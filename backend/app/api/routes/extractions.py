from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_session
from app.models import ExtractionRun, ExtractedField, SourceDocument, Transaction, User, ExtractionStatus
from app.schemas import ConfirmRequest, DeadlineOut, ExtractionFlag, ExtractionJobOut, ExtractedFieldOut, TransactionDetail
from app.services import transaction_service
from app.services.demo_workflow import DEADLINE_DATA

router = APIRouter(prefix="/extractions", tags=["extractions"])

@router.post("/start", response_model=ExtractionJobOut)
def start_extraction(body: dict, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    source_document_id = body.get("sourceDocumentId") or body.get("source_document_id") or body.get("documentId")
    if not source_document_id:
        raise HTTPException(status_code=400, detail="sourceDocumentId is required")
    doc = session.get(SourceDocument, source_document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Source document not found")
    run = ExtractionRun(source_document_id=doc.id, transaction_id=doc.transaction_id, status=ExtractionStatus.needs_review, completed_at=__import__('datetime').datetime.now(__import__('datetime').timezone.utc), progress_percent=100)
    session.add(run); session.commit(); session.refresh(run)
    return get_run(run.id, user, session)

@router.get("/{run_id}", response_model=ExtractionJobOut)
def get_run(run_id: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    run = session.get(ExtractionRun, run_id)
    if not run: raise HTTPException(status_code=404, detail="Extraction run not found")
    fields = session.exec(select(ExtractedField).where(ExtractedField.extraction_run_id == run.id)).all()
    return ExtractionJobOut(id=run.id, status=run.status.value, progress_percent=run.progress_percent, transaction_id=run.transaction_id, source_document_id=run.source_document_id, fields=[ExtractedFieldOut.model_validate({**f.model_dump(), "category": f.source_section}) for f in fields], deadlines=[], flags=[ExtractionFlag(title="Additional Provision §30", detail="Additional provisions detected and preserved for broker review.")])

@router.get("/{run_id}/events")
def run_events(run_id: str):
    return {"detail": "SSE deferred; use polling on GET /api/extractions/{run_id}.", "runId": run_id}

@router.post("/{job_id}/confirm", response_model=TransactionDetail)
def confirm_extraction(job_id: str, body: ConfirmRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    run = session.get(ExtractionRun, job_id)
    if not run: raise HTTPException(status_code=404, detail="Extraction job not found")
    doc = session.get(SourceDocument, run.source_document_id)
    if not doc: raise HTTPException(status_code=404, detail="Source document not found")
    tx = transaction_service.build_from_extraction(session, user.id, run, doc) if not run.transaction_id else session.get(Transaction, run.transaction_id)
    return transaction_service.to_detail(session, tx)
