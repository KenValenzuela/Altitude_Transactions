"""Extraction job routes: status polling, field results, retry."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import (
    AuthContext,
    extraction_rate_limiter,
    get_current_context,
    get_owned_transaction,
)
from app.db.session import get_session
from app.models import ExtractedField, ExtractionJob, ExtractionJobStatus
from app.schemas import ExtractedFieldOut, ExtractionJobDetailOut, ExtractionJobOut
from app.services.extraction import run_extraction_job

router = APIRouter(tags=["extractions"])


def _job_out(job: ExtractionJob) -> dict:
    return dict(
        id=job.id,
        transaction_id=job.transaction_id,
        file_id=job.file_id,
        checklist_item_id=job.checklist_item_id,
        status=job.status.value,
        document_type=job.document_type.value if job.document_type else None,
        classification_confidence=job.classification_confidence,
        provider=job.provider,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )


def _get_owned_job(job_id: str, ctx: AuthContext, session: Session) -> ExtractionJob:
    job = session.get(ExtractionJob, job_id)
    if job is None or job.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Extraction job not found")
    return job


@router.get("/extraction-jobs/{job_id}", response_model=ExtractionJobDetailOut)
def get_extraction_job(
    job_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ExtractionJobDetailOut:
    job = _get_owned_job(job_id, ctx, session)
    fields = session.exec(
        select(ExtractedField)
        .where(ExtractedField.job_id == job.id)
        .order_by(ExtractedField.created_at)  # type: ignore[arg-type]
    ).all()
    return ExtractionJobDetailOut(
        **_job_out(job),
        fields=[ExtractedFieldOut.model_validate(f) for f in fields],
    )


@router.get(
    "/transactions/{transaction_id}/extraction-jobs",
    response_model=list[ExtractionJobOut],
)
def list_extraction_jobs(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[ExtractionJobOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    jobs = session.exec(
        select(ExtractionJob)
        .where(ExtractionJob.transaction_id == tx.id)
        .order_by(ExtractionJob.created_at.desc())  # type: ignore[attr-defined]
    ).all()
    return [ExtractionJobOut(**_job_out(j)) for j in jobs]


@router.post("/extraction-jobs/{job_id}/retry", response_model=ExtractionJobOut)
def retry_extraction_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> ExtractionJobOut:
    job = _get_owned_job(job_id, ctx, session)
    if job.status != ExtractionJobStatus.failed:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"Only failed jobs can be retried (status: {job.status.value})"
        )
    extraction_rate_limiter.check(ctx.user.id)
    background_tasks.add_task(run_extraction_job, job.id)
    return ExtractionJobOut(**_job_out(job))
