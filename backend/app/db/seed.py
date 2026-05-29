"""Idempotent demo data seeding.

Creates the demo broker and ONE fully-built demo transaction (4902 Cherry
Springs Drive, Colorado Springs) so the dashboard is non-empty on first run.
The transaction is built from the same MockExtractionService used by the live
confirm flow, keeping seed and runtime behavior consistent.
"""
from __future__ import annotations

from sqlmodel import Session, select

import app.db.session as db_session
from app.models import Document, DocumentState, User
from app.services import transaction_service
from app.services.extraction_service import get_extraction_service


def seed_demo_data() -> None:
    with Session(db_session.engine) as session:
        existing = session.exec(select(User)).first()
        if existing is not None:
            return  # already seeded; idempotent

        broker = User(
            name="Brett Predmore",
            email="brett.predmore@icloud.com",
            brokerage="RE/MAX Real Estate Group",
            license_no="FA100002032",
        )
        session.add(broker)
        session.commit()
        session.refresh(broker)

        # A "received" contract document for the demo transaction.
        doc = Document(
            name="Contract to Buy and Sell (CBS1-8-24)",
            source="CTME",
            state=DocumentState.received,
            original_filename="cherry_springs_cbs.pdf",
            content_type="application/pdf",
        )
        session.add(doc)
        session.commit()
        session.refresh(doc)

        result = get_extraction_service().extract(doc)
        transaction_service.build_from_extraction(
            session,
            owner_id=broker.id,
            result=result,
            document=doc,
        )
