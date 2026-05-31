from fastapi import APIRouter, Depends

from app.api.deps import DEV_TOKEN, get_current_user
from app.models import User
from app.schemas import SessionOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/session", response_model=SessionOut)
def create_session(user: User = Depends(get_current_user)) -> SessionOut:
    """Stubbed login: returns the seeded broker and a dev token."""
    return SessionOut(user=UserOut.model_validate(user), token=DEV_TOKEN)
