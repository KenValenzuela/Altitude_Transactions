"""Altitude Transactions data model.

Design invariant: raw AI output (`ExtractedField`) is immutable; human decisions
(`ReviewDecision`) are append-only; canonical transaction state (`CanonicalField`,
`Transaction` columns, `Deadline`, `TransactionContact`) is written only by the
deterministic apply engine from approved/edited fields. Every meaningful action
writes an `AuditLog` row.
"""
from __future__ import annotations

import datetime as dt
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from sqlmodel import Field, SQLModel, UniqueConstraint


def _uuid() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------- enums


class Role(str, Enum):
    admin = "admin"
    agent = "agent"
    tc = "tc"  # transaction coordinator (reserved; treated as reviewer)


class TransactionSide(str, Enum):
    buyer = "buyer"
    seller = "seller"


class FinancingType(str, Enum):
    cash = "cash"
    fha = "fha"
    va = "va"
    conventional = "conventional"
    investment = "investment"
    other = "other"


class TransactionStatus(str, Enum):
    active = "active"
    pending_review = "pending_review"
    approved = "approved"
    archived = "archived"


class ChecklistItemStatus(str, Enum):
    """Workflow states for checklist rows. `overdue` is derived at read time."""

    needed = "needed"
    not_applicable = "not_applicable"
    uploaded = "uploaded"
    in_review = "in_review"
    needs_correction = "needs_correction"
    approved = "approved"
    rejected = "rejected"


class ExtractionJobStatus(str, Enum):
    pending = "pending"
    classifying = "classifying"
    extracting = "extracting"
    needs_review = "needs_review"
    completed = "completed"
    failed = "failed"


class DocumentType(str, Enum):
    contract_to_buy_and_sell = "contract_to_buy_and_sell"
    counterproposal = "counterproposal"
    amend_extend = "amend_extend"
    earnest_money_receipt = "earnest_money_receipt"
    inspection_objection = "inspection_objection"
    inspection_resolution = "inspection_resolution"
    closing_instructions = "closing_instructions"
    hoa_status_letter = "hoa_status_letter"
    home_inspection_report = "home_inspection_report"
    radon_report = "radon_report"
    contractor_invoice = "contractor_invoice"
    other = "other"


class ReviewDecisionType(str, Enum):
    approved = "approved"
    edited = "edited"
    rejected = "rejected"
    marked_na = "marked_na"


class ProposalStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DeadlineApplicability(str, Enum):
    active = "active"
    not_applicable = "not_applicable"
    completed = "completed"


class TaskStatus(str, Enum):
    open = "open"
    done = "done"
    not_applicable = "not_applicable"


class ActorType(str, Enum):
    user = "user"
    system = "system"
    ai = "ai"


# --------------------------------------------------------------------------- identity


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=_now)


class Organization(SQLModel, table=True):
    __tablename__ = "organizations"

    id: str = Field(default_factory=_uuid, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=_now)


class OrganizationMember(SQLModel, table=True):
    __tablename__ = "organization_members"
    __table_args__ = (UniqueConstraint("organization_id", "user_id", name="uq_org_member"),)

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    role: Role = Field(default=Role.agent)
    created_at: datetime = Field(default_factory=_now)


# --------------------------------------------------------------------------- transaction core


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    created_by: str = Field(foreign_key="users.id", index=True)

    property_address: str = Field(index=True)
    city: str = ""
    state: str = "CO"
    zip: str = ""
    county: str = ""
    legal_description: str = ""
    mls_number: str = ""

    side: TransactionSide = Field(default=TransactionSide.buyer)
    financing_type: FinancingType = Field(default=FinancingType.conventional)

    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    possession_date: dt.date | None = None
    possession_time: str = ""

    purchase_price: int = 0  # whole dollars
    earnest_money: int = 0  # whole dollars

    status: TransactionStatus = Field(default=TransactionStatus.active)
    archived_at: datetime | None = None

    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class ContactRole(SQLModel, table=True):
    """Org-level contact types (admin-managed). Core rows cannot be deleted."""

    __tablename__ = "contact_roles"
    __table_args__ = (UniqueConstraint("organization_id", "key", name="uq_contact_role_key"),)

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    key: str  # stable identifier, e.g. "buyer_agent"
    label: str
    is_core: bool = False
    sort_order: int = 0
    created_at: datetime = Field(default_factory=_now)


