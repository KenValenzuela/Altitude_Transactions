"""Authentication routes: login and current user."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import AuthContext, get_current_context
from app.core.security import create_access_token, verify_password
from app.db.session import get_session
from app.models import OrganizationMember, User
from app.schemas import LoginRequest, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(user: User, org_id: str | None = None, role: str | None = None) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        role=role,
        organization_id=org_id,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenOut)
def login(body: LoginRequest, session: Session = Depends(get_session)) -> TokenOut:
    user = session.exec(select(User).where(User.email == body.email)).first()
    if user is None or not user.is_active or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    membership = session.exec(
        select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    ).first()
    token = create_access_token(user.id)
    return TokenOut(
        access_token=token,
        user=_user_out(
            user,
            org_id=membership.organization_id if membership else None,
            role=membership.role.value if membership else None,
        ),
    )


@router.get("/me", response_model=UserOut)
def me(ctx: AuthContext = Depends(get_current_context)) -> UserOut:
    return _user_out(ctx.user, org_id=ctx.organization_id, role=ctx.role.value)
