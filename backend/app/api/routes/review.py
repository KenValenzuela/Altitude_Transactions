"""Human review: field decisions, document approve/reject, deadline proposals.

The flow this implements: AI suggests (`ExtractedField`), humans decide
(`ReviewDecision`, append-only), the apply engine writes canonical state, and
deadline changes always pass through an explicitly-approved proposal.
"""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import AuthContext, get_current_context, get_owned_transaction
from app.db.session import get_session
from app.models import (
    CanonicalField,
    ChecklistItemStatus,
    DeadlineChangeProposal,
    DocumentChecklistItem,
    ExtractedField,
    ExtractionJob,
    ExtractionJobStatus,
    ProposalStatus,
    ReviewDecision,
    ReviewDecisionType,
    UploadedFile,
)
from app.schemas import (
    ApplyResultOut,
    CanonicalFieldOut,
    DeadlineChangeProposalOut,
    DocumentApproveRequest,
    DocumentRejectRequest,
    ExtractionJobOut,
    ReviewDecisionCreate,
    ReviewDecisionOut,
    ReviewFieldOut,
    ReviewJobOut,
    UploadedFileOut,
)
from app.services.apply_engine import apply_job, apply_proposal, latest_decisions
from app.services.audit import record as audit
from app.services.checklist import recompute_transaction_status

router = APIRouter(tags=["review"])

_DECIDABLE = (ExtractionJobStatus.needs_review,)


def _get_owned_job(job_id: str, ctx: AuthContext, session: Session) -> ExtractionJob:
    job = session.get(ExtractionJob, job_id)
    if job is None or job.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Extraction job not found")
    return job


def _review_field(field: ExtractedField, decision: ReviewDecision | None) -> ReviewFieldOut:
    return ReviewFieldOut(
        **_field_dict(field),
        decision=decision.decision.value if decision else None,
        corrected_value=decision.corrected_value if decision else None,
        decision_reason=decision.reason if decision else None,
        reviewer_id=decision.reviewer_id if decision else None,
        decided_at=decision.created_at if decision else None,
    )


def _field_dict(field: ExtractedField) -> dict:
    return dict(
        id=field.id,
        job_id=field.job_id,
        transaction_id=field.transaction_id,
        field_key=field.field_key,
        label=field.label,
        group=field.group,
        value=field.value,
        normalized_value=field.normalized_value,
        value_type=field.value_type,
        confidence=field.confidence,
        source_page=field.source_page,
        source_text=field.source_text,
        created_at=field.created_at,
    )


def _job_out(job: ExtractionJob) -> ExtractionJobOut:
    return ExtractionJobOut(
        id=job.id,
        transaction_id=job.transaction_id,
        file_id=job.file_id,
        checklist_item_id=job.checklist_item_id,
        status=job.status.value,
        document_type=job.document_type.value if job.document_type else None,
        classification_confidence=job.classification_confidence,
        provider=job.provider,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )


# ─── Review queue ─────────────────────────────────────────────────────────────


