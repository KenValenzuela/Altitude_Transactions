"""Deterministic apply engine: approved fields -> canonical transaction state.

This is the only writer of `CanonicalField`, deadline rows derived from
extractions, and extraction-driven Transaction columns. It consumes:
  - immutable `ExtractedField` rows, and
  - the latest append-only `ReviewDecision` per field (approved/edited only;
    rejected and marked-N/A fields never become canonical).

Safety invariant: an existing deadline's date is NEVER silently overwritten.
Amend/Extend and counterproposal changes (group="deadline_changes") always
become `DeadlineChangeProposal` rows; a conflicting date from a re-approved
base contract becomes a proposal too. Only a human decision on the proposal
mutates the deadline.
"""
from __future__ import annotations

import datetime as dt
import re

from sqlmodel import Session, select

from app.api.deps import AuthContext
from app.models import (
    CanonicalField,
    Deadline,
    DeadlineApplicability,
    DeadlineChangeProposal,
    ExtractedField,
    ExtractionJob,
    ProposalStatus,
    ReviewDecision,
    ReviewDecisionType,
    Transaction,
)
from app.services.audit import record as audit
from app.services.extraction_schemas import normalize_date, normalize_money

# Extraction field_key -> Transaction column writeback.
_TX_TEXT = {
    "property_address": "property_address",
    "city": "city",
    "county": "county",
    "zip": "zip",
    "legal_description": "legal_description",
    "possession_time": "possession_time",
}
_TX_MONEY = {"purchase_price": "purchase_price", "earnest_money": "earnest_money"}
_TX_DATE = {
    "contract_date": "contract_date",
    "closing_date": "closing_date",
    "possession_date": "possession_date",
}

_SECTION_RE = re.compile(r"§\s*[\d.]+")


def latest_decisions(session: Session, job_id: str) -> dict[str, ReviewDecision]:
    """Latest decision per extracted field (append-only log; last write wins)."""
    rows = session.exec(
        select(ReviewDecision)
        .where(ReviewDecision.job_id == job_id)
        .order_by(ReviewDecision.created_at)  # type: ignore[arg-type]
    ).all()
    return {r.extracted_field_id: r for r in rows}


def effective_value(field: ExtractedField, decision: ReviewDecision) -> tuple[str | None, str | None]:
    """(value, normalized_value) after applying an approved/edited decision."""
    if decision.decision == ReviewDecisionType.edited:
        value = decision.corrected_value
        if field.value_type == "date":
            return value, normalize_date(value)
        if field.value_type == "money":
            return value, normalize_money(value)
        return value, None
    return field.value, field.normalized_value


def apply_job(session: Session, job: ExtractionJob, ctx: AuthContext) -> dict:
    """Apply all approved/edited fields of an approved document.

    Returns counts for the API response. Caller owns the final commit.
    """
    fields = session.exec(
        select(ExtractedField).where(ExtractedField.job_id == job.id)
    ).all()
    decisions = latest_decisions(session, job.id)

    counts = {"canonical": 0, "deadlines_created": 0, "deadlines_updated": 0, "proposals": 0}
    tx = session.get(Transaction, job.transaction_id)

    for field in fields:
        decision = decisions.get(field.id)
        if decision is None or decision.decision not in (
            ReviewDecisionType.approved,
            ReviewDecisionType.edited,
        ):
            continue
        value, normalized = effective_value(field, decision)

        if field.group == "deadline_changes":
            counts["proposals"] += _propose_deadline_change(
                session, job, field, value, normalized, ctx
            )
            continue
        if field.group == "deadlines":
            created, updated, proposed = _apply_deadline(
                session, job, field, value, normalized, ctx
            )
            counts["deadlines_created"] += created
            counts["deadlines_updated"] += updated
            counts["proposals"] += proposed
            continue

        _upsert_canonical(session, job, field, value, normalized, ctx)
        counts["canonical"] += 1
        if tx is not None:
            _write_back_transaction(session, tx, field.field_key, value, normalized, ctx, job)

    return counts


# ─── Canonical fields ─────────────────────────────────────────────────────────


