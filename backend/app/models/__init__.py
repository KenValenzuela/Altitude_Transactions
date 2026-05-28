"""SQLModel database tables for Altitude.

Postgres-compatible: string UUID primary keys, no SQLite-only features.
Internal field names are snake_case; the API layer maps to camelCase.
"""
from __future__ import annotations

import datetime as _dt
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from sqlmodel import Field, SQLModel


def _uuid() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# --- Enums -----------------------------------------------------------------


class TransactionStatus(str, Enum):
    under_contract = "under_contract"
    inspection = "inspection"
    appraisal = "appraisal"
    clear_to_close = "clear_to_close"
    closed = "closed"


class PartyRole(str, Enum):
    buyer = "buyer"
    seller = "seller"
    listing_agent = "listing_agent"
    lender = "lender"
    title = "title"
    inspector = "inspector"


class DocumentState(str, Enum):
    received = "received"
    pending = "pending"
    upcoming = "upcoming"
    na = "na"


class ExtractionStatus(str, Enum):
    pending = "pending"
    running = "running"
    complete = "complete"
    failed = "failed"


class ReviewStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    edited = "edited"


class TaskState(str, Enum):
    todo = "todo"
    doing = "doing"
    done = "done"
    na = "na"


# --- Tables ----------------------------------------------------------------


class User(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    name: str
    email: str = Field(index=True)
    brokerage: str | None = None
    license_no: str | None = None


class Transaction(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    owner_id: str = Field(foreign_key="user.id", index=True)
    address: str
    city: str
    county: str | None = None
    status: TransactionStatus = Field(default=TransactionStatus.under_contract)
    price: int = 0
    earnest: int = 0
    loan_type: str | None = None
    close_date: _dt.date | None = None
    created_at: datetime = Field(default_factory=_now)


class Property(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    type: str | None = None
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    mls: str | None = None
    is_rural: bool = False
    has_hoa: bool = False


class Party(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    role: PartyRole
    name: str
    sub: str | None = None
    phone: str | None = None
    email: str | None = None


class Document(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str | None = Field(default=None, foreign_key="transaction.id", index=True)
    name: str
    source: str | None = None
    state: DocumentState = Field(default=DocumentState.received)
    original_filename: str | None = None
    content_type: str | None = None
    size_bytes: int | None = None
    created_at: datetime = Field(default_factory=_now)


class ExtractionJob(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    document_id: str = Field(foreign_key="document.id", index=True)
    status: ExtractionStatus = Field(default=ExtractionStatus.pending)
    created_at: datetime = Field(default_factory=_now)
    completed_at: datetime | None = None


class ExtractedField(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="extractionjob.id", index=True)
    label: str
    value: str | None = None
    confidence: float = 1.0
    review_status: ReviewStatus = Field(default=ReviewStatus.pending)
    category: str | None = None


class Deadline(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    event: str
    reference: str | None = None
    category: str | None = None
    date: _dt.date | None = None
    raw_value: str | None = None
    is_urgent: bool = False
    is_na: bool = False


class Task(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    group: str
    title: str
    due: str | None = None
    state: TaskState = Field(default=TaskState.todo)
    ai_note: str | None = None
    is_post_close: bool = False
