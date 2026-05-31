# Altitude Transactions — Mobile-Native Product Strategy

**Date:** 2026-05-29
**Status:** Approved direction — implementation in progress

---

## 1. Current Repo Diagnosis

### What exists today

| Layer            | Technology                                                    | Status                       |
|------------------|---------------------------------------------------------------|------------------------------|
| Web frontend     | Next.js 15, React 18, TypeScript, App Router                  | Active and working           |
| Backend API      | FastAPI + SQLModel, Python 3.11+, SQLite                      | Active and working           |
| Styling          | CSS custom properties (no Tailwind), Instrument Serif + Geist | Well-structured token system |
| Mobile           | None                                                          | Not yet started              |
| Monorepo tooling | None (independent apps/web/ and backend/ folders)             | Not yet wired                |

### Repo structure summary

```
Altitude_Transactions_PT/
├── apps/web/       ← Next.js 15 web app (active source of truth)
├── backend/        ← FastAPI API (active source of truth)
├── project/        ← Original HTML prototype + brand assets
├── docs/           ← Architecture, API, UX, and strategy documentation
└── .claude/        ← Claude Code skill files (UI/UX Pro Max)
```

### Current working routes (Next.js App Router)

- `/` — root entry (currently redirects to dashboard or login)
- `/login` — broker authentication
- `/dashboard` — operations cockpit with active transaction queue
- `/upload` — CTME PDF upload
- `/upload/[documentId]/extracting` — extraction progress polling
- `/review/[documentId]` — human field review before workspace creation
- `/transactions/[id]` — transaction workspace hub
- `/transactions/[id]/deadlines` — deadline timeline
- `/transactions/[id]/tasks` — task checklist
- `/transactions/[id]/contacts` — parties and contacts
- `/transactions/[id]/documents` — document requirements
- `/transactions/[id]/audit` — audit history
- `/walkthrough` — interactive demo

### Current API (FastAPI — working endpoints)

```
GET    /api/transactions
GET    /api/transactions/{id}
POST   /api/documents/upload
GET    /api/documents/{document_id}/extraction
POST   /api/extractions/{job_id}/confirm
PATCH  /api/extracted-fields/{field_id}
PATCH  /api/tasks/{task_id}
PATCH  /api/documents/{document_id}
GET    /api/transactions/{id}/audit
```

### Known mock/stub boundaries

- PDF extraction is mocked by `MockExtractionService` — replays sample CTME field data
- Auth is stubbed to a seeded broker session
- Push notifications: not yet implemented
- Real PDF parsing: not yet implemented (planned Phase 9)

---

## 2. Brand Interpretation

### Visual source

`project/uploads/Altitude_Transactions_Inspiration.png` — a dark navy brand signage panel with a 3D metallic gold
mountain range logo, wide-tracked serif "ALTITUDE" in caps, and the tagline "Elevated service. Intelligence systems."

### What to extract

| Visual element                            | Product translation                                                   |
|-------------------------------------------|-----------------------------------------------------------------------|
| Deep navy foundation (`#14223F`)          | App canvas, sidebar, top navigation surfaces                          |
| Metallic gold mountain logo               | Brand moments only: splash screen, logo lockup, primary CTA highlight |
| Gold ruled horizontal lines               | Hairline dividers — sparingly, one per section break                  |
| Wide serif caps for "ALTITUDE"            | Display typography for screen titles and hero moments only            |
| Restrained whitespace on sides            | Generous padding — do not crowd content                               |
| "Elevated service. Intelligence systems." | Product voice: calm, confident, tool-grade professionalism            |

### What to avoid

- Literal gold borders on every card or row
- Embossed or 3D metallic effects inside the product UI
- Full dark navy as the only surface (light `--paper` is required for data legibility)
- Treating every heading like a conference room plaque
- Over-decorating workflow screens with mountain imagery

### Brand voice principles

- Calm, not urgent
- Confident, not boastful
- Operational, not luxury
- Intelligent, not magical
- Professional, not bureaucratic

---

## 3. Product Positioning

### Repositioned statement

> Altitude is a mobile-native contract-to-close concierge for Colorado residential brokers. It ingests CTME-exported
> contract PDFs, extracts deadlines, parties, and transaction metadata using AI, puts every extracted field in front of
> the broker for human review, then turns approved data into an operational mobile workspace: timeline, tasks, contacts,
> documents, weekly summary, and closeout tracking — all from the broker's phone.

### Who it is for

**Primary:** Colorado residential real estate brokers managing active transaction files.
**Secondary:** Transaction coordinators working alongside brokers.
**Future:** Clients who want visibility into their deal status without broker phone calls.

### What job it performs

