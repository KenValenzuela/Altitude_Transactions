"""Extraction contracts shared by all providers.

`FIELD_SPECS` is the per-document-type registry of expected field keys. The
mock provider emits exactly these keys and the Anthropic provider instructs the
model to use them, so downstream consumers (review UI, apply engine) see one
stable vocabulary regardless of provider.

Deadline table rows are open-ended: they use dynamic keys `deadline.<slug>`
(group="deadlines") for CBS extractions and `deadline_change.<slug>`
(group="deadline_changes") for Amend/Extend extractions.
"""
from __future__ import annotations

import datetime as dt
import re
from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel, Field

from app.models import DocumentType

# ─── Internal provider output (persisted as ExtractedField rows) ─────────────


@dataclass
class RawField:
    field_key: str
    label: str
    group: str  # property | parties | terms | dates | deadlines | deadline_changes | hoa | items | meta
    value: str | None
    value_type: str = "text"  # text | date | money | number | bool | list
    normalized_value: str | None = None  # ISO date / plain integer string
    confidence: float | None = None
    source_page: int | None = None
    source_text: str = ""


@dataclass
class Classification:
    document_type: DocumentType
    confidence: float
    reasoning: str = ""


@dataclass
class ExtractionResult:
    classification: Classification
    fields: list[RawField] = field(default_factory=list)


# ─── Structured-output schemas (Anthropic provider) ──────────────────────────


class ClassificationOut(BaseModel):
    """Model output schema for the classification call."""

    document_type: Literal[
        "contract_to_buy_and_sell",
        "counterproposal",
        "amend_extend",
        "earnest_money_receipt",
        "inspection_objection",
        "inspection_resolution",
        "closing_instructions",
        "hoa_status_letter",
        "home_inspection_report",
        "radon_report",
        "contractor_invoice",
        "other",
    ]
    confidence: float = Field(description="0..1 confidence in the classification")
    reasoning: str = Field(description="One sentence explaining the decision")


class ExtractedItemOut(BaseModel):
    """One extracted fact with source evidence."""

    field_key: str = Field(description="Stable snake_case key from the requested field list")
    label: str = Field(description="Human-readable label")
    group: str = Field(description="Field group, e.g. property, parties, terms, deadlines")
    value: str | None = Field(description="Verbatim value as written in the document; null if absent")
    value_type: str = Field(description="text | date | money | number | bool | list")
    normalized_value: str | None = Field(
        description="ISO-8601 date for dates, plain integer string for money; null otherwise"
    )
    confidence: float = Field(description="0..1 confidence in this value")
    source_page: int | None = Field(description="1-based page number where the value appears")
    source_text: str = Field(description="Short verbatim snippet surrounding the value")


class ExtractionOut(BaseModel):
    """Model output schema for the extraction call."""

    fields: list[ExtractedItemOut]


# ─── Field specs per document type ───────────────────────────────────────────

