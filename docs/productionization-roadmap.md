# Productionization Roadmap

**Project:** Altitude Transactions  
**Date:** 2026-05-30  
**Status:** MVP Foundation — Phase 1 complete, Phase 2 engineering-ready

This document is honest about what is production-ready, what is scaffolded,
and what is mocked. It does not claim production readiness where it does not exist.

---

## Current Production Readiness Assessment

### Backend

| Component | Status | Notes |
|---|---|---|
| Domain models (SQLModel) | Production-ready | All 10 entities with correct schema |
| API routes | Production-ready | Thin controllers, correct HTTP verbs |
| Transaction service | Production-ready | Correct business logic layer |
| Human-in-the-loop review | Production-ready | approve/edit/reject/na with audit events |
| Audit trail | Production-ready | Immutable events, before/after values |
| File upload | Production-ready (local) | Needs cloud storage for deploy |
| Authentication | Scaffolded | No real auth — seed user only |
| Extraction pipeline | **Sandbox — FixtureExtractionProvider** | Not real OCR/LLM |
| Async job processing | Not implemented | Synchronous only |
| Database migrations | Not implemented | SQLite create_all only |
| Error handling | Partial | Missing required field validation on some routes |
| File size limits | Not enforced | Should add 25MB limit for PDFs |
| Rate limiting | Not implemented | |
| Secrets management | .env.example only | No secrets in code |

### Frontend

| Component | Status | Notes |
|---|---|---|
| App shell + routing | Production-ready | Next.js 15 App Router |
| Design system | Production-ready | CSS variables, full token set |
| Dashboard | Production-ready | Metrics, transaction cards, deadline alert |
| Upload flow | Production-ready | PDF upload with drag-and-drop |
| Extraction polling | Production-ready | Polls until complete |
| Extraction review | Production-ready | Field-by-field approve/edit/reject |
| Transaction workspace | Production-ready | All tabs: deadlines/tasks/contacts/docs/audit |
| Mobile navigation | Production-ready | Responsive, accessible |
| Authentication | Scaffolded | Auto-session, no real auth gate |
| Error boundaries | Partial | ErrorState component exists, not wired everywhere |
| Offline support | Not implemented | |
| Push notifications | Not implemented | |

### Mobile (React Native / Expo)

| Component | Status | Notes |
|---|---|---|
| App scaffold | Scaffolded | Expo Router structure only |
| Transaction screens | Not implemented | Screen components exist in web app |
| Authentication | Not implemented | |
| API integration | Not implemented | |

---

## Phase 1 — Complete (Current State)

- [x] Domain model with all 10 entities
- [x] Full CTME extraction fixture (real Colorado CBS contract data)
- [x] Human-in-the-loop review workflow
- [x] Audit trail
- [x] Dashboard with metrics, transaction cards, deadline alerts
- [x] Upload → extract → review → confirm flow
- [x] Transaction workspace: deadlines, tasks, contacts, documents, audit, post-close
- [x] Design system: midnight navy + gold + info blue
- [x] Responsive layout with mobile nav
- [x] Accessible: focus states, ARIA labels, skip link, `prefers-reduced-motion`
- [x] All 11 backend tests passing
- [x] Frontend build passing

---

## Phase 2 — Engineering-Ready (Next Sprint)

These items have clear implementation paths and no unsolved design questions.

### Backend

- [ ] **Real authentication** — JWT with bcrypt. Remove seed-user bypass. Add `/auth/login` + `/auth/logout`.
- [ ] **Cloud storage** — Replace `settings.upload_dir` with S3/GCS StorageAdapter. Swap is surgical via the adapter pattern.
- [ ] **File size validation** — Add 25MB limit on PDF upload. Return 413 on exceed.
- [ ] **Database migrations** — Add Alembic. The current `create_all` approach is not safe for schema updates.
- [ ] **ExtractionRun.status progression** — Add queued → uploading → parsing_pdf → extracting_fields → needs_review transitions for async readiness.
- [ ] **Transaction readiness score** — Compute from: fields approved, tasks complete, contacts populated, docs received. Expose as `/api/transactions/{id}/readiness`.
- [ ] **N/A exclusion in summaries** — Add `exclude_na=true` query param to `/tasks`, `/deadlines`, `/documents` endpoints.
- [ ] **Contact completeness tracking** — Update `Contact.complete` when fields are populated via PATCH.

