# Altitude — Contract-to-Close for Colorado Brokers

Altitude is an AI-assisted transaction coordinator for Colorado residential real
estate brokers. A broker uploads a signed CTM "Contract to Buy and Sell"
(CBS) PDF; the system extracts the parties, price terms, and the ~43 statutory
deadlines; the broker confirms the extraction; Altitude then builds a deadline
timeline and task checklist and tracks the transaction from under-contract to
keys.

This repository is a clean **Next.js + FastAPI** monorepo migrated from an
earlier single-page design prototype. (The original prototype is preserved — see
[Prototype & history](#prototype--history).)

```
altitude/
├── apps/
│   ├── web/           Next.js 15 App Router · React · TypeScript (mobile-first)
│   └── mobile/        Expo React Native · TypeScript
├── backend/           FastAPI · SQLModel · SQLite (Postgres-compatible)
├── packages/
│   └── shared/        Shared types · theme · domain constants
└── docs/              Architecture, API contracts, design system docs
```

## The core workflow

```
Login → Dashboard → Upload PDF → AI Extraction → Review & Confirm
      → Transaction Workspace (Overview · Checklist · Deadlines · Parties · Documents)
      → Weekly Summary → Post-close
```

Each step maps to a real route and a real API call. The journey is:

1. **Upload** a contract PDF → `POST /api/documents/upload` (file is stored, an
   extraction job is created).
2. **Extraction** runs as a job → `GET /api/documents/{id}/extraction` (polled).
3. **Review** the extracted fields, deadlines, and conditional flags, then
   confirm → `POST /api/extractions/{jobId}/confirm` builds the transaction
   (human-in-the-loop: nothing is committed until the broker confirms).
4. **Workspace** screens read `GET /api/transactions/{id}` and mutate task /
   document state via `PATCH /api/tasks/{id}` and `PATCH /api/documents/{id}`.

## Running locally

You need two terminals. **Start the backend first** (the frontend calls it).

### Backend — FastAPI (port 8000)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

- API root: `http://localhost:8000/api`
- Interactive docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health`
- On first start the DB is seeded with a demo broker and one fully-built demo
  transaction (the Cherry Springs contract), so the dashboard is non-empty.

### Web — Next.js (port 3000)

```bash
cd apps/web
npm install
npm run dev
```

Or from the root: `npm run dev:web`

### Mobile — Expo React Native

```bash
cd apps/mobile
npm install
npm run start
```

Or from the root: `npm run mobile`

Open `http://localhost:3000` → you land on `/dashboard`. If you use `/login`, click **Continue** to establish a stubbed session and reach the dashboard.

## Environment variables

| Where    | Variable                   | Default                     | Purpose                           |
|----------|----------------------------|-----------------------------|-----------------------------------|
| apps/web | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | Backend base URL                  |
| backend  | `DATABASE_URL`             | `sqlite:///./altitude.db`   | DB connection (swap for Postgres) |
| backend  | `FRONTEND_ORIGIN`          | `http://localhost:3000`     | CORS allow-origin                 |
| backend  | `APP_VERSION`              | `0.1.0`                     | Reported by `/api/health`         |

## What is real vs. mocked

**Real:**
- Frontend ↔ backend separation, typed API client, all UX states (loading /
  error / empty), routing, and the full upload → extract → confirm → workspace loop.
- Database persistence (SQLModel/SQLite), file upload + on-disk storage.
- Deadline & checklist derivation from the extraction (N/A skipped, `MM/DD/YYYY`
  parsed, `COMPLETED` handled, critical deadlines flagged urgent).
- Task & document state mutations persist.
- The weekly **Summary** is *derived* from the live transaction, not faked.

**Mocked (clearly bounded, swappable):**
- **AI extraction.** `MockExtractionService` does **not** parse uploaded PDF
  bytes — it replays a real, structured CTM CBS1-8-24 extraction
  (`backend/app/services/data/`). The upload, job lifecycle, and review flow are
  real; only the parser is stubbed. Swap it behind the `ExtractionService`
  interface when a real parser is ready.
- **Auth.** `get_current_user` returns the seeded broker and
  `POST /api/auth/session` returns a fixed token. The dependency is real-shaped
  so it can be replaced with real auth without touching call sites.
- **Frontend fixtures.** `apps/web/src/lib/fixtures.ts` holds typed demo data
  (in the exact API shape) used as offline fallbacks. It is never sent anywhere
  and is separate from the API client.

## Architecture notes

### UX and design-system upgrade

The operational workflow has been upgraded around semantic landmarks, mobile-first responsive layouts, accessible focus states, labeled upload controls, table captions, typed status badges, reusable page/section headers, and explicit loading/error/empty states. The current audit and migration plan live in `docs/UX_UI_ACCESSIBILITY_AUDIT.md`; API contracts and mock boundaries live in `docs/API_CONTRACTS.md`.

Design-system rules now follow these practical tokens and patterns:

- **Color:** neutral operational surfaces, navy primary actions, gold deadline emphasis, green success, amber warning, red danger.
- **Typography:** large page titles for orientation, uppercase eyebrows for metadata, compact readable body text for dense workflows.
- **Spacing/radius/elevation:** card-based sections with consistent 1rem rhythm, rounded operational cards, restrained shadows.
- **Buttons/forms:** 44px minimum targets, visible disabled states, clear primary/secondary variants, labeled file input with helper and live status text.
- **Data display:** metric cards for summaries, list semantics for generated tasks/deadlines/documents, scrollable tables with captions for review data.
- **Responsive behavior:** mobile stacks by default, tablet/desktop split grids, bottom mobile navigation, sidebar on desktop, no intentional horizontal overflow except labeled table regions.

## Architecture notes

**Web app** (`apps/web/src/`)
- `app/` — App Router routes (one per workflow step).
- `components/workflow/` — production workflow primitives and feature components (`AppShell`, page/section headers, cards, buttons, states, review table, upload, task/deadline/document/activity components).
- `components/ui/` and `components/screens/` — preserved prototype-era components used by legacy/demo routes.
- `types/domain.ts` and `types/api.ts` — centralized domain and API contracts without frontend `any` types.
- `lib/api-client.ts` — the only production workflow layer that calls `fetch`.
- `hooks/useApi.ts` — generic data-fetching with loading/error/refresh.
- `lib/navigation.ts` — maps screen ids → real routes.

**Mobile app** (`apps/mobile/`)

- Expo React Native with file-based routing (`app/` directory).
- Shares theme tokens and domain types from `packages/shared`.

**Backend** (`backend/app/`)
- `api/routes/` — modular routers (auth, transactions, documents, extractions, tasks).
- `schemas/` — Pydantic `CamelModel` request/response models (camelCase JSON).
- `models/` — SQLModel tables (string-UUID PKs, status enums; Postgres-ready).
- `services/` — `extraction_service`, `document_service`, `transaction_service`,
  `deadline_service`, `task_service` (real service boundaries).
- `db/seed.py` — idempotent demo seed.

The design tokens (`apps/web/src/app/globals.css`) — color/typography/spacing
scales, dark theme, accent theming, status colors, urgency indicators — are
preserved from the prototype and remain the design system.

## Tests

```bash
cd backend && pytest          # 11 tests: health, seed, full upload→extract→confirm, error paths
cd apps/web && npm run build  # typecheck + production build
```

## Remaining technical debt & known limitations

- **Extraction is mocked** — it always returns the sample contract regardless of
  the uploaded file. This is the next real implementation target.
- **Auth is stubbed** — single demo broker, no real sessions or org scoping.
- **Prototype inline styles** — preserved prototype-era screens still use inline `style={{}}`; production workflow screens now use shared operational CSS/components.
- **No optimistic-refresh on cross-screen counts** — workspace counts refresh on
  navigation, not live, after task/document mutations.
- **SQLite is ephemeral** in cloud/container runs; point `DATABASE_URL` at
  Postgres for persistence.
- **`daysToClose` can be negative** for the seeded transaction because the sample
  contract's close date is in the past — this faithfully reflects the sample data.

## Recommended next tasks

1. Implement a real PDF extraction parser behind `ExtractionService`.
2. Real authentication + organization/broker scoping on every query.
3. Field-level editing in the Review screen UI (the API supports edits; the upgraded UI currently approves values and documents editing as a next task).
4. Persist + display notes / activity log per transaction.
5. Move inline styles into the design-system layer; add component tests.
6. Make workspace mutations refresh dependent views live.

## Prototype & history

The original design prototype was used to define the domain model and drove the
initial contract data schema. The real CTM CBS1-8-24 extraction that bootstrapped
the domain model is bundled as
`backend/app/services/data/sample_contract_extraction.json` and is what the
`FixtureExtractionProvider` replays during development.
