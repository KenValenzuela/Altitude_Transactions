"""File upload, listing, and authorized download.

Uploads go to a transaction (optionally targeting a checklist row). The file is
stored via the storage backend under a server-generated key, the checklist row
moves to `uploaded`, and a pending ExtractionJob is queued (rate-limited).
Downloads are authorized + org-scoped; files are never publicly addressable.
"""
from __future__ import annotations

import datetime as dt
import hashlib

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlmodel import Session, func, select

from app.api.deps import (
    AuthContext,
    extraction_rate_limiter,
    get_current_context,
    get_owned_transaction,
)
from app.core.config import settings
from app.db.session import get_session
from app.models import (
    ChecklistItemStatus,
    DocumentChecklistItem,
    ExtractionJob,
    ExtractionJobStatus,
    UploadedFile,
)
from app.schemas import UploadOut, UploadedFileOut
from app.services.audit import record as audit
from app.services.storage import get_storage, make_storage_key

PDF_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}

router = APIRouter(tags=["files"])


def _file_out(f: UploadedFile) -> UploadedFileOut:
    return UploadedFileOut.model_validate(f)


@router.post(
    "/transactions/{transaction_id}/files",
    response_model=UploadOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_file(
    transaction_id: str,
    file: UploadFile = File(...),
    checklist_item_id: str | None = Form(default=None, alias="checklistItemId"),
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> UploadOut:
    tx = get_owned_transaction(transaction_id, ctx, session)

    if file.content_type not in PDF_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only PDF uploads are supported (got {file.content_type})",
        )
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            413, f"File exceeds {settings.max_upload_bytes // (1024 * 1024)} MB limit"
        )

    item: DocumentChecklistItem | None = None
    if checklist_item_id:
        item = session.get(DocumentChecklistItem, checklist_item_id)
        if item is None or item.transaction_id != tx.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Checklist item not found")

    # One extraction job per upload; throttle before doing any work.
    extraction_rate_limiter.check(ctx.user.id)

    storage_key = make_storage_key(ctx.organization_id, tx.id)
    get_storage().put(storage_key, data)

    version = 1
    if item is not None:
        prior = session.exec(
            select(func.count())
            .select_from(UploadedFile)
            .where(UploadedFile.checklist_item_id == item.id)
        ).one()
        version = int(prior or 0) + 1

    uploaded = UploadedFile(
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        checklist_item_id=item.id if item else None,
        version=version,
        original_filename=file.filename or "document.pdf",
        content_type=file.content_type or "application/pdf",
        size_bytes=len(data),
        sha256=hashlib.sha256(data).hexdigest(),
        storage_key=storage_key,
        uploaded_by=ctx.user.id,
    )
    session.add(uploaded)
    session.flush()

    job = ExtractionJob(
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        file_id=uploaded.id,
        checklist_item_id=item.id if item else None,
        status=ExtractionJobStatus.pending,
        provider=settings.extraction_provider,
        schema_version=settings.extraction_schema_version,
        created_by=ctx.user.id,
    )
    session.add(job)
    session.flush()

    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="document_uploaded",
        entity_type="uploaded_file",
        entity_id=uploaded.id,
        new_value=uploaded.original_filename,
        source_file_id=uploaded.id,
        metadata={"checklistItemId": item.id if item else None, "version": version},
    )

    if item is not None:
        old_status = item.status.value
        item.status = ChecklistItemStatus.uploaded
        item.updated_at = dt.datetime.now(dt.timezone.utc)
        session.add(item)
        if old_status != item.status.value:
            audit(
                session,
                organization_id=ctx.organization_id,
                transaction_id=tx.id,
                actor_id=ctx.user.id,
                event_type="checklist_item_status_changed",
                entity_type="document_checklist_item",
                entity_id=item.id,
                old_value=old_status,
                new_value=item.status.value,
                source_file_id=uploaded.id,
            )

    session.commit()
    return UploadOut(
        file_id=uploaded.id,
        checklist_item_id=item.id if item else None,
        extraction_job_id=job.id,
        version=version,
        status="uploaded",
    )


@router.get("/transactions/{transaction_id}/files", response_model=list[UploadedFileOut])
def list_files(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[UploadedFileOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    files = session.exec(
        select(UploadedFile)
        .where(UploadedFile.transaction_id == tx.id)
        .order_by(UploadedFile.uploaded_at.desc())  # type: ignore[attr-defined]
    ).all()
    return [_file_out(f) for f in files]


@router.get("/files/{file_id}/download")
def download_file(
    file_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> Response:
    f = session.get(UploadedFile, file_id)
    if f is None or f.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    try:
        data = get_storage().get(f.storage_key)
    except FileNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File content missing from storage")
    return Response(
        content=data,
        media_type=f.content_type,
        headers={"Content-Disposition": f'attachment; filename="{f.original_filename}"'},
    )
