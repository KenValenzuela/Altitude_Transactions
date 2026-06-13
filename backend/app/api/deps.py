"""FastAPI dependencies: authentication, org context, RBAC, rate limiting."""
from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_session
from app.models import OrganizationMember, Role, Transaction, User

_bearer = HTTPBearer(auto_error=False)


@dataclass
class AuthContext:
    user: User
    organization_id: str
    role: Role

    @property
    def is_admin(self) -> bool:
        return self.role == Role.admin

    @property
    def can_review(self) -> bool:
        # MVP: admins, TCs, and agents may review; template/checklist-row
        # management stays admin-only.
        return self.role in (Role.admin, Role.tc, Role.agent)


def get_current_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: Session = Depends(get_session),
) -> AuthContext:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = session.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown user")
    membership = session.exec(
        select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    ).first()
    if membership is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No organization membership")
    return AuthContext(user=user, organization_id=membership.organization_id, role=membership.role)


def require_admin(ctx: AuthContext = Depends(get_current_context)) -> AuthContext:
    if not ctx.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin role required")
    return ctx


def get_owned_transaction(transaction_id: str, ctx: AuthContext, session: Session) -> Transaction:
    """Fetch a transaction scoped to the caller's organization, or 404."""
    tx = session.get(Transaction, transaction_id)
    if tx is None or tx.organization_id != ctx.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaction not found")
    return tx


class RateLimiter:
    """Minimal in-memory sliding-window limiter (per process)."""

    def __init__(self, max_calls: int, window_seconds: float = 60.0) -> None:
        self.max_calls = max_calls
        self.window = window_seconds
        self._calls: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        calls = self._calls[key]
        while calls and now - calls[0] > self.window:
            calls.popleft()
        if len(calls) >= self.max_calls:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Extraction rate limit reached; try again shortly",
            )
        calls.append(now)


extraction_rate_limiter = RateLimiter(settings.extraction_rate_limit_per_minute)

__all__ = [
    "AuthContext",
    "get_current_context",
    "require_admin",
    "get_owned_transaction",
    "get_session",
    "extraction_rate_limiter",
]
