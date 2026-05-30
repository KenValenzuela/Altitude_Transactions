from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, ExtractedField, PopulationStatus, ReviewStatus, User
from app.schemas import ExtractedFieldOut, FieldPatch

router = APIRouter(prefix="/extracted-fields", tags=["extracted-fields"])
@router.patch("/{field_id}", response_model=ExtractedFieldOut)
def patch_field(field_id: str, patch: FieldPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    field = session.get(ExtractedField, field_id)
    if not field: raise HTTPException(status_code=404, detail="Extracted field not found")
    before = field.value
    if patch.action == "reject": field.review_status = ReviewStatus.rejected; ev="field_rejected"
    elif patch.value is not None and patch.value != field.value:
        field.value = patch.value; field.population_status = PopulationStatus.manual_override; field.review_status = ReviewStatus.edited; ev="field_edited"
    else:
        field.review_status = ReviewStatus.approved; ev="field_approved"
    field.reviewed_by = user.id; field.reviewed_at = datetime.now(timezone.utc)
    session.add(field); session.add(AuditEvent(transaction_id=field.transaction_id, actor_type="user", actor_id=user.id, event_type=ev, entity_type="extracted_field", entity_id=field.id, before_value=before, after_value=field.value)); session.commit(); session.refresh(field)
    return ExtractedFieldOut.model_validate({**field.model_dump(), "category": field.source_section})
