# Architectural Decision Records

**Project:** Altitude Transactions  
**Format:** Lightweight ADR (Context → Decision → Rationale → Trade-offs → Status)

---

## ADR-001: Custom Build vs. Business Plan's Recommended SaaS Stack

**Date:** 2026-05-30  
**Status:** Active — documented conflict, explicit label applied

### Context

The Altitude Transactions Business Plan recommends a lean no-code/low-code stack:
Airtable (data), Softr (portal), Make.com (automation), Claude API (extraction), and CTME-native tooling.
This approach minimizes upfront engineering investment for a solo operator and is well-suited to Brett's
launch phase.

The current repository (`Altitude_Transactions_PT`) is a custom-built full-stack application:
- Frontend: Next.js 15 (TypeScript, App Router, pure CSS)
- Backend: FastAPI + SQLite/SQLModel (Python 3.11)
- Mobile: React Native / Expo (scaffolded)

These are two different implementation paths for the same product.

### Decision

**The repository is explicitly labeled as the Production-Oriented Custom Implementation Path.**
It is NOT a throwaway demo. It is not the launch stack recommended by the business plan.
It is a production-quality foundation for a proprietary Altitude product, operating in parallel
with (or as a future replacement for) the SaaS-stack approach.

The codebase must never claim to be the approved launch stack unless Brett explicitly confirms
that the custom build is the chosen path.

### Rationale

- The business plan's SaaS stack is optimized for speed-to-market and low engineering overhead
- The custom build provides more control, better branding, and a credible investor/demo artifact
- Both paths serve the same domain model and product workflows
- The custom build is more maintainable and auditable for the extraction/review pipeline

### Trade-offs

| Factor | SaaS Stack | Custom Build |
|---|---|---|
| Time-to-launch | Weeks | Months |
| Engineering cost | Low | High |
| Brand control | Limited | Full |
| Extraction fidelity | Moderate | High |
| AI pipeline control | Limited | Full |
| Scalability | Airtable limits | Database-native |
| Auditability | Moderate | Full |

### Action Required

Brett must confirm which path is the launch path before:
- Deploying to production
- Advertising the product to brokers
- Investing further in the mobile app

---

## ADR-002: FixtureExtractionProvider vs. Production OCR/LLM Provider

**Date:** 2026-05-30  
**Status:** Active — sandbox mode intentionally preserved

### Context

The current extraction pipeline does not perform real OCR or LLM extraction.
`MockExtractionService` (in `backend/app/services/extraction_service.py`) and the
`FixtureExtractionProvider` (in `backend/app/services/demo_workflow.py`) replay a
pre-structured extraction of a real Colorado CBS contract
(4902 Cherry Springs Drive, Colorado Springs, CO 80923).

The extraction data comes from `backend/app/services/data/sample_contract_extraction.json`,
which was produced from a real contract and contains real CTME field values.

### Decision

**The fixture provider is the intentional sandbox/staging implementation.**
The `ExtractionService` Protocol in `extraction_service.py` defines the interface boundary.
To go live with real extraction, implement the protocol and swap the instance in
`get_extraction_service()`. No other code needs to change.

Candidate live providers:
- AWS Textract (form fields + table extraction)
- Azure Document Intelligence (pre-built form model for real estate)
- Google Document AI
- Claude API (via Anthropic) — structured JSON output with evidence anchoring
- OpenAI GPT-4o (vision + structured output)
- Tesseract + custom CTME field parser (fully offline)

### Rationale

- The fixture provider allows the complete HITL review workflow to function without OCR infrastructure
- The real contract data makes the review experience authentic
- The protocol boundary makes provider swap a surgical change

### What Must NOT Change

- `extraction_method = "fixture"` on all fields produced by this provider
- The provider label `"FixtureExtractionProvider"` on `ExtractionRun.provider`
- The user-facing label must never claim this is real OCR

### Swap Checklist (for production)

- [ ] Implement `ExtractionService.extract(document)` against a live provider
- [ ] Return `ExtractionResult` with `evidence_text`, `source_page`, `confidence` from real parsing
- [ ] Set `extraction_method = "deterministic"` or `"llm"` as appropriate
- [ ] Handle `extraction_method = "human_corrected"` when broker edits a field
- [ ] Update `model_name` and `schema_version` to reflect the live provider
- [ ] Update `ExtractionRun.provider` to the live provider class name
- [ ] Add error handling: `ExtractionStatus.failed` path with `error_message`
- [ ] Add async job polling: real extraction may take 10–60 seconds

---

## ADR-003: Human Approval Gate Before Transaction Workspace

**Date:** 2026-05-30  
**Status:** Active — required behavior

### Context

The business plan explicitly states that every AI-extracted field must be broker-reviewed
before becoming part of the official transaction record. The review must:
- Show the extracted value and source evidence
- Allow approve, edit, reject, and N/A actions
- Create audit events for each action
- Not promote unapproved fields to the active workspace

