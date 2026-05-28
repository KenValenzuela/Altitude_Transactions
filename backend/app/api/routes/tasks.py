from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import Task, TaskState, User
from app.schemas import TaskOut, TaskPatch

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.patch("/{task_id}", response_model=TaskOut)
def patch_task(
    task_id: str,
    patch: TaskPatch,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskOut:
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    try:
        task.state = TaskState(patch.state)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid task state '{patch.state}'",
        )
    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskOut.model_validate(task)
