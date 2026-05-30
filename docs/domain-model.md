# Domain Model

**Project:** Altitude Transactions  
**Date:** 2026-05-30  
**Backend:** FastAPI + SQLite/SQLModel (Python 3.11)  
**Source of truth:** `backend/app/models/__init__.py`

---

## Entity Relationships

```
User
 └── Transaction (owner_id)
       ├── SourceDocument (transaction_id)
       │     └── ExtractionRun (source_document_id)
       │           └── ExtractedField (extraction_run_id)
       ├── Deadline (transaction_id)
       │     └── Task (linked_deadline_id) ←── Task also links to Transaction directly
       ├── Contact (transaction_id)
       ├── DocumentRequirement (transaction_id)
       ├── PostCloseTask (transaction_id)
       └── AuditEvent (transaction_id)
```

---

## Transaction

The central record. One transaction = one property under contract.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | Primary key |
| owner_id | FK → User | Brett's user ID |
| property_address | string | Street address |
| city | string | Colorado city |
| state | string | Always "CO" |
| zip, county, legal_description | optional string | From contract |
| contract_date | date | Offer/contract execution date |
| closing_date | date | Scheduled closing date |
| possession_date | date | Scheduled possession date |
| possession_time | string | "Time of Closing/Funding" etc. |
| status | TransactionStatus enum | in_review → active → closing → closed |
| risk_level | RiskLevel enum | low / medium / high |
| completion_percent | int | 0–100 |
| purchase_price | int | In dollars |
| earnest_money | int | In dollars |

**TransactionStatus values:** draft, under_contract, in_review, active, closing, closed, cancelled

---

## SourceDocument

Represents an uploaded contract PDF or supporting document.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | Also the storage filename |
| transaction_id | FK → Transaction | May be null if not yet confirmed |
| filename | string | Original filename |
| document_type | string | "CTME Contract to Buy and Sell Real Estate" |
| mime_type | string | application/pdf |
| file_size_bytes | int | |
| storage_path | string | Local filesystem path (sandbox) |
| sha256_hash | string | Deduplication key |
| uploaded_by | FK → User | |
| uploaded_at | datetime | |

**Production note:** `storage_path` should be a cloud storage URI in production.

---

## ExtractionRun

Records one extraction attempt on a SourceDocument.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | Also the "job ID" used in the upload flow |
| transaction_id | FK → Transaction | May be null if pre-confirm |
| source_document_id | FK → SourceDocument | |
| status | ExtractionStatus enum | needs_review / approved / failed |
| stage | string | Pipeline stage label |
| provider | string | "FixtureExtractionProvider" (sandbox) |
| model_name | string | "fixture-extraction-provider-v1" (sandbox) |
| schema_version | string | "altitude-ctme-v1" |
| started_at | datetime | |
| completed_at | datetime | |
| error_message | string | Populated on failure |
| progress_percent | int | 0–100 |
| metrics_json | string (JSON) | Extraction metrics (see extraction-pipeline.md) |

**ExtractionStatus values:** queued, uploading, parsing_pdf, extracting_fields, generating_deadlines, generating_tasks, needs_review, approved, failed

---

## ExtractedField

One extracted value from a contract field. Created at extraction time with `review_status = pending`.
Must be reviewed (approved / edited / rejected / n/a) before the workspace is broker-confirmed.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| extraction_run_id | FK → ExtractionRun | |
| field_key | string | Machine-readable key (e.g., "purchase_price") |
| label | string | Human-readable label (e.g., "Purchase Price") |
| value | string | Raw extracted string |
| normalized_value | string | Parsed/cleaned value |
| source_document_id | FK → SourceDocument | Evidence anchor |
| source_page | int | Page number in source document |
| source_section | string | CTME section reference |
| evidence_text | string | Descriptive evidence from extraction |
| confidence | float | 0.0–1.0 extraction confidence |
| extraction_method | string | fixture / deterministic / llm / human_corrected / imported |
| risk_level | string | low / medium / high (derived from confidence) |
| population_status | PopulationStatus enum | See below |
| review_status | ReviewStatus enum | pending / approved / edited / rejected |
| reviewed_by | FK → User | |
| reviewed_at | datetime | |
| rejection_reason | string | Optional reason for rejection or N/A |

**PopulationStatus values:** populated, missing_required, not_applicable, redacted_in_source, completed, needs_human_review, manual_override, superseded_by_amendment

**ReviewStatus values:** pending, approved, edited, rejected

---

## Deadline

