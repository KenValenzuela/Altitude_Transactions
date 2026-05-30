"""Altitude workflow SQLModel tables for the Altitude Transactions custom build."""
from __future__ import annotations

import datetime as dt
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from sqlmodel import Field, SQLModel


def _uuid() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class TransactionStatus(str, Enum):
    draft = "draft"
    under_contract = "under_contract"
    in_review = "in_review"
    active = "active"
    closing = "closing"
    closed = "closed"
    cancelled = "cancelled"


class ExtractionStatus(str, Enum):
    queued = "queued"
    uploading = "uploading"
    parsing_pdf = "parsing_pdf"
    extracting_fields = "extracting_fields"
    generating_deadlines = "generating_deadlines"
    generating_tasks = "generating_tasks"
    needs_review = "needs_review"
    approved = "approved"
    failed = "failed"


class PopulationStatus(str, Enum):
    populated = "populated"
    missing_required = "missing_required"
    not_applicable = "not_applicable"
    redacted_in_source = "redacted_in_source"
    completed = "completed"
    needs_human_review = "needs_human_review"
    manual_override = "manual_override"
    superseded_by_amendment = "superseded_by_amendment"


class ReviewStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    edited = "edited"
    rejected = "rejected"


class TaskStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    complete = "complete"
    not_applicable = "not_applicable"


class DeadlineApplicability(str, Enum):
    active = "active"
    not_applicable = "not_applicable"
    completed = "completed"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class RequiredStatus(str, Enum):
    required = "required"
    conditional = "conditional"
    not_applicable = "not_applicable"


class ReceivedStatus(str, Enum):
    missing = "missing"
    received = "received"
    reviewed = "reviewed"
    approved = "approved"


class AvailabilityStatus(str, Enum):
    """WHY a field value is or is not present."""
    available = "available"
    missing = "missing"
    unavailable_now = "unavailable_now"
    redacted = "redacted"
    unreadable = "unreadable"


class ApplicabilityStatus(str, Enum):
    """WHETHER the field applies to this specific transaction."""
    applicable = "applicable"
    not_applicable = "not_applicable"
    conditional = "conditional"
    unknown = "unknown"


class RequiredLevel(str, Enum):
    """Urgency tier: blocks workspace creation vs. blocks closing vs. optional."""
    required_to_create = "required_to_create"
    required_before_closing = "required_before_closing"
    optional = "optional"
    informational = "informational"


class ReviewDecision(str, Enum):
    """Broker's final decision on a field — more specific than ReviewStatus."""
    unreviewed = "unreviewed"
    approved = "approved"
    edited = "edited"
    marked_not_applicable = "marked_not_applicable"
    marked_unavailable = "marked_unavailable"
    rejected = "rejected"


