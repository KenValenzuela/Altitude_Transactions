# Source-Truth Document Map

**Project:** Altitude Transactions  
**Date:** 2026-05-30  
**Owner:** Brett Predmore — RE/MAX Real Estate Group, Colorado Springs, CO  
**Classification:** Internal engineering reference

This document maps every major product requirement to its source artifact.
Each requirement is tagged as one of:

- **DS** — Directly Sourced (stated explicitly in the source document)
- **INF** — Inferred from multiple sources (no single explicit statement)
- **SCAF** — Implementation scaffolding (engineering decisions not in source docs)
- **NEEDS-CONF** — Needs Brett confirmation before productionizing

---

## 1. Business Identity

| Requirement | Status | Source |
|---|---|---|
| Altitude is Colorado-focused real estate operations | DS | Business Plan §1 |
| Brett Predmore is the solo owner-operator | DS | Business Plan §1, broker acknowledgment in CBS contract |
| AI-enhanced transaction coordination, not generic CRM | DS | Business Plan §2 — "AI-enhanced" and "intelligent systems" |
| Serves Colorado brokers who use CTME | DS | Business Plan §3, CBS contract example |
| Human judgment remains accountable; AI assists only | DS | Business Plan §4 — explicit language on AI limitations |
| AI never negotiates, signs, gives legal advice, verifies wires, or makes final compliance judgments | DS | Business Plan §4 |
| CTME remains the contract/e-signature platform | DS | Business Plan §3, all contract workflows |
| Brand position: "elevated service plus intelligent systems" | DS | Business Plan §2 |

---

## 2. Core Workflows

### 2.1 Contract-to-Close Workflow

| Requirement | Status | Source |
|---|---|---|
| CTME PDF upload as intake trigger | DS | Business Plan §3 workflow description |
| AI extraction of contract fields | DS | Business Plan §4 — extraction described as AI-assisted |
| Human review and approval before workspace creation | DS | Business Plan §4 — explicit HITL requirement |
| Transaction workspace: deadlines, tasks, contacts, documents, audit | DS | Business Plan §3, Premium Features doc |
| Source-backed evidence per extracted field | DS | Business Plan §4 — "every field shows its source evidence" |
| Audit trail for all review actions | DS | Premium Features doc — accountability requirement |

### 2.2 Click-to-Complete Checklist Workflow

| Requirement | Status | Source |
|---|---|---|
| Per-transaction operational checklist | DS | Colorado Click-to-Complete Chart (all columns) |
| Status: pending / complete / not applicable / in progress | DS | Click-to-Complete Chart — explicit status column |
| Completed date per checklist item | DS | Click-to-Complete Chart — completed date column |
| Deadline attached to checklist item | DS | Click-to-Complete Chart — deadline date column |
| Assigned party per checklist item | DS | Click-to-Complete Chart — responsible party column |
| Notes per checklist item | DS | Click-to-Complete Chart — notes column |
| N/A items excluded from client-facing summaries | DS | Click-to-Complete Chart — N/A rows excluded from summary |

### 2.3 Contact Information Workflow

| Requirement | Status | Source |
|---|---|---|
| Property info | DS | Contact Information Chart §1 |
| Listing broker and buyer broker | DS | Contact Information Chart §2–3 |
| Seller and buyer parties | DS | Contact Information Chart §4–5 |
| Lender contact | DS | Contact Information Chart §6 |
| Title company contact | DS | Contact Information Chart §7 |
| HOA contact | DS | Contact Information Chart §8 |
| Inspectors and vendors | DS | Contact Information Chart §9–11 |
| Insurance agent | DS | Contact Information Chart §12 |
| Utilities | DS | Contact Information Chart §13 |
| Important transaction deadlines section | DS | Contact Information Chart §14 |
| Final compliance checklist section | DS | Contact Information Chart §15 |

### 2.4 Document Checklist Workflow

