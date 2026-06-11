"""Audit log writer. Every meaningful action goes through here."""
from __future__ import annotations

import json

from sqlmodel import Session

from app.models import ActorType, AuditLog


def record(
    session: Session,
    *,
    organization_id: str,
    event_type: str,
    transaction_id: str | None = None,
    actor_id: str | None = None,
    actor_type: ActorType = ActorType.user,
    entity_type: str = "",
    entity_id: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
    source_file_id: str | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    """Append an audit event. Caller owns the commit."""
    event = AuditLog(
        organization_id=organization_id,
        transaction_id=transaction_id,
        actor_type=actor_type,
        actor_id=actor_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        source_file_id=source_file_id,
        metadata_json=json.dumps(metadata, default=str) if metadata else None,
    )
    session.add(event)
    return event
