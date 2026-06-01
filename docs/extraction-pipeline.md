# Extraction Pipeline

**Project:** Altitude Transactions  
**Date:** 2026-05-30  
**Honesty label:** Current implementation uses `FixtureExtractionProvider` (sandbox).
No live OCR or LLM extraction is active. See ADR-002 for the swap plan.

---

## Pipeline Overview

```
[CTME PDF Upload]
      │
      ▼
[1. Document Ingest]          POST /api/documents/upload
      │
      ▼
[2. Storage + Hash]           SHA-256, local filesystem (sandbox)
      │
      ▼
[3. ExtractionRun created]    status = needs_review, provider = FixtureExtractionProvider
      │
      ▼
[4. FixtureExtractionProvider] Replays sample_contract_extraction.json
      │  (SANDBOX — not real OCR/LLM)
      ▼
[5. Field materialization]    ExtractedFields with confidence, evidence_text, risk_level
      │
      ▼
[6. Deadline extraction]      Deadline rows from §29 Dates and Deadlines
      │
      ▼
[7. Task generation]          Tasks linked to deadlines via TASK_MAP
      │
      ▼
[8. Contact scaffolding]      Contact rows from contract parties + operational roles
      │
      ▼
[9. Document requirements]    DocumentRequirement rows from Colorado checklist
      │
      ▼
[10. Post-close tasks]        PostCloseTask rows from Thank You Card Tracking Chart
      │
      ▼
[11. ExtractionMetrics]       metrics_json written to ExtractionRun
      │
      ▼
[12. Audit events]            extraction_completed event
      │
      ▼
[BROKER REVIEW]               GET /review/{documentId}
      │  Human approves / edits / rejects / marks N/A each field
      │  PATCH /api/extracted-fields/{id} with action + optional value + optional reason
      │  Each action creates an AuditEvent
      ▼
[CONFIRM]                     POST /api/extractions/{job_id}/confirm
      │  Transaction promoted from in_review to active
      ▼
[TRANSACTION WORKSPACE]       Deadlines, Tasks, Contacts, Documents, Audit
```

---

## Stage 1: Document Ingest

**Endpoint:** `POST /api/documents/upload`  
**File constraints:** PDF only (`application/pdf`), no size limit enforced yet (production should add)  
**What happens:**
- File bytes written to `settings.upload_dir` with UUID filename
- SHA-256 hash computed for deduplication
- `SourceDocument` row created with `storage_path`, `sha256_hash`, `file_size_bytes`
- `ExtractionRun` row created with `status = needs_review`

**Production note:** In a live deployment, file bytes should go to a secure object store
(S3, GCS, Azure Blob) with presigned URL access, not a local filesystem path.

---

## Stage 2: Field Extraction (Currently: Fixture Provider)

**Provider:** `FixtureExtractionProvider` (in `fixture_provider.py` / `extraction_service.py`)  
**What happens:**
- Reads `backend/app/services/data/sample_contract_extraction.json`
- Returns structured `ExtractionResult` with fields, deadlines, flags, and party data
- **Does NOT parse the uploaded PDF bytes** — the document bytes are ignored

**Each extracted field includes:**
- `field_key` — machine-readable identifier
- `label` — human-readable label
- `value` — raw extracted string
- `normalized_value` — parsed/cleaned value when applicable
- `source_page` — page number (from fixture data)
- `source_section` — CTME section reference (e.g., "§4 Purchase Price")
- `evidence_text` — descriptive evidence anchor (fixture: "Extracted from {section}, page {page}")
- `confidence` — extraction confidence (0.0–1.0)
- `extraction_method` — `"fixture"` for this provider
- `risk_level` — derived from confidence: <0.5 → high, 0.5–0.85 → medium, >0.85 → low
- `population_status` — populated / not_applicable / redacted_in_source / completed
- `review_status` — always `pending` at extraction time

**Production note:** A live provider would return real `confidence` scores from the
extraction model, `source_page` from document structure analysis, and `evidence_text`
from the actual contract text at the source anchor.

---

## Stage 3: Deadline Extraction

**Source:** 31 deadline rows from CBS contract §29 Dates and Deadlines  
**Each deadline includes:**
- CTME item number and section reference
- Event name (e.g., "Inspection Objection Deadline")
- `due_date` — parsed from M/DD/YYYY format
- `due_time` — time string when present (e.g., "7:00 PM MT")
- `raw_value` — original text from contract
- `applicability` — active / not_applicable / completed
- `confidence` — 1.0 for fixture data (deterministic parse)
- `responsible_party` — inferred from deadline category (buyer_broker / listing_broker / title_company)
- `calendar_ready` — true when due_date is parseable and applicability = active
- `human_review_required` — false for fixture (all values are deterministic)