def _upsert_canonical(
    session: Session,
    job: ExtractionJob,
    field: ExtractedField,
    value: str | None,
    normalized: str | None,
    ctx: AuthContext,
) -> None:
    stored = normalized if field.value_type in ("date", "money") and normalized else value
    existing = session.exec(
        select(CanonicalField).where(
            CanonicalField.transaction_id == job.transaction_id,
            CanonicalField.field_key == field.field_key,
        )
    ).first()
    old_value = existing.value if existing else None
    if existing is None:
        existing = CanonicalField(
            transaction_id=job.transaction_id, field_key=field.field_key
        )
    existing.label = field.label
    existing.value = stored or ""
    existing.value_type = field.value_type
    existing.source_field_id = field.id
    existing.source_file_id = job.file_id
    existing.approved_by = ctx.user.id
    existing.approved_at = dt.datetime.now(dt.timezone.utc)
    session.add(existing)
    if old_value != existing.value:
        audit(
            session,
            organization_id=job.organization_id,
            transaction_id=job.transaction_id,
            actor_id=ctx.user.id,
            event_type="canonical_field_set",
            entity_type="canonical_field",
            entity_id=existing.id,
            old_value=old_value,
            new_value=existing.value,
            source_file_id=job.file_id,
            metadata={"fieldKey": field.field_key},
        )


def _write_back_transaction(
    session: Session,
    tx: Transaction,
    field_key: str,
    value: str | None,
    normalized: str | None,
    ctx: AuthContext,
    job: ExtractionJob,
) -> None:
    """Map known canonical keys onto Transaction columns (deterministic rules)."""
    changed: tuple[str, str | None, str | None] | None = None  # (col, old, new)
    if field_key in _TX_TEXT and value:
        col = _TX_TEXT[field_key]
        old = getattr(tx, col)
        if old != value:
            setattr(tx, col, value)
            changed = (col, old, value)
    elif field_key in _TX_MONEY and normalized:
        col = _TX_MONEY[field_key]
        old = getattr(tx, col)
        if old != int(normalized):
            setattr(tx, col, int(normalized))
            changed = (col, str(old), normalized)
    elif field_key in _TX_DATE and normalized:
        col = _TX_DATE[field_key]
        old = getattr(tx, col)
        new = dt.date.fromisoformat(normalized)
        if old != new:
            setattr(tx, col, new)
            changed = (col, old.isoformat() if old else None, normalized)

    if changed:
        tx.updated_at = dt.datetime.now(dt.timezone.utc)
        session.add(tx)
        audit(
            session,
            organization_id=job.organization_id,
            transaction_id=tx.id,
            actor_id=ctx.user.id,
            event_type="transaction_field_updated",
            entity_type="transaction",
            entity_id=tx.id,
            old_value=changed[1],
            new_value=changed[2],
            source_file_id=job.file_id,
            metadata={"column": changed[0]},
        )


# ─── Deadlines ────────────────────────────────────────────────────────────────


def _deadline_key(field_key: str) -> str:
    return field_key.split(".", 1)[1] if "." in field_key else field_key


def _section_ref(source_text: str) -> str:
    match = _SECTION_RE.search(source_text)
    return match.group(0) if match else ""


def _get_deadline(session: Session, transaction_id: str, key: str) -> Deadline | None:
    return session.exec(
        select(Deadline).where(
            Deadline.transaction_id == transaction_id, Deadline.deadline_key == key
        )
    ).first()


def _apply_deadline(
    session: Session,
    job: ExtractionJob,
    field: ExtractedField,
    value: str | None,
    normalized: str | None,
    ctx: AuthContext,
) -> tuple[int, int, int]:
    """Base-contract deadline row. Returns (created, updated, proposed)."""
    key = _deadline_key(field.field_key)
    new_date = dt.date.fromisoformat(normalized) if normalized else None
    is_na = bool(value) and value.strip().upper().startswith("N/A")
    existing = _get_deadline(session, job.transaction_id, key)

    if existing is None:
        deadline = Deadline(
            transaction_id=job.transaction_id,
            deadline_key=key,
            name=field.label,
            section_reference=_section_ref(field.source_text),
            due_date=new_date,
            due_time="" if (new_date or is_na) else (value or ""),
            applicability=(
                DeadlineApplicability.not_applicable if is_na else DeadlineApplicability.active
            ),
            source_file_id=job.file_id,
            source_field_id=field.id,
        )
        session.add(deadline)
        audit(
            session,
            organization_id=job.organization_id,
            transaction_id=job.transaction_id,
            actor_id=ctx.user.id,
            event_type="deadline_created",
            entity_type="deadline",
            entity_id=deadline.id,
            new_value=normalized or value,
            source_file_id=job.file_id,
            metadata={"deadlineKey": key},
        )
        return 1, 0, 0

    if existing.due_date == new_date:
        return 0, 0, 0  # no change

    if existing.due_date is None:
        # Filling in a previously-unset date is not an overwrite.
        old = existing.due_date
        existing.due_date = new_date
        existing.applicability = (
            DeadlineApplicability.not_applicable if is_na else DeadlineApplicability.active
        )
        existing.source_file_id = job.file_id
        existing.source_field_id = field.id
        existing.updated_at = dt.datetime.now(dt.timezone.utc)
        session.add(existing)
        audit(
            session,
            organization_id=job.organization_id,
            transaction_id=job.transaction_id,
            actor_id=ctx.user.id,
            event_type="deadline_updated",
            entity_type="deadline",
            entity_id=existing.id,
            old_value=old.isoformat() if old else None,
            new_value=normalized,
            source_file_id=job.file_id,
            metadata={"deadlineKey": key},
        )
        return 0, 1, 0

    # Conflicting date for an established deadline -> reviewable proposal.
    return 0, 0, _create_proposal(session, job, field, key, existing, new_date, ctx)


