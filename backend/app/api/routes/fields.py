from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, ExtractedField, PopulationStatus, ReviewStatus, User
from app.schemas import ExtractedFieldOut, FieldPatch

router = APIRouter(prefix="/extracted-fields", tags=["extracted-fields"])


def _resolve_decision(patch: FieldPatch) -> str:
    """Resolve the effective decision from either the new `decision` field or legacy `action`."""
    if patch.decision:
        return patch.decision
    # Legacy action mapping
    if patch.action == "reject":
        return "reject"
    if patch.action in ("na", "not_applicable"):
        return "mark_not_applicable"
    if patch.action == "unavailable":
        return "mark_unavailable"
    if patch.value is not None:
        return "edit"
    return "approve"


@router.patch("/{field_id}", response_model=ExtractedFieldOut)
def patch_field(field_id: str, patch: FieldPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    field = session.get(ExtractedField, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Extracted field not found")

    before = field.value
    decision = _resolve_decision(patch)

    if decision == "reject":
        field.review_status = ReviewStatus.rejected
        field.review_decision = "rejected"
        if patch.reason:
            field.rejection_reason = patch.reason
        ev = "field_rejected"

    elif decision == "mark_not_applicable":
        field.review_status = ReviewStatus.rejected
        field.review_decision = "marked_not_applicable"
        field.population_status = PopulationStatus.not_applicable
        field.applicability_status = "not_applicable"
        if patch.reason:
            field.rejection_reason = patch.reason
        ev = "field_marked_na"

    elif decision == "mark_unavailable":
        field.review_status = ReviewStatus.rejected
        field.review_decision = "marked_unavailable"
        field.availability_status = "unavailable_now"
        if patch.unavailable_reason or patch.reason:
            field.rejection_reason = patch.unavailable_reason or patch.reason
        ev = "field_marked_unavailable"

    elif decision == "edit" or (patch.value is not None and patch.value != field.value):
        if not field.original_value:
            field.original_value = field.value
        field.edited_value = patch.value
        field.value = patch.value
        field.population_status = PopulationStatus.manual_override
        field.review_status = ReviewStatus.edited
        field.review_decision = "edited"
        field.extraction_method = "human_corrected"
        ev = "field_edited"

    else:
        field.review_status = ReviewStatus.approved
        field.review_decision = "approved"
        ev = "field_approved"

    field.reviewed_by = user.id
    field.reviewed_at = datetime.now(timezone.utc)

    meta: dict = {}
    if patch.reason:
        meta["reason"] = patch.reason
    if patch.unavailable_reason:
        meta["unavailable_reason"] = patch.unavailable_reason

    session.add(field)
    import json as _json
    session.add(AuditEvent(
        transaction_id=field.transaction_id, actor_type="user", actor_id=user.id,
        event_type=ev, entity_type="extracted_field", entity_id=field.id,
        before_value=before, after_value=field.value,
        metadata_json=_json.dumps(meta) if meta else None,
    ))
    session.commit()
    session.refresh(field)
    return ExtractedFieldOut.model_validate({**field.model_dump(), "category": field.source_section})
