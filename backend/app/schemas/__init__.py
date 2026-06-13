"""Altitude API schemas — Pydantic request/response models."""
from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(CamelModel):
    email: str
    password: str


class UserOut(CamelModel):
    id: str
    email: str
    name: str
    is_active: bool
    role: str | None = None
    organization_id: str | None = None
    created_at: dt.datetime


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Transactions ─────────────────────────────────────────────────────────────

class TransactionCreate(CamelModel):
    property_address: str
    city: str
    state: str = "CO"
    zip: str = ""
    county: str = ""
    side: str  # buyer | seller
    financing_type: str  # conventional | fha | va | cash | investment | other
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    purchase_price: int = 0
    earnest_money: int = 0
    mls_number: str = ""


class TransactionOut(CamelModel):
    id: str
    organization_id: str
    created_by: str
    property_address: str
    city: str
    state: str
    zip: str
    county: str
    side: str
    financing_type: str
    status: str
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    possession_date: dt.date | None = None
    purchase_price: int
    earnest_money: int
    mls_number: str
    days_to_close: int | None = None
    created_at: dt.datetime
    updated_at: dt.datetime


class TransactionCard(CamelModel):
    id: str
    property_address: str
    city: str
    state: str
    zip: str
    side: str
    status: str
    financing_type: str
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    days_to_close: int | None = None
    checklist_total: int = 0
    checklist_approved: int = 0
    checklist_needed: int = 0
    overdue_count: int = 0
    created_at: dt.datetime


class TransactionPatch(CamelModel):
    property_address: str | None = None
    city: str | None = None
    state: str | None = None
    zip: str | None = None
    county: str | None = None
    side: str | None = None
    financing_type: str | None = None
    contract_date: dt.date | None = None
    closing_date: dt.date | None = None
    possession_date: dt.date | None = None
    purchase_price: int | None = None
    earnest_money: int | None = None
    mls_number: str | None = None
    status: str | None = None


# ─── Checklist ────────────────────────────────────────────────────────────────

class ChecklistItemOut(CamelModel):
    id: str
    transaction_id: str
    template_id: str | None = None
    name: str
    section: str
    section_label: str = ""
    sort_order: int
    required: bool
    is_core: bool
    document_type: str | None = None
    status: str
    due_date: dt.date | None = None
    na_reason: str
    overdue: bool = False
    created_at: dt.datetime
    updated_at: dt.datetime


class ChecklistSectionOut(CamelModel):
    key: str
    label: str
    items: list[ChecklistItemOut]
    total: int
    approved: int


class ChecklistOut(CamelModel):
    transaction_id: str
    sections: list[ChecklistSectionOut]
    total: int
    approved: int
    in_review: int
    needed: int
    overdue: int


class ChecklistItemPatch(CamelModel):
    status: str | None = None
    due_date: dt.date | None = None
    na_reason: str | None = None


class ChecklistItemCreate(CamelModel):
    name: str
    section: str
    required: bool = False
    document_type: str | None = None
    due_date: dt.date | None = None


# ─── Files ────────────────────────────────────────────────────────────────────

class UploadedFileOut(CamelModel):
    id: str
    organization_id: str
    transaction_id: str
    checklist_item_id: str | None = None
    version: int
    original_filename: str
    content_type: str
    size_bytes: int
    sha256: str
    storage_key: str
    uploaded_by: str
    uploaded_at: dt.datetime


class UploadOut(CamelModel):
    file_id: str
    checklist_item_id: str | None = None
    extraction_job_id: str | None = None
    version: int = 1
    status: str


# ─── Extraction ───────────────────────────────────────────────────────────────

class ExtractionJobOut(CamelModel):
    id: str
    transaction_id: str
    file_id: str
    checklist_item_id: str | None = None
    status: str
    document_type: str | None = None
    classification_confidence: float | None = None
    provider: str = ""
    error_message: str
    created_at: dt.datetime
    completed_at: dt.datetime | None = None


class ExtractedFieldOut(CamelModel):
    id: str
    job_id: str
    transaction_id: str
    field_key: str
    label: str
    group: str
    value: str | None = None
    normalized_value: str | None = None
    value_type: str
    confidence: float | None = None
    source_page: int | None = None
    source_text: str
    review_decision: str | None = None
    created_at: dt.datetime


class ExtractionJobDetailOut(ExtractionJobOut):
    fields: list[ExtractedFieldOut] = []


# ─── Review ───────────────────────────────────────────────────────────────────

class ReviewFieldOut(ExtractedFieldOut):
    """Extracted field + its latest human decision (if any)."""

    decision: str | None = None
    corrected_value: str | None = None
    decision_reason: str | None = None
    reviewer_id: str | None = None
    decided_at: dt.datetime | None = None


class ReviewJobOut(CamelModel):
    job: ExtractionJobOut
    file: UploadedFileOut
    checklist_item_name: str | None = None
    fields: list[ReviewFieldOut]
    undecided_count: int
    proposal_count: int = 0