@router.get("/transactions/{transaction_id}/review", response_model=list[ReviewJobOut])
def review_queue(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[ReviewJobOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    jobs = session.exec(
        select(ExtractionJob)
        .where(
            ExtractionJob.transaction_id == tx.id,
            ExtractionJob.status == ExtractionJobStatus.needs_review,
        )
        .order_by(ExtractionJob.created_at)  # type: ignore[arg-type]
    ).all()

    result = []
    for job in jobs:
        file = session.get(UploadedFile, job.file_id)
        if file is None:
            continue
        fields = session.exec(
            select(ExtractedField)
            .where(ExtractedField.job_id == job.id)
            .order_by(ExtractedField.created_at)  # type: ignore[arg-type]
        ).all()
        decisions = latest_decisions(session, job.id)
        item_name = None
        if job.checklist_item_id:
            item = session.get(DocumentChecklistItem, job.checklist_item_id)
            item_name = item.name if item else None
        proposal_count = len(
            session.exec(
                select(DeadlineChangeProposal).where(
                    DeadlineChangeProposal.job_id == job.id,
                    DeadlineChangeProposal.status == ProposalStatus.pending,
                )
            ).all()
        )
        result.append(
            ReviewJobOut(
                job=_job_out(job),
                file=UploadedFileOut.model_validate(file),
                checklist_item_name=item_name,
                fields=[_review_field(f, decisions.get(f.id)) for f in fields],
                undecided_count=sum(1 for f in fields if f.id not in decisions),
                proposal_count=proposal_count,
            )
        )
    return result


# ─── Field decisions ──────────────────────────────────────────────────────────


@router.post("/extracted-fields/{field_id}/decision", response_model=ReviewDecisionOut)
def decide_field(
    field_id: str,
    body: ReviewDecisionCreate,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ReviewDecisionOut:
    if not ctx.can_review:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer role required")
    field = session.get(ExtractedField, field_id)
    if field is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Extracted field not found")
    get_owned_transaction(field.transaction_id, ctx, session)
    job = session.get(ExtractionJob, field.job_id)
    if job is None or job.status not in _DECIDABLE:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Decisions are only accepted while the document is in review",
        )

    try:
        decision_type = ReviewDecisionType(body.decision)
    except ValueError:
        raise HTTPException(422, f"Invalid decision '{body.decision}'")
    if decision_type == ReviewDecisionType.edited and not body.corrected_value:
        raise HTTPException(422, "correctedValue is required for an edit decision")

    decision = ReviewDecision(
        extracted_field_id=field.id,
        job_id=field.job_id,
        transaction_id=field.transaction_id,
        decision=decision_type,
        original_value=field.value,
        corrected_value=body.corrected_value if decision_type == ReviewDecisionType.edited else None,
        reason=body.reason,
        reviewer_id=ctx.user.id,
    )
    session.add(decision)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=field.transaction_id,
        actor_id=ctx.user.id,
        event_type=f"field_{decision_type.value}",
        entity_type="extracted_field",
        entity_id=field.id,
        old_value=field.value,
        new_value=decision.corrected_value or field.value,
        source_file_id=job.file_id,
        metadata={"fieldKey": field.field_key, "reason": body.reason} if body.reason else
                 {"fieldKey": field.field_key},
    )
    session.commit()
    session.refresh(decision)
    return ReviewDecisionOut(
        id=decision.id,
        extracted_field_id=decision.extracted_field_id,
        job_id=decision.job_id,
        transaction_id=decision.transaction_id,
        decision=decision.decision.value,
        original_value=decision.original_value,
        corrected_value=decision.corrected_value,
        reason=decision.reason,
        reviewer_id=decision.reviewer_id,
        created_at=decision.created_at,
    )


# ─── Document approve / reject ────────────────────────────────────────────────


@router.post("/extraction-jobs/{job_id}/approve", response_model=ApplyResultOut)
def approve_document(
    job_id: str,
    body: DocumentApproveRequest | None = None,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ApplyResultOut:
    if not ctx.can_review:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer role required")
    job = _get_owned_job(job_id, ctx, session)
    if job.status != ExtractionJobStatus.needs_review:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"Job is not awaiting review (status: {job.status.value})"
        )
    approve_remaining = body.approve_remaining if body is not None else True

    fields = session.exec(
        select(ExtractedField).where(ExtractedField.job_id == job.id)
    ).all()
    decisions = latest_decisions(session, job.id)
    undecided = [f for f in fields if f.id not in decisions]

    if undecided and not approve_remaining:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"{len(undecided)} field(s) have no decision; decide them or approve with approveRemaining",
        )
    for field in undecided:
        session.add(
            ReviewDecision(
                extracted_field_id=field.id,
                job_id=job.id,
                transaction_id=job.transaction_id,
                decision=ReviewDecisionType.approved,
                original_value=field.value,
                reason="Bulk-approved with document",
                reviewer_id=ctx.user.id,
            )
        )
    if undecided:
        session.flush()

    counts = apply_job(session, job, ctx)

    job.status = ExtractionJobStatus.completed
    job.completed_at = dt.datetime.now(dt.timezone.utc)
    session.add(job)

    if job.checklist_item_id:
        item = session.get(DocumentChecklistItem, job.checklist_item_id)
        if item is not None and item.status in (
            ChecklistItemStatus.uploaded,
            ChecklistItemStatus.in_review,
            ChecklistItemStatus.needs_correction,
        ):
            old = item.status.value
            item.status = ChecklistItemStatus.approved
            item.updated_at = dt.datetime.now(dt.timezone.utc)
            session.add(item)
            audit(
                session,
                organization_id=ctx.organization_id,
                transaction_id=job.transaction_id,
                actor_id=ctx.user.id,
                event_type="checklist_item_status_changed",
                entity_type="document_checklist_item",
                entity_id=item.id,
                old_value=old,
                new_value=ChecklistItemStatus.approved.value,
                source_file_id=job.file_id,
            )

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=job.transaction_id,
        actor_id=ctx.user.id,
        event_type="document_approved",
        entity_type="extraction_job",
        entity_id=job.id,
        source_file_id=job.file_id,
        metadata=counts | {"bulkApproved": len(undecided)},
    )

    tx = get_owned_transaction(job.transaction_id, ctx, session)
    recompute_transaction_status(session, tx)
    session.commit()

    return ApplyResultOut(job_id=job.id, status=job.status.value, **counts)