Eliminates the manual overhead between "contract signed in CTME" and "broker has a working transaction workspace." The
broker uploads the contract once; Altitude extracts, organizes, and tracks everything. The broker manages the deal — not
a spreadsheet.

### Why CTME stays the source system

CTME is the Colorado Association of REALTORS®-approved e-signature and contract platform that Colorado brokers use for
legally compliant contract execution. Altitude does not replace it — it reads from it. This positioning is an additive
workflow layer, not a platform migration ask, and does not require brokers to change their compliance process.

**Important:** Altitude's CTME integration is currently a mock extraction service replaying sample CTME field data. Real
PDF parsing is a Phase 9 item. Do not represent it as a live CTME integration until that phase is complete.

### Why mobile-native is a differentiator

Brokers work between showings, inspections, client calls, and closings — not primarily at a desk. A mobile-first tool
means:

- Deadline alerts reach the broker immediately via push notification
- Tasks get completed from anywhere, not just from a laptop
- Client contact happens one tap away
- Document status is visible during property walkthroughs

A PWA or responsive website cannot match this. Native UX signals quality in a way that a browser tab does not.

---

## 4. Web vs Mobile Responsibility Split

### Mobile app (React Native / Expo) — broker daily workflow

| Screen                   | Purpose                                             |
|--------------------------|-----------------------------------------------------|
| Login                    | Auth + biometric unlock                             |
| Today dashboard          | Active transactions, next 3 deadlines, alert count  |
| Active transactions      | Full portfolio list, search, filter                 |
| Transaction detail       | Workspace hub: stage rail, metrics, tab navigation  |
| Contract upload          | Camera + file picker → PDF upload                   |
| Extraction progress      | AI parsing feedback, field count, progress          |
| Human review             | Approve/edit each extracted field before confirming |
| Deadline timeline        | Vertical timeline with status indicators            |
| Task checklist           | Grouped by stage, completion with haptic feedback   |
| Contacts                 | Parties, vendors — tap to call or email             |
| Documents                | Required/conditional doc checklist                  |
| Weekly summary           | Deal health snapshot                                |
| Closeout / thank-you     | Post-close task tracking                            |
| Settings / notifications | Push alert preferences, theme, broker profile       |

### Web app (Next.js) — desktop portal + marketing

| Route                 | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `/`                   | Public landing page with product story        |
| `/walkthrough`        | Interactive PhoneShell demo for presentations |
| `/dashboard`          | Broker/admin desktop operations cockpit       |
| `/transactions/[id]`  | Full transaction workspace (all sub-routes)   |
| `/upload` + `/review` | Desktop PDF upload and extraction review      |

### Why the split makes sense

The mobile app owns the broker's real-time daily workflow. The web app owns the desktop review experience (extraction
tables, bulk operations, audit history) and the marketing/demo surface. They share the same FastAPI backend.

---

## 5. React Native / Expo Upgrade Strategy

### Proposed future structure (not yet implemented)

```
Altitude_Transactions_PT/
├── apps/
│   ├── mobile/     ← NEW: Expo / React Native broker app
│   ├── web/        ← MOVE from apps/web/: Next.js web portal
│   └── api/        ← MOVE from backend/: FastAPI backend
├── packages/
│   └── shared/     ← NEW: shared TypeScript types, theme, utils
└── (root workspace config)
```

### Migration safety rules

1. Do not rename or move `apps/web/` or `backend/` until the current app is fully stable and tested
2. Create `packages/shared` first — pure TypeScript, no framework imports
3. Create `apps/mobile` as an additive new folder — never by moving `apps/web/`
4. Port mobile screens one at a time; do not build all 14 before testing the first 5 end-to-end
5. Only sunset web screens after mobile equivalents are proven stable in production

### Why Expo specifically

- Single codebase for iOS and Android
- Expo Router provides file-based navigation matching Next.js mental model
- `expo-notifications` for push alerts without custom native modules
- `expo-document-picker` + `expo-camera` for native file/photo upload
- Over-the-air (OTA) updates without App Store review for minor changes
- EAS Build handles CI/CD for iOS and Android distributions

### What React Native adds that web cannot replace

| Native feature                  | Why it matters for brokers                                                       |
|---------------------------------|----------------------------------------------------------------------------------|
| Push notifications              | Deadline alerts, task reminders — not possible in browser without PWA complexity |
| Haptic feedback                 | Confirmation signal when completing a task or approving a field                  |
| Camera-native upload            | Photograph a document in-person at an inspection or signing                      |
| Biometric auth                  | Face ID / fingerprint — broker doesn't retype password between showings          |
| Offline-capable deadline access | View upcoming deadlines even without signal in mountain properties               |
| Deep links                      | Tap a notification → land directly on the specific deadline or task              |

---

## 6. Backend / API Assumptions

### Current mock boundaries (important — do not misrepresent)

