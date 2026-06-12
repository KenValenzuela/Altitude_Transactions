"""Task status updates (open / done / not_applicable)."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import AuthContext, get_current_context, get_owned_transaction
from app.db.session import get_session
from app.models import Task, TaskStatus
from app.schemas import TaskOut, TaskPatch
from app.services.audit import record as audit

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.patch("/{task_id}", response_model=TaskOut)
def patch_task(
    task_id: str,
    body: TaskPatch,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TaskOut:
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    # Org scoping via the parent transaction.
    get_owned_transaction(task.transaction_id, ctx, session)

    if body.status is None:
        raise HTTPException(422, "status is required")
    try:
        new_status = TaskStatus(body.status)
    except ValueError:
        raise HTTPException(422, f"Invalid task status '{body.status}'")

    old_status = task.status.value
    now = dt.datetime.now(dt.timezone.utc)
    task.status = new_status
    task.completed_at = now if new_status == TaskStatus.done else None
    task.updated_at = now
    session.add(task)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=task.transaction_id,
        actor_id=ctx.user.id,
        event_type="task_status_changed",
        entity_type="task",
        entity_id=task.id,
        old_value=old_status,
        new_value=new_status.value,
    )
    session.commit()
    session.refresh(task)
    return TaskOut.model_validate(task)
