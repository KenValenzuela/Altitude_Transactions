# Altitude Transactions — MVP 1 Implementation Plan

**Date:** 2026-06-11
**Scope:** MVP 1 "Document-to-Workflow Engine" — transaction-first document intake,
classification, structured AI extraction with evidence, human review, canonical state,
deterministic deadlines/tasks, audit trail, dashboard.

---

## 1. Repo assessment (Phase 0 audit)

### Backend (`backend/`)
| Area | State | Verdict |
|---|---|---|
| Framework | FastAPI + SQLModel + SQLite, `create_all` only | Keep stack; add Alembic + Postgres |
| Auth | Fully stubbed — `get_current_user` returns the first user; several routes have **no auth at all** (`/transactions/{id}/deadlines`, `/tasks`, `/contacts`, `/audit`, `/documents`) | Replace with JWT + RBAC + org scoping |
| Extraction | `FixtureExtractionProvider` replays one hardcoded CBS contract on **every** upload, regardless of file. Upload **creates** a transaction from fixture data (upload-first flow) | Replace with transaction-first flow + provider interface (mock + Anthropic) |
| Review | Review state mutated inline on `ExtractedField`; no separate decision records; approved values never reach the transaction record | Split into immutable `extracted_fields` → append-only `review_decisions` → `canonical_fields` |
| Deadlines | Written directly at extraction time (before review) — violates "rules calculate on approved data only" | Move behind approval + deterministic apply engine |
| Checklist | `DocumentRequirement` rows hardcoded in the fixture; states don't match required workflow (`Needed/N-A/Uploaded/In Review/Needs Correction/Approved/Rejected/Overdue`); `POST /transactions/{id}/documents` marks the *first missing* row received regardless of file | Rebuild with org-level templates + per-transaction items + correct state machine |
| Amendments | No diff/proposal mechanism | Add `deadline_change_proposals` |
| Audit | `audit_events` table exists and is used — good bones | Keep concept, extend coverage |
| Dead code | `document_service.py` (imports non-existent models), `deadline_service.py`, `task_service.py` never imported | Delete |
| Tests | 19 passing tests around the fixture flow | Replace with tests for the new engine |

### Frontend (`apps/web/`)
- Two route trees: `/app/*` (live shell, **entirely fixture-driven** via `product-data.ts`) and legacy top-level routes (`/upload`, `/review/[id]` are the only pages calling the real API).
- `ProductComponents.tsx` is a 1000+ line monolith powering all `/app/*` pages.
- Token in `localStorage`, **no route guards**, no logout, no session validation.
- Tailwind configured but unused — styling is a CSS-custom-property design system in `globals.css` (navy/brass/paper tokens, 4px spacing scale). That token system is good; keep it.
- Dead code: `components/landing/*`, `components/brand/*`, `components/tweaks/*`, `TransactionGate.tsx`, `packages/shared` (zero imports), `lib/navigation.ts`.
- TypeScript strict mode on, but type-checking effectively enforced only via `npm run build`.

### Mobile (`apps/mobile/`)
Expo scaffold, not wired to anything. **Out of MVP scope — untouched.**

---

## 2. Target architecture

```
Next.js (apps/web)  ──HTTP/JSON (camelCase, Bearer JWT)──►  FastAPI (backend)
                                                            │
        ┌───────────────────────────────────────────────────┤
        │ api/routes      thin controllers, RBAC deps        │
        │ services        workflow engine (pure logic)       │
        │   extraction/   provider interface: Mock | Anthropic (claude-opus-4-8)
        │   apply_engine  approved fields → canonical state  │
        │   deadline_engine  deterministic deadline/task rules
        │ models          SQLModel tables (Postgres/SQLite)  │
        │ storage         local disk | S3-compatible         │
        └────────────────────────────────────────────────────┘
```

**Core invariant** (the trust model): raw uploaded file → `extraction_jobs`/`extracted_fields`
(immutable AI output + evidence) → `review_decisions` (append-only human decisions) →
`canonical_fields` + structured state (transactions, deadlines, contacts) written **only**
by the deterministic apply engine, **only** from approved/edited fields. Amend/Extend and
Counterproposal date changes never write directly — they create `deadline_change_proposals`
that require a second explicit approval. Every step writes `audit_log`.

## 3. Data model (18 tables)

