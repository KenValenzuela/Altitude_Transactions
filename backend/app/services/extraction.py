"""AI extraction: provider interface, mock + Anthropic providers, job pipeline.

Pipeline invariants:
- `ExtractedField` rows are immutable raw AI output (with page + snippet
  evidence) — never updated after insert.
- Jobs end in `needs_review`; nothing becomes canonical without a human
  decision (Phase 4 apply engine).
- Every model call is recorded in `ai_model_runs`; every stage transition in
  the audit log.
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import time
from pathlib import Path
from typing import Protocol

from sqlmodel import Session

import app.db.session as db_session
from app.core.config import settings
from app.models import (
    AIModelRun,
    ActorType,
    ChecklistItemStatus,
    DocumentChecklistItem,
    DocumentType,
    ExtractedField,
    ExtractionJob,
    ExtractionJobStatus,
    UploadedFile,
)
from app.services.audit import record as audit
from app.services.checklist import find_item_for_document_type
from app.services.extraction_schemas import (
    FIELD_SPECS,
    Classification,
    ClassificationOut,
    ExtractionOut,
    RawField,
    normalize_date,
    normalize_money,
    slugify,
)
from app.services.storage import get_storage

logger = logging.getLogger("altitude.extraction")

_FIXTURE_PATH = Path(__file__).resolve().parent / "data" / "sample_contract_extraction.json"


class ExtractionProvider(Protocol):
    name: str
    model_name: str

    def classify(self, pdf_bytes: bytes, filename: str) -> Classification: ...

    def extract(
        self, pdf_bytes: bytes, filename: str, document_type: DocumentType
    ) -> list[RawField]: ...


# ─── Mock provider (deterministic, no network) ────────────────────────────────

_FILENAME_RULES: list[tuple[str, DocumentType]] = [
    ("amend", DocumentType.amend_extend),
    ("extend", DocumentType.amend_extend),
    ("counter", DocumentType.counterproposal),
    ("earnest", DocumentType.earnest_money_receipt),
    ("emr", DocumentType.earnest_money_receipt),
    ("receipt", DocumentType.earnest_money_receipt),
    ("objection", DocumentType.inspection_objection),
    ("resolution", DocumentType.inspection_resolution),
    ("closing_instruction", DocumentType.closing_instructions),
    ("closing-instruction", DocumentType.closing_instructions),
    ("hoa", DocumentType.hoa_status_letter),
    ("status_letter", DocumentType.hoa_status_letter),
    ("radon", DocumentType.radon_report),
    ("inspection", DocumentType.home_inspection_report),
    ("invoice", DocumentType.contractor_invoice),
    ("bid", DocumentType.contractor_invoice),
    ("cbs", DocumentType.contract_to_buy_and_sell),
    ("contract", DocumentType.contract_to_buy_and_sell),
]


class MockExtractionProvider:
    """Deterministic provider for dev/tests.

    Classifies by filename keywords and replays a real CBS1-8-24 extraction
    (bundled fixture) for contracts; other types use small built-in fixtures.
    Never reads the PDF bytes.
    """

    name = "mock"
    model_name = "mock-fixture-v2"

    def classify(self, pdf_bytes: bytes, filename: str) -> Classification:
        lowered = filename.lower()
        for keyword, doc_type in _FILENAME_RULES:
            if keyword in lowered:
                return Classification(doc_type, 0.95, f"Filename contains '{keyword}'")
        return Classification(DocumentType.other, 0.3, "No filename keyword matched")

    def extract(
        self, pdf_bytes: bytes, filename: str, document_type: DocumentType
    ) -> list[RawField]:
        if document_type == DocumentType.contract_to_buy_and_sell:
            return self._extract_cbs()
        return _MOCK_FIXTURES.get(document_type, _MOCK_FIXTURES[DocumentType.other])()

    def _extract_cbs(self) -> list[RawField]:
        data = json.loads(_FIXTURE_PATH.read_text())["structured_contract_data"]
        parties = data["parties_and_property"]
        price = data["purchase_price_terms"]
        closing = data["closing_possession"]
        identity = data["document_identity"]
        financing = data["financing"]

        street = parties["street_address"]  # "4902 Cherry Springs Drive, Colorado Springs, CO 80923"
        addr_parts = [p.strip() for p in street.split(",")]
        zip_code = addr_parts[-1].split()[-1] if addr_parts else ""

        def f(key, label, group, value, vtype="text", page=1, snippet="", conf=0.97):
            return RawField(
                field_key=key,
                label=label,
                group=group,
                value=None if value is None else str(value),
                value_type=vtype,
                normalized_value=(
                    normalize_date(str(value)) if vtype == "date"
                    else normalize_money(value) if vtype == "money"
                    else None
                ),
                confidence=conf,
                source_page=page,
                source_text=snippet or f"{label}: {value}",
            )

        fields = [
            f("property_address", "Property Address", "property", addr_parts[0], page=1,
              snippet=f"known as: {street}"),
            f("city", "City", "property", addr_parts[1] if len(addr_parts) > 1 else "", page=1,
              snippet=f"known as: {street}"),
            f("county", "County", "property", parties["county"], page=1,
              snippet=f"County of {parties['county']}, Colorado"),
            f("zip", "ZIP Code", "property", zip_code, page=1, snippet=f"known as: {street}"),
            f("legal_description", "Legal Description", "property", parties["legal_description"],
              page=1, snippet=parties["legal_description"]),
            f("buyer_name", "Buyer Name(s)", "parties", parties["buyer_name"], page=1,
              snippet=f"Buyer: {parties['buyer_name']} (Joint Tenants)", conf=0.99),
            f("seller_name", "Seller Name(s)", "parties", parties["seller_name"], page=1,
              snippet=f"Seller: {parties['seller_name']}", conf=0.99),
            f("purchase_price", "Purchase Price", "terms", price["purchase_price"], "money", page=4,
              snippet="§ 4.1 Purchase Price $520,000.00", conf=0.99),
            f("earnest_money", "Earnest Money", "terms", price["earnest_money"], "money", page=4,
              snippet="§ 4.1 Earnest Money $5,000.00", conf=0.99),
            f("earnest_money_holder", "Earnest Money Holder", "terms",
              price["earnest_money_holder"], page=4,
              snippet=f"Earnest Money Holder: {price['earnest_money_holder']}"),
            f("seller_concession", "Seller Concession", "terms", price["seller_concession"],
              "money", page=4, snippet="§ 4.2 Seller Concession $10,000.00"),
            f("loan_type", "Loan Type", "terms", financing["loan_type"], page=5,
              snippet=f"§ 5.4 Loan Limitations: {financing['loan_type']}"),
            f("contract_date", "Contract Date", "dates", identity["printed_or_contract_date"],
              "date", page=1, snippet=f"Date: {identity['printed_or_contract_date']}"),
            f("closing_date", "Closing Date", "dates", closing["closing_date"], "date", page=3,
              snippet=f"§ 12 Closing Date {closing['closing_date']}", conf=0.99),
            f("possession_date", "Possession Date", "dates", closing["possession_date"], "date",
              page=3, snippet=f"§ 17 Possession Date {closing['possession_date']}"),
            f("possession_time", "Possession Time", "dates", closing["possession_time"], page=3,
              snippet=f"Possession Time: {closing['possession_time']}"),
            f("has_hoa", "Part of an HOA / CIC", "property", "true", "bool", page=2,
              snippet="Common Interest Community Disclosure: applicable", conf=0.85),
            f("additional_provisions", "Additional Provisions Summary", "meta",
              "; ".join(p["text"][:80] for p in
                        json.loads(_FIXTURE_PATH.read_text())["structured_contract_data"]
                        ["additional_provisions"][:2]),
              page=14, snippet="§ 30 Additional Provisions", conf=0.8),
        ]

        for row in data["dates_deadlines"]:
            value = row["value"]
            iso = normalize_date(value)
            fields.append(
                RawField(
                    field_key=f"deadline.{slugify(row['event'])}",
                    label=row["event"],
                    group="deadlines",
                    value=value,
                    value_type="date" if iso else "text",
                    normalized_value=iso,
                    confidence=0.96,
                    source_page=2 if row["item_no"] <= 25 else 3,
                    source_text=f"{row['reference']} {row['event']}: {value}",
                )
            )
        return fields


def _mock_amend_extend() -> list[RawField]:
    changes = [
        ("Inspection Resolution Deadline", "11/14/2025"),
        ("Closing Date", "12/05/2025"),
    ]
    fields = [
        RawField("agreement_date", "Agreement Date", "dates", "11/08/2025", "date",
                 normalize_date("11/08/2025"), 0.97, 1, "Agreement to Amend/Extend dated 11/08/2025"),
        RawField("changes_summary", "Summary of Changes", "meta",
                 "Inspection Resolution and Closing Date extended", "text", None, 0.9, 1,
                 "§ 2 The following dates and deadlines are changed"),
    ]
    for name, new_date in changes:
        fields.append(
            RawField(
                field_key=f"deadline_change.{slugify(name)}",
                label=f"{name} (amended)",
                group="deadline_changes",
                value=new_date,
                value_type="date",
                normalized_value=normalize_date(new_date),
                confidence=0.96,
                source_page=1,
                source_text=f"{name} is changed to {new_date}",
            )
        )
    return fields


def _mock_emr() -> list[RawField]:
    return [
        RawField("amount", "Earnest Money Amount", "terms", "5000", "money", "5000", 0.99, 1,
                 "Received earnest money in the amount of $5,000.00"),
        RawField("holder", "Holder / Title Company", "terms", "Land Title Company", "text", None,
                 0.97, 1, "Land Title Guarantee Company, as Earnest Money Holder"),
        RawField("date_received", "Date Received", "dates", "10/24/2025", "date",
                 normalize_date("10/24/2025"), 0.97, 1, "Date received: 10/24/2025"),
        RawField("payment_form", "Form of Payment", "terms", "Wire Transfer", "text", None, 0.9, 1,
                 "Form of payment: Wire Transfer"),
    ]


def _mock_inspection_objection() -> list[RawField]:
    return [
        RawField("objection_date", "Objection Date", "dates", "11/08/2025", "date",
                 normalize_date("11/08/2025"), 0.96, 1, "Inspection Objection dated 11/08/2025"),
        RawField("items_summary", "Objection Items Summary", "items",
                 "Repair furnace heat exchanger; service water heater; repair roof flashing",
                 "text", None, 0.88, 1, "Buyer requires the following corrections"),
        RawField("item_count", "Number of Items", "items", "3", "number", "3", 0.92, 1,
                 "Items 1-3 listed"),
        RawField("resolution_deadline", "Inspection Resolution Deadline", "deadlines",
                 "11/12/2025", "date", normalize_date("11/12/2025"), 0.95, 1,
                 "Inspection Resolution Deadline 11/12/2025"),
    ]


def _mock_inspection_resolution() -> list[RawField]:
    return [
        RawField("resolution_date", "Resolution Date", "dates", "11/11/2025", "date",
                 normalize_date("11/11/2025"), 0.96, 1, "Inspection Resolution dated 11/11/2025"),
        RawField("resolved_items_summary", "Resolved Items Summary", "items",
                 "Seller to repair furnace and roof flashing before closing", "text", None, 0.88,
                 1, "Seller agrees to the following"),
        RawField("seller_obligations", "Seller Obligations", "items",
                 "Licensed contractor repairs with receipts provided", "text", None, 0.85, 1,
                 "Work performed by licensed contractor"),
    ]


def _mock_closing_instructions() -> list[RawField]:
    return [
        RawField("closing_company", "Closing Company", "parties", "Land Title Guarantee Company",
                 "text", None, 0.97, 1, "Closing Company: Land Title Guarantee Company"),
        RawField("closer_name", "Closer / Escrow Officer", "parties", "Jordan Reyes", "text",
                 None, 0.9, 1, "Closer: Jordan Reyes"),
        RawField("closing_date", "Closing Date", "dates", "11/20/2025", "date",
                 normalize_date("11/20/2025"), 0.95, 1, "Closing Date: 11/20/2025"),
        RawField("earnest_money_holder", "Earnest Money Holder", "terms", "Land Title Company",
                 "text", None, 0.93, 1, "Earnest Money held by Land Title"),
    ]


def _mock_hoa() -> list[RawField]:
    return [
        RawField("hoa_name", "HOA Name", "hoa", "Wagon Trails HOA", "text", None, 0.95, 1,
                 "Wagon Trails Homeowners Association"),
        RawField("management_company", "Management Company", "hoa", "Peak Property Management",
                 "text", None, 0.93, 1, "Managed by Peak Property Management"),
        RawField("monthly_dues", "Monthly Dues", "hoa", "85", "money", "85", 0.96, 1,
                 "Monthly assessment: $85.00"),
        RawField("transfer_fee", "Transfer Fee", "hoa", "250", "money", "250", 0.94, 2,
                 "Transfer fee: $250.00"),
        RawField("status_letter_fee", "Status Letter Fee", "hoa", "150", "money", "150", 0.94, 2,
                 "Status letter fee: $150.00"),
        RawField("outstanding_balance", "Outstanding Balance", "hoa", "0", "money", "0", 0.92, 2,
                 "Account balance: $0.00"),
    ]


def _mock_home_inspection() -> list[RawField]:
    return [
        RawField("inspection_date", "Inspection Date", "dates", "11/05/2025", "date",
                 normalize_date("11/05/2025"), 0.96, 1, "Inspection performed 11/05/2025"),
        RawField("inspector_name", "Inspector / Company", "parties", "Summit Home Inspections",
                 "text", None, 0.94, 1, "Summit Home Inspections LLC"),
        RawField("major_findings", "Major Findings Summary", "items",
                 "Furnace heat exchanger crack; roof flashing wear; water heater near end of life",
                 "text", None, 0.85, 3, "Summary of major findings"),
    ]


def _mock_radon() -> list[RawField]:
    return [
        RawField("test_date", "Test Date", "dates", "11/05/2025", "date",
                 normalize_date("11/05/2025"), 0.96, 1, "48-hour test ending 11/05/2025"),
        RawField("radon_level", "Radon Level (pCi/L)", "items", "5.2", "number", None, 0.97, 1,
                 "Average radon concentration: 5.2 pCi/L"),
        RawField("mitigation_recommended", "Mitigation Recommended", "items", "true", "bool",
                 None, 0.95, 1, "Result exceeds EPA action level of 4.0 pCi/L"),
    ]


def _mock_invoice() -> list[RawField]:
    return [
        RawField("contractor_name", "Contractor / Company", "parties", "Front Range Heating",
                 "text", None, 0.94, 1, "Front Range Heating & Air LLC"),
        RawField("invoice_date", "Invoice Date", "dates", "11/13/2025", "date",
                 normalize_date("11/13/2025"), 0.95, 1, "Invoice date: 11/13/2025"),
        RawField("amount", "Amount", "terms", "1850", "money", "1850", 0.96, 1,
                 "Total due: $1,850.00"),
        RawField("work_summary", "Work Summary", "items",
                 "Replace furnace heat exchanger and inspect heating system", "text", None, 0.88,
                 1, "Description of work performed"),
    ]


def _mock_other() -> list[RawField]:
    return [
        RawField("document_title", "Document Title", "meta", "Unclassified Document", "text",
                 None, 0.5, 1, "Document heading"),
        RawField("document_date", "Document Date", "dates", None, "date", None, 0.3, None, ""),
        RawField("summary", "Summary", "meta", "Document could not be confidently classified",
                 "text", None, 0.4, 1, ""),
    ]


_MOCK_FIXTURES = {
    DocumentType.amend_extend: _mock_amend_extend,
    DocumentType.counterproposal: _mock_amend_extend,  # same diff-style shape
    DocumentType.earnest_money_receipt: _mock_emr,
    DocumentType.inspection_objection: _mock_inspection_objection,
    DocumentType.inspection_resolution: _mock_inspection_resolution,
    DocumentType.closing_instructions: _mock_closing_instructions,
    DocumentType.hoa_status_letter: _mock_hoa,
    DocumentType.home_inspection_report: _mock_home_inspection,
    DocumentType.radon_report: _mock_radon,
    DocumentType.contractor_invoice: _mock_invoice,
    DocumentType.other: _mock_other,
}


# ─── Anthropic provider ───────────────────────────────────────────────────────


class AnthropicExtractionProvider:
    """Claude-backed provider: PDF document blocks + structured outputs."""

    name = "anthropic"

    def __init__(self) -> None:
        import anthropic

        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key or None)
        self.model_name = settings.anthropic_model

    def _pdf_block(self, pdf_bytes: bytes) -> dict:
        import base64

        return {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64.standard_b64encode(pdf_bytes).decode(),
            },
        }

    def classify(self, pdf_bytes: bytes, filename: str) -> Classification:
        response = self._client.messages.parse(
            model=self.model_name,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    self._pdf_block(pdf_bytes),
                    {
                        "type": "text",
                        "text": (
                            "Classify this Colorado residential real estate transaction "
                            f"document (filename: {filename!r}). Choose the single best "
                            "document_type. Use 'other' only if nothing fits."
                        ),
                    },
                ],
            }],
            output_format=ClassificationOut,
        )
        parsed: ClassificationOut = response.parsed_output
        return Classification(
            DocumentType(parsed.document_type),
            max(0.0, min(1.0, parsed.confidence)),
            parsed.reasoning,
        )

    def extract(
        self, pdf_bytes: bytes, filename: str, document_type: DocumentType
    ) -> list[RawField]:
        spec_lines = "\n".join(
            f"- {key} | {label} | group={group} | type={vtype}"
            for key, label, group, vtype in FIELD_SPECS[document_type]
        )
        dynamic = ""
        if document_type == DocumentType.contract_to_buy_and_sell:
            dynamic = (
                "\nAlso emit one field per row of the Dates & Deadlines table (§ 3): "
                "field_key='deadline.<snake_case_event_name>', group='deadlines', "
                "value_type='date' (or 'text' for N/A / time-of-day rows), label=event name."
            )
        elif document_type in (DocumentType.amend_extend, DocumentType.counterproposal):
            dynamic = (
                "\nAlso emit one field per CHANGED deadline: "
                "field_key='deadline_change.<snake_case_deadline_name>', "
                "group='deadline_changes', value_type='date', value=the NEW date, "
                "label='<Deadline Name> (amended)'."
            )

        response = self._client.messages.parse(
            model=self.model_name,
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": [
                    self._pdf_block(pdf_bytes),
                    {
                        "type": "text",
                        "text": (
                            "Extract these fields from this "
                            f"'{document_type.value}' document:\n{spec_lines}\n{dynamic}\n"
                            "Rules: value is VERBATIM from the document (null if absent). "
                            "normalized_value: ISO-8601 for dates, whole-dollar integer "
                            "string for money, else null. source_page is the 1-based page "
                            "where the value appears; source_text is a short verbatim "
                            "snippet containing it. confidence reflects how certain you "
                            "are. Do not guess values that are not in the document."
                        ),
                    },
                ],
            }],
            output_format=ExtractionOut,
        )
        parsed: ExtractionOut = response.parsed_output
        fields = []
        for item in parsed.fields:
            normalized = item.normalized_value
            if item.value_type == "date" and not normalized:
                normalized = normalize_date(item.value)
            elif item.value_type == "money" and not normalized:
                normalized = normalize_money(item.value)
            fields.append(
                RawField(
                    field_key=item.field_key,
                    label=item.label,
                    group=item.group,
                    value=item.value,
                    value_type=item.value_type,
                    normalized_value=normalized,
                    confidence=max(0.0, min(1.0, item.confidence)),
                    source_page=item.source_page,
                    source_text=item.source_text[:500],
                )
            )
        return fields


_provider: ExtractionProvider | None = None


def get_extraction_provider() -> ExtractionProvider:
    global _provider
    if _provider is None:
        if settings.extraction_provider == "anthropic":
            _provider = AnthropicExtractionProvider()
        else:
            _provider = MockExtractionProvider()
    return _provider


# ─── Job pipeline ─────────────────────────────────────────────────────────────


def run_extraction_job(job_id: str) -> None:
    """Run classify -> extract for one job. Designed for BackgroundTasks.

    Owns its session/commits. Failures land the job in `failed` with an
    error_message (retryable via the API).
    """
    with Session(db_session.engine) as session:
        job = session.get(ExtractionJob, job_id)
        if job is None or job.status not in (
            ExtractionJobStatus.pending,
            ExtractionJobStatus.failed,
        ):
            return
        file = session.get(UploadedFile, job.file_id)
        if file is None:
            _fail(session, job, "Uploaded file row missing")
            return

        provider = get_extraction_provider()
        job.provider = provider.name
        job.model_name = provider.model_name
        job.status = ExtractionJobStatus.classifying
        job.started_at = dt.datetime.now(dt.timezone.utc)
        job.error_message = ""
        session.add(job)
        audit(
            session,
            organization_id=job.organization_id,
            transaction_id=job.transaction_id,
            actor_type=ActorType.ai,
            event_type="extraction_started",
            entity_type="extraction_job",
            entity_id=job.id,
            source_file_id=file.id,
            metadata={"provider": provider.name},
        )
        session.commit()

        try:
            pdf_bytes = get_storage().get(file.storage_key)

            started = time.monotonic()
            classification = provider.classify(pdf_bytes, file.original_filename)
            session.add(AIModelRun(
                job_id=job.id,
                provider=provider.name,
                model_name=provider.model_name,
                request_kind="classify",
                latency_ms=int((time.monotonic() - started) * 1000),
            ))

            job.document_type = classification.document_type
            job.classification_confidence = classification.confidence
            audit(
                session,
                organization_id=job.organization_id,
                transaction_id=job.transaction_id,
                actor_type=ActorType.ai,
                event_type="document_classified",
                entity_type="extraction_job",
                entity_id=job.id,
                new_value=classification.document_type.value,
                source_file_id=file.id,
                metadata={
                    "confidence": classification.confidence,
                    "reasoning": classification.reasoning,
                },
            )

            # Suggest a checklist row when the upload wasn't targeted at one.
            if job.checklist_item_id is None:
                suggested = find_item_for_document_type(
                    session, job.transaction_id, classification.document_type
                )
                if suggested is not None:
                    job.checklist_item_id = suggested.id
                    audit(
                        session,
                        organization_id=job.organization_id,
                        transaction_id=job.transaction_id,
                        actor_type=ActorType.ai,
                        event_type="checklist_item_suggested",
                        entity_type="document_checklist_item",
                        entity_id=suggested.id,
                        new_value=suggested.name,
                        source_file_id=file.id,
                    )

            job.status = ExtractionJobStatus.extracting
            session.add(job)
            session.commit()

            started = time.monotonic()
            raw_fields = provider.extract(
                pdf_bytes, file.original_filename, classification.document_type
            )
            session.add(AIModelRun(
                job_id=job.id,
                provider=provider.name,
                model_name=provider.model_name,
                request_kind="extract",
                latency_ms=int((time.monotonic() - started) * 1000),
            ))

            for rf in raw_fields:
                session.add(ExtractedField(
                    job_id=job.id,
                    transaction_id=job.transaction_id,
                    field_key=rf.field_key,
                    label=rf.label,
                    group=rf.group,
                    value=rf.value,
                    normalized_value=rf.normalized_value,
                    value_type=rf.value_type,
                    confidence=rf.confidence,
                    source_page=rf.source_page,
                    source_text=rf.source_text,
                    extraction_method=provider.name,
                ))

            job.status = ExtractionJobStatus.needs_review
            job.completed_at = dt.datetime.now(dt.timezone.utc)
            session.add(job)

            if job.checklist_item_id:
                item = session.get(DocumentChecklistItem, job.checklist_item_id)
                if item is not None and item.status == ChecklistItemStatus.uploaded:
                    item.status = ChecklistItemStatus.in_review
                    item.updated_at = dt.datetime.now(dt.timezone.utc)
                    session.add(item)
                    audit(
                        session,
                        organization_id=job.organization_id,
                        transaction_id=job.transaction_id,
                        actor_type=ActorType.system,
                        event_type="checklist_item_status_changed",
                        entity_type="document_checklist_item",
                        entity_id=item.id,
                        old_value=ChecklistItemStatus.uploaded.value,
                        new_value=ChecklistItemStatus.in_review.value,
                        source_file_id=file.id,
                    )

            audit(
                session,
                organization_id=job.organization_id,
                transaction_id=job.transaction_id,
                actor_type=ActorType.ai,
                event_type="extraction_completed",
                entity_type="extraction_job",
                entity_id=job.id,
                new_value=str(len(raw_fields)),
                source_file_id=file.id,
                metadata={"fieldCount": len(raw_fields)},
            )
            session.commit()
        except Exception as exc:  # noqa: BLE001 — job must land in `failed`, not crash the worker
            logger.exception("Extraction job %s failed", job_id)
            session.rollback()
            job = session.get(ExtractionJob, job_id)
            if job is not None:
                _fail(session, job, str(exc)[:500])


def _fail(session: Session, job: ExtractionJob, message: str) -> None:
    job.status = ExtractionJobStatus.failed
    job.error_message = message
    job.completed_at = dt.datetime.now(dt.timezone.utc)
    session.add(job)
    audit(
        session,
        organization_id=job.organization_id,
        transaction_id=job.transaction_id,
        actor_type=ActorType.system,
        event_type="extraction_failed",
        entity_type="extraction_job",
        entity_id=job.id,
        new_value=message,
    )
    session.commit()
