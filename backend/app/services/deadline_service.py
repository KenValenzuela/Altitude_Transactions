from sqlmodel import Session, select
from app.models import Deadline

def list_deadlines(session: Session, transaction_id: str):
    return session.exec(select(Deadline).where(Deadline.transaction_id == transaction_id).order_by(Deadline.due_date)).all()
