"""Fixture extraction provider and transaction materialization.

SANDBOX / FIXTURE implementation of the extraction pipeline.
Does not perform real OCR or LLM extraction. Replays a pre-structured extraction
of a real Colorado CBS contract (4902 Cherry Springs Drive, El Paso County) so the
human-in-the-loop review workflow can operate with source-grounded data.

To wire in a real extraction backend: implement the ExtractionService protocol in
extraction_service.py and swap the instance returned by get_extraction_service().
This module remains the FixtureExtractionProvider for local dev and testing.
"""
from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timezone
from pathlib import Path
from uuid import uuid4

from sqlmodel import Session, select

from app.core.config import settings
from app.models import (
    AuditEvent, Contact, Deadline, DeadlineApplicability, DocumentRequirement,
    ExtractionRun, ExtractionStatus, ExtractedField, PopulationStatus, ReceivedStatus,
    RequiredStatus, ReviewStatus, SourceDocument, Task, TaskStatus, Transaction,
    TransactionStatus, RiskLevel, User, PostCloseTask,
)


def _risk_for_confidence(conf: float) -> str:
    if conf < 0.5:
        return "high"
    if conf < 0.85:
        return "medium"
    return "low"


def d(s: str | None) -> date | None:
    if not s or s in {"N/A", "COMPLETED", "Deleted"} or ":" in s:
        return None
    m, day, y = s.split("/")
    return date(int(y), int(m), int(day))

FIELD_DATA = [
    # (key, label, value, normalized, page, section, confidence, population_status)
    ("property_address", "Property Address", "4902 Cherry Springs Drive, Colorado Springs, CO 80923", "4902 Cherry Springs Drive, Colorado Springs, CO 80923", 2, "§2.1 Property", .99, "populated"),
    ("county", "County", "El Paso", "El Paso", 2, "§2.1 County", .98, "populated"),
    ("legal_description", "Legal Description", "LOT 3 WAGON TRAILS SUB FIL NO 21 PLAT 10743", "LOT 3 WAGON TRAILS SUB FIL NO 21 PLAT 10743", 2, "§2.2 Legal Description", .96, "populated"),
    ("contract_date", "Contract Date", "10/21/2025", "2025-10-21", 1, "Offer date", .98, "populated"),
    ("brokerage", "Brokerage", "RE/MAX Real Estate Group", "RE/MAX Real Estate Group", 17, "Broker acknowledgment", .95, "populated"),
    ("broker", "Broker", "Brett Predmore", "Brett Predmore", 17, "Broker acknowledgment", .95, "populated"),
    ("broker_email", "Broker Email", "brett.predmore@icloud.com", "brett.predmore@icloud.com", 17, "Broker acknowledgment", .94, "populated"),
    ("broker_phone", "Broker Phone", "719-338-9465", "719-338-9465", 17, "Broker acknowledgment", .94, "populated"),
    ("purchase_price", "Purchase Price", "520000", "520000", 3, "§4 Purchase Price", .99, "populated"),
    ("earnest_money", "Earnest Money", "5000", "5000", 3, "§4.3 Earnest Money", .99, "populated"),
    ("new_loan", "New Loan", "468000", "468000", 4, "§4.5 New Loan", .97, "populated"),
    ("cash_at_closing", "Cash at Closing", "47000", "47000", 4, "§4.6 Cash at Closing", .96, "populated"),
    ("seller_concession", "Seller Concession", "10000", "10000", 4, "§4.2 Seller Concession", .95, "populated"),
    ("earnest_money_holder", "Earnest Money Holder", "Land Title Company", "Land Title Company", 3, "§4.3 Holder", .94, "populated"),
    ("other_inclusions", "Other Inclusions", "Cook Top/Range Oven, Dishwasher, Microwave Oven, Kitchen Refrigerator", None, 2, "§2.5 Inclusions", .93, "populated"),
    ("exclusions", "Exclusions", "Seller's Personal Property", None, 2, "§2.6 Exclusions", .92, "populated"),
    ("parking", "Parking", "Attached Two-Car Garage", None, 2, "§2.5 Parking", .9, "populated"),
    ("storage", "Storage", "Storage Shed in Backyard", None, 2, "§2.5 Storage", .9, "populated"),
    ("buyer_name", "Buyer Name", "[REDACTED IN SOURCE]", None, 1, "Parties", .4, "redacted_in_source"),
    ("seller_name", "Seller Name", "[REDACTED IN SOURCE]", None, 1, "Parties", .4, "redacted_in_source"),
    ("closing_date", "Closing Date", "11/20/2025", "2025-11-20", 12, "§12 Closing", .98, "populated"),
    ("possession_date", "Possession Date", "11/20/2025", "2025-11-20", 12, "§17 Possession", .96, "populated"),
    ("possession_time", "Possession Time", "Time of Closing/Funding", None, 12, "§17 Possession", .95, "populated"),
    ("lead_based_paint_disclosure", "Lead-Based Paint Disclosure", "N/A", None, 6, "Dates and Deadlines", .99, "not_applicable"),
    ("new_loan_application_deadline", "New Loan Application Deadline", "COMPLETED", None, 6, "Dates and Deadlines", .99, "completed"),
    # Fields with edge-case extraction states (low confidence, missing, conditional N/A)
    # Low confidence: terms were in a dense block; value is likely correct but warrants review
    ("seller_concession_terms", "Seller Concession Terms", "Closing costs per §4.2 (buyer to pay standard)", None, 4, "§4.2 Seller Concession", .62, "populated"),
    # Missing — required before closing: loan officer was not in this version of the contract
    ("loan_officer_name", "Loan Officer", None, None, None, "§5 Financing", 0.0, "missing_required"),
    # Conditional N/A: §7 Association Documents not applicable to this property
    ("hoa_monthly_assessment", "HOA Monthly Assessment", "N/A", None, 7, "§7 Association Documents", .97, "not_applicable"),
]


