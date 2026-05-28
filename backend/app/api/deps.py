"""Shared FastAPI dependencies."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import User

DEMO_TOKEN = "demo-token-altitude"  # noqa: S105 - fake token for stubbed auth


def get_current_user(session: Session = Depends(get_session)) -> User:
    """Stubbed auth: returns the seeded demo broker.

    Real-shaped dependency so it is trivially swappable for OAuth/JWT later.
    No passwords are checked.
    """
    user = session.exec(select(User)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authenticated user available",
        )
    return user


__all__ = ["get_current_user", "get_session", "DEMO_TOKEN"]