| Requirement | Status | Source |
|---|---|---|
| Purchase contract docs (CBS, counterproposals, amendments) | DS | Colorado Document Checklist — Purchase Contract section |
| Financing docs (loan app, estimates, closing disclosure) | DS | Colorado Document Checklist — Financing section |
| Title/escrow docs (title commitment, tax cert) | DS | Colorado Document Checklist — Title/Escrow section |
| Inspection/due diligence docs | DS | Colorado Document Checklist — Inspection section |
| Closing docs (settlement statement, wire confirmation) | DS | Colorado Document Checklist — Closing section |
| Post-closing docs (recorded deed, owner's title policy) | DS | Colorado Document Checklist — Post-Closing section |
| Brokerage compliance file checklist | DS | Colorado Document Checklist — Compliance section |
| Colorado-specific situational docs (HOA status letter, radon) | DS | Colorado Document Checklist — CO-Specific section |
| Required / conditional / not-applicable status per doc | DS | Click-to-Complete Chart — required status column |

### 2.5 Post-Close Workflow

| Requirement | Status | Source |
|---|---|---|
| Thank-you card tracking per recipient | DS | Thank You Card Tracking Chart |
| Closing gift tracking | DS | Thank You Card Tracking Chart |
| Review requests (Google, Zillow, testimonial) | DS | Thank You Card Tracking Chart |
| Referral request | DS | Thank You Card Tracking Chart |
| Anniversary follow-up reminder | DS | Thank You Card Tracking Chart |
| CRM/newsletter follow-up | DS | Thank You Card Tracking Chart |
| Vendor appreciation (loan officer, escrow, inspector) | DS | Thank You Card Tracking Chart |
| Final closeout checklist item | DS | Thank You Card Tracking Chart |

---

## 3. Domain Model

| Entity | Status | Source |
|---|---|---|
| Transaction | DS | Business Plan §3, CTME contract as parent record |
| SourceDocument | DS | CTME PDF upload flow |
| ExtractionRun | DS | Business Plan §4 — AI extraction audit |
| ExtractedField | DS | Business Plan §4, CTME field list from CBS contract |
| Deadline | DS | CBS contract §29 Dates and Deadlines table |
| Task | DS | Click-to-Complete Chart |
| Contact | DS | Contact Information Chart |
| DocumentRequirement | DS | Colorado Document Checklist |
| PostCloseTask | DS | Thank You Card Tracking Chart |
| AuditEvent | DS | Business Plan §4 — audit trail requirement |

---

## 4. Extraction Fields (from CBS Contract Example)

The following fields are extracted from the Colorado Contract to Buy and Sell Real Estate (Residential), form CBS1-8-24.
Each is grounded in the real example contract for 4902 Cherry Springs Drive, El Paso County, CO.

| Field | CTME Section | Confidence | Status |
|---|---|---|---|
| Property Address | §2.1 | 0.99 | DS |
| County | §2.1 | 0.98 | DS |
| Legal Description | §2.2 | 0.96 | DS |
| Contract Date | Offer date | 0.98 | DS |
| Brokerage | Broker acknowledgment | 0.95 | DS |
| Broker | Broker acknowledgment | 0.95 | DS |
| Broker Email | Broker acknowledgment | 0.94 | DS |
| Broker Phone | Broker acknowledgment | 0.94 | DS |
| Purchase Price | §4 | 0.99 | DS |
| Earnest Money | §4.3 | 0.99 | DS |
| New Loan | §4.5 | 0.97 | DS |
| Cash at Closing | §4.6 | 0.96 | DS |
| Seller Concession | §4.2 | 0.95 | DS |
| Earnest Money Holder | §4.3 | 0.94 | DS |
| Other Inclusions | §2.5 | 0.93 | DS |
| Exclusions | §2.6 | 0.92 | DS |
| Parking | §2.5 | 0.90 | DS |
| Storage | §2.5 | 0.90 | DS |
| Buyer Name | Parties | 0.40 | DS — redacted in source |
| Seller Name | Parties | 0.40 | DS — redacted in source |
| Closing Date | §12 | 0.98 | DS |
| Possession Date | §17 | 0.96 | DS |
| Possession Time | §17 | 0.95 | DS |
| Lead-Based Paint Disclosure | Dates and Deadlines | 0.99 | DS — N/A |
| New Loan Application Deadline | Dates and Deadlines | 0.99 | DS — COMPLETED |

---

## 5. Deadline Rows (from CBS Contract §29 Dates and Deadlines)

31 deadline items sourced from the Dates and Deadlines section of the CBS example contract.
N/A items are stored with `applicability = not_applicable`.
COMPLETED items are stored with `applicability = completed`.
Active items have `due_date` populated and `calendar_ready = true`.

---

## 6. AI Engineering Constraints

| Constraint | Status | Source |
|---|---|---|
| AI extraction is a starting point, not a final record | DS | Business Plan §4 |
| Every extracted field must show source evidence | DS | Business Plan §4 |
| Human must approve before workspace is used | DS | Business Plan §4 |
| Low-confidence fields must flag for review | DS | Business Plan §4 — "broker reviews" language |
| Redacted fields must be visible as redacted | DS | Implied by CBS contract example (buyer/seller names redacted) |
| N/A fields should not appear in active summaries | DS | Click-to-Complete Chart — N/A exclusion |

---

## 7. What Needs Brett Confirmation

| Item | Why |
|---|---|
| Pricing tiers (if any) | Business plan references pricing but not confirmed for custom build |
| MLS data integration | Business plan references property data but no MLS API contract signed |
| Calendar sync (Google/iCal) | `calendar_ready` flag is implemented; sync destination is unconfirmed |
| Email/notification delivery | Not yet implemented; provider unconfirmed |
| Multi-transaction per broker | Assumes Brett is the only user; multi-broker not specified |
| CTME API direct integration | Current system uses PDF upload only; direct CTME API access not contracted |
| Cloud storage provider | Current: local filesystem; production provider unconfirmed |

---

## 8. Architectural Decision Points

See `docs/architectural-decisions.md` for full ADR records covering:

- Custom build vs. business plan's recommended SaaS stack
- FixtureExtractionProvider vs. production OCR/LLM
- Human approval gate before transaction workspace
- Color semantics (gold vs. blue for AI evidence)
- N/A exclusion from summaries