class TransactionContact(SQLModel, table=True):
    __tablename__ = "transaction_contacts"

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    role_key: str = Field(index=True)
    role_label: str = ""
    name: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    license_number: str = ""
    address: str = ""
    notes: str = ""
    source: str = "manual"  # manual | extraction
    source_file_id: str | None = Field(default=None, foreign_key="uploaded_files.id")
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# --------------------------------------------------------------------------- checklist


class DocumentTypeTemplate(SQLModel, table=True):
    """Org-level checklist template row (admin-managed)."""

    __tablename__ = "document_type_templates"

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    name: str
    section: str = Field(index=True)  # see services.checklist.SECTIONS
    sort_order: int = 0
    required: bool = True
    is_core: bool = False  # core rows: agents can't delete, admins can deactivate
    active: bool = True
    document_type: DocumentType | None = None  # expected classification, if known
    created_at: datetime = Field(default_factory=_now)


class DocumentChecklistItem(SQLModel, table=True):
    __tablename__ = "document_checklist_items"

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    template_id: str | None = Field(default=None, foreign_key="document_type_templates.id")
    name: str
    section: str = Field(index=True)
    sort_order: int = 0
    required: bool = True
    is_core: bool = False
    document_type: DocumentType | None = None
    status: ChecklistItemStatus = Field(default=ChecklistItemStatus.needed, index=True)
    due_date: dt.date | None = None
    na_reason: str = ""
    created_by: str | None = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# --------------------------------------------------------------------------- files & extraction


class UploadedFile(SQLModel, table=True):
    __tablename__ = "uploaded_files"

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    checklist_item_id: str | None = Field(
        default=None, foreign_key="document_checklist_items.id", index=True
    )
    version: int = 1  # increments per checklist item re-upload
    original_filename: str
    content_type: str = "application/pdf"
    size_bytes: int = 0
    sha256: str = ""
    storage_key: str = ""
    uploaded_by: str = Field(foreign_key="users.id")
    uploaded_at: datetime = Field(default_factory=_now)


class ExtractionJob(SQLModel, table=True):
    __tablename__ = "extraction_jobs"

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    file_id: str = Field(foreign_key="uploaded_files.id", index=True)
    checklist_item_id: str | None = Field(default=None, foreign_key="document_checklist_items.id")
    status: ExtractionJobStatus = Field(default=ExtractionJobStatus.pending, index=True)
    document_type: DocumentType | None = None
    classification_confidence: float | None = None
    provider: str = ""
    model_name: str = ""
    schema_version: str = ""
    error_message: str = ""
    created_by: str = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ExtractedField(SQLModel, table=True):
    """Immutable raw AI output with source evidence. Never edited after insert."""

    __tablename__ = "extracted_fields"

    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="extraction_jobs.id", index=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    field_key: str = Field(index=True)
    label: str
    group: str = ""  # e.g. property | parties | terms | deadlines | hoa | items
    value: str | None = None
    normalized_value: str | None = None  # ISO date / integer string where parseable
    value_type: str = "text"  # text | date | money | number | list | bool
    confidence: float | None = None
    source_page: int | None = None
    source_text: str = ""
    extraction_method: str = ""
    created_at: datetime = Field(default_factory=_now)


