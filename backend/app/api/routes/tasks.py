from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, Task, TaskStatus, User
from app.schemas import TaskOut, TaskPatch
from app.services.transaction_service import _task_out

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.patch("/{task_id}", response_model=TaskOut)
def patch_task(task_id: str, patch: TaskPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    value = patch.status or patch.state
    legacy = {"todo":"not_started", "doing":"in_progress", "done":"complete", "na":"not_applicable"}
    try: new_status = TaskStatus(legacy.get(value or "", value or ""))
    except ValueError: raise HTTPException(status_code=400, detail=f"Invalid task state '{value}'")
    before = task.status.value; task.status = new_status; task.notes = patch.notes if patch.notes is not None else task.notes; task.updated_at = datetime.now(timezone.utc)
    if new_status == TaskStatus.complete: task.completed_at = datetime.now(timezone.utc)
    session.add(task); session.add(AuditEvent(transaction_id=task.transaction_id, actor_type="user", actor_id=user.id, event_type="task_completed" if new_status == TaskStatus.complete else "task_marked_not_applicable" if new_status == TaskStatus.not_applicable else "task_updated", entity_type="task", entity_id=task.id, before_value=before, after_value=new_status.value)); session.commit(); session.refresh(task)
    return _task_out(task)
