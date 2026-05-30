from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, Contact, Deadline, DocumentRequirement, ExtractedField, ReviewStatus, PopulationStatus, Task, TaskStatus, User
from app.schemas import *  # noqa: F403
from app.services import transaction_service
from app.services.transaction_service import _deadline_out, _task_out, _contact_out, _doc_out

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=list[TransactionCard])
def list_transactions(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return transaction_service.list_cards(session, user.id)

@router.get("/{transaction_id}", response_model=TransactionDetail)
def get_transaction(transaction_id: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tx = transaction_service.get_transaction(session, transaction_id)
    if tx is None or tx.owner_id != user.id: raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction_service.to_detail(session, tx)

@router.get("/{transaction_id}/extracted-fields", response_model=list[ExtractedFieldOut])
def fields(transaction_id: str, session: Session = Depends(get_session)):
    return [ExtractedFieldOut.model_validate({**f.model_dump(), "category": f.source_section}) for f in session.exec(select(ExtractedField).where(ExtractedField.transaction_id == transaction_id)).all()]

@router.get("/{transaction_id}/deadlines", response_model=list[DeadlineOut])
def deadlines(transaction_id: str, session: Session = Depends(get_session)):
    return [_deadline_out(d) for d in session.exec(select(Deadline).where(Deadline.transaction_id == transaction_id)).all()]

@router.get("/{transaction_id}/tasks", response_model=list[TaskOut])
def tasks(transaction_id: str, session: Session = Depends(get_session)):
    return [_task_out(t) for t in session.exec(select(Task).where(Task.transaction_id == transaction_id)).all()]

@router.get("/{transaction_id}/contacts", response_model=list[ContactOut])
def contacts(transaction_id: str, session: Session = Depends(get_session)):
    return [_contact_out(c) for c in session.exec(select(Contact).where(Contact.transaction_id == transaction_id)).all()]

@router.get("/{transaction_id}/documents", response_model=list[DocumentRequirementOut])
def docs(transaction_id: str, session: Session = Depends(get_session)):
    return [_doc_out(d) for d in session.exec(select(DocumentRequirement).where(DocumentRequirement.transaction_id == transaction_id)).all()]

@router.post("/{transaction_id}/documents", response_model=DocumentRequirementOut)
def upload_supporting(transaction_id: str, file: UploadFile = File(...), session: Session = Depends(get_session)):
    req = session.exec(select(DocumentRequirement).where(DocumentRequirement.transaction_id == transaction_id, DocumentRequirement.received_status == "missing")).first()
    if not req: raise HTTPException(status_code=404, detail="No missing requirement found")
    req.received_status = "received"; session.add(req); session.commit(); session.refresh(req)
    return _doc_out(req)

@router.get("/{transaction_id}/audit", response_model=list[AuditEventOut])
def audit(transaction_id: str, session: Session = Depends(get_session)):
    return [AuditEventOut.model_validate(a) for a in session.exec(select(AuditEvent).where(AuditEvent.transaction_id == transaction_id)).all()]
