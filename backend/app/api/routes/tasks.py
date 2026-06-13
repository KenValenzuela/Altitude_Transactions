"""Tasks: manual creation and status updates (open / done / not_applicable)."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import AuthContext, get_current_context, get_owned_transaction
from app.db.session import get_session
from app.models import Task, TaskStatus
from app.schemas import TaskCreate, TaskOut, TaskPatch
from app.services.audit import record as audit

router = APIRouter(tags=["tasks"])


@router.post(
    "/transactions/{transaction_id}/tasks",
    response_model=TaskOut,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    transaction_id: str,
    body: TaskCreate,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TaskOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    task = Task(
        transaction_id=tx.id,
        title=body.title,
        due_date=body.due_date,
        source="manual",
    )
    session.add(task)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="task_created",
        entity_type="task",
        entity_id=task.id,
        new_value=task.title,
    )
    session.commit()
    session.refresh(task)
    return TaskOut.model_validate(task)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
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
