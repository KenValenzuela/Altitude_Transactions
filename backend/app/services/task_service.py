from sqlmodel import Session, select
from app.models import Task
from app.services.transaction_service import grouped_tasks

def list_tasks(session: Session, transaction_id: str):
    return session.exec(select(Task).where(Task.transaction_id == transaction_id)).all()