### Decision

**Extracted fields are written to `extracted_fields` with `review_status = pending` immediately
after extraction. The transaction is created in `status = in_review`. The active workspace
(deadlines, tasks, contacts, documents) is populated immediately but the broker must
complete the review before treating the workspace as production-ready.**

The confirm endpoint (`POST /api/extractions/{job_id}/confirm`) transitions the transaction
from staging to active. Before confirm, the transaction's `status = in_review` signals
that the workspace is not yet broker-approved.

### Rationale

- Source: Business Plan §4 — "broker reviews and approves before anything becomes official"
- Allows the full workspace to be visible during review (so the broker can see what they're approving)
- Creates a clear transition point for the audit trail

### Trade-offs

The current implementation writes extracted fields AND creates the transaction at upload time.
A stricter implementation would defer transaction creation until after full approval.
The current approach is acceptable for an MVP but should be documented as a design choice.

### Future Option

Split `materialize_extraction` into:
1. `extract_fields(run, doc)` — creates ExtractedFields only, no transaction
2. `confirm_extraction(run, approved_fields)` — creates Transaction from approved fields

This would enforce "no workspace until approved" strictly. Deferred pending Brett confirmation
on desired UX (can broker preview workspace before approving?).

---

## ADR-004: Color Semantics — Gold vs. Blue for AI Evidence

**Date:** 2026-05-30  
**Status:** Active

### Context

Two accent colors compete for "importance" in the Altitude UI: refined gold (`#D6A84F`)
and info blue (`#2563EB`). Both could be used for highlighting AI content or premium actions.

### Decision

**Gold = premium CTA, milestone, selected state, brand accent.**  
**Blue = AI extraction evidence, confidence scores, source-backed review metadata.**

This distinction is critical because:
- Gold creates a trust signal for actions Brett initiates (upload, confirm, approve)
- Blue creates a trust signal for AI-provided information (extracted values, evidence text, confidence)
- Mixing them destroys the semantic layer that helps the broker trust the system

### Rules

| Color | Use | Do Not Use For |
|---|---|---|
| Gold `#D6A84F` | CTAs, selected nav items, milestones, brand accent | AI confidence, evidence text |
| Blue `#2563EB` | AI extraction badges, evidence panels, confidence | CTAs, nav, milestones |
| Amber `#B7791F` | Deadline risk, overdue, due-soon | Completed items |
| Green `#2E7D5B` | Completed tasks, approved fields, closed deals | Risk indicators |
| Red `#B42318` | Overdue, critical errors, rejected fields | Warnings |
| Gray `#64748B` | N/A, archived, disabled, not-relevant | Active/important content |

---

## ADR-005: N/A Fields Excluded from Active Summaries

**Date:** 2026-05-30  
**Status:** Active

### Context

The CTME contract has many fields that are legitimately not applicable for a given
transaction (e.g., Lead-Based Paint Disclosure for a new home, Water Rights for an
urban property, Conditional Sale for a cash buyer). These appear as "N/A" in the
contract. If included in operational summaries, they create noise and reduce broker trust.

### Decision

**Fields, deadlines, and tasks with `population_status = not_applicable` or
`applicability = not_applicable` or `status = not_applicable` MUST be excluded
from:**
- Daily/weekly operational summaries
- Dashboard metric counts
- Task completion progress calculations
- Client-facing reports

**They MUST be preserved in:**
- The full audit trail
- The extraction review table (so the broker can confirm N/A)
- The full data export

### Source

- Click-to-Complete Chart: explicit N/A status column with "excluded from active workflow" guidance
- Business Plan §4: operational summaries should show active items only

---

## ADR-006: Deadlines as Rows, Not Transaction Columns

**Date:** 2026-05-30  
**Status:** Active

### Context

The CTME "Dates and Deadlines" section contains 31 itemized deadline rows, each with:
an item number, section reference, event name, date, time, and applicability (active/N/A/COMPLETED).
These deadlines can be amended, added, completed, or marked N/A by addendum.

### Decision

**Deadlines are stored as rows in the `deadline` table, not as columns on the `transaction` table.**

Each deadline row preserves:
- `item_number` — CTME item number (§29)
- `section_reference` — Contract section (e.g., §10.2)
- `event_name` — Human-readable deadline label
- `due_date` and `due_time`
- `raw_value` — Original text from the contract
- `applicability` — active / not_applicable / completed
- `confidence` — Extraction confidence
- `responsible_party` — Who must act by this deadline
- `calendar_ready` — Whether the deadline has a parseable date for calendar export
- `source_page` and `source_section` — Evidence anchoring

### Rationale

Row storage allows:
- Amendments to add/delete/modify individual deadlines
- N/A deadlines to be preserved without contaminating the active list
- Deadline-to-task linking (each deadline generates a corresponding task)
- Full audit trail per deadline