# Enriched metadata for each field key. Drives triage UI: required level, availability, messages.
FIELD_META: dict[str, dict] = {
    "property_address": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Property address found with high confidence.",
        "suggested_action": "Verify the address is complete and correct, then approve.",
    },
    "county": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Colorado county found with high confidence.",
        "suggested_action": "Approve if correct.",
    },
    "legal_description": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Legal description found. Compare with the title commitment.",
        "suggested_action": "Approve or correct if it differs from the title commitment.",
    },
    "contract_date": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "date",
        "user_facing_message": "Contract date found with high confidence.",
        "suggested_action": "Approve if this matches the signed offer date.",
    },
    "brokerage": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Brokerage name found from the broker acknowledgment section.",
        "suggested_action": "Approve if correct.",
    },
    "broker": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "name",
        "user_facing_message": "Broker name found from the broker acknowledgment section.",
        "suggested_action": "Approve if this is the correct agent of record.",
    },
    "broker_email": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "email",
        "user_facing_message": "Broker email found from the broker acknowledgment section.",
        "suggested_action": "Approve or correct.",
    },
    "broker_phone": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "phone",
        "user_facing_message": "Broker phone found from the broker acknowledgment section.",
        "suggested_action": "Approve or correct.",
    },
    "purchase_price": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "money",
        "user_facing_message": "Purchase price found with high confidence at §4.",
        "suggested_action": "Verify this matches the signed contract price, then approve.",
    },
    "earnest_money": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "money",
        "user_facing_message": "Earnest money amount found at §4.3.",
        "suggested_action": "Approve if this matches the earnest money agreed upon.",
    },
    "new_loan": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "money",
        "user_facing_message": "New loan amount found at §4.5.",
        "suggested_action": "Approve or correct against the loan commitment.",
    },
    "cash_at_closing": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "money",
        "user_facing_message": "Cash at closing amount found at §4.6.",
        "suggested_action": "Approve or correct.",
    },
    "seller_concession": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "money",
        "user_facing_message": "Seller concession found at §4.2.",
        "suggested_action": "Approve or correct.",
    },
    "earnest_money_holder": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Earnest money holder (title company) found at §4.3.",
        "suggested_action": "Approve if this is the correct title company.",
    },
    "other_inclusions": {
        "required_level": "optional", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "list",
        "user_facing_message": "Personal property inclusions found at §2.5.",
        "suggested_action": "Approve the list or edit to match the contract.",
    },
    "exclusions": {
        "required_level": "optional", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "list",
        "user_facing_message": "Exclusions found at §2.6.",
        "suggested_action": "Approve or correct.",
    },
    "parking": {
        "required_level": "informational", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Parking information found at §2.5.",
        "suggested_action": "Approve if correct. Not required to create the workspace.",
    },
    "storage": {
        "required_level": "informational", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Storage information found at §2.5.",
        "suggested_action": "Approve if correct. Not required to create the workspace.",
    },
    "buyer_name": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "redacted", "applicability_status": "applicable",
        "value_type": "name",
        "user_facing_message": "Buyer name is redacted in this version of the contract.",
        "suggested_action": "Enter the buyer's legal name as it appears in the unredacted contract.",
    },
    "seller_name": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "redacted", "applicability_status": "applicable",
        "value_type": "name",
        "user_facing_message": "Seller name is redacted in this version of the contract.",
        "suggested_action": "Enter the seller's legal name as it appears in the unredacted contract.",
    },
    "closing_date": {
        "required_level": "required_to_create", "blocking": True,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "date",
        "user_facing_message": "Closing date found at §12.",
        "suggested_action": "Approve or correct. This drives all deadline calculations.",
    },
    "possession_date": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "date",
        "user_facing_message": "Possession date found at §17.",
        "suggested_action": "Approve or correct.",
    },
    "possession_time": {
        "required_level": "optional", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Possession time found at §17.",
        "suggested_action": "Approve if correct.",
    },
    "lead_based_paint_disclosure": {
        "required_level": "informational", "blocking": False,
        "availability_status": "available", "applicability_status": "not_applicable",
        "value_type": "text",
        "user_facing_message": "Lead-Based Paint Disclosure is marked N/A in this contract. This typically applies to homes built before 1978.",
        "suggested_action": "Confirm as N/A if the home was built after 1977.",
    },
    "new_loan_application_deadline": {
        "required_level": "informational", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "New loan application was completed prior to contract execution. No outstanding deadline.",
        "suggested_action": "No action needed — already completed.",
    },
    # Diverse-state fields
    "seller_concession_terms": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "available", "applicability_status": "applicable",
        "value_type": "text",
        "user_facing_message": "Seller concession terms were found with lower than usual confidence. The source text in this area was dense.",
        "suggested_action": "Review page 4, §4.2 to confirm this accurately describes the concession arrangement.",
    },
    "loan_officer_name": {
        "required_level": "required_before_closing", "blocking": False,
        "availability_status": "missing", "applicability_status": "applicable",
        "value_type": "name",
        "user_facing_message": "Loan officer name was not found in this contract. This is common — loan officer details are often added separately.",
        "suggested_action": "Add the loan officer's name now, or mark as 'Get later' to create a follow-up task.",
    },
    "hoa_monthly_assessment": {
        "required_level": "optional", "blocking": False,
        "availability_status": "available", "applicability_status": "not_applicable",
        "value_type": "money",
        "user_facing_message": "HOA Association Documents section (§7) does not appear to apply to this property.",
        "suggested_action": "Confirm N/A if this property has no homeowner association.",
    },
}