| Table | Purpose / key fields |
|---|---|
| `users` | id, email (unique), name, hashed_password, is_active |
| `organizations` | id, name |
| `organization_members` | org_id, user_id, role ∈ {admin, agent, tc} |
| `transactions` | org_id, address/city/state/zip/county, mls_number, side ∈ {buyer, seller}, financing_type ∈ {cash, fha, va, conventional, investment, other}, contract/closing/possession dates, possession_time, purchase_price, earnest_money, status ∈ {active, pending_review, approved, archived}, legal_description |
| `contact_roles` | org-scoped contact types (admin-managed; `is_core` rows undeletable) |
| `transaction_contacts` | role, name/company/email/phone/license, source ∈ {manual, extraction} |
| `document_type_templates` | org-scoped checklist template: name, section, sort, required, is_core, conditional |
| `document_checklist_items` | per-transaction rows instantiated from template + custom rows; status ∈ {needed, not_applicable, uploaded, in_review, needs_correction, approved, rejected}; `overdue` is **derived** at read time |
| `uploaded_files` | org/transaction/checklist-item scoped, sha256, storage_key, `version` (per item → covers document versioning) |
| `extraction_jobs` | file_id, status ∈ {pending, classifying, extracting, needs_review, completed, failed}, document_type, classification_confidence, provider/model/schema_version, error |
| `extracted_fields` | **immutable** AI output: field_key, label, value, normalized_value, value_type, group, confidence, source_page, source_text |
| `review_decisions` | **append-only**: field_id, decision ∈ {approved, edited, rejected, marked_na}, original/corrected value, reason, reviewer, timestamp |
| `canonical_fields` | unique(transaction, field_key): approved value + provenance (source field/file, approver, time) |
| `deadlines` | deadline_key (normalized), name, due_date/time, section_reference, applicability ∈ {active, not_applicable, completed}; upcoming/overdue derived |
| `deadline_change_proposals` | amendment diff rows: deadline_key, old→new date, status ∈ {pending, approved, rejected}, decided_by |
| `tasks` | title, status ∈ {open, done, not_applicable}, due_date, linked_deadline_id, source |
| `audit_log` | org/transaction, actor, event_type, entity, old/new value, source_file_id, metadata JSON |
| `ai_model_runs` | per LLM call: provider, model, kind ∈ {classify, extract}, tokens, latency, success |

Migrations: Alembic (initial autogenerated revision). Dev/tests use `create_all`
(SQLite); Postgres via `DATABASE_URL` + docker-compose.

## 4. API routes (all under `/api`, camelCase JSON, Bearer JWT)

- `POST /auth/login`, `GET /auth/me`
- `GET|POST /transactions`, `GET /transactions/{id}`, `POST /transactions/{id}/archive|unarchive`
- `GET /transactions/{id}/checklist`, `POST /transactions/{id}/checklist` (admin custom row),
  `PATCH /checklist-items/{id}` (mark N/A / needed), `DELETE /checklist-items/{id}` (admin, custom only)
- `POST /checklist-items/{id}/upload` → stores file, sets `uploaded`, queues extraction job (rate-limited)
- `GET /files/recent`, `GET /files/{id}/download` (auth + org-scoped; no public URLs)
- `GET /extraction-jobs/{id}`, `POST /extraction-jobs/{id}/retry`
- `GET /transactions/{id}/review` (queue: jobs + fields + latest decisions)
- `POST /extracted-fields/{id}/decision` {decision, correctedValue?, reason?}
- `POST /extraction-jobs/{id}/approve` (apply engine → canonical + proposals; checklist → approved)
- `POST /extraction-jobs/{id}/reject` (checklist → needs_correction)
- `GET /transactions/{id}/deadline-proposals`, `POST /deadline-proposals/{id}/approve|reject`
- `GET /transactions/{id}/deadlines|tasks|contacts|audit`, `PATCH /tasks/{id}`, `POST|PATCH|DELETE /transactions/{id}/contacts...`
- `GET /dashboard` (counts, review queue, upcoming/overdue deadlines, recent files, recent audit)
- Admin: `GET|POST|PATCH|DELETE /admin/templates`, `GET|POST|DELETE /admin/contact-roles`
- `GET /health`

## 5. Frontend plan (`apps/web`)

