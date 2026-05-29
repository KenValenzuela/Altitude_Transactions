"""Transaction build + dashboard/detail assembly."""
from __future__ import annotations

from datetime import date

from sqlmodel import Session, select

from app.models import (
    Document,
    Party,
    PartyRole,
    Property,
    Transaction,
    TransactionStatus,
)
from app.schemas import (
    CountsOut,
    DeadlineOut,
    DocumentOut,
    MoneyOut,
    PartyOut,
    PropertyOut,
    StageOut,
    TransactionCard,
    TransactionDetail,
)
from app.services import deadline_service, task_service
from app.services.extraction_service import ExtractionResult

# Human labels for statuses.
STATUS_LABELS = {
    TransactionStatus.under_contract: "Under Contract",
    TransactionStatus.inspection: "Inspection",
    TransactionStatus.appraisal: "Appraisal",
    TransactionStatus.clear_to_close: "Clear to Close",
    TransactionStatus.closed: "Closed",
}

# Derived stage rail definition. Maps to TransactionStatus progression.
_RAIL = [
    ("under_contract", "Under Contract", [TransactionStatus.under_contract]),
    ("inspection", "Inspection", [TransactionStatus.inspection]),
    ("appraisal", "Appraisal", [TransactionStatus.appraisal]),
    ("loan", "Loan Approval", [TransactionStatus.clear_to_close]),
    ("closing", "Closing", [TransactionStatus.closed]),
]
_RAIL_INDEX = {
    TransactionStatus.under_contract: 0,
    TransactionStatus.inspection: 1,
    TransactionStatus.appraisal: 2,
    TransactionStatus.clear_to_close: 3,
    TransactionStatus.closed: 4,
}


# --- Build from extraction -------------------------------------------------


def build_from_extraction(
    session: Session,
    *,
    owner_id: str,
    result: ExtractionResult,
    document: Document | None,
    overrides: dict[str, str] | None = None,
) -> Transaction:
    """Create Transaction + Property + Parties + Deadlines + Tasks.

    `overrides` is a {fieldLabel-or-key: value} map applied to scalar fields.
    Supported override keys: address, city, county, price, earnest, loanType,
    closeDate.
    """
    overrides = overrides or {}

    def ov(key: str, default):
        return overrides[key] if key in overrides else default

    price = int(ov("price", result.price))
    earnest = int(ov("earnest", result.earnest))
    close_date = result.close_date
    if "closeDate" in overrides:
        close_date = _parse_date(overrides["closeDate"]) or close_date

    tx = Transaction(
        owner_id=owner_id,
        address=str(ov("address", result.address)),
        city=str(ov("city", result.city)),
        county=ov("county", result.county),
        status=TransactionStatus.under_contract,
        price=price,
        earnest=earnest,
        loan_type=ov("loanType", result.loan_type),
        close_date=close_date,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)

    prop = Property(
        transaction_id=tx.id,
        type="Single Family",
        is_rural=result.is_rural,
        has_hoa=result.has_hoa,
    )
    session.add(prop)

    for p in result.parties:
        try:
            role = PartyRole(p["role"])
        except ValueError:
            continue
        session.add(
            Party(
                transaction_id=tx.id,
                role=role,
                name=p.get("name") or role.value.title(),
                sub=p.get("sub"),
                phone=p.get("phone"),
                email=p.get("email"),
            )
        )

    deadline_service.build_deadlines(session, tx.id, result)
    task_service.build_tasks(session, tx.id, result)

    if document is not None:
        document.transaction_id = tx.id
        session.add(document)

    session.commit()
    session.refresh(tx)
    return tx


