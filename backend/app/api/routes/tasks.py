from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import AuditEvent, PostCloseTask, Task, TaskStatus, User
from app.schemas import PostCloseTaskOut, TaskOut, TaskPatch
from app.services.transaction_service import _task_out

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _resolve_status(value: str | None) -> TaskStatus:
    legacy = {"todo": "not_started", "doing": "in_progress", "done": "complete", "na": "not_applicable"}
    try:
        return TaskStatus(legacy.get(value or "", value or ""))
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid task state '{value}'")


@router.patch("/{task_id}", response_model=TaskOut | PostCloseTaskOut)
def patch_task(task_id: str, patch: TaskPatch, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    now = datetime.now(timezone.utc)
    value = patch.status or patch.state
    new_status = _resolve_status(value)

    # Regular task
    task = session.get(Task, task_id)
    if task:
        before = task.status.value
        task.status = new_status
        task.notes = patch.notes if patch.notes is not None else task.notes
        task.updated_at = now
        if new_status == TaskStatus.complete:
            task.completed_at = now
        event_type = ("task_completed" if new_status == TaskStatus.complete
                      else "task_marked_not_applicable" if new_status == TaskStatus.not_applicable
        else "task_updated")
        session.add(task)
        session.add(AuditEvent(transaction_id=task.transaction_id, actor_type="user", actor_id=user.id,
                               event_type=event_type, entity_type="task", entity_id=task.id,
                               before_value=before, after_value=new_status.value))
        session.commit()
        session.refresh(task)
        return _task_out(task)

    # Post-close task
    pc_task = session.get(PostCloseTask, task_id)
    if pc_task:
        pc_task.status = new_status
        pc_task.updated_at = now
        if new_status == TaskStatus.complete:
            pc_task.date_completed = now.date()
        session.add(pc_task)
        session.commit()
        session.refresh(pc_task)
        return PostCloseTaskOut.model_validate(pc_task.model_dump())

    raise HTTPException(status_code=404, detail="Task not found")
