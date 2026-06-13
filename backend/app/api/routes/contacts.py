"""Transaction contacts: list, add, edit, remove."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import AuthContext, get_current_context, get_owned_transaction
from app.db.session import get_session
from app.models import ContactRole, TransactionContact
from app.schemas import TransactionContactCreate, TransactionContactOut, TransactionContactPatch
from app.services.audit import record as audit

router = APIRouter(prefix="/transactions/{transaction_id}/contacts", tags=["contacts"])


def _out(c: TransactionContact) -> TransactionContactOut:
    return TransactionContactOut.model_validate(c)


@router.get("", response_model=list[TransactionContactOut])
def list_contacts(
    transaction_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> list[TransactionContactOut]:
    tx = get_owned_transaction(transaction_id, ctx, session)
    contacts = session.exec(
        select(TransactionContact).where(TransactionContact.transaction_id == tx.id)
    ).all()
    return [_out(c) for c in contacts]


@router.post("", response_model=TransactionContactOut, status_code=status.HTTP_201_CREATED)
def add_contact(
    transaction_id: str,
    body: TransactionContactCreate,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TransactionContactOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    role = session.exec(
        select(ContactRole).where(
            ContactRole.organization_id == ctx.organization_id,
            ContactRole.key == body.role_key,
        )
    ).first()
    if role is None:
        raise HTTPException(422, f"Unknown contact role '{body.role_key}'")

    contact = TransactionContact(
        transaction_id=tx.id,
        role_key=role.key,
        role_label=role.label,
        name=body.name,
        company=body.company,
        email=body.email,
        phone=body.phone,
        license_number=body.license_number,
        notes=body.notes,
        source="manual",
    )
    session.add(contact)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="contact_added",
        entity_type="transaction_contact",
        entity_id=contact.id,
        new_value=f"{role.label}: {body.name}",
    )
    session.commit()
    session.refresh(contact)
    return _out(contact)


@router.patch("/{contact_id}", response_model=TransactionContactOut)
def patch_contact(
    transaction_id: str,
    contact_id: str,
    body: TransactionContactPatch,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> TransactionContactOut:
    tx = get_owned_transaction(transaction_id, ctx, session)
    contact = session.get(TransactionContact, contact_id)
    if contact is None or contact.transaction_id != tx.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")

    old = f"{contact.role_label}: {contact.name}"
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    contact.updated_at = dt.datetime.now(dt.timezone.utc)
    session.add(contact)
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="contact_updated",
        entity_type="transaction_contact",
        entity_id=contact.id,
        old_value=old,
        new_value=f"{contact.role_label}: {contact.name}",
    )
    session.commit()
    session.refresh(contact)
    return _out(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    transaction_id: str,
    contact_id: str,
    ctx: AuthContext = Depends(get_current_context),
    session: Session = Depends(get_session),
) -> None:
    tx = get_owned_transaction(transaction_id, ctx, session)
    contact = session.get(TransactionContact, contact_id)
    if contact is None or contact.transaction_id != tx.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Contact not found")
    audit(
        session,
        organization_id=ctx.organization_id,
        transaction_id=tx.id,
        actor_id=ctx.user.id,
        event_type="contact_removed",
        entity_type="transaction_contact",
        entity_id=contact.id,
        old_value=f"{contact.role_label}: {contact.name}",
    )
    session.delete(contact)
    session.commit()