DEADLINE_DATA = [
    ("1", "§3", "Time of Day Deadline", None, "7:00 PM MT"), ("2", "§4.3", "Alternative Earnest Money Deadline", "10/28/2025", None),
    ("3", "§8.1", "Record Title Deadline", "11/3/2025", None), ("4", "§8.2", "Record Title Objection Deadline", "11/5/2025", None),
    ("5", "§8.3", "Title Resolution Deadline", "11/7/2025", None), ("6", "§7", "Association Documents Deadline", "11/3/2025", None),
    ("7", "§7", "Association Documents Termination Deadline", "11/5/2025", None), ("8", "§10.1", "Seller’s Property Disclosure Deadline", "10/24/2025", None),
    ("9", "§10.10", "Lead-Based Paint Disclosure Deadline", "N/A", None), ("10", "§5.2", "New Loan Application Deadline", "COMPLETED", None),
    ("11", "§5.3", "New Loan Terms Deadline", "11/7/2025", None), ("12", "§5.4", "New Loan Availability Deadline", "11/14/2025", None),
    ("13", "§6.2", "Appraisal Deadline", "11/10/2025", None), ("14", "§6.2", "Appraisal Objection Deadline", "11/12/2025", None),
    ("15", "§6.2", "Appraisal Resolution Deadline", "11/13/2025", None), ("16", "§9", "New ILC or New Survey Deadline", "11/10/2025", None),
    ("17", "§9", "New ILC or New Survey Objection Deadline", "11/12/2025", None), ("18", "§9", "New ILC or New Survey Resolution Deadline", "11/13/2025", None),
    ("19", "§10.3", "Water Rights Examination Deadline", "N/A", None), ("20", "§10.4", "Mineral Rights Examination Deadline", "N/A", None),
    ("21", "§10.2", "Inspection Termination Deadline", "10/29/2025", None), ("22", "§10.2", "Inspection Objection Deadline", "10/29/2025", None),
    ("23", "§10.2", "Inspection Resolution Deadline", "10/31/2025", None), ("24", "§10.7", "Property Insurance Termination Deadline", "11/7/2025", None),
    ("25", "§10.6", "Due Diligence Documents Delivery Deadline", "11/3/2025", None), ("26", "§10.6", "Due Diligence Documents Objection Deadline", "11/5/2025", None),
    ("27", "§10.6", "Due Diligence Documents Resolution Deadline", "11/7/2025", None), ("28", "§10.8", "Conditional Sale Deadline", "N/A", None),
    ("29", "§10.10", "Lead-Based Paint Termination Deadline", "N/A", None), ("30", "§31", "Acceptance Deadline Date", "10/21/2025", None),
    ("31", "§31", "Acceptance Deadline Time", None, "7:00 PM MT"),
]

