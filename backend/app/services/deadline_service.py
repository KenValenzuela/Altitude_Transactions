"""Build Deadline rows from an ExtractionResult."""
from __future__ import annotations

from sqlmodel import Session, select

from app.models import Deadline
from app.services.extraction_service import ExtractionResult


def build_deadlines(session: Session, transaction_id: str, result: ExtractionResult) -> list[Deadline]:
    rows: list[Deadline] = []
    for dl in result.deadlines:
        row = Deadline(
            transaction_id=transaction_id,
            event=dl.event,
            reference=dl.reference,
            category=dl.category,
            date=dl.date,
            raw_value=dl.raw_value,
            is_urgent=dl.is_urgent,
            is_na=dl.is_na,
        )
        session.add(row)
        rows.append(row)
    return rows


def list_deadlines(session: Session, transaction_id: str) -> list[Deadline]:
    stmt = select(Deadline).where(Deadline.transaction_id == transaction_id)
    rows = list(session.exec(stmt))
    # Sort: dated first (chronological), then non-dated (e.g. COMPLETED).
    rows.sort(key=lambda d: (d.date is None, d.date or __import__("datetime").date.max))
    return rows
