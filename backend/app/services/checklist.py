"""Checklist sections, the Colorado template definition, and checklist helpers."""
from __future__ import annotations

import datetime as dt

from sqlmodel import Session, select

from app.models import (
    ChecklistItemStatus,
    DocumentChecklistItem,
    DocumentType,
    DocumentTypeTemplate,
    Transaction,
    TransactionStatus,
)

# Canonical checklist sections (Colorado contract-to-close workflow).
SECTIONS: list[tuple[str, str]] = [
    ("listing_seller", "Listing / Seller Documents"),
    ("buyer_representation", "Buyer Representation Documents"),
    ("purchase_contract", "Purchase Contract Documents"),
    ("financing", "Financing Documents"),
    ("title_escrow", "Title & Escrow Documents"),
    ("inspection_due_diligence", "Inspection & Due Diligence Documents"),
    ("hoa_cic", "HOA / CIC Documents"),
    ("closing_post_closing", "Closing / Post-Closing Documents"),
]
SECTION_LABELS = dict(SECTIONS)

# (name, section, required, document_type) — seeded as core template rows.
# MVP prioritizes purchase contract, title/escrow, inspection, and HOA sections.
CORE_TEMPLATE: list[tuple[str, str, bool, DocumentType | None]] = [
    ("Contract to Buy and Sell Real Estate", "purchase_contract", True, DocumentType.contract_to_buy_and_sell),
    ("Earnest Money Receipt", "purchase_contract", True, DocumentType.earnest_money_receipt),
    ("Counterproposal", "purchase_contract", False, DocumentType.counterproposal),
    ("Agreement to Amend/Extend Contract", "purchase_contract", False, DocumentType.amend_extend),
    ("Closing Instructions", "purchase_contract", True, DocumentType.closing_instructions),
    ("Loan Estimate", "financing", False, None),
    ("Closing Disclosure", "financing", False, None),
    ("Title Commitment", "title_escrow", True, None),
    ("Tax Certificate", "title_escrow", False, None),
    ("Settlement Statement", "title_escrow", False, None),
    ("Inspection Objection Notice", "inspection_due_diligence", False, DocumentType.inspection_objection),
    ("Inspection Resolution", "inspection_due_diligence", False, DocumentType.inspection_resolution),
    ("Home Inspection Report", "inspection_due_diligence", False, DocumentType.home_inspection_report),
    ("Radon Report", "inspection_due_diligence", False, DocumentType.radon_report),
    ("Contractor Proposal / Invoice", "inspection_due_diligence", False, DocumentType.contractor_invoice),
    ("Sewer Scope Report", "inspection_due_diligence", False, None),
    ("HOA Status Letter", "hoa_cic", False, DocumentType.hoa_status_letter),
    ("HOA Governing Documents", "hoa_cic", False, None),
    ("Final Walkthrough Confirmation", "closing_post_closing", False, None),
    ("Recorded Deed Copy", "closing_post_closing", False, None),
    ("Seller's Property Disclosure", "listing_seller", True, None),
    ("Lead-Based Paint Disclosure", "listing_seller", False, None),
    ("Buyer Agency Agreement", "buyer_representation", True, None),
]

# Core contact roles (key, label).
CORE_CONTACT_ROLES: list[tuple[str, str]] = [
    ("buyer", "Buyer"),
    ("seller", "Seller"),
    ("buyer_agent", "Buyer's Agent"),
    ("listing_agent", "Listing Agent"),
    ("title_company", "Title Company"),
    ("escrow_officer", "Escrow / Closer"),
    ("lender", "Lender / Loan Officer"),
    ("home_inspector", "Home Inspector"),
    ("hoa_management", "HOA / Management Company"),
    ("insurance_agent", "Insurance Agent"),
]


def seed_org_templates(session: Session, organization_id: str) -> None:
    """Create core checklist template rows for an org if it has none."""
    existing = session.exec(
        select(DocumentTypeTemplate).where(DocumentTypeTemplate.organization_id == organization_id)
    ).first()
    if existing:
        return
    for i, (name, section, required, doc_type) in enumerate(CORE_TEMPLATE):
        session.add(
            DocumentTypeTemplate(
                organization_id=organization_id,
                name=name,
                section=section,
                sort_order=i,
                required=required,
                is_core=True,
                document_type=doc_type,
            )
        )


def instantiate_checklist(session: Session, tx: Transaction) -> list[DocumentChecklistItem]:
    """Create per-transaction checklist rows from the org's active template."""
    templates = session.exec(
        select(DocumentTypeTemplate)
        .where(
            DocumentTypeTemplate.organization_id == tx.organization_id,
            DocumentTypeTemplate.active == True,  # noqa: E712
        )
        .order_by(DocumentTypeTemplate.sort_order)
    ).all()
    items = [
        DocumentChecklistItem(
            transaction_id=tx.id,
            template_id=t.id,
            name=t.name,
            section=t.section,
            sort_order=t.sort_order,
            required=t.required,
            is_core=t.is_core,
            document_type=t.document_type,
        )
        for t in templates
    ]
    for item in items:
        session.add(item)
    return items


def is_item_overdue(item: DocumentChecklistItem, today: dt.date | None = None) -> bool:
    """Derived `Overdue`: a dated, unresolved row past its due date."""
    if item.due_date is None:
        return False
    if item.status in (
        ChecklistItemStatus.approved,
        ChecklistItemStatus.not_applicable,
    ):
        return False
    return item.due_date < (today or dt.date.today())


def find_item_for_document_type(
    session: Session, transaction_id: str, doc_type: DocumentType
) -> DocumentChecklistItem | None:
    """Suggest the checklist row a classified document belongs to."""
    return session.exec(
        select(DocumentChecklistItem)
        .where(
            DocumentChecklistItem.transaction_id == transaction_id,
            DocumentChecklistItem.document_type == doc_type,
        )
        .order_by(DocumentChecklistItem.sort_order)
    ).first()


def recompute_transaction_status(session: Session, tx: Transaction) -> None:
    """Derive `approved` from checklist completeness; `archived` is sticky.

    A transaction is `approved` when every required checklist row is approved
    or N/A. Called after any checklist/review state change. Caller commits.
    """
    if tx.status == TransactionStatus.archived:
        return
    required = session.exec(
        select(DocumentChecklistItem).where(
            DocumentChecklistItem.transaction_id == tx.id,
            DocumentChecklistItem.required == True,  # noqa: E712
        )
    ).all()
    resolved = (ChecklistItemStatus.approved, ChecklistItemStatus.not_applicable)
    all_done = bool(required) and all(i.status in resolved for i in required)
    new_status = TransactionStatus.approved if all_done else TransactionStatus.active
    if tx.status != new_status:
        tx.status = new_status
        tx.updated_at = dt.datetime.now(dt.timezone.utc)
        session.add(tx)