Keep the `/app/*` tree + CSS-token design system; replace fixture plumbing with a new
typed API client. Pages: `/login` (real auth, cookie+localStorage token, middleware guard
for `/app/*`), `/app/today` (dashboard), `/app/transactions` (+ `/archived`, `/new`),
`/app/transactions/[id]` (workspace: header, status, checklist grouped by section with
Upload / Mark N/A / Review / Approve / History per row), `/app/transactions/[id]/review/[jobId]`
(field cards: value, confidence, page + snippet evidence, approve/edit/reject; document
approve; amendment diff panel), plus deadlines/contacts/audit tabs, `/app/settings`
(checklist templates + contact types, admin-only). Delete dead code (landing/brand/tweaks
components, product-data fixtures, legacy routes).

## 6. AI extraction pipeline

1. Upload (PDF, ≤25MB) → `extraction_jobs(pending)` → FastAPI background task.
2. **Classify** → document_type + confidence (structured output, enum-constrained).
3. **Extract** → per-document-type Pydantic schema (CBS, Amend/Extend, EM Receipt,
   Inspection Objection/Resolution, HOA Status Letter, generic fallback). Every scalar is an
   `ExtractedValue {value, page, sourceText, confidence}` → flattened to `extracted_fields`.
4. Providers behind one interface: `MockExtractionProvider` (deterministic fixtures, default
   when no API key; powers tests) and `AnthropicExtractionProvider` — official `anthropic`
   SDK, model `claude-opus-4-8` (configurable via `ANTHROPIC_MODEL`), PDF passed as a base64
   `document` content block, structured outputs via `client.messages.parse()` with the
   Pydantic schema, adaptive thinking. Token usage logged to `ai_model_runs`.
5. Failure → job `failed` + audit event + checklist item stays `uploaded` with retry — never a broken workflow.
6. LLM never computes deadline arithmetic or writes state. The deadline engine owns a
   canonical registry of CBS §3 deadline names/keys; amendment values are diffed against
   existing approved deadlines into proposals.

## 7. Security / RBAC

- JWT (HS256, `SECRET_KEY` env) + bcrypt password hashes; seeded admin (Brett) + agent.
- Roles: **admin** (everything incl. templates, contact roles, custom row delete, archive),
  **agent** (view/create transactions, upload, mark N/A, review if permitted — MVP: yes for
  own org, cannot delete core rows/templates), **tc** (modeled in enum, treated as admin-lite
  reviewer later).
- Org scoping on every query; file downloads authorized per org + transaction; no public file URLs.
- Simple in-memory rate limit on extraction-triggering endpoints; input validation via Pydantic;
  document text not logged.
- Future hardening documented (encryption at rest, malware scan, tenant isolation review…).

## 8. Phases & commits

1. **Phase 1** Data foundation: models, security, Alembic, seed (org, users, Colorado checklist template, contact roles).
2. **Phase 2** Upload + checklist workflow: transactions, checklist, files, audit, dashboard skeleton.
3. **Phase 3** AI extraction: schemas, providers (mock + Anthropic), pipeline, jobs.
4. **Phase 4** Human review: decisions, document approve/reject, apply engine, amendment proposals.
5. **Phase 5** Deadline engine: registry, diffs, tasks, dashboard widgets.
6. **Phase 6** Frontend: auth, dashboard, transactions, workspace, review, settings; dead-code removal; responsive polish.
7. **Phase 7** Tests + fixtures + evals; docker-compose + README.

## 9. Risks & tradeoffs

- **Background tasks** use FastAPI `BackgroundTasks` (in-process) instead of a queue — right-sized
  for MVP; the pipeline is a pure function so a Celery/RQ swap later is mechanical.
- **Confidence scores** are model-self-reported — treated as triage hints, never gates.
- **Bounding boxes** deferred; evidence = page number + source text snippet (per spec fallback).
- **Money as integer dollars** (matches existing data); HOA cents live in canonical string values.
- **Transaction "type"** split into `side` + `financing_type` (the spec's single list mixes both).
- **S3** implemented behind a storage interface with local-disk default; S3 backend requires
  `boto3` (optional extra) and is exercised manually, not in CI.
- **Mobile app** untouched this MVP.

## 10. Assumptions (made instead of blocking questions)

- Single seeded organization; Brett = admin (credentials via env, dev defaults logged).
- "Approved" transaction status = all required checklist items approved/N-A; recomputed on events; `archived` is manual and sticky.
- `Overdue` (checklist + deadlines) is derived from dates at read time, not stored.
- Agents may review/approve documents in MVP (per "review assigned items if permitted"); only admins manage templates/custom rows/contact types.
- Counterproposal date changes reuse the amendment proposal mechanism (same safety property).