# (field_key, label, group, value_type)
FIELD_SPECS: dict[DocumentType, list[tuple[str, str, str, str]]] = {
    DocumentType.contract_to_buy_and_sell: [
        ("property_address", "Property Address", "property", "text"),
        ("city", "City", "property", "text"),
        ("county", "County", "property", "text"),
        ("zip", "ZIP Code", "property", "text"),
        ("legal_description", "Legal Description", "property", "text"),
        ("buyer_name", "Buyer Name(s)", "parties", "text"),
        ("seller_name", "Seller Name(s)", "parties", "text"),
        ("purchase_price", "Purchase Price", "terms", "money"),
        ("earnest_money", "Earnest Money", "terms", "money"),
        ("earnest_money_holder", "Earnest Money Holder", "terms", "text"),
        ("seller_concession", "Seller Concession", "terms", "money"),
        ("loan_type", "Loan Type", "terms", "text"),
        ("contract_date", "Contract Date", "dates", "date"),
        ("closing_date", "Closing Date", "dates", "date"),
        ("possession_date", "Possession Date", "dates", "date"),
        ("possession_time", "Possession Time", "dates", "text"),
        ("has_hoa", "Part of an HOA / CIC", "property", "bool"),
        ("additional_provisions", "Additional Provisions Summary", "meta", "text"),
        # plus dynamic: deadline.<slug> rows from the Dates & Deadlines table
    ],
    DocumentType.amend_extend: [
        ("agreement_date", "Agreement Date", "dates", "date"),
        ("changes_summary", "Summary of Changes", "meta", "text"),
        # plus dynamic: deadline_change.<slug> rows with the NEW date
    ],
    DocumentType.counterproposal: [
        ("counter_date", "Counterproposal Date", "dates", "date"),
        ("purchase_price", "Purchase Price (countered)", "terms", "money"),
        ("closing_date", "Closing Date (countered)", "dates", "date"),
        ("changes_summary", "Summary of Changes", "meta", "text"),
        # plus dynamic: deadline_change.<slug> rows when deadlines are countered
    ],
    DocumentType.earnest_money_receipt: [
        ("amount", "Earnest Money Amount", "terms", "money"),
        ("holder", "Holder / Title Company", "terms", "text"),
        ("date_received", "Date Received", "dates", "date"),
        ("payment_form", "Form of Payment", "terms", "text"),
    ],
    DocumentType.inspection_objection: [
        ("objection_date", "Objection Date", "dates", "date"),
        ("items_summary", "Objection Items Summary", "items", "text"),
        ("item_count", "Number of Items", "items", "number"),
        ("resolution_deadline", "Inspection Resolution Deadline", "deadlines", "date"),
    ],
    DocumentType.inspection_resolution: [
        ("resolution_date", "Resolution Date", "dates", "date"),
        ("resolved_items_summary", "Resolved Items Summary", "items", "text"),
        ("seller_obligations", "Seller Obligations", "items", "text"),
    ],
    DocumentType.closing_instructions: [
        ("closing_company", "Closing Company", "parties", "text"),
        ("closer_name", "Closer / Escrow Officer", "parties", "text"),
        ("closing_date", "Closing Date", "dates", "date"),
        ("earnest_money_holder", "Earnest Money Holder", "terms", "text"),
    ],
    DocumentType.hoa_status_letter: [
        ("hoa_name", "HOA Name", "hoa", "text"),
        ("management_company", "Management Company", "hoa", "text"),
        ("monthly_dues", "Monthly Dues", "hoa", "money"),
        ("transfer_fee", "Transfer Fee", "hoa", "money"),
        ("status_letter_fee", "Status Letter Fee", "hoa", "money"),
        ("outstanding_balance", "Outstanding Balance", "hoa", "money"),
    ],
    DocumentType.home_inspection_report: [
        ("inspection_date", "Inspection Date", "dates", "date"),
        ("inspector_name", "Inspector / Company", "parties", "text"),
        ("major_findings", "Major Findings Summary", "items", "text"),
    ],
    DocumentType.radon_report: [
        ("test_date", "Test Date", "dates", "date"),
        ("radon_level", "Radon Level (pCi/L)", "items", "number"),
        ("mitigation_recommended", "Mitigation Recommended", "items", "bool"),
    ],
    DocumentType.contractor_invoice: [
        ("contractor_name", "Contractor / Company", "parties", "text"),
        ("invoice_date", "Invoice Date", "dates", "date"),
        ("amount", "Amount", "terms", "money"),
        ("work_summary", "Work Summary", "items", "text"),
    ],
    DocumentType.other: [
        ("document_title", "Document Title", "meta", "text"),
        ("document_date", "Document Date", "dates", "date"),
        ("summary", "Summary", "meta", "text"),
    ],
}


# ─── Helpers ──────────────────────────────────────────────────────────────────


def slugify(name: str) -> str:
    """Deadline name -> stable key segment, e.g. 'Inspection Objection Deadline'
    -> 'inspection_objection_deadline'."""
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", name.lower())).strip("_")


_DATE_FORMATS = ("%m/%d/%Y", "%m/%d/%y", "%Y-%m-%d", "%B %d, %Y", "%b %d, %Y")


def normalize_date(value: str | None) -> str | None:
    """Parse common US date spellings to ISO-8601, else None."""
    if not value:
        return None
    text = value.strip()
    for fmt in _DATE_FORMATS:
        try:
            return dt.datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def normalize_money(value: float | int | str | None) -> str | None:
    """Money -> whole-dollar integer string."""
    if value is None:
        return None
    try:
        return str(int(round(float(str(value).replace("$", "").replace(",", "")))))
    except ValueError:
        return None
