"""API contract schemas. All JSON is camelCase.

Internal models use snake_case; these CamelModel-based schemas expose the
camelCase aliases the frontend consumes. populate_by_name=True lets us build
them from snake_case attributes too.
"""
from __future__ import annotations

import datetime as _dt

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: serialize/deserialize using camelCase aliases."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# --- Auth / User -----------------------------------------------------------


class UserOut(CamelModel):
    id: str
    name: str
    email: str
    brokerage: str | None = None
    license_no: str | None = None


class SessionOut(CamelModel):
    user: UserOut
    token: str


# --- Dashboard cards -------------------------------------------------------


class TransactionCard(CamelModel):
    id: str
    address: str
    city: str
    stage: str          # human label of status
    status: str         # raw enum value
    days_to_close: int
    progress: float     # 0..1 from task completion
    next: str
    urgent: bool
    parties: str        # e.g. "Okafor · Hayes"
    price: int
    active: bool


# --- Transaction detail ----------------------------------------------------


class PropertyOut(CamelModel):
    id: str
    type: str | None = None
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    mls: str | None = None
    is_rural: bool = False
    has_hoa: bool = False


class PartyOut(CamelModel):
    id: str
    role: str
    name: str
    sub: str | None = None
    phone: str | None = None
    email: str | None = None


class StageOut(CamelModel):
    id: str
    label: str
    done: bool
    current: bool = False


class MoneyOut(CamelModel):
    price: int
    earnest: int
    close_date: _dt.date | None = None
    days_to_close: int


class DeadlineOut(CamelModel):
    id: str
    event: str
    reference: str | None = None
    category: str | None = None
    date: _dt.date | None = None
    raw_value: str | None = None
    is_urgent: bool = False
    is_na: bool = False


class TaskOut(CamelModel):
    id: str
    group: str
    title: str
    due: str | None = None
    state: str
    ai_note: str | None = None
    is_post_close: bool = False


class TaskGroupOut(CamelModel):
    group: str
    items: list[TaskOut]


class DocumentOut(CamelModel):
    id: str
    name: str
    source: str | None = None
    state: str
    original_filename: str | None = None
    content_type: str | None = None
    size_bytes: int | None = None


class CountsOut(CamelModel):
    done: int
    doing: int
    todo: int
    na: int
    active: int


class TransactionDetail(CamelModel):
    id: str
    address: str
    city: str
    status: str
    property: PropertyOut | None = None
    parties: list[PartyOut]
    stages: list[StageOut]
    money: MoneyOut
    deadlines: list[DeadlineOut]
    tasks: list[TaskGroupOut]
    documents: list[DocumentOut]
    counts: CountsOut


# --- Documents / Extraction ------------------------------------------------


class UploadOut(CamelModel):
    document_id: str
    status: str
    extraction_job_id: str


class ExtractionFlag(CamelModel):
    title: str
    detail: str


class ExtractionDeadline(CamelModel):
    event: str
    reference: str | None = None
    category: str | None = None
    date: _dt.date | None = None
    raw_value: str | None = None
    is_na: bool = False


class ExtractedFieldOut(CamelModel):
    id: str
    label: str
    value: str | None = None
    confidence: float
    review_status: str
    category: str | None = None


class ExtractionJobOut(CamelModel):
    id: str
    status: str
    fields: list[ExtractedFieldOut] = []
    deadlines: list[ExtractionDeadline] = []
    flags: list[ExtractionFlag] = []


# --- Request bodies --------------------------------------------------------


class ConfirmRequest(CamelModel):
    overrides: dict[str, str] | None = None
    transaction_id: str | None = None


class TaskPatch(CamelModel):
    state: str


class DocumentPatch(CamelModel):
    state: str


# --- Error -----------------------------------------------------------------


class ErrorResponse(CamelModel):
    detail: str