class DocumentApproveRequest(CamelModel):
    # Undecided fields are bulk-approved (each gets an audited ReviewDecision)
    # unless the caller demands every field be individually decided first.
    approve_remaining: bool = True


class DocumentRejectRequest(CamelModel):
    reason: str


class ApplyResultOut(CamelModel):
    job_id: str
    status: str
    canonical: int
    deadlines_created: int
    deadlines_updated: int
    proposals: int


class ReviewDecisionCreate(CamelModel):
    decision: str  # approved | edited | rejected | marked_na
    corrected_value: str | None = None
    reason: str = ""


class ReviewDecisionOut(CamelModel):
    id: str
    extracted_field_id: str
    job_id: str
    transaction_id: str
    decision: str
    original_value: str | None = None
    corrected_value: str | None = None
    reason: str
    reviewer_id: str
    created_at: dt.datetime


# ─── Canonical fields ─────────────────────────────────────────────────────────

class CanonicalFieldOut(CamelModel):
    id: str
    transaction_id: str
    field_key: str
    label: str
    value: str
    value_type: str
    source_field_id: str | None = None
    approved_by: str | None = None
    approved_at: dt.datetime


# ─── Deadlines ────────────────────────────────────────────────────────────────

class DeadlineOut(CamelModel):
    id: str
    transaction_id: str
    deadline_key: str
    name: str
    section_reference: str
    due_date: dt.date | None = None
    due_time: str
    applicability: str
    days_remaining: int | None = None
    source_field_id: str | None = None
    created_at: dt.datetime
    updated_at: dt.datetime


class DeadlineChangeProposalOut(CamelModel):
    id: str
    transaction_id: str
    job_id: str
    deadline_id: str | None = None
    deadline_key: str
    name: str
    old_date: dt.date | None = None
    new_date: dt.date | None = None
    old_time: str
    new_time: str
    status: str  # pending | approved | rejected
    decided_by: str | None = None
    decided_at: dt.datetime | None = None
    created_at: dt.datetime


# ─── Tasks ────────────────────────────────────────────────────────────────────

class TaskOut(CamelModel):
    id: str
    transaction_id: str
    title: str
    status: str
    due_date: dt.date | None = None
    source: str
    linked_deadline_id: str | None = None
    completed_at: dt.datetime | None = None
    created_at: dt.datetime
    updated_at: dt.datetime


class TaskCreate(CamelModel):
    title: str
    due_date: dt.date | None = None


class TaskPatch(CamelModel):
    status: str | None = None  # open | done | not_applicable


# ─── Contacts ─────────────────────────────────────────────────────────────────

class TransactionContactOut(CamelModel):
    id: str
    transaction_id: str
    role_key: str
    role_label: str
    name: str
    company: str
    email: str
    phone: str
    license_number: str
    notes: str
    source: str
    created_at: dt.datetime
    updated_at: dt.datetime


class TransactionContactCreate(CamelModel):
    role_key: str
    name: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    license_number: str = ""
    notes: str = ""


class TransactionContactPatch(CamelModel):
    name: str | None = None
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    license_number: str | None = None
    notes: str | None = None


class ContactRoleOut(CamelModel):
    id: str
    key: str
    label: str
    is_core: bool
    sort_order: int


class ContactRoleCreate(CamelModel):
    key: str
    label: str


# ─── Audit ────────────────────────────────────────────────────────────────────

class AuditEventOut(CamelModel):
    id: str
    organization_id: str
    transaction_id: str | None = None
    actor_type: str
    actor_id: str | None = None
    event_type: str
    entity_type: str
    entity_id: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    created_at: dt.datetime


# ─── Admin: checklist templates ──────────────────────────────────────────────

class TemplateOut(CamelModel):
    id: str
    name: str
    section: str
    sort_order: int
    required: bool
    is_core: bool
    active: bool
    document_type: str | None = None


class TemplateCreate(CamelModel):
    name: str
    section: str
    required: bool = False
    document_type: str | None = None


class TemplatePatch(CamelModel):
    name: str | None = None
    section: str | None = None
    required: bool | None = None
    active: bool | None = None


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardDeadlineOut(CamelModel):
    id: str
    transaction_id: str
    property_address: str
    name: str
    due_date: dt.date | None = None
    days_remaining: int | None = None
    overdue: bool = False


class DashboardChecklistItemOut(CamelModel):
    id: str
    transaction_id: str
    property_address: str
    name: str
    section: str
    status: str
    due_date: dt.date | None = None
    overdue: bool = False


class DashboardOut(CamelModel):
    total_transactions: int
    active_transactions: int
    approved_transactions: int
    missing_documents: int
    pending_reviews: int
    pending_proposals: int = 0
    open_tasks: int = 0
    overdue_items: int
    closing_this_week: int
    missing_document_items: list[DashboardChecklistItemOut] = []
    review_queue: list[DashboardChecklistItemOut] = []
    upcoming_deadlines: list[DashboardDeadlineOut] = []
    recent_files: list[UploadedFileOut] = []
    recent_activity: list[AuditEventOut] = []
