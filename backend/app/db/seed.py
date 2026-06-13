"""Idempotent first-run seed: org, admin + agent users, templates, contact roles."""
from __future__ import annotations

import datetime as dt
import logging

from sqlmodel import Session, select

import app.db.session as db_session
from app.core.config import settings
from app.core.security import hash_password
from app.models import (
    ContactRole,
    FinancingType,
    Organization,
    OrganizationMember,
    Role,
    Transaction,
    TransactionSide,
    User,
)
from app.services import checklist as checklist_service
from app.services.audit import record as audit

logger = logging.getLogger("altitude.seed")


def seed_initial_data() -> None:
    with Session(db_session.engine) as session:
        if session.exec(select(Organization)).first():
            return

        org = Organization(name=settings.seed_org_name)
        session.add(org)
        session.flush()

        admin = User(
            email=settings.seed_admin_email,
            name=settings.seed_admin_name,
            hashed_password=hash_password(settings.seed_admin_password),
        )
        agent = User(
            email=settings.seed_agent_email,
            name=settings.seed_agent_name,
            hashed_password=hash_password(settings.seed_agent_password),
        )
        session.add(admin)
        session.add(agent)
        session.flush()
        session.add(OrganizationMember(organization_id=org.id, user_id=admin.id, role=Role.admin))
        session.add(OrganizationMember(organization_id=org.id, user_id=agent.id, role=Role.agent))

        checklist_service.seed_org_templates(session, org.id)
        for i, (key, label) in enumerate(checklist_service.CORE_CONTACT_ROLES):
            session.add(
                ContactRole(
                    organization_id=org.id, key=key, label=label, is_core=True, sort_order=i
                )
            )

        if settings.seed_demo_transaction:
            tx = Transaction(
                organization_id=org.id,
                created_by=admin.id,
                property_address="4902 Cherry Springs Drive",
                city="Colorado Springs",
                state="CO",
                zip="80923",
                county="El Paso",
                side=TransactionSide.buyer,
                financing_type=FinancingType.conventional,
                contract_date=dt.date.today() - dt.timedelta(days=7),
                closing_date=dt.date.today() + dt.timedelta(days=23),
            )
            session.add(tx)
            session.flush()
            checklist_service.instantiate_checklist(session, tx)
            audit(
                session,
                organization_id=org.id,
                transaction_id=tx.id,
                actor_id=admin.id,
                event_type="transaction_created",
                entity_type="transaction",
                entity_id=tx.id,
                new_value=tx.property_address,
                metadata={"seed": True},
            )

        session.commit()
        if settings.seed_admin_password == "altitude-admin":
            logger.warning(
                "Seeded with default credentials (%s). Set SEED_ADMIN_PASSWORD / "
                "SEED_AGENT_PASSWORD and SECRET_KEY before any real deployment.",
                settings.seed_admin_email,
            )