One itemized deadline from the CTME Dates and Deadlines section (§29).

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| item_number | string | CTME item number (§29 row number) |
| section_reference | string | Contract section (e.g., "§10.2") |
| event_name | string | Human-readable deadline name |
| due_date | date | Parsed date |
| due_time | string | Time string (e.g., "7:00 PM MT") |
| raw_value | string | Original text from contract |
| applicability | DeadlineApplicability enum | active / not_applicable / completed |
| confidence | float | Extraction confidence |
| responsible_party | string | Role responsible for this deadline |
| calendar_ready | bool | True if due_date is parseable and active |
| human_review_required | bool | True for ambiguous/complex deadlines |
| source_document_id | FK → SourceDocument | |
| source_page | int | |
| source_section | string | "Dates and Deadlines" |
| linked_task_id | FK → Task | Linked operational task |

---

## Task

One operational checklist item, typically generated from a deadline.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| title | string | Operational action (e.g., "Confirm inspection objection decision") |
| category | string | inspection / loan / title / due_diligence / closing / post_close |
| status | TaskStatus enum | not_started / in_progress / complete / not_applicable |
| due_date | date | Usually matches linked deadline |
| completed_at | datetime | Set when status → complete |
| assigned_role | string | "buyer_broker" for all generated tasks |
| notes | string | Contextual guidance |
| not_applicable_reason | string | Reason when marked N/A |
| linked_deadline_id | FK → Deadline | Source deadline |
| source_type | string | generated_from_deadline / generated_from_contract_date |

---

## Contact

One party or vendor role in the transaction. Separate from ExtractedField parties.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| role | string | buyer / seller / buyer_agent / listing_agent / loan_officer / title_company / escrow_officer / home_inspector / etc. |
| name | string | Full name |
| company | string | Company/brokerage |
| email | string | |
| phone | string | |
| license_number | string | Colorado broker license |
| address | string | |
| notes | string | |
| required | bool | True for roles that must be completed |
| complete | bool | True when all required fields are populated |
| source | string | contract_extraction / operational_checklist |

**Source:** Contact Information Chart — all roles and fields

---

## DocumentRequirement

One item from the Colorado transaction document checklist.
Not the same as a SourceDocument (which is an uploaded file).

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| document_name | string | Human-readable document name |
| category | string | purchase_contract / financing / title_escrow / inspection_due_diligence / closing / post_closing / brokerage_compliance / colorado_specific |
| purpose | string | Description of document's role |
| required_status | RequiredStatus enum | required / conditional / not_applicable |
| received_status | ReceivedStatus enum | missing / received / reviewed / approved |
| source_document_id | FK → SourceDocument | Linked uploaded file when received |
| due_date | date | When the document must be received |
| notes | string | |

---

## PostCloseTask

Post-closing follow-up actions tracked per transaction.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| title | string | Action description |
| recipient_role | string | buyer / seller / loan_officer / escrow_officer / inspector / client |
| status | TaskStatus enum | not_started / in_progress / complete / not_applicable |
| date_sent | date | When card/gift/review request was sent |
| date_completed | date | When follow-up was completed |
| notes | string | |

**Source:** Real Estate Transaction Thank You Card Tracking Chart

---

## AuditEvent

Immutable record of every significant action in the system.

| Field | Type | Notes |
|---|---|---|
| id | UUID string | |
| transaction_id | FK → Transaction | |
| actor_type | string | "user" / "system" |
| actor_id | FK → User | |
| event_type | string | document_uploaded / extraction_completed / field_approved / field_edited / field_rejected / field_marked_na / task_generated / deadline_generated / etc. |
| entity_type | string | source_document / extraction_run / extracted_field / task / deadline / etc. |
| entity_id | string | ID of the affected entity |
| before_value | string | Value before change (for edit events) |
| after_value | string | Value after change |
| metadata_json | string (JSON) | Additional context (e.g., rejection reason) |
| created_at | datetime | |

---

## Enumerations

```python
TransactionStatus: draft | under_contract | in_review | active | closing | closed | cancelled
ExtractionStatus:  queued | uploading | parsing_pdf | extracting_fields | generating_deadlines | generating_tasks | needs_review | approved | failed
PopulationStatus:  populated | missing_required | not_applicable | redacted_in_source | completed | needs_human_review | manual_override | superseded_by_amendment
ReviewStatus:      pending | approved | edited | rejected
TaskStatus:        not_started | in_progress | complete | not_applicable
DeadlineApplicability: active | not_applicable | completed
RiskLevel:         low | medium | high
RequiredStatus:    required | conditional | not_applicable
ReceivedStatus:    missing | received | reviewed | approved
```