TASK_MAP = {
    "Alternative Earnest Money Deadline": "Confirm earnest money delivered and receipt uploaded.",
    "Record Title Deadline": "Confirm title commitment and tax certificate received.",
    "Record Title Objection Deadline": "Confirm buyer title objection decision.",
    "Association Documents Deadline": "Confirm HOA documents received if applicable.",
    "Seller’s Property Disclosure Deadline": "Confirm seller property disclosure received.",
    "New Loan Terms Deadline": "Confirm buyer loan terms review.",
    "New Loan Availability Deadline": "Confirm lender status / loan availability.",
    "Appraisal Deadline": "Confirm appraisal received.",
    "Appraisal Objection Deadline": "Confirm appraisal objection decision.",
    "Inspection Objection Deadline": "Confirm inspection objection decision.",
    "Inspection Resolution Deadline": "Confirm inspection resolution signed or waived.",
    "Due Diligence Documents Delivery Deadline": "Confirm due diligence documents received.",
}
DOCS = [
("Contract to Buy and Sell Real Estate","purchase_contract","Signed CTME contract", "approved"), ("Earnest Money Receipt","purchase_contract","Proof earnest money was delivered", "missing"),
("Counterproposal","purchase_contract","If countered", "missing"), ("Amend / Extend Contract","purchase_contract","Changes after mutual execution", "missing"),
("Inspection Objection","inspection_due_diligence","Buyer objection form", "missing"), ("Inspection Resolution","inspection_due_diligence","Signed resolution", "missing"),
("Appraisal Objection","financing","Appraisal objection", "missing"), ("Appraisal Resolution","financing","Appraisal resolution", "missing"),
("Title Objection","title_escrow","Title objection", "missing"), ("Title Resolution","title_escrow","Title resolution", "missing"),
("Due Diligence Documents","inspection_due_diligence","Seller due diligence package", "missing"), ("Closing Instructions","closing","Title/escrow closing instructions", "missing"),
("Additional Provisions Addendum","purchase_contract","If additional terms attach", "missing"), ("Loan Application","financing","Loan application confirmation", "reviewed"),
("Loan Estimate","financing","Loan estimate", "missing"), ("Closing Disclosure","financing","Final CD", "missing"),
("Title Commitment","title_escrow","Title commitment", "missing"), ("Title Insurance Policy","post_closing","Owner policy", "missing"),
("Settlement Statement","closing","Settlement statement", "missing"), ("Tax Certificate","title_escrow","Tax certificate", "missing"),
("HOA Status Letter","colorado_specific","HOA status letter", "missing"), ("General Home Inspection Report","inspection_due_diligence","Inspection report", "missing"),
("Radon Test Results","inspection_due_diligence","Radon results", "missing"), ("Sewer Scope Report","inspection_due_diligence","Sewer scope", "missing"),
("Final Walkthrough Confirmation","closing","Walkthrough complete", "missing"), ("Wire Confirmation","closing","Wire confirmation", "missing"),
("Closing Package Receipt","closing","Closing docs received", "missing"), ("Recorded Deed Copy","post_closing","Recorded deed", "missing"),
("Owner’s Title Policy","post_closing","Owner policy", "missing"), ("Final Brokerage File Audit","brokerage_compliance","Brokerage review", "missing"),
("Signed Agency Disclosures","brokerage_compliance","Agency disclosures", "missing"), ("Earnest Money Tracking","brokerage_compliance","Earnest money log", "missing"),
("Communication Log","brokerage_compliance","Comms log", "missing"), ("Commission Record","brokerage_compliance","Commission file", "missing"), ("File Retention Confirmation","brokerage_compliance","Retention closeout", "missing"),
]
POST_CLOSE = ["Thank You Card Sent to Buyer","Closing Gift Delivered to Buyer","Review Request Sent to Buyer","Referral Request Sent to Buyer","Anniversary Follow-Up Reminder Added","CRM Follow-Up Campaign Added","Thank You Card Sent to Seller","Thank You Card Sent to Loan Officer","Thank You Card Sent to Escrow Officer","Thank You Card Sent to Home Inspector","Google Review Requested","Zillow Review Requested","Testimonial Requested","Client Added to Newsletter","Home Purchase Anniversary Reminder Added","Transaction Fully Closed Out"]


