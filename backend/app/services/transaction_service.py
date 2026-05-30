from __future__ import annotations

from datetime import date

from sqlmodel import Session, select

from app.models import Contact, Deadline, DocumentRequirement, ExtractionRun, ExtractedField, PostCloseTask, SourceDocument, Task, TaskStatus, Transaction, AuditEvent
from app.schemas import *  # noqa: F403
from app.services.demo_workflow import materialize_extraction


def _days(close: date | None) -> int:
    return (close - date.today()).days if close else 0


def _task_out(t: Task) -> TaskOut:
    state_map = {"not_started":"todo", "in_progress":"doing", "complete":"done", "not_applicable":"na"}
    return TaskOut.model_validate({**t.model_dump(), "group": t.category, "due": t.due_date.isoformat() if t.due_date else None, "state": state_map.get(t.status.value, t.status.value), "ai_note": t.notes, "is_post_close": t.category == "post_close"})


def _deadline_out(d: Deadline) -> DeadlineOut:
    return DeadlineOut.model_validate({**d.model_dump(), "event": d.event_name, "reference": d.section_reference, "category": d.section_reference, "date": d.due_date, "is_na": d.applicability.value == "not_applicable", "is_urgent": d.event_name in {"Inspection Objection Deadline", "Seller’s Property Disclosure Deadline", "Alternative Earnest Money Deadline"}})


def _doc_out(d: DocumentRequirement) -> DocumentRequirementOut:
    state = {"missing":"pending", "received":"received", "reviewed":"received", "approved":"received"}.get(d.received_status.value, "pending")
    return DocumentRequirementOut.model_validate({**d.model_dump(), "name": d.document_name, "source": d.category, "state": state})


def _contact_out(c: Contact) -> ContactOut:
    return ContactOut.model_validate({**c.model_dump(), "sub": c.company})


def list_cards(session: Session, owner_id: str) -> list[TransactionCard]:
    txs = session.exec(select(Transaction).where(Transaction.owner_id == owner_id)).all()
    cards=[]
    for i, tx in enumerate(txs):
        tasks = session.exec(select(Task).where(Task.transaction_id == tx.id)).all()
        countable=[t for t in tasks if t.status != TaskStatus.not_applicable]
        complete=sum(1 for t in countable if t.status == TaskStatus.complete)
        progress=round(complete/len(countable), 2) if countable else 0
        next_deadline=session.exec(select(Deadline).where(Deadline.transaction_id == tx.id, Deadline.due_date != None).order_by(Deadline.due_date)).first()  # noqa: E711
        contacts=session.exec(select(Contact).where(Contact.transaction_id == tx.id)).all()
        names=" · ".join([c.name for c in contacts if c.name][:2])
        cards.append(TransactionCard(id=tx.id, address=tx.property_address, city=tx.city, stage="Under Contract", status=tx.status.value, days_to_close=_days(tx.closing_date), progress=progress, next=f"{next_deadline.event_name} {next_deadline.due_date:%b %d}" if next_deadline and next_deadline.due_date else "Review extracted fields", urgent=bool(next_deadline), parties=names, price=tx.purchase_price, active=i==0))
    return cards


def grouped_tasks(tasks: list[Task]) -> list[TaskGroupOut]:
    groups: dict[str, list[TaskOut]]={}
    for t in tasks: groups.setdefault(t.category, []).append(_task_out(t))
    return [TaskGroupOut(group=k, items=v) for k,v in groups.items()]


def to_detail(session: Session, tx: Transaction) -> TransactionDetail:
    source_documents=session.exec(select(SourceDocument).where(SourceDocument.transaction_id == tx.id)).all()
    runs=session.exec(select(ExtractionRun).where(ExtractionRun.transaction_id == tx.id)).all()
    fields=session.exec(select(ExtractedField).where(ExtractedField.transaction_id == tx.id)).all()
    deadlines=session.exec(select(Deadline).where(Deadline.transaction_id == tx.id)).all()
    tasks=session.exec(select(Task).where(Task.transaction_id == tx.id)).all()
    contacts=session.exec(select(Contact).where(Contact.transaction_id == tx.id)).all()
    docs=session.exec(select(DocumentRequirement).where(DocumentRequirement.transaction_id == tx.id)).all()
    post=session.exec(select(PostCloseTask).where(PostCloseTask.transaction_id == tx.id)).all()
    audit=session.exec(select(AuditEvent).where(AuditEvent.transaction_id == tx.id).order_by(AuditEvent.created_at)).all()
    done=sum(1 for t in tasks if t.status == TaskStatus.complete); doing=sum(1 for t in tasks if t.status == TaskStatus.in_progress); todo=sum(1 for t in tasks if t.status == TaskStatus.not_started); na=sum(1 for t in tasks if t.status == TaskStatus.not_applicable)
    field_out=[ExtractedFieldOut.model_validate({**f.model_dump(), "category": (f.source_section or "Contract").split()[0]}) for f in fields]
    return TransactionDetail(
        id=tx.id, property_address=tx.property_address, address=tx.property_address, city=tx.city, state=tx.state, zip=tx.zip, county=tx.county, legal_description=tx.legal_description, contract_date=tx.contract_date, closing_date=tx.closing_date, possession_date=tx.possession_date, possession_time=tx.possession_time, status=tx.status.value, risk_level=tx.risk_level.value, completion_percent=tx.completion_percent, created_at=tx.created_at, updated_at=tx.updated_at,
        source_documents=[SourceDocumentOut.model_validate(d) for d in source_documents], extraction_runs=[ExtractionRunOut.model_validate(r) for r in runs], extracted_fields=field_out, deadlines=[_deadline_out(d) for d in deadlines], tasks=grouped_tasks(tasks), contacts=[_contact_out(c) for c in contacts], document_requirements=[_doc_out(d) for d in docs], post_close_tasks=[PostCloseTaskOut.model_validate(p) for p in post], audit_events=[AuditEventOut.model_validate(a) for a in audit],
        property=PropertyOut(id=tx.id, is_rural=False, has_hoa=True), parties=[_contact_out(c) for c in contacts], stages=[StageOut(id="under_contract", label="Under Contract", done=True), StageOut(id="review", label="Review", done=False, current=True), StageOut(id="active", label="Active Ops", done=False), StageOut(id="closing", label="Closing", done=False), StageOut(id="closed", label="Closed", done=False)], money=MoneyOut(price=tx.purchase_price, earnest=tx.earnest_money, close_date=tx.closing_date, days_to_close=_days(tx.closing_date)), documents=[_doc_out(d) for d in docs], counts=CountsOut(done=done, doing=doing, todo=todo, na=na, active=done+doing+todo))


def get_transaction(session: Session, transaction_id: str) -> Transaction | None:
    return session.get(Transaction, transaction_id)


def build_from_extraction(session: Session, owner_id: str, run: ExtractionRun, doc: SourceDocument) -> Transaction:
    return materialize_extraction(session, run, doc, owner_id)
