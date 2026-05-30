from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, Contact, User
from app.schemas import ContactOut, ContactPatch
from app.services.transaction_service import _contact_out

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.patch("/{contact_id}", response_model=ContactOut)
def patch_contact(contact_id: str, patch: ContactPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    contact = session.get(Contact, contact_id)
    if not contact: raise HTTPException(status_code=404, detail="Contact not found")
    before = contact.model_dump_json()
    for key, value in patch.model_dump(exclude_unset=True).items(): setattr(contact, key, value)
    contact.updated_at = datetime.now(timezone.utc); contact.complete = bool(contact.name or contact.company or contact.email or contact.phone) if patch.complete is None else patch.complete
    session.add(contact); session.add(AuditEvent(transaction_id=contact.transaction_id, actor_type="user", actor_id=user.id, event_type="contact_updated", entity_type="contact", entity_id=contact.id, before_value=before, after_value=contact.model_dump_json())); session.commit(); session.refresh(contact)
    return _contact_out(contact)
