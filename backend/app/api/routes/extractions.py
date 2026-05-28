from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import Document, ExtractionJob, ExtractionStatus, User
from app.schemas import ConfirmRequest, TransactionDetail
from app.services import transaction_service
from app.services.extraction_service import get_extraction_service

router = APIRouter(prefix="/extractions", tags=["extractions"])


@router.post("/{job_id}/confirm", response_model=TransactionDetail)
def confirm_extraction(
    job_id: str,
    body: ConfirmRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TransactionDetail:
    """Human-in-the-loop commit: build the transaction from the extraction."""
    job = session.get(ExtractionJob, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extraction job not found")
    if job.status != ExtractionStatus.complete:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Extraction not ready (status={job.status.value})",
        )

    document = session.get(Document, job.document_id)
    result = get_extraction_service().extract(document)

    tx = transaction_service.build_from_extraction(
        session,
        owner_id=user.id,
        result=result,
        document=document,
        overrides=body.overrides,
    )
    return transaction_service.to_detail(session, tx)