def audit(session: Session, transaction_id: str | None, event_type: str, entity_type: str, entity_id: str | None = None, before: str | None = None, after: str | None = None, actor_id: str | None = None) -> AuditEvent:
    ev = AuditEvent(transaction_id=transaction_id, event_type=event_type, entity_type=entity_type, entity_id=entity_id, before_value=before, after_value=after, actor_id=actor_id)
    session.add(ev); return ev


def create_transaction(session: Session, owner_id: str) -> Transaction:
    tx = Transaction(owner_id=owner_id, property_address="4902 Cherry Springs Drive", city="Colorado Springs", state="CO", zip="80923", county="El Paso", legal_description="LOT 3 WAGON TRAILS SUB FIL NO 21 PLAT 10743", contract_date=d("10/21/2025"), closing_date=d("11/20/2025"), possession_date=d("11/20/2025"), possession_time="Time of Closing/Funding", status=TransactionStatus.in_review, risk_level=RiskLevel.medium, purchase_price=520000, earnest_money=5000, completion_percent=22)
    session.add(tx); session.commit(); session.refresh(tx); return tx


def create_source_document(session: Session, user: User, filename: str, content_type: str, data: bytes, transaction_id: str | None = None) -> tuple[SourceDocument, ExtractionRun]:
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    doc_id = str(uuid4())
    storage = str(Path(settings.upload_dir) / f"{doc_id}.pdf")
    Path(storage).write_bytes(data)
    doc = SourceDocument(id=doc_id, transaction_id=transaction_id, filename=filename, mime_type=content_type, file_size_bytes=len(data), storage_path=storage, sha256_hash=hashlib.sha256(data).hexdigest(), uploaded_by=user.id)
    session.add(doc); session.commit(); session.refresh(doc)
    run = ExtractionRun(
        source_document_id=doc.id, transaction_id=transaction_id,
        status=ExtractionStatus.needs_review,
        provider="FixtureExtractionProvider",
        model_name="fixture-extraction-provider-v1",
        schema_version="altitude-ctme-v1",
        stage="completed",
        completed_at=datetime.now(timezone.utc),
        progress_percent=100,
    )
    session.add(run); session.commit(); session.refresh(run)
    # Always materialize extraction synchronously — the FixtureExtractionProvider
    # is synchronous. A live OCR/LLM provider would defer this to a background job
    # and update ExtractionRun.status asynchronously.
    materialize_extraction(session, run, doc, user.id)
    # document_uploaded audit is additive; extraction audits are emitted inside materialize_extraction.
    audit(session, run.transaction_id, "document_uploaded", "source_document", doc.id, after=filename, actor_id=user.id)
    session.commit()
    return doc, run