class User(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    name: str
    email: str = Field(index=True)
    brokerage: str | None = None
    license_no: str | None = None


class Transaction(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    owner_id: str = Field(foreign_key="user.id", index=True)
    property_address: str = Field(index=True)
    city: str
    state: str = "CO"
    zip: str | None = None
    county: str | None = None
    legal_description: str | None = None
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    possession_date: dt.date | None = None
    possession_time: str | None = None
    status: TransactionStatus = Field(default=TransactionStatus.in_review)
    risk_level: RiskLevel = Field(default=RiskLevel.medium)
    completion_percent: int = 0
    purchase_price: int = 0
    earnest_money: int = 0
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class SourceDocument(SQLModel, table=True):
    __tablename__ = "source_documents"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str | None = Field(default=None, foreign_key="transaction.id", index=True)
    filename: str
    document_type: str = "CTME Contract to Buy and Sell Real Estate"
    mime_type: str | None = None
    file_size_bytes: int | None = None
    storage_path: str | None = None
    sha256_hash: str | None = None
    uploaded_by: str | None = None
    uploaded_at: datetime = Field(default_factory=_now)


class ExtractionRun(SQLModel, table=True):
    __tablename__ = "extraction_runs"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str | None = Field(default=None, foreign_key="transaction.id", index=True)
    source_document_id: str = Field(foreign_key="source_documents.id", index=True)
    status: ExtractionStatus = Field(default=ExtractionStatus.needs_review)
    stage: str = "completed"
    provider: str = "FixtureExtractionProvider"
    started_at: datetime = Field(default_factory=_now)
    completed_at: datetime | None = None
    model_name: str = "fixture-extraction-provider-v1"
    schema_version: str = "altitude-ctme-v1"
    error_message: str | None = None
    progress_percent: int = 100
    metrics_json: str | None = None


class ExtractedField(SQLModel, table=True):
    __tablename__ = "extracted_fields"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str | None = Field(default=None, foreign_key="transaction.id", index=True)
    extraction_run_id: str = Field(foreign_key="extraction_runs.id", index=True)
    field_key: str
    label: str
    value: str | None = None
    normalized_value: str | None = None
    source_document_id: str = Field(foreign_key="source_documents.id", index=True)
    source_page: int | None = None
    source_section: str | None = None
    evidence_text: str | None = None
    confidence: float = 1.0
    extraction_method: str = "fixture"
    risk_level: str | None = None
    value_type: str | None = None
    # Multi-dimensional classification for human review triage
    availability_status: str = "available"
    applicability_status: str = "applicable"
    required_level: str = "optional"
    blocking: bool = False
    # Review decision — richer than review_status for UI routing
    review_decision: str = "unreviewed"
    # User-facing guidance (plain English, not parser terms)
    user_facing_message: str | None = None
    suggested_action: str | None = None
    # Value history
    original_value: str | None = None
    edited_value: str | None = None
    # Parser metadata (not user-facing)
    parser_message: str | None = None
    conflict_options: str | None = None
    # Legacy review fields
    population_status: PopulationStatus = Field(default=PopulationStatus.populated)
    review_status: ReviewStatus = Field(default=ReviewStatus.pending)
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    rejection_reason: str | None = None
    created_at: datetime = Field(default_factory=_now)


class Deadline(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    item_number: str | None = None
    section_reference: str | None = None
    event_name: str
    due_date: dt.date | None = None
    due_time: str | None = None
    raw_value: str | None = None
    applicability: DeadlineApplicability = Field(default=DeadlineApplicability.active)
    confidence: float = 1.0
    responsible_party: str | None = None
    calendar_ready: bool = False
    human_review_required: bool = False
    source_document_id: str = Field(foreign_key="source_documents.id", index=True)
    source_page: int | None = None
    source_section: str | None = None
    linked_task_id: str | None = None
    created_at: datetime = Field(default_factory=_now)


class Task(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    title: str
    category: str
    status: TaskStatus = Field(default=TaskStatus.not_started)
    due_date: dt.date | None = None
    completed_at: datetime | None = None
    assigned_role: str | None = None
    notes: str | None = None
    not_applicable_reason: str | None = None
    linked_deadline_id: str | None = Field(default=None, foreign_key="deadline.id")
    source_type: str = "generated_from_deadline"
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class Contact(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    role: str
    name: str | None = None
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    license_number: str | None = None
    address: str | None = None
    notes: str | None = None
    required: bool = True
    complete: bool = False
    source: str = "contract_extraction"
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class DocumentRequirement(SQLModel, table=True):
    __tablename__ = "document_requirements"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    document_name: str
    category: str
    purpose: str | None = None
    required_status: RequiredStatus = Field(default=RequiredStatus.required)
    received_status: ReceivedStatus = Field(default=ReceivedStatus.missing)
    source_document_id: str | None = Field(default=None, foreign_key="source_documents.id")
    due_date: dt.date | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class PostCloseTask(SQLModel, table=True):
    __tablename__ = "post_close_tasks"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transaction.id", index=True)
    title: str
    recipient_role: str | None = None
    status: TaskStatus = Field(default=TaskStatus.not_started)
    date_sent: dt.date | None = None
    date_completed: dt.date | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class AuditEvent(SQLModel, table=True):
    __tablename__ = "audit_events"
    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str | None = Field(default=None, foreign_key="transaction.id", index=True)
    actor_type: str = "system"
    actor_id: str | None = None
    event_type: str
    entity_type: str
    entity_id: str | None = None
    before_value: str | None = None
    after_value: str | None = None
    created_at: datetime = Field(default_factory=_now)
    metadata_json: str | None = None

# Compatibility aliases for legacy route names/tests.
Document = SourceDocument
ExtractionJob = ExtractionRun
