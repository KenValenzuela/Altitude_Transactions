from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import User
from app.schemas import DeadlineOut, TransactionCard, TransactionDetail
from app.services import deadline_service, transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionCard])
def list_transactions(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[TransactionCard]:
    return transaction_service.list_cards(session, user.id)


@router.get("/{transaction_id}", response_model=TransactionDetail)
def get_transaction(
    transaction_id: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TransactionDetail:
    tx = transaction_service.get_transaction(session, transaction_id)
    if tx is None or tx.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction_service.to_detail(session, tx)


@router.get("/{transaction_id}/deadlines", response_model=list[DeadlineOut])
def get_deadlines(
    transaction_id: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[DeadlineOut]:
    tx = transaction_service.get_transaction(session, transaction_id)
    if tx is None or tx.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return [DeadlineOut.model_validate(d) for d in deadline_service.list_deadlines(session, transaction_id)]