def _propose_deadline_change(
    session: Session,
    job: ExtractionJob,
    field: ExtractedField,
    value: str | None,
    normalized: str | None,
    ctx: AuthContext,
) -> int:
    key = _deadline_key(field.field_key)
    new_date = dt.date.fromisoformat(normalized) if normalized else None
    existing = _get_deadline(session, job.transaction_id, key)
    if existing is not None and existing.due_date == new_date:
        return 0  # nothing to change
    return _create_proposal(session, job, field, key, existing, new_date, ctx)


def _create_proposal(
    session: Session,
    job: ExtractionJob,
    field: ExtractedField,
    key: str,
    existing: Deadline | None,
    new_date: dt.date | None,
    ctx: AuthContext,
) -> int:
    duplicate = session.exec(
        select(DeadlineChangeProposal).where(
            DeadlineChangeProposal.transaction_id == job.transaction_id,
            DeadlineChangeProposal.deadline_key == key,
            DeadlineChangeProposal.status == ProposalStatus.pending,
            DeadlineChangeProposal.new_date == new_date,
        )
    ).first()
    if duplicate is not None:
        return 0

    proposal = DeadlineChangeProposal(
        transaction_id=job.transaction_id,
        job_id=job.id,
        source_file_id=job.file_id,
        deadline_id=existing.id if existing else None,
        deadline_key=key,
        name=field.label.removesuffix(" (amended)"),
        old_date=existing.due_date if existing else None,
        new_date=new_date,
    )
    session.add(proposal)
    audit(
        session,
        organization_id=job.organization_id,
        transaction_id=job.transaction_id,
        actor_id=ctx.user.id,
        event_type="deadline_change_proposed",
        entity_type="deadline_change_proposal",
        entity_id=proposal.id,
        old_value=proposal.old_date.isoformat() if proposal.old_date else None,
        new_value=new_date.isoformat() if new_date else None,
        source_file_id=job.file_id,
        metadata={"deadlineKey": key},
    )
    return 1


# ─── Proposal decisions ───────────────────────────────────────────────────────


def apply_proposal(
    session: Session, proposal: DeadlineChangeProposal, ctx: AuthContext, organization_id: str
) -> Deadline:
    """Human-approved proposal -> mutate (or create) the canonical deadline."""
    deadline = (
        session.get(Deadline, proposal.deadline_id) if proposal.deadline_id else None
    ) or _get_deadline(session, proposal.transaction_id, proposal.deadline_key)

    if deadline is None:
        deadline = Deadline(
            transaction_id=proposal.transaction_id,
            deadline_key=proposal.deadline_key,
            name=proposal.name,
            source_file_id=proposal.source_file_id,
        )
    old = deadline.due_date
    deadline.due_date = proposal.new_date
    deadline.applicability = DeadlineApplicability.active
    deadline.source_file_id = proposal.source_file_id
    deadline.updated_at = dt.datetime.now(dt.timezone.utc)
    session.add(deadline)

    # Closing date is mirrored on the transaction row.
    if proposal.deadline_key == "closing_date":
        tx = session.get(Transaction, proposal.transaction_id)
        if tx is not None:
            tx.closing_date = proposal.new_date
            tx.updated_at = dt.datetime.now(dt.timezone.utc)
            session.add(tx)

    audit(
        session,
        organization_id=organization_id,
        transaction_id=proposal.transaction_id,
        actor_id=ctx.user.id,
        event_type="deadline_updated",
        entity_type="deadline",
        entity_id=deadline.id,
        old_value=old.isoformat() if old else None,
        new_value=proposal.new_date.isoformat() if proposal.new_date else None,
        source_file_id=proposal.source_file_id,
        metadata={"deadlineKey": proposal.deadline_key, "viaProposal": proposal.id},
    )
    return deadline