### Frontend

- [ ] **Real auth gate** — Login page currently bypasses auth. Wire to real JWT.
- [ ] **Field confidence display** — Show confidence percentage and risk level badge in review table.
- [ ] **Evidence panel** — Show `evidence_text` and `source_page` per field in the review UI.
- [ ] **Rejection reason input** — Add text input when broker rejects a field.
- [ ] **N/A indicator on deadline list** — Show N/A deadlines in a collapsed section.
- [ ] **Transaction readiness score** — Display as a dashboard metric.
- [ ] **Review decision progress** — Show "X of Y fields reviewed" progress in the review page header.

---

## Phase 3 — Production Deployment

### Infrastructure

- [ ] PostgreSQL migration from SQLite (Alembic migrations, connection pooling)
- [ ] Cloud storage (S3 or GCS) with presigned URLs
- [ ] Containerization (Dockerfile + docker-compose for local, K8s/ECS for prod)
- [ ] Environment management (prod/staging/dev configs)
- [ ] Secrets management (AWS Secrets Manager / Doppler / .env.production)
- [ ] CDN for frontend (Vercel, Cloudflare, or S3+CloudFront)
- [ ] Domain + TLS
- [ ] Health checks + monitoring (Sentry, Datadog, or CloudWatch)
- [ ] Backup strategy for database

### Security

- [ ] Rate limiting on upload and auth endpoints
- [ ] Input validation hardening (file type magic bytes check, not just Content-Type)
- [ ] Audit log tamper protection
- [ ] PII handling review (buyer/seller names are redacted in fixture; live data will have real names)
- [ ] CORS lockdown to production domain only

---

## Phase 4 — Live Extraction

**Prerequisite:** Brett confirms production launch path (see ADR-001).

- [ ] Choose extraction provider (AWS Textract / Azure / Claude API — see ADR-002)
- [ ] Implement `ExtractionService.extract()` against chosen provider
- [ ] Add async job queue (Celery + Redis, or AWS SQS, or a simple FastAPI BackgroundTask for small scale)
- [ ] Add SSE or WebSocket endpoint for real-time extraction progress
- [ ] Update `ExtractionRun.provider`, `model_name`, `schema_version` to reflect live provider
- [ ] Add extraction accuracy monitoring (compare extracted vs. broker-approved values)
- [ ] Add confidence calibration (are 0.9 confidence fields actually 90% accurate after review?)

---

## Phase 5 — Advanced Features

**Source:** Business Plan advanced features section + Premium Features document

- [ ] Calendar integration (Google Calendar / iCal export for deadlines)
- [ ] Email notifications (deadline reminders, task due dates)
- [ ] Agent portal (read-only client-facing workspace link)
- [ ] Daily summary email (grouped by transaction, active deadlines, completed tasks)
- [ ] Multi-transaction dashboard (multiple active files at once)
- [ ] Amendment processing (detect and merge deadline changes from addenda)
- [ ] Mobile app (React Native / Expo — scaffold exists)
- [ ] Analytics dashboard (extraction accuracy, review time, deal velocity)

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Real auth not implemented | High | Phase 2 — JWT auth is standard |
| Extraction is mocked | High | Clearly labeled; Phase 4 plan is explicit |
| SQLite not production-grade | Medium | Alembic + PostgreSQL in Phase 3 |
| File storage is local | Medium | StorageAdapter swap in Phase 3 |
| No rate limiting | Medium | Standard FastAPI middleware in Phase 3 |
| PII in uploaded contracts | High | Cloud storage with access control in Phase 3 |
| No backup strategy | High | Phase 3 |
| Buyer/seller names redacted in fixture | Low | By design; live extraction will have real data |

---

## Source References

- Business Plan: §3 (workflow), §4 (AI constraints), §5 (features)
- Premium Features doc: operational infrastructure requirements
- Click-to-Complete Chart: task/checklist structure
- Contact Information Chart: contact roles
- Colorado Document Checklist: document requirements
- Thank You Card Tracking Chart: post-close workflow