**N/A deadlines:** Preserved in DB but excluded from operational views.  
**COMPLETED deadlines:** Preserved with `applicability = completed`.

---

## Stage 4: Task Generation

**Source:** `TASK_MAP` in `fixture_provider.py` — maps deadline event names to operational task titles  
**Pattern:** One task per critical deadline (12 mapped deadlines)  
**Additional tasks:** Closing logistics + possession logistics (2 more)  
**Each task includes:**
- `title` — operational action (e.g., "Confirm inspection objection decision")
- `category` — inspection / loan / title / due_diligence / closing
- `linked_deadline_id` — foreign key to the source deadline
- `source_type` — `"generated_from_deadline"` or `"generated_from_contract_date"`
- `assigned_role` — `"buyer_broker"` for all generated tasks
- `notes` — reminder that the task is not complete until Brett confirms or uploads the doc
- `status` — `not_started` at creation

**Source:** Business Plan Click-to-Complete Chart — task-to-deadline linkage pattern

---

## Stage 5: Contact Scaffolding

**11 contact roles created per transaction:**

| Role | Data Available | Source |
|---|---|---|
| buyer_brokerage | RE/MAX Real Estate Group | Broker acknowledgment |
| buyer_agent | Brett Predmore, email, phone | Broker acknowledgment |
| title_company | Land Title Company | §4.3 Earnest Money Holder |
| seller | Name redacted | Parties §1 |
| buyer | Name redacted | Parties §1 |
| loan_officer | Empty | NEEDS-CONF: broker confirms |
| escrow_officer | Land Title Company | §4.3 |
| home_inspector | Empty | Operational role |
| radon_inspector | Empty | Operational role |
| sewer_scope_vendor | Empty | Operational role |
| insurance_agent | Empty | Operational role |

**Source:** Contact Information Chart (all roles listed)

---

## Stage 6: Document Checklist

**35 document requirements created from the Colorado document checklist:**
- Purchase contract documents (7)
- Financing documents (4)
- Title/escrow documents (4)
- Inspection/due diligence documents (4)
- Closing documents (5)
- Post-closing documents (3)
- Brokerage compliance documents (5)
- Colorado-specific documents (2, HOA + radon)

**Initial status:** `"Contract to Buy and Sell Real Estate"` → approved; `"Loan Application"` → reviewed; all others → missing

**Source:** Colorado Real Estate Transaction Documents Click-to-Complete Chart

---

## Stage 7: Post-Close Tasks

**16 post-close tasks created from the Thank You Card Tracking Chart:**
Thank you cards (buyer, seller, loan officer, escrow officer, inspector), closing gift,
review requests (Google, Zillow, testimonial), referral request, anniversary reminder,
CRM follow-up, newsletter enrollment, transaction closeout.

**Source:** Real Estate Transaction Thank You Card Tracking Chart

---

## Extraction Metrics

After each run, `ExtractionRun.metrics_json` stores:

```json
{
  "fields_extracted": 25,
  "fields_requiring_review": 25,
  "low_confidence_count": 4,
  "missing_required_count": 0,
  "deadlines_extracted": 31,
  "active_deadlines": 22,
  "na_count": 5,
  "extraction_coverage_pct": 96,
  "provider": "FixtureExtractionProvider",
  "source": "sample_contract_extraction.json"
}
```

**Production metrics to add:** approval_rate, correction_rate, average_review_time,
transaction_readiness_score.

---

## Human Review Interface

**Endpoint:** `PATCH /api/extracted-fields/{field_id}`  
**Actions:**

| Action | Result |
|---|---|
| `approve` | `review_status = approved` |
| `edit` (with `value`) | `review_status = edited`, `extraction_method = human_corrected` |
| `reject` (with optional `reason`) | `review_status = rejected`, `rejection_reason` stored |
| `na` / `not_applicable` | `review_status = rejected`, `population_status = not_applicable` |

**Each action creates an `AuditEvent`** with `before_value`, `after_value`, actor, and optional metadata.

---

## Production Readiness

| Stage | Status |
|---|---|
| Document ingest | Production-ready (needs object storage for prod deploy) |
| Extraction boundary | Scaffolded — FixtureExtractionProvider only |
| Field schema | Production-ready (all required fields present) |
| Deadline extraction | Production-ready for fixture; real parser TBD |
| Task generation | Production-ready |
| Contact scaffolding | Production-ready for known contacts; unknown contacts need user input |
| Document checklist | Production-ready |
| Post-close tasks | Production-ready |
| Audit trail | Production-ready |
| Metrics | Basic metrics implemented; advanced metrics TBD |
| Human review | Production-ready |
| Async extraction job | Not implemented — synchronous only in current fixture mode |
| SSE / WebSocket polling | Not implemented — polling endpoint available |