- PDF extraction: mocked by `MockExtractionService` in `backend/app/services/extraction_service.py`
- Auth: stubbed session, seeded broker
- Push notifications: not implemented in backend or frontend
- Real CTME API integration: not in scope (CTME PDFs are exported manually and uploaded)

### Endpoints to add before mobile launch

| Route                                    | Purpose                               |
|------------------------------------------|---------------------------------------|
| `POST /api/auth/login`                   | Real JWT auth for mobile session      |
| `GET /api/auth/me`                       | Session restore / token validation    |
| `GET /api/dashboard/summary`             | Aggregate metrics for today dashboard |
| `PATCH /api/deadlines/{id}`              | Mark deadline complete / N/A          |
| `PATCH /api/extractions/{job_id}/fields` | Batch field approval                  |
| `GET /api/transactions/{id}/summary`     | Weekly summary data                   |
| `POST /api/notifications/register`       | Store Expo push token per broker      |
| `GET /api/notifications/preferences`     | Fetch broker notification settings    |
| `GET /api/transactions/{id}/postclose`   | Post-close task list                  |
| `PATCH /api/post-close-tasks/{id}`       | Mark post-close task complete         |

### Response shape principles (already established)

- camelCase JSON for all apps/web/mobile responses
- Status enums, not free-form strings
- Source/evidence references on extracted field values
- PATCH routes return the updated object so clients can update local state without a full reload

---

## 7. Implementation Phases

| Phase | Goal                          | Key deliverable                                    | Risk   |
|-------|-------------------------------|----------------------------------------------------|--------|
| 0     | Repo hygiene                  | `.gitignore` updated, tool artifacts suppressed    | Low    |
| 1     | Strategy documentation        | `docs/ALTITUDE_MOBILE_NATIVE_STRATEGY.md`          | Low    |
| 2     | Design system documentation   | `docs/ALTITUDE_DESIGN_SYSTEM.md`, token alignment  | Low    |
| 3     | Web landing / product story   | `/` page with real product copy and CTAs           | Low    |
| 4     | Shared contracts prep         | `packages/shared/` TypeScript types and theme      | Low    |
| 5     | Expo implementation checklist | `docs/EXPO_IMPLEMENTATION_CHECKLIST.md`            | Low    |
| 6     | Monorepo wiring               | `pnpm-workspace.yaml` or Turborepo root            | Medium |
| 7     | Expo app shell                | `apps/mobile/` with navigation and theme           | Medium |
| 8     | Mobile core screens           | Login → Dashboard → Transaction → Timeline → Tasks | Medium |
| 9     | Upload + extraction review    | Camera, file picker, review flow                   | High   |
| 10    | Push notifications            | Expo push tokens, backend registration, alerts     | High   |
| 11    | Production hardening          | Real auth, real PDF extraction, Postgres, CI/CD    | High   |

---

## 8. Risks and Tradeoffs

| Risk                                         | Likelihood      | Mitigation                                                                         |
|----------------------------------------------|-----------------|------------------------------------------------------------------------------------|
| Monorepo wiring breaks current app           | Medium          | Keep `apps/web/` and `backend/` as-is until wiring is verified                     |
| React Native style system diverges from web  | High (expected) | `packages/shared/theme.ts` as single source; platforms implement independently     |
| Push notification credentials (Apple/Google) | High complexity | Use Expo's managed push service; do not hard-code tokens                           |
| Large PDF uploads on mobile (slow network)   | High            | Add file size validation and chunked upload or server-side URL ingestion           |
| Camera permissions vary by OS                | Medium          | Graceful fallback to file picker if camera denied                                  |
| Mock extraction misrepresented as real       | Preventable     | Always display extraction confidence and "AI-extracted — pending review" labels    |
| Over-engineering before user validation      | Medium          | Ship the 5 core mobile screens before adding notifications or offline support      |
| Gold overuse in UI                           | Preventable     | Gold token applied only to primary CTA, active timeline progress, and brand lockup |

---

## 9. Immediate Next Steps

The following steps are in progress or immediately next:

1. **Phase 2** — Create `docs/ALTITUDE_DESIGN_SYSTEM.md` and verify token alignment in `apps/web/src/app/globals.css`
2. **Phase 3** — Build the `/` public landing page so the web app communicates the product story
3. **Phase 4** — Create `packages/shared/` with pure TypeScript types and theme constants
4. **Phase 5** — Create `docs/EXPO_IMPLEMENTATION_CHECKLIST.md` as the approved mobile build roadmap
5. **Approval gate** — Brett reviews Phase 5 checklist before any Expo app is created

**Do not start Phase 6 (monorepo wiring) or create `apps/mobile/` without explicit approval.**

---

*Maintained by the Altitude development team. Update this document as phases are completed or strategy changes.*
