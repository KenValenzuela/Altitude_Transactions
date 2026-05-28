"""Extraction service — a REAL SERVICE BOUNDARY.

`ExtractionService` is the interface a future live document-parsing pipeline
(OCR + LLM extraction over an uploaded PDF) would implement.

`MockExtractionService` is the MVP implementation. It is MOCKED: it does NOT
parse the uploaded PDF bytes. Instead it REPLAYS a real structured extraction
of a Colorado CTM "Contract to Buy and Sell Real Estate (Residential)" form
(CBS1-8-24), bundled at app/services/data/sample_contract_extraction.json.

To go live, implement `ExtractionService.extract` against a real parser and
swap the instance in app.services (see `get_extraction_service`).
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Protocol

_DATA_FILE = Path(__file__).resolve().parent / "data" / "sample_contract_extraction.json"

# Deadlines that are time-critical for a buyer-side coordinator. When upcoming,
# these are flagged is_urgent.
_CRITICAL_EVENTS = {
    "Appraisal Deadline",
    "Appraisal Resolution Deadline",
    "Inspection Resolution Deadline",
    "Closing Date",
}


def _parse_mmddyyyy(value: str) -> date | None:
    try:
        return datetime.strptime(value.strip(), "%m/%d/%Y").date()
    except (ValueError, AttributeError):
        return None


@dataclass
class ExtractedDeadline:
    event: str
    reference: str | None
    category: str | None
    date: date | None
    raw_value: str
    is_na: bool
    is_urgent: bool = False


@dataclass
class ExtractedFieldData:
    label: str
    value: str | None
    confidence: float
    category: str | None = None


@dataclass
class ExtractionFlagData:
    title: str
    detail: str


@dataclass
class ExtractionResult:
    """Normalized output of an extraction run."""

    fields: list[ExtractedFieldData] = field(default_factory=list)
    deadlines: list[ExtractedDeadline] = field(default_factory=list)
    flags: list[ExtractionFlagData] = field(default_factory=list)

    # Convenience structured values used when building a transaction.
    address: str = ""
    city: str = ""
    county: str | None = None
    price: int = 0
    earnest: int = 0
    loan_type: str | None = None
    close_date: date | None = None
    is_rural: bool = False
    has_hoa: bool = False
    parties: list[dict] = field(default_factory=list)

    def field_by_label(self, label: str) -> ExtractedFieldData | None:
        for f in self.fields:
            if f.label == label:
                return f
        return None


class ExtractionService(Protocol):
    """Interface boundary. A live implementation would parse `document`."""

    def extract(self, document) -> ExtractionResult:  # pragma: no cover - protocol
        ...


class MockExtractionService:
    """MOCKED implementation: replays the bundled sample extraction JSON.

    It ignores the actual uploaded bytes and returns a normalized
    ExtractionResult parsed from the real CTM contract extraction file.
    """

    def __init__(self, data_file: Path = _DATA_FILE) -> None:
        self._data_file = data_file

    def _load(self) -> dict:
        with open(self._data_file, "r", encoding="utf-8") as fh:
            return json.load(fh)

    def extract(self, document=None) -> ExtractionResult:  # noqa: ARG002 - mocked
        raw = self._load()
        scd = raw["structured_contract_data"]
        parties_prop = scd["parties_and_property"]
        terms = scd["purchase_price_terms"]
        financing = scd.get("financing", {})

        result = ExtractionResult()

        # --- Structured scalar values ---
        full_address = parties_prop.get("street_address", "")
        # The street_address bundles street + city + state/zip
        # ("4902 Cherry Springs Drive, Colorado Springs, CO 80923").
        result.address = self._street_from_address(full_address)
        result.city = self._city_from_address(full_address)
        result.county = parties_prop.get("county")
        result.price = int(terms.get("purchase_price") or 0)
        result.earnest = int(terms.get("earnest_money") or 0)
        result.loan_type = financing.get("loan_type")
        result.close_date = _parse_mmddyyyy(scd.get("closing_possession", {}).get("closing_date", ""))

        # --- Deadlines ---
        future_critical: list[ExtractedDeadline] = []
        for item in scd.get("dates_deadlines", []):
            event = item.get("event")
            value = item.get("value")
            if not event or event == "N/A":
                continue
            if value == "N/A":
                # Skip not-applicable deadlines entirely.
                continue
            parsed = _parse_mmddyyyy(value) if value not in ("COMPLETED",) else None
            dl = ExtractedDeadline(
                event=event,
                reference=item.get("reference"),
                category=item.get("category"),
                date=parsed,
                raw_value=str(value),
                is_na=False,
            )
            result.deadlines.append(dl)
            if parsed is not None and event in _CRITICAL_EVENTS:
                future_critical.append(dl)

        # Mark nearest upcoming critical events as urgent (top 3 by date).
        for dl in sorted(future_critical, key=lambda d: d.date)[:3]:
            dl.is_urgent = True

        # --- Conditional flags derived from extraction ---
        # is_rural: presence of water_rights / well / septic signals.
        wr = scd.get("water_rights", {})
        rural_signals = [v for v in wr.values() if v and v != "N/A"]
        result.is_rural = len(rural_signals) > 0  # sample: all N/A -> False

        # has_hoa: Association Documents deadlines present.
        result.has_hoa = any(
            d.category == "Owners Association" for d in result.deadlines
        )

        flags: list[ExtractionFlagData] = []
        if result.has_hoa:
            flags.append(
                ExtractionFlagData(
                    title="HOA / Owners Association",
                    detail="Association Documents deadlines detected — order and review HOA docs.",
                )
            )
        if result.is_rural:
            flags.append(
                ExtractionFlagData(
                    title="Rural property signals",
                    detail="Water rights / well / septic references detected — verify rural due diligence.",
                )
            )
        for prov in scd.get("additional_provisions", []):
            flags.append(
                ExtractionFlagData(
                    title=f"Additional Provision §{prov.get('section')}",
                    detail=prov.get("text", ""),
                )
            )
        if financing.get("new_loan_application_deadline") == "COMPLETED":
            flags.append(
                ExtractionFlagData(
                    title="Loan application completed",
                    detail="New Loan Application Deadline marked COMPLETED in contract.",
                )
            )
        result.flags = flags

        # --- Flat extracted fields for human review ---
        broker = scd.get("broker_header", {})
        result.fields = [
            ExtractedFieldData("Street Address", full_address, 0.99, "Property"),
            ExtractedFieldData("County", result.county, 0.98, "Property"),
            ExtractedFieldData("Legal Description", parties_prop.get("legal_description"), 0.95, "Property"),
            ExtractedFieldData("Title Vesting", parties_prop.get("title_vesting"), 0.9, "Property"),
            ExtractedFieldData("Purchase Price", f"{result.price}", 0.99, "Terms"),
            ExtractedFieldData("Earnest Money", f"{result.earnest}", 0.99, "Terms"),
            ExtractedFieldData("New Loan", f"{int(terms.get('new_loan') or 0)}", 0.97, "Terms"),
            ExtractedFieldData("Cash at Closing", f"{int(terms.get('cash_at_closing') or 0)}", 0.95, "Terms"),
            ExtractedFieldData("Seller Concession", f"{int(terms.get('seller_concession') or 0)}", 0.93, "Terms"),
            ExtractedFieldData("Earnest Money Holder", terms.get("earnest_money_holder"), 0.92, "Terms"),
            ExtractedFieldData("Loan Type", result.loan_type, 0.96, "Financing"),
            ExtractedFieldData("Closing Date", scd.get("closing_possession", {}).get("closing_date"), 0.98, "Closing"),
            ExtractedFieldData("Possession Date", scd.get("closing_possession", {}).get("possession_date"), 0.96, "Closing"),
            ExtractedFieldData("Buyer Name", parties_prop.get("buyer_name"), 0.4, "Parties"),
            ExtractedFieldData("Seller Name", parties_prop.get("seller_name"), 0.4, "Parties"),
            ExtractedFieldData("Listing Brokerage", scd.get("broker_acknowledgments", {}).get("seller_side", {}).get("brokerage_firm_name"), 0.9, "Parties"),
            ExtractedFieldData("Listing Agent", scd.get("broker_acknowledgments", {}).get("seller_side", {}).get("broker_name"), 0.9, "Parties"),
            ExtractedFieldData("Buyer Agent", broker.get("agent"), 0.95, "Parties"),
        ]

        # --- Parties for transaction build ---
        seller_side = scd.get("broker_acknowledgments", {}).get("seller_side", {})
        buyer_name = parties_prop.get("buyer_name") or ""
        seller_name = parties_prop.get("seller_name") or ""
        # Redacted placeholders -> friendly labels.
        if buyer_name.startswith("[REDACTED"):
            buyer_name = "Buyer"
        if seller_name.startswith("[REDACTED"):
            seller_name = "Seller"
        result.parties = [
            {"role": "buyer", "name": buyer_name, "sub": parties_prop.get("title_vesting"), "phone": None, "email": None},
            {"role": "seller", "name": seller_name, "sub": None, "phone": None, "email": None},
            {
                "role": "listing_agent",
                "name": seller_side.get("broker_name") or "Listing Agent",
                "sub": seller_side.get("brokerage_firm_name"),
                "phone": seller_side.get("phone"),
                "email": seller_side.get("email"),
            },
            {
                "role": "title",
                "name": terms.get("earnest_money_holder") or "Title Company",
                "sub": "Earnest money holder",
                "phone": None,
                "email": None,
            },
        ]
        return result

    @staticmethod
    def _street_from_address(address: str) -> str:
        # "4902 Cherry Springs Drive, Colorado Springs, CO 80923" -> street line
        return address.split(",")[0].strip()

    @staticmethod
    def _city_from_address(address: str) -> str:
        # "4902 Cherry Springs Drive, Colorado Springs, CO 80923" -> "Colorado Springs"
        parts = [p.strip() for p in address.split(",")]
        if len(parts) >= 2:
            return parts[1]
        return ""


# Single swappable instance. Replace with a live implementation to go live.
_extraction_service: ExtractionService = MockExtractionService()


def get_extraction_service() -> ExtractionService:
    return _extraction_service
