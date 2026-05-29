"""Document upload + extraction job orchestration."""
from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlmodel import Session

from app.core.config import settings
from app.models import Document, DocumentState, ExtractedField, ExtractionJob, ExtractionStatus
from app.services.extraction_service import get_extraction_service

PDF_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


def save_upload(
    session: Session,
    *,
    filename: str,
    content_type: str | None,
    data: bytes,
    transaction_id: str | None,
) -> tuple[Document, ExtractionJob]:
    """Persist file bytes, create Document + ExtractionJob, run the mock extraction.

    The extraction is modeled as a job: pending -> running -> complete. The mock
    runs synchronously, but the job lifecycle is real-shaped.
    """
    document = Document(
        transaction_id=transaction_id,
        name=filename,
        source="Upload",
        state=DocumentState.received,
        original_filename=filename,
        content_type=content_type,
        size_bytes=len(data),
    )
    session.add(document)
    session.commit()
    session.refresh(document)

    # Save bytes under uploads/{documentId}/{filename}
    dest_dir = os.path.join(settings.upload_dir, document.id)
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, filename), "wb") as fh:
        fh.write(data)

    job = ExtractionJob(document_id=document.id, status=ExtractionStatus.pending)
    session.add(job)
    session.commit()
    session.refresh(job)

    _run_extraction(session, job, document)
    return document, job


def _run_extraction(session: Session, job: ExtractionJob, document: Document) -> None:
    job.status = ExtractionStatus.running
    session.add(job)
    session.commit()

    try:
        service = get_extraction_service()
        result = service.extract(document)

        for f in result.fields:
            session.add(
                ExtractedField(
                    job_id=job.id,
                    label=f.label,
                    value=f.value,
                    confidence=f.confidence,
                    category=f.category,
                )
            )
        job.status = ExtractionStatus.complete
        job.completed_at = datetime.now(timezone.utc)
        session.add(job)
        session.commit()
    except Exception:  # pragma: no cover - defensive
        job.status = ExtractionStatus.failed
        session.add(job)
        session.commit()
        raise
