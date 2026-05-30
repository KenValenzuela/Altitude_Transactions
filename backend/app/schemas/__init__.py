"""Pydantic API schemas for the Altitude CTME workflow."""
from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class UserOut(CamelModel):
    id: str
    name: str
    email: str
    brokerage: str | None = None
    license_no: str | None = None


class SessionOut(CamelModel):
    user: UserOut
    token: str


class SourceDocumentOut(CamelModel):
    id: str
    transaction_id: str | None = None
    filename: str
    document_type: str
    mime_type: str | None = None
    file_size_bytes: int | None = None
    storage_path: str | None = None
    sha256_hash: str | None = None
    uploaded_by: str | None = None
    uploaded_at: dt.datetime


class ExtractionRunOut(CamelModel):
    id: str
    transaction_id: str | None = None
    source_document_id: str
    status: str
    stage: str = "completed"
    provider: str = "FixtureExtractionProvider"
    started_at: dt.datetime
    completed_at: dt.datetime | None = None
    model_name: str
    schema_version: str
    error_message: str | None = None
    progress_percent: int
    metrics_json: str | None = None


class ExtractedFieldOut(CamelModel):
    id: str
    transaction_id: str | None = None
    extraction_run_id: str
    field_key: str
    label: str
    value: str | None = None
    normalized_value: str | None = None
    source_document_id: str
    source_page: int | None = None
    source_section: str | None = None
    evidence_text: str | None = None
    confidence: float
    extraction_method: str = "fixture"
    risk_level: str | None = None
    value_type: str | None = None
    # Multi-dimensional triage state
    availability_status: str = "available"
    applicability_status: str = "applicable"
    required_level: str = "optional"
    blocking: bool = False
    review_decision: str = "unreviewed"
    user_facing_message: str | None = None
    suggested_action: str | None = None
    original_value: str | None = None
    edited_value: str | None = None
    conflict_options: str | None = None
    # Legacy review fields
    population_status: str
    review_status: str
    reviewed_by: str | None = None
    reviewed_at: dt.datetime | None = None
    rejection_reason: str | None = None
    created_at: dt.datetime
    # Legacy-friendly optional field used by old screen grouping.
    category: str | None = None


class DeadlineOut(CamelModel):
    id: str
    transaction_id: str
    item_number: str | None = None
    section_reference: str | None = None
    event_name: str
    due_date: dt.date | None = None
    due_time: str | None = None
    raw_value: str | None = None
    applicability: str
    confidence: float = 1.0
    responsible_party: str | None = None
    calendar_ready: bool = False
    human_review_required: bool = False
    source_document_id: str
    source_page: int | None = None
    source_section: str | None = None
    linked_task_id: str | None = None
    created_at: dt.datetime
    # Legacy aliases preserved for old pages/tests.
    event: str | None = None
    reference: str | None = None
    category: str | None = None
    date: dt.date | None = None
    is_urgent: bool = False
    is_na: bool = False


class TaskOut(CamelModel):
    id: str
    transaction_id: str
    title: str
    category: str
    status: str
    due_date: dt.date | None = None
    completed_at: dt.datetime | None = None
    assigned_role: str | None = None
    notes: str | None = None
    not_applicable_reason: str | None = None
    linked_deadline_id: str | None = None
    source_type: str
    created_at: dt.datetime
    updated_at: dt.datetime
    # Legacy shape.
    group: str | None = None
    due: str | None = None
    state: str | None = None
    ai_note: str | None = None
    is_post_close: bool = False


class TaskGroupOut(CamelModel):
    group: str
    items: list[TaskOut]


class ContactOut(CamelModel):
    id: str
    transaction_id: str
    role: str
    name: str | None = None
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    license_number: str | None = None
    address: str | None = None
    notes: str | None = None
    required: bool
    complete: bool
    source: str
    created_at: dt.datetime
    updated_at: dt.datetime
    sub: str | None = None


class DocumentRequirementOut(CamelModel):
    id: str
    transaction_id: str
    document_name: str
    category: str
    purpose: str | None = None
    required_status: str
    received_status: str
    source_document_id: str | None = None
    due_date: dt.date | None = None
    notes: str | None = None
    created_at: dt.datetime
    updated_at: dt.datetime
    # Legacy document fields.
    name: str | None = None
    source: str | None = None
    state: str | None = None
    original_filename: str | None = None
    content_type: str | None = None
    size_bytes: int | None = None