@router.post("/extraction-jobs/{job_id}/reject", response_model=ExtractionJobOut)
def reject_document(
    job_id: str,
    body: DocumentRejectRequest,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ExtractionJobOut:
    if not ctx.can_review:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer role required")
    job = _get_owned_job(job_id, ctx, session)
    if job.status != ExtractionJobStatus.needs_review:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"Job is not awaiting review (status: {job.status.value})"
        )

    job.status = ExtractionJobStatus.completed
    job.completed_at = dt.datetime.now(dt.timezone.utc)
    session.add(job)

    if job.checklist_item_id:
        item = session.get(DocumentChecklistItem, job.checklist_item_id)
        if item is not None:
            old = item.status.value
            item.status = ChecklistItemStatus.needs_correction
            item.updated_at = dt.datetime.now(dt.timezone.utc)
            session.add(item)
            audit(
                session,
                organization_id=ctx.organization_id,
                transaction_id=job.transaction_id,
                actor_id=ctx.user.id,
                event_type="checklist_item_status_changed",
                entity_type="document_checklist_item",
                entity_id=item.id,
                old_value=old,
                new_value=ChecklistItemStatus.needs_correction.value,
                source_file_id=job.file_id,
            )

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=job.transaction_id,
        actor_id=ctx.user.id,
        event_type="document_rejected",
        entity_type="extraction_job",
        entity_id=job.id,
        new_value=body.reason,
        source_file_id=job.file_id,
    )
    session.commit()
    session.refresh(job)
    return _job_out(job)


# ─── Canonical fields (read) ──────────────────────────────────────────────────


@router.get(
    "/transactions/{transaction_id}/canonical-fields",
    response_model=list[CanonicalFieldOut],
)
def list_canonical_fields(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[CanonicalFieldOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    rows = session.exec(
        select(CanonicalField)
        .where(CanonicalField.transaction_id == tx.id)
        .order_by(CanonicalField.field_key)  # type: ignore[arg-type]
    ).all()
    return [CanonicalFieldOut.model_validate(r) for r in rows]


# ─── Deadline change proposals ────────────────────────────────────────────────


def _proposal_out(p: DeadlineChangeProposal) -> DeadlineChangeProposalOut:
    return DeadlineChangeProposalOut(
        id=p.id,
        transaction_id=p.transaction_id,
        job_id=p.job_id,
        deadline_id=p.deadline_id,
        deadline_key=p.deadline_key,
        name=p.name,
        old_date=p.old_date,
        new_date=p.new_date,
        old_time=p.old_time,
        new_time=p.new_time,
        status=p.status.value,
        decided_by=p.decided_by,
        decided_at=p.decided_at,
        created_at=p.created_at,
    )


@router.get(
    "/transactions/{transaction_id}/deadline-proposals",
    response_model=list[DeadlineChangeProposalOut],
)
def list_proposals(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[DeadlineChangeProposalOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    proposals = session.exec(
        select(DeadlineChangeProposal)
        .where(DeadlineChangeProposal.transaction_id == tx.id)
        .order_by(DeadlineChangeProposal.created_at.desc())  # type: ignore[attr-defined]
    ).all()
    return [_proposal_out(p) for p in proposals]


def _get_pending_proposal(
    proposal_id: str, ctx: AuthContext, session: Session
) -> DeadlineChangeProposal:
    proposal = session.get(DeadlineChangeProposal, proposal_id)
    if proposal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Proposal not found")
    get_owned_transaction(proposal.transaction_id, ctx, session)
    if proposal.status != ProposalStatus.pending:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"Proposal already {proposal.status.value}"
        )
    return proposal


@router.post("/deadline-proposals/{proposal_id}/approve", response_model=DeadlineChangeProposalOut)
def approve_proposal(
    proposal_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> DeadlineChangeProposalOut:
    if not ctx.can_review:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer role required")
    proposal = _get_pending_proposal(proposal_id, ctx, session)

    deadline = apply_proposal(session, proposal, ctx, ctx.organization_id)
    session.flush()
    proposal.deadline_id = deadline.id
    proposal.status = ProposalStatus.approved
    proposal.decided_by = ctx.user.id
    proposal.decided_at = dt.datetime.now(dt.timezone.utc)
    session.add(proposal)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=proposal.transaction_id,
        actor_id=ctx.user.id,
        event_type="proposal_approved",
        entity_type="deadline_change_proposal",
        entity_id=proposal.id,
        old_value=proposal.old_date.isoformat() if proposal.old_date else None,
        new_value=proposal.new_date.isoformat() if proposal.new_date else None,
        source_file_id=proposal.source_file_id,
    )
    session.commit()
    session.refresh(proposal)
    return _proposal_out(proposal)


@router.post("/deadline-proposals/{proposal_id}/reject", response_model=DeadlineChangeProposalOut)
def reject_proposal(
    proposal_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> DeadlineChangeProposalOut:
    if not ctx.can_review:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Reviewer role required")
    proposal = _get_pending_proposal(proposal_id, ctx, session)

    proposal.status = ProposalStatus.rejected
    proposal.decided_by = ctx.user.id
    proposal.decided_at = dt.datetime.now(dt.timezone.utc)
    session.add(proposal)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=proposal.transaction_id,
        actor_id=ctx.user.id,
        event_type="proposal_rejected",
        entity_type="deadline_change_proposal",
        entity_id=proposal.id,
        old_value=proposal.old_date.isoformat() if proposal.old_date else None,
        new_value=proposal.new_date.isoformat() if proposal.new_date else None,
        source_file_id=proposal.source_file_id,
    )
    session.commit()
    session.refresh(proposal)
    return _proposal_out(proposal)
