"""Transaction routes: CRUD and checklist management."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.api.deps import AuthContext, get_current_context, get_owned_transaction, require_admin
from app.db.session import get_session
from app.models import (
    ChecklistItemStatus,
    DocumentChecklistItem,
    DocumentType,
    FinancingType,
    Transaction,
    TransactionSide,
    TransactionStatus,
)
from app.schemas import (
    ChecklistItemCreate,
    ChecklistItemOut,
    ChecklistItemPatch,
    ChecklistOut,
    ChecklistSectionOut,
    TransactionCard,
    TransactionCreate,
    TransactionOut,
    TransactionPatch,
)
from app.services.audit import record as audit
from app.services.checklist import SECTION_LABELS, SECTIONS, instantiate_checklist, is_item_overdue

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _days_to_close(closing_date: dt.date | None) -> int | None:
    if closing_date is None:
        return None
    return (closing_date - dt.date.today()).days


def _checklist_stats(items: list[DocumentChecklistItem]) -> dict:
    total = len(items)
    approved = sum(1 for i in items if i.status == ChecklistItemStatus.approved)
    in_review = sum(
        1 for i in items
        if i.status in (ChecklistItemStatus.in_review, ChecklistItemStatus.needs_correction)
    )
    needed = sum(1 for i in items if i.status == ChecklistItemStatus.needed)
    overdue = sum(1 for i in items if is_item_overdue(i))
    return dict(total=total, approved=approved, in_review=in_review, needed=needed, overdue=overdue)


def _item_out(item: DocumentChecklistItem) -> ChecklistItemOut:
    return ChecklistItemOut(
        id=item.id,
        transaction_id=item.transaction_id,
        template_id=item.template_id,
        name=item.name,
        section=item.section,
        section_label=SECTION_LABELS.get(item.section, item.section),
        sort_order=item.sort_order,
        required=item.required,
        is_core=item.is_core,
        document_type=item.document_type.value if item.document_type else None,
        status=item.status.value,
        due_date=item.due_date,
        na_reason=item.na_reason,
        overdue=is_item_overdue(item),
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def _tx_out(tx: Transaction) -> TransactionOut:
    return TransactionOut(
        id=tx.id,
        organization_id=tx.organization_id,
        created_by=tx.created_by,
        property_address=tx.property_address,
        city=tx.city,
        state=tx.state,
        zip=tx.zip,
        county=tx.county,
        side=tx.side.value,
        financing_type=tx.financing_type.value,
        status=tx.status.value,
        contract_date=tx.contract_date,
        closing_date=tx.closing_date,
        possession_date=tx.possession_date,
        purchase_price=tx.purchase_price,
        earnest_money=tx.earnest_money,
        mls_number=tx.mls_number,
        days_to_close=_days_to_close(tx.closing_date),
        created_at=tx.created_at,
        updated_at=tx.updated_at,
    )


def _tx_card(tx: Transaction, items: list[DocumentChecklistItem]) -> TransactionCard:
    stats = _checklist_stats(items)
    return TransactionCard(
        id=tx.id,
        property_address=tx.property_address,
        city=tx.city,
        state=tx.state,
        zip=tx.zip,
        side=tx.side.value,
        status=tx.status.value,
        financing_type=tx.financing_type.value,
        contract_date=tx.contract_date,
        closing_date=tx.closing_date,
        days_to_close=_days_to_close(tx.closing_date),
        checklist_total=stats["total"],
        checklist_approved=stats["approved"],
        checklist_needed=stats["needed"],
        overdue_count=stats["overdue"],
        created_at=tx.created_at,
    )


# ─── Transaction CRUD ─────────────────────────────────────────────────────────

@router.get("", response_model=list[TransactionCard])
def list_transactions(
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[TransactionCard]:
    txs = session.exec(
        select(Transaction)
        .where(Transaction.organization_id == ctx.organization_id)
        .order_by(Transaction.created_at.desc())  # type: ignore[attr-defined]
    ).all()
    result = []
    for tx in txs:
        items = list(
            session.exec(
                select(DocumentChecklistItem).where(DocumentChecklistItem.transaction_id == tx.id)
            ).all()
        )
        result.append(_tx_card(tx, items))
    return result


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    body: TransactionCreate,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TransactionOut:
    try:
        side = TransactionSide(body.side)
        financing = FinancingType(body.financing_type)
    except ValueError as exc:
        raise HTTPException(422, str(exc))

    tx = Transaction(
        organization_id=ctx.organization_id,
        created_by=ctx.user.id,
        property_address=body.property_address,
        city=body.city,
        state=body.state,
        zip=body.zip,
        county=body.county,
        side=side,
        financing_type=financing,
        contract_date=body.contract_date,
        closing_date=body.closing_date,
        purchase_price=body.purchase_price,
        earnest_money=body.earnest_money,
        mls_number=body.mls_number,
    )
    session.add(tx)
    session.flush()

    instantiate_checklist(session, tx)

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="transaction_created",
        entity_type="transaction",
        entity_id=tx.id,
        new_value=tx.property_address,
    )

    session.commit()
    session.refresh(tx)
    return _tx_out(tx)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TransactionOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    return _tx_out(tx)


@router.patch("/{transaction_id}", response_model=TransactionOut)
def patch_transaction(
    transaction_id: str,
    body: TransactionPatch,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TransactionOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    old_addr = tx.property_address

    for key, value in body.model_dump(exclude_unset=True).items():
        try:
            if key == "side":
                value = TransactionSide(value)
            elif key == "financing_type":
                value = FinancingType(value)
            elif key == "status":
                value = TransactionStatus(value)
        except ValueError as exc:
            raise HTTPException(422, str(exc))
        setattr(tx, key, value)

    tx.updated_at = dt.datetime.now(dt.timezone.utc)
    session.add(tx)

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="transaction_updated",
        entity_type="transaction",
        entity_id=tx.id,
        old_value=old_addr,
        new_value=tx.property_address,
    )

    session.commit()
    session.refresh(tx)
    return _tx_out(tx)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    ctx: AuthContext = Depends(require_admin),
    session: Session = Depends(get_session),
) -> None:
    tx = get_owned_transaction(transaction_id, ctx, session)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="transaction_deleted",
        entity_type="transaction",
        entity_id=tx.id,
        old_value=tx.property_address,
    )
    session.delete(tx)
    session.commit()


# ─── Checklist ────────────────────────────────────────────────────────────────

@router.get("/{transaction_id}/checklist", response_model=ChecklistOut)
def get_checklist(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ChecklistOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    items = list(
        session.exec(
            select(DocumentChecklistItem)
            .where(DocumentChecklistItem.transaction_id == tx.id)
            .order_by(DocumentChecklistItem.sort_order)  # type: ignore[attr-defined]
        ).all()
    )
    stats = _checklist_stats(items)

    section_map: dict[str, list[DocumentChecklistItem]] = {key: [] for key, _ in SECTIONS}
    for item in items:
        if item.section in section_map:
            section_map[item.section].append(item)
        else:
            section_map.setdefault(item.section, []).append(item)

    sections = [
        ChecklistSectionOut(
            key=key,
            label=label,
            items=[_item_out(i) for i in section_map[key]],
            total=len(section_map[key]),
            approved=sum(1 for i in section_map[key] if i.status == ChecklistItemStatus.approved),
        )
        for key, label in SECTIONS
    ]

    return ChecklistOut(
        transaction_id=tx.id,
        sections=sections,
        total=stats["total"],
        approved=stats["approved"],
        in_review=stats["in_review"],
        needed=stats["needed"],
        overdue=stats["overdue"],
    )


@router.patch(
    "/{transaction_id}/checklist/{item_id}",
    response_model=ChecklistItemOut,
)
def patch_checklist_item(
    transaction_id: str,
    item_id: str,
    body: ChecklistItemPatch,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ChecklistItemOut:
    get_owned_transaction(transaction_id, ctx, session)
    item = session.get(DocumentChecklistItem, item_id)
    if item is None or item.transaction_id != transaction_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Checklist item not found")

    old_status = item.status.value

    if body.status is not None:
        try:
            new_status = ChecklistItemStatus(body.status)
        except ValueError:
            raise HTTPException(
                422, f"Invalid status '{body.status}'"
            )
        if new_status == ChecklistItemStatus.not_applicable and item.is_core and not ctx.is_admin:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Only admins can mark core items as N/A"
            )
        item.status = new_status

    if "due_date" in body.model_fields_set:
        item.due_date = body.due_date
    if body.na_reason is not None:
        item.na_reason = body.na_reason

    item.updated_at = dt.datetime.now(dt.timezone.utc)
    session.add(item)

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=transaction_id,
        actor_id=ctx.user.id,
        event_type="checklist_item_updated",
        entity_type="document_checklist_item",
        entity_id=item.id,
        old_value=old_status,
        new_value=item.status.value,
    )

    session.commit()
    session.refresh(item)
    return _item_out(item)


@router.post(
    "/{transaction_id}/checklist",
    response_model=ChecklistItemOut,
    status_code=status.HTTP_201_CREATED,
)
def add_checklist_item(
    transaction_id: str,
    body: ChecklistItemCreate,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ChecklistItemOut:
    tx = get_owned_transaction(transaction_id, ctx, session)

    max_order = session.exec(
        select(func.max(DocumentChecklistItem.sort_order)).where(
            DocumentChecklistItem.transaction_id == tx.id
        )
    ).one()

    doc_type: DocumentType | None = None
    if body.document_type:
        try:
            doc_type = DocumentType(body.document_type)
        except ValueError:
            raise HTTPException(
                422,
                f"Invalid document_type '{body.document_type}'",
            )

    item = DocumentChecklistItem(
        transaction_id=tx.id,
        name=body.name,
        section=body.section,
        sort_order=(max_order or 0) + 1,
        required=body.required,
        document_type=doc_type,
        due_date=body.due_date,
        created_by=ctx.user.id,
    )
    session.add(item)

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="checklist_item_added",
        entity_type="document_checklist_item",
        entity_id=item.id,
        new_value=item.name,
    )

    session.commit()
    session.refresh(item)
    return _item_out(item)