def _parse_date(value: str) -> date | None:
    from datetime import datetime

    for fmt in ("%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except (ValueError, AttributeError):
            continue
    return None


# --- Assembly helpers ------------------------------------------------------


def _days_to_close(close_date: date | None, today: date | None = None) -> int:
    if close_date is None:
        return 0
    today = today or date.today()
    return (close_date - today).days


def _progress(session: Session, transaction_id: str) -> float:
    tasks = task_service.list_tasks(session, transaction_id)
    countable = [t for t in tasks if t.state.value != "na"]
    if not countable:
        return 0.0
    done = sum(1 for t in countable if t.state.value == "done")
    return round(done / len(countable), 2)


def _next_action(session: Session, transaction_id: str) -> tuple[str, bool]:
    """Return (label, urgent) for the next upcoming deadline."""
    deadlines = deadline_service.list_deadlines(session, transaction_id)
    today = date.today()
    upcoming = [d for d in deadlines if d.date is not None and d.date >= today]
    if upcoming:
        nxt = upcoming[0]
        return f"{nxt.event} {nxt.date.strftime('%b %d')}", any(d.is_urgent for d in upcoming)
    # fall back to any dated deadline
    dated = [d for d in deadlines if d.date is not None]
    if dated:
        nxt = dated[0]
        return f"{nxt.event} {nxt.date.strftime('%b %d')}", False
    return "No upcoming deadlines", False


def _parties_label(session: Session, transaction_id: str) -> str:
    parties = session.exec(
        select(Party).where(Party.transaction_id == transaction_id)
    ).all()
    buyer = next((p for p in parties if p.role == PartyRole.buyer), None)
    seller = next((p for p in parties if p.role == PartyRole.seller), None)

    def last(name: str | None) -> str | None:
        if not name:
            return None
        return name.split()[-1]

    labels = [x for x in (last(buyer.name if buyer else None), last(seller.name if seller else None)) if x]
    return " · ".join(labels) if labels else ""


# --- Public assembly -------------------------------------------------------


def to_card(session: Session, tx: Transaction, active: bool = False) -> TransactionCard:
    next_label, next_urgent = _next_action(session, tx.id)
    deadlines = deadline_service.list_deadlines(session, tx.id)
    urgent = next_urgent or any(d.is_urgent for d in deadlines)
    return TransactionCard(
        id=tx.id,
        address=tx.address,
        city=tx.city,
        stage=STATUS_LABELS[tx.status],
        status=tx.status.value,
        days_to_close=_days_to_close(tx.close_date),
        progress=_progress(session, tx.id),
        next=next_label,
        urgent=urgent,
        parties=_parties_label(session, tx.id),
        price=tx.price,
        active=active,
    )


def list_cards(session: Session, owner_id: str) -> list[TransactionCard]:
    txs = session.exec(
        select(Transaction).where(Transaction.owner_id == owner_id)
    ).all()
    txs = sorted(txs, key=lambda t: t.created_at)
    cards = [to_card(session, t, active=(i == 0)) for i, t in enumerate(txs)]
    return cards


def _stage_rail(tx: Transaction) -> list[StageOut]:
    current_idx = _RAIL_INDEX[tx.status]
    stages: list[StageOut] = []
    for i, (sid, label, _statuses) in enumerate(_RAIL):
        done = i < current_idx or tx.status == TransactionStatus.closed
        current = i == current_idx and tx.status != TransactionStatus.closed
        stages.append(StageOut(id=sid, label=label, done=done, current=current))
    return stages


def _counts(session: Session, transaction_id: str) -> CountsOut:
    tasks = task_service.list_tasks(session, transaction_id)
    done = sum(1 for t in tasks if t.state.value == "done")
    doing = sum(1 for t in tasks if t.state.value == "doing")
    todo = sum(1 for t in tasks if t.state.value == "todo")
    na = sum(1 for t in tasks if t.state.value == "na")
    return CountsOut(done=done, doing=doing, todo=todo, na=na, active=done + doing + todo)


def to_detail(session: Session, tx: Transaction) -> TransactionDetail:
    prop = session.exec(
        select(Property).where(Property.transaction_id == tx.id)
    ).first()
    parties = session.exec(
        select(Party).where(Party.transaction_id == tx.id)
    ).all()
    documents = session.exec(
        select(Document).where(Document.transaction_id == tx.id)
    ).all()
    deadlines = deadline_service.list_deadlines(session, tx.id)
    tasks = task_service.list_tasks(session, tx.id)

    return TransactionDetail(
        id=tx.id,
        address=tx.address,
        city=tx.city,
        status=tx.status.value,
        property=PropertyOut.model_validate(prop) if prop else None,
        parties=[PartyOut.model_validate(p) for p in parties],
        stages=_stage_rail(tx),
        money=MoneyOut(
            price=tx.price,
            earnest=tx.earnest,
            close_date=tx.close_date,
            days_to_close=_days_to_close(tx.close_date),
        ),
        deadlines=[DeadlineOut.model_validate(d) for d in deadlines],
        tasks=task_service.grouped_tasks(tasks),
        documents=[DocumentOut.model_validate(d) for d in documents],
        counts=_counts(session, tx.id),
    )


def get_transaction(session: Session, transaction_id: str) -> Transaction | None:
    return session.get(Transaction, transaction_id)