class ReviewDecision(SQLModel, table=True):
    """Append-only human decisions about an extracted field. Latest wins."""

    __tablename__ = "review_decisions"

    id: str = Field(default_factory=_uuid, primary_key=True)
    extracted_field_id: str = Field(foreign_key="extracted_fields.id", index=True)
    job_id: str = Field(foreign_key="extraction_jobs.id", index=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    decision: ReviewDecisionType
    original_value: str | None = None
    corrected_value: str | None = None
    reason: str = ""
    reviewer_id: str = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=_now)


class CanonicalField(SQLModel, table=True):
    """Approved canonical transaction facts with provenance."""

    __tablename__ = "canonical_fields"
    __table_args__ = (UniqueConstraint("transaction_id", "field_key", name="uq_canonical_field"),)

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    field_key: str = Field(index=True)
    label: str = ""
    value: str = ""
    value_type: str = "text"
    source_field_id: str | None = Field(default=None, foreign_key="extracted_fields.id")
    source_file_id: str | None = Field(default=None, foreign_key="uploaded_files.id")
    approved_by: str | None = Field(default=None, foreign_key="users.id")
    approved_at: datetime = Field(default_factory=_now)


# --------------------------------------------------------------------------- deadlines & tasks


class Deadline(SQLModel, table=True):
    __tablename__ = "deadlines"

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    deadline_key: str = Field(index=True)  # normalized, e.g. "inspection_resolution_deadline"
    name: str
    section_reference: str = ""  # CBS section, e.g. "§10.2"
    due_date: dt.date | None = None
    due_time: str = ""
    applicability: DeadlineApplicability = Field(default=DeadlineApplicability.active)
    source_file_id: str | None = Field(default=None, foreign_key="uploaded_files.id")
    source_field_id: str | None = Field(default=None, foreign_key="extracted_fields.id")
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class DeadlineChangeProposal(SQLModel, table=True):
    """Reviewable diff produced by Amend/Extend (and counterproposal) documents."""

    __tablename__ = "deadline_change_proposals"

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    job_id: str = Field(foreign_key="extraction_jobs.id", index=True)
    source_file_id: str | None = Field(default=None, foreign_key="uploaded_files.id")
    deadline_id: str | None = Field(default=None, foreign_key="deadlines.id")
    deadline_key: str
    name: str
    old_date: dt.date | None = None
    new_date: dt.date | None = None
    old_time: str = ""
    new_time: str = ""
    status: ProposalStatus = Field(default=ProposalStatus.pending, index=True)
    decided_by: str | None = Field(default=None, foreign_key="users.id")
    decided_at: datetime | None = None
    created_at: datetime = Field(default_factory=_now)


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(default_factory=_uuid, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)
    title: str
    status: TaskStatus = Field(default=TaskStatus.open, index=True)
    due_date: dt.date | None = None
    linked_deadline_id: str | None = Field(default=None, foreign_key="deadlines.id")
    source: str = "manual"  # manual | deadline | document
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# --------------------------------------------------------------------------- audit & AI telemetry


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: str = Field(default_factory=_uuid, primary_key=True)
    organization_id: str = Field(foreign_key="organizations.id", index=True)
    transaction_id: str | None = Field(default=None, foreign_key="transactions.id", index=True)
    actor_type: ActorType = Field(default=ActorType.user)
    actor_id: str | None = Field(default=None, foreign_key="users.id")
    event_type: str = Field(index=True)
    entity_type: str = ""
    entity_id: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    source_file_id: str | None = Field(default=None, foreign_key="uploaded_files.id")
    metadata_json: str | None = None
    created_at: datetime = Field(default_factory=_now, index=True)


class AIModelRun(SQLModel, table=True):
    __tablename__ = "ai_model_runs"

    id: str = Field(default_factory=_uuid, primary_key=True)
    job_id: str = Field(foreign_key="extraction_jobs.id", index=True)
    provider: str = ""
    model_name: str = ""
    request_kind: str = ""  # classify | extract
    input_tokens: int | None = None
    output_tokens: int | None = None
    latency_ms: int | None = None
    success: bool = True
    error_message: str = ""
    created_at: datetime = Field(default_factory=_now)