def materialize_extraction(session: Session, run: ExtractionRun, doc: SourceDocument, owner_id: str) -> Transaction:
    tx = session.get(Transaction, run.transaction_id) if run.transaction_id else None
    if not tx:
        tx = create_transaction(session, owner_id)
        run.transaction_id = tx.id; doc.transaction_id = tx.id
    fields_created: list[ExtractedField] = []
    for key, label, value, norm, page, section, conf, pop_status in FIELD_DATA:
        meta = FIELD_META.get(key, {})
        # Determine availability_status from population status and meta
        if meta.get("availability_status"):
            avail = meta["availability_status"]
        elif pop_status == "redacted_in_source":
            avail = "redacted"
        elif pop_status == "missing_required" or (value is None and pop_status not in ("not_applicable", "completed")):
            avail = "missing"
        else:
            avail = "available"
        # review_decision: N/A fields auto-resolve; others start unreviewed
        applic = meta.get("applicability_status", "applicable")
        if pop_status in ("not_applicable",) or applic == "not_applicable":
            review_dec = "marked_not_applicable"
        elif pop_status == "completed":
            review_dec = "approved"
        else:
            review_dec = "unreviewed"
        field = ExtractedField(
            transaction_id=tx.id, extraction_run_id=run.id,
            field_key=key, label=label, value=value, normalized_value=norm,
            source_document_id=doc.id, source_page=page, source_section=section,
            evidence_text=meta.get("user_facing_message") or f"Extracted from {section}, page {page}.",
            confidence=conf,
            extraction_method="fixture",
            risk_level=_risk_for_confidence(conf),
            value_type=meta.get("value_type"),
            availability_status=avail,
            applicability_status=applic,
            required_level=meta.get("required_level", "optional"),
            blocking=meta.get("blocking", False),
            review_decision=review_dec,
            user_facing_message=meta.get("user_facing_message"),
            suggested_action=meta.get("suggested_action"),
            population_status=PopulationStatus(pop_status),
            review_status=ReviewStatus.pending if review_dec == "unreviewed" else ReviewStatus.approved,
        )
        session.add(field)
        fields_created.append(field)

    last_time = "7:00 PM MT"
    for item, ref, name, raw, time in DEADLINE_DATA:
        raw_value = raw or time
        app = DeadlineApplicability.active
        if raw == "N/A":
            app = DeadlineApplicability.not_applicable
        if raw == "COMPLETED":
            app = DeadlineApplicability.completed
        has_date = d(raw) is not None
        resp_party = (
            "buyer_broker" if any(k in name for k in ("Inspection", "Appraisal", "Loan", "ILC", "Survey"))
            else "listing_broker" if "Seller" in name or "Acceptance" in name
            else "title_company" if "Title" in name or "Association" in name
            else "buyer_broker"
        )
        dl = Deadline(
            transaction_id=tx.id, item_number=item, section_reference=ref, event_name=name,
            due_date=d(raw),
            due_time=time or (last_time if raw and app == DeadlineApplicability.active else None),
            raw_value=raw_value, applicability=app,
            confidence=1.0,
            responsible_party=resp_party if app == DeadlineApplicability.active else None,
            calendar_ready=has_date and app == DeadlineApplicability.active,
            human_review_required=False,
            source_document_id=doc.id, source_page=6, source_section="Dates and Deadlines",
        )
        session.add(dl)
        session.flush()
        if name in TASK_MAP:
            category = "inspection" if "Inspection" in name else "loan" if "Loan" in name or "Appraisal" in name else "title" if "Title" in name else "due_diligence"
            task = Task(transaction_id=tx.id, title=TASK_MAP[name], category=category, due_date=dl.due_date, linked_deadline_id=dl.id, status=TaskStatus.not_started, assigned_role="buyer_broker", notes="Generated from CTME deadline; not complete until Brett confirms or document is reviewed.")
            session.add(task); session.flush(); dl.linked_task_id = task.id; audit(session, tx.id, "task_generated", "task", task.id)
            audit(session, tx.id, "deadline_generated", "deadline", dl.id)
    for title, due in [("Confirm closing scheduled, closing package received, final walkthrough complete.", tx.closing_date), ("Confirm possession logistics.", tx.possession_date)]:
        session.add(Task(transaction_id=tx.id, title=title, category="closing", due_date=due, assigned_role="buyer_broker", source_type="generated_from_contract_date"))
    contacts = [("buyer_brokerage", None, "RE/MAX Real Estate Group", None, None, True), ("buyer_agent", "Brett Predmore", "RE/MAX Real Estate Group", "brett.predmore@icloud.com", "719-338-9465", True), ("title_company", None, "Land Title Company", None, None, True), ("seller", None, None, None, None, True), ("buyer", None, None, None, None, True), ("loan_officer", None, None, None, None, True), ("escrow_officer", None, "Land Title Company", None, None, True), ("home_inspector", None, None, None, None, False), ("radon_inspector", None, None, None, None, False), ("sewer_scope_vendor", None, None, None, None, False), ("insurance_agent", None, None, None, None, True)]
    for role,name,company,email,phone,required in contacts:
        session.add(Contact(transaction_id=tx.id, role=role, name=name, company=company, email=email, phone=phone, required=required, complete=bool(name or company or email or phone), source="contract_extraction" if name or company else "operational_checklist"))
    for name,cat,purpose,recv in DOCS:
        req = RequiredStatus.conditional if name in {"Counterproposal","Amend / Extend Contract","Additional Provisions Addendum"} else RequiredStatus.required
        session.add(DocumentRequirement(transaction_id=tx.id, document_name=name, category=cat, purpose=purpose, required_status=req, received_status=ReceivedStatus(recv), source_document_id=doc.id if name == "Contract to Buy and Sell Real Estate" else None, due_date=tx.closing_date if cat in {"closing","post_closing"} else None))
    for title in POST_CLOSE:
        session.add(PostCloseTask(transaction_id=tx.id, title=title, recipient_role=title.split(" to ")[-1].lower().replace(" ", "_") if " to " in title else "client", status=TaskStatus.not_started))
    low_conf = [f for f in fields_created if f.confidence < 0.85]
    missing_req = [f for f in fields_created if f.population_status == PopulationStatus.missing_required]
    na_fields = [f for f in fields_created if f.population_status == PopulationStatus.not_applicable]
    active_deadlines = [item for _, _, _, raw, _ in DEADLINE_DATA if raw not in ("N/A", "COMPLETED", None) and d(raw) is not None]
    metrics = {
        "fields_extracted": len(fields_created),
        "fields_requiring_review": len(fields_created),
        "low_confidence_count": len(low_conf),
        "missing_required_count": len(missing_req),
        "deadlines_extracted": len(DEADLINE_DATA),
        "active_deadlines": len(active_deadlines),
        "na_count": len(na_fields),
        "extraction_coverage_pct": round(len([f for f in fields_created if f.value]) / len(fields_created) * 100) if fields_created else 0,
        "provider": "FixtureExtractionProvider",
        "source": "sample_contract_extraction.json",
    }
    run.metrics_json = json.dumps(metrics)
    run.provider = "FixtureExtractionProvider"
    run.stage = "completed"

    audit(session, tx.id, "extraction_completed", "extraction_run", run.id, after="needs_review", actor_id=owner_id)
    session.add(tx); session.add(run); session.add(doc); session.commit(); session.refresh(tx); return tx


def seed_fixture_transaction(session: Session, user: User) -> Transaction:
    existing = session.exec(select(Transaction)).first()
    if existing: return existing
    doc, run = create_source_document(session, user, "CBS - CONTRACT TO BUY AND SELL REAL ESTATE (RESIDENTIAL) EXAMPLE.pdf", "application/pdf", b"%PDF-1.4\n%%EOF\n")
    return materialize_extraction(session, run, doc, user.id)