class PostCloseTaskOut(CamelModel):
    id: str
    transaction_id: str
    title: str
    recipient_role: str | None = None
    status: str
    date_sent: dt.date | None = None
    date_completed: dt.date | None = None
    notes: str | None = None
    created_at: dt.datetime
    updated_at: dt.datetime


class AuditEventOut(CamelModel):
    id: str
    transaction_id: str | None = None
    actor_type: str
    actor_id: str | None = None
    event_type: str
    entity_type: str
    entity_id: str | None = None
    before_value: str | None = None
    after_value: str | None = None
    created_at: dt.datetime
    metadata_json: str | None = None


class TransactionCard(CamelModel):
    id: str
    address: str
    city: str
    stage: str
    status: str
    days_to_close: int
    progress: float
    next: str
    urgent: bool
    parties: str
    price: int
    active: bool


class MoneyOut(CamelModel):
    price: int
    earnest: int
    close_date: dt.date | None = None
    days_to_close: int


class CountsOut(CamelModel):
    done: int
    doing: int
    todo: int
    na: int
    active: int


class StageOut(CamelModel):
    id: str
    label: str
    done: bool
    current: bool = False


class PropertyOut(CamelModel):
    id: str
    type: str | None = None
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    mls: str | None = None
    is_rural: bool = False
    has_hoa: bool = True


class TransactionDetail(CamelModel):
    id: str
    property_address: str
    address: str
    city: str
    state: str
    zip: str | None = None
    county: str | None = None
    legal_description: str | None = None
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    possession_date: dt.date | None = None
    possession_time: str | None = None
    status: str
    risk_level: str
    completion_percent: int
    created_at: dt.datetime
    updated_at: dt.datetime
    source_documents: list[SourceDocumentOut] = []
    extraction_runs: list[ExtractionRunOut] = []
    extracted_fields: list[ExtractedFieldOut] = []
    deadlines: list[DeadlineOut] = []
    tasks: list[TaskGroupOut] = []
    contacts: list[ContactOut] = []
    document_requirements: list[DocumentRequirementOut] = []
    post_close_tasks: list[PostCloseTaskOut] = []
    audit_events: list[AuditEventOut] = []
    property: PropertyOut | None = None
    parties: list[ContactOut] = []
    stages: list[StageOut] = []
    money: MoneyOut
    documents: list[DocumentRequirementOut] = []
    counts: CountsOut


class UploadOut(CamelModel):
    document_id: str
    status: str
    extraction_job_id: str
    transaction_id: str | None = None


class ExtractionFlag(CamelModel):
    title: str
    detail: str


class ExtractionReviewSummary(CamelModel):
    """Pre-computed triage counts for the review UI summary panel."""
    total: int = 0
    blocking_unreviewed: int = 0
    needs_review: int = 0
    confirmed_na: int = 0
    approved: int = 0
    missing_expected: int = 0
    low_confidence: int = 0
    conflicts: int = 0
    can_create_transaction: bool = False
    estimated_review_minutes: int = 0


class ExtractionJobOut(CamelModel):
    id: str
    status: str
    progress_percent: int = 100
    transaction_id: str | None = None
    source_document_id: str
    fields: list[ExtractedFieldOut] = []
    deadlines: list[DeadlineOut] = []
    flags: list[ExtractionFlag] = []
    review_summary: ExtractionReviewSummary | None = None


class ConfirmRequest(CamelModel):
    overrides: dict[str, str] | None = None
    transaction_id: str | None = None


class TaskPatch(CamelModel):
    state: str | None = None
    status: str | None = None
    notes: str | None = None


class FieldPatch(CamelModel):
    action: str = "approve"  # legacy — prefer decision
    decision: str | None = None  # approve | edit | mark_not_applicable | mark_unavailable | reject
    value: str | None = None
    reason: str | None = None
    unavailable_reason: str | None = None


class ContactPatch(CamelModel):
    name: str | None = None
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    notes: str | None = None
    complete: bool | None = None


class DocumentPatch(CamelModel):
    state: str | None = None
    received_status: str | None = None
