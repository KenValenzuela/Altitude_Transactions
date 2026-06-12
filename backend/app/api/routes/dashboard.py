"""Dashboard aggregates: counts, missing docs, review queue, deadlines, activity."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.api.deps import AuthContext, get_current_context
from app.db.session import get_session
from app.models import (
    AuditLog,
    ChecklistItemStatus,
    Deadline,
    DeadlineApplicability,
    DocumentChecklistItem,
    Transaction,
    TransactionStatus,
    UploadedFile,
)
from app.schemas import (
    AuditEventOut,
    DashboardChecklistItemOut,
    DashboardDeadlineOut,
    DashboardOut,
    UploadedFileOut,
)
from app.services.checklist import is_item_overdue

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

REVIEW_STATUSES = (ChecklistItemStatus.uploaded, ChecklistItemStatus.in_review)


@router.get("", response_model=DashboardOut)
def get_dashboard(
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> DashboardOut:
    today = dt.date.today()
    week_out = today + dt.timedelta(days=7)

    txs = session.exec(
        select(Transaction).where(Transaction.organization_id == ctx.organization_id)
    ).all()
    tx_by_id = {t.id: t for t in txs}
    open_tx_ids = [t.id for t in txs if t.status != TransactionStatus.archived]

    items: list[DocumentChecklistItem] = []
    deadlines: list[Deadline] = []
    if open_tx_ids:
        items = list(
            session.exec(
                select(DocumentChecklistItem).where(
                    DocumentChecklistItem.transaction_id.in_(open_tx_ids)  # type: ignore[attr-defined]
                )
            ).all()
        )
        deadlines = list(
            session.exec(
                select(Deadline).where(
                    Deadline.transaction_id.in_(open_tx_ids),  # type: ignore[attr-defined]
                    Deadline.applicability == DeadlineApplicability.active,
                )
            ).all()
        )

    def _item_card(i: DocumentChecklistItem) -> DashboardChecklistItemOut:
        return DashboardChecklistItemOut(
            id=i.id,
            transaction_id=i.transaction_id,
            property_address=tx_by_id[i.transaction_id].property_address,
            name=i.name,
            section=i.section,
            status=i.status.value,
            due_date=i.due_date,
            overdue=is_item_overdue(i, today),
        )

    missing = [i for i in items if i.required and i.status == ChecklistItemStatus.needed]
    in_review = [i for i in items if i.status in REVIEW_STATUSES]
    overdue_items = [i for i in items if is_item_overdue(i, today)]
    overdue_deadlines = [d for d in deadlines if d.due_date and d.due_date < today]

    upcoming = sorted(
        (d for d in deadlines if d.due_date and d.due_date >= today),
        key=lambda d: d.due_date,  # type: ignore[arg-type, return-value]
    )[:10]

    recent_files = session.exec(
        select(UploadedFile)
        .where(UploadedFile.organization_id == ctx.organization_id)
        .order_by(UploadedFile.uploaded_at.desc())  # type: ignore[attr-defined]
        .limit(5)
    ).all()
    recent_audit = session.exec(
        select(AuditLog)
        .where(AuditLog.organization_id == ctx.organization_id)
        .order_by(AuditLog.created_at.desc())  # type: ignore[attr-defined]
        .limit(10)
    ).all()

    return DashboardOut(
        total_transactions=len(txs),
        active_transactions=sum(1 for t in txs if t.status == TransactionStatus.active),
        approved_transactions=sum(1 for t in txs if t.status == TransactionStatus.approved),
        missing_documents=len(missing),
        pending_reviews=len(in_review),
        overdue_items=len(overdue_items) + len(overdue_deadlines),
        closing_this_week=sum(
            1
            for t in txs
            if t.status != TransactionStatus.archived
            and t.closing_date
            and today <= t.closing_date <= week_out
        ),
        missing_document_items=[_item_card(i) for i in missing[:10]],
        review_queue=[_item_card(i) for i in in_review[:10]],
        upcoming_deadlines=[
            DashboardDeadlineOut(
                id=d.id,
                transaction_id=d.transaction_id,
                property_address=tx_by_id[d.transaction_id].property_address,
                name=d.name,
                due_date=d.due_date,
                days_remaining=(d.due_date - today).days if d.due_date else None,
                overdue=False,
            )
            for d in upcoming
        ],
        recent_files=[UploadedFileOut.model_validate(f) for f in recent_files],
        recent_activity=[AuditEventOut.model_validate(e) for e in recent_audit],
    )
