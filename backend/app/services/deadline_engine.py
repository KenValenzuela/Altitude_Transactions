"""Deterministic deadline -> task engine.

Tasks are a pure projection of the deadlines table: every active, dated
deadline gets exactly one linked task. Re-running the sync is idempotent.
Rules (no AI involved):
  - known Colorado deadline keys get workflow-specific task titles from the
    registry; unknown keys fall back to "Prepare for <name>"
  - deadline date moves -> open linked task moves with it (done tasks are
    history and are not reopened)
  - deadline goes not-applicable -> open linked task goes not_applicable
"""
from __future__ import annotations

import datetime as dt

from sqlmodel import Session, select

from app.models import (
    ActorType,
    Deadline,
    DeadlineApplicability,
    Task,
    TaskStatus,
)
from app.services.audit import record as audit

# Registry: deadline_key -> task title (Colorado contract-to-close playbook).
TASK_TITLES: dict[str, str] = {
    "alternative_earnest_money_deadline": "Confirm earnest money deposited with holder",
    "record_title_deadline_and_tax_certificate": "Review title commitment and tax certificate",
    "record_title_objection_deadline": "Send record title objection or confirm acceptance",
    "off_record_title_deadline": "Review off-record title documents",
    "off_record_title_objection_deadline": "Send off-record title objection or confirm acceptance",
    "title_resolution_deadline": "Confirm title objections resolved",
    "association_documents_deadline": "Confirm HOA documents received",
    "association_documents_termination_deadline": "Review HOA documents — termination right expires",
    "sellers_property_disclosure_deadline": "Confirm Seller's Property Disclosure received",
    "lead_based_paint_disclosure_deadline": "Confirm Lead-Based Paint Disclosure signed",
    "new_loan_application_deadline": "Confirm buyer submitted loan application",
    "new_loan_terms_deadline": "Review new loan terms",
    "new_loan_availability_deadline": "Confirm loan availability / clear to proceed",
    "buyer_s_credit_information_deadline": "Provide buyer credit information",
    "disapproval_of_buyer_s_credit_information_deadline": "Seller credit disapproval window closes",
    "existing_loan_deadline": "Review existing loan documents",
    "existing_loan_termination_deadline": "Existing loan termination right expires",
    "loan_transfer_approval_deadline": "Confirm loan transfer approval",
    "seller_or_private_financing_deadline": "Finalize seller/private financing documents",
    "appraisal_deadline": "Confirm appraisal completed and reviewed",
    "appraisal_objection_deadline": "Send appraisal objection if needed",
    "appraisal_resolution_deadline": "Confirm appraisal objections resolved",
    "new_ilc_or_new_survey_deadline": "Confirm ILC / survey ordered and received",
    "new_ilc_or_new_survey_objection_deadline": "Send survey objection if needed",
    "new_ilc_or_new_survey_resolution_deadline": "Confirm survey objections resolved",
    "water_rights_examination_deadline": "Examine water rights documentation",
    "mineral_rights_examination_deadline": "Examine mineral rights documentation",
    "inspection_termination_deadline": "Inspection termination right expires — confirm buyer decision",
    "inspection_objection_deadline": "Send inspection objection or confirm waiver",
    "inspection_resolution_deadline": "Confirm inspection objections resolved",
    "property_insurance_termination_deadline": "Confirm property insurability",
    "due_diligence_documents_delivery_deadline": "Confirm due diligence documents delivered",
    "due_diligence_documents_objection_deadline": "Send due diligence objection if needed",
    "due_diligence_documents_resolution_deadline": "Confirm due diligence objections resolved",
    "conditional_sale_deadline": "Confirm buyer's property sale contingency status",
    "lead_based_paint_termination_deadline": "Lead-based paint termination right expires",
    "estoppel_statements_deadline": "Confirm estoppel statements received",
    "estoppel_statements_termination_deadline": "Estoppel termination right expires",
    "closing_date": "Confirm closing logistics: CDA, final walkthrough, utilities",
    "possession_date": "Coordinate key transfer and possession",
}


def task_title_for(deadline_key: str, name: str) -> str:
    return TASK_TITLES.get(deadline_key, f"Prepare for {name}")


def sync_tasks_for_transaction(
    session: Session,
    transaction_id: str,
    organization_id: str,
    actor_id: str | None = None,
) -> dict:
    """Reconcile deadline-linked tasks with the deadlines table. Caller commits."""
    deadlines = session.exec(
        select(Deadline).where(Deadline.transaction_id == transaction_id)
    ).all()
    tasks = session.exec(
        select(Task).where(
            Task.transaction_id == transaction_id,
            Task.source == "deadline",
        )
    ).all()
    by_deadline = {t.linked_deadline_id: t for t in tasks if t.linked_deadline_id}

    counts = {"created": 0, "updated": 0, "deactivated": 0}
    now = dt.datetime.now(dt.timezone.utc)

    for deadline in deadlines:
        task = by_deadline.get(deadline.id)
        active = (
            deadline.applicability == DeadlineApplicability.active
            and deadline.due_date is not None
        )

        if task is None:
            if not active:
                continue
            task = Task(
                transaction_id=transaction_id,
                title=task_title_for(deadline.deadline_key, deadline.name),
                due_date=deadline.due_date,
                linked_deadline_id=deadline.id,
                source="deadline",
            )
            session.add(task)
            counts["created"] += 1
            audit(
                session,
                organization_id=organization_id,
                transaction_id=transaction_id,
                actor_type=ActorType.system,
                actor_id=actor_id,
                event_type="task_created",
                entity_type="task",
                entity_id=task.id,
                new_value=task.title,
                metadata={"deadlineKey": deadline.deadline_key},
            )
            continue

        if task.status == TaskStatus.done:
            continue  # completed work is history; deadline moves don't reopen it

        if not active and task.status == TaskStatus.open:
            task.status = TaskStatus.not_applicable
            task.updated_at = now
            session.add(task)
            counts["deactivated"] += 1
            audit(
                session,
                organization_id=organization_id,
                transaction_id=transaction_id,
                actor_type=ActorType.system,
                actor_id=actor_id,
                event_type="task_status_changed",
                entity_type="task",
                entity_id=task.id,
                old_value=TaskStatus.open.value,
                new_value=TaskStatus.not_applicable.value,
                metadata={"deadlineKey": deadline.deadline_key},
            )
            continue

        if active and task.due_date != deadline.due_date:
            old = task.due_date
            task.due_date = deadline.due_date
            if task.status == TaskStatus.not_applicable:
                task.status = TaskStatus.open  # deadline became applicable again
            task.updated_at = now
            session.add(task)
            counts["updated"] += 1
            audit(
                session,
                organization_id=organization_id,
                transaction_id=transaction_id,
                actor_type=ActorType.system,
                actor_id=actor_id,
                event_type="task_due_date_changed",
                entity_type="task",
                entity_id=task.id,
                old_value=old.isoformat() if old else None,
                new_value=deadline.due_date.isoformat() if deadline.due_date else None,
                metadata={"deadlineKey": deadline.deadline_key},
            )

    return counts
