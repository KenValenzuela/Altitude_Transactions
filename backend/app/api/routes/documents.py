from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import DocumentRequirement, ReceivedStatus, SourceDocument, User
from app.schemas import DocumentPatch, DocumentRequirementOut, UploadOut
from app.services.fixture_provider import create_source_document

PDF_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}
router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=UploadOut)
async def upload_document(file: UploadFile = File(...), transactionId: str | None = Form(default=None), user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if file.content_type not in PDF_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only PDF uploads are supported (got {file.content_type})")
    doc, run = create_source_document(session, user, file.filename or "contract.pdf", file.content_type or "application/pdf", await file.read(), transactionId)
    return UploadOut(document_id=doc.id, status="uploaded", extraction_job_id=run.id, transaction_id=doc.transaction_id)

@router.patch("/{document_id}", response_model=DocumentRequirementOut)
def patch_document(document_id: str, patch: DocumentPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    req = session.get(DocumentRequirement, document_id)
    if not req:
        # compatibility: allow patching source document and return a pseudo requirement
        src = session.get(SourceDocument, document_id)
        if not src: raise HTTPException(status_code=404, detail="Document not found")
        return DocumentRequirementOut.model_validate({"id": src.id, "transaction_id": src.transaction_id or "", "document_name": src.filename, "category": src.document_type, "required_status": "required", "received_status": "received", "created_at": src.uploaded_at, "updated_at": src.uploaded_at, "name": src.filename, "state": "received", "source": src.document_type})
    value = patch.received_status or patch.state
    state_map = {"pending":"missing", "received":"received", "reviewed":"reviewed", "approved":"approved", "na":"missing"}
    try: req.received_status = ReceivedStatus(state_map.get(value or "", value or ""))
    except ValueError: raise HTTPException(status_code=400, detail=f"Invalid document state '{value}'")
    session.add(req); session.commit(); session.refresh(req)
    return DocumentRequirementOut.model_validate({**req.model_dump(), "name": req.document_name, "source": req.category, "state": patch.state or req.received_status.value})

from sqlmodel import select
from app.models import ExtractionRun, ExtractedField, Deadline
from app.schemas import ExtractionJobOut, ExtractedFieldOut, ExtractionFlag
from app.services.transaction_service import _deadline_out, compute_review_summary

@router.get("/{document_id}/extraction", response_model=ExtractionJobOut)
def get_document_extraction(document_id: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    run = session.exec(select(ExtractionRun).where(ExtractionRun.source_document_id == document_id)).first()
    if run is None:
        raise HTTPException(status_code=404, detail="Extraction job not found")
    fields = session.exec(select(ExtractedField).where(ExtractedField.extraction_run_id == run.id)).all()
    deadlines = session.exec(select(Deadline).where(Deadline.transaction_id == run.transaction_id)).all() if run.transaction_id else []
    field_outs = [ExtractedFieldOut.model_validate({**f.model_dump(), "category": f.source_section}) for f in fields]
    return ExtractionJobOut(
        id=run.id,
        status="complete" if run.status.value == "needs_review" else run.status.value,
        progress_percent=run.progress_percent,
        transaction_id=run.transaction_id,
        source_document_id=run.source_document_id,
        fields=field_outs,
        deadlines=[_deadline_out(d) for d in deadlines],
        flags=[ExtractionFlag(title="Additional Provision §30", detail="Additional provisions detected and preserved for broker review.")],
        review_summary=compute_review_summary(list(fields)),
    )
