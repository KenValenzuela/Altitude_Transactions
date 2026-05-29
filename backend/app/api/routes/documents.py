from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_session
from app.models import Document, DocumentState, ExtractedField, ExtractionJob, User
from app.schemas import (
    DocumentOut,
    DocumentPatch,
    ExtractedFieldOut,
    ExtractionDeadline,
    ExtractionFlag,
    ExtractionJobOut,
    UploadOut,
)
from app.services import document_service
from app.services.document_service import PDF_CONTENT_TYPES
from app.services.extraction_service import get_extraction_service

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=UploadOut)
async def upload_document(
    file: UploadFile = File(...),
    transactionId: str | None = Form(default=None),  # noqa: N803 - camelCase form field
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> UploadOut:
    if file.content_type not in PDF_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only PDF uploads are supported (got {file.content_type})",
        )
    data = await file.read()
    document, job = document_service.save_upload(
        session,
        filename=file.filename or "upload.pdf",
        content_type=file.content_type,
        data=data,
        transaction_id=transactionId,
    )
    return UploadOut(document_id=document.id, status="uploaded", extraction_job_id=job.id)


@router.get("/{document_id}/extraction", response_model=ExtractionJobOut)
def get_extraction(
    document_id: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ExtractionJobOut:
    job = session.exec(
        select(ExtractionJob).where(ExtractionJob.document_id == document_id)
    ).first()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction job not found")

    fields = session.exec(
        select(ExtractedField).where(ExtractedField.job_id == job.id)
    ).all()

    # Deadlines + flags come from the (mocked) extraction result so the review
    # screen can show them alongside the stored fields.
    result = get_extraction_service().extract(None)
    deadlines = [
        ExtractionDeadline(
            event=d.event,
            reference=d.reference,
            category=d.category,
            date=d.date,
            raw_value=d.raw_value,
            is_na=d.is_na,
        )
        for d in result.deadlines
    ]
    flags = [ExtractionFlag(title=f.title, detail=f.detail) for f in result.flags]

    return ExtractionJobOut(
        id=job.id,
        status=job.status.value,
        fields=[ExtractedFieldOut.model_validate(f) for f in fields],
        deadlines=deadlines,
        flags=flags,
    )


@router.patch("/{document_id}", response_model=DocumentOut)
def patch_document(
    document_id: str,
    patch: DocumentPatch,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> DocumentOut:
    doc = session.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    try:
        doc.state = DocumentState(patch.state)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document state '{patch.state}'",
        )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return DocumentOut.model_validate(doc)
