# Altitude Mobile — Expo / React Native Implementation Checklist

**Date:** 2026-05-29
**Status:** Planning — awaiting Brett's approval before `apps/mobile` is created
**Dependency:** `packages/shared` types established (complete)

---

## Why Expo is the right choice for Altitude

| Capability                      | Why it matters for brokers                                                                                     |
|---------------------------------|----------------------------------------------------------------------------------------------------------------|
| **Push notifications**          | Deadline alerts reach the broker during showings, inspections, and signings — not just when they open a laptop |
| **Camera + file picker**        | Photograph a document in-person during a walkthrough; upload directly without desktop                          |
| **Haptic feedback**             | Tactile confirmation when completing a task or approving an extracted field                                    |
| **Biometric auth**              | Face ID / fingerprint — broker doesn't retype password between back-to-back showings                           |
| **Native tab navigation**       | iOS/Android native bottom tabs feel correct; browser tabs do not                                               |
| **Offline-ish deadline access** | View upcoming deadlines even in mountain properties with poor signal                                           |
| **Deep links**                  | Tap a notification → land directly on the specific deadline or task in the transaction                         |
| **OTA updates**                 | Deploy minor fixes and content changes without App Store review                                                |

A PWA can deliver some of these partially. Expo delivers all of them natively, on both iOS and Android, from a single
codebase.

---

## What native features matter (in priority order)

1. **Push notifications** — deadline and task alerts (Expo Notifications + EAS)
2. **Camera / document picker** — contract PDF upload from phone (expo-camera, expo-document-picker)
3. **Haptics** — task completion and field approval feedback (expo-haptics)
4. **Biometric auth** — Face ID / fingerprint unlock (expo-local-authentication)
5. **Native tab navigation** — bottom tab bar (Expo Router tabs)
6. **Deep links** — notification tap → specific screen (Expo Router deep links)
7. **Offline deadline access** — cached deadline data for low-signal situations (AsyncStorage or MMKV)

---

## Proposed repo structure (not yet created)

```
Altitude_Transactions_PT/
├── apps/
│   ├── mobile/          ← Expo React Native broker + client app  [NOT YET CREATED]
│   ├── web/             ← Next.js web portal (apps/web/)
│   └── api/             ← FastAPI backend (currently backend/)
├── packages/
│   └── shared/          ← Shared types, theme, constants  [CREATED]
│       └── src/
│           ├── index.ts
│           ├── domain.ts
│           ├── theme.ts
│           └── constants.ts
└── (workspace config)   ← pnpm-workspace.yaml or turbo.json  [NOT YET CREATED]
```

**Important:** `frontend/` and `backend/` remain in place until the monorepo migration is approved and verified.

---

## Migration sequence

### Gate 0 — Current state (complete)

- [x] Next.js web app working at `apps/web/`
- [x] FastAPI backend working at `backend/`
- [x] `packages/shared/` types and theme created
- [x] Landing page at `/` tells the product story
- [x] Build passes cleanly

### Gate 1 — Monorepo wiring (requires Brett's approval)

- [ ] Decide: pnpm workspaces or Turborepo
- [ ] Create root `package.json` with workspaces config
- [x] `apps/web/` is now the canonical web app location
- [ ] Verify `backend/` still runs as `apps/api`
- [ ] Wire `packages/shared` so both apps can import it
- **Do not proceed to Gate 2 until Gate 1 builds are verified**

### Gate 2 — Expo app shell (requires Gate 1 + Brett's approval)

- [ ] `npx create-expo-app apps/mobile --template blank-typescript`
- [ ] Configure Expo Router file-based navigation
- [ ] Load `packages/shared/theme.ts` as the design token source
- [ ] Load Geist font via `expo-font` (or system font fallback)
- [ ] Basic app shell: navigation structure, empty screens, no data
- [ ] Verify app opens on iOS Simulator

### Gate 3 — Auth and session

- [ ] Implement `POST /api/auth/login` on FastAPI backend
- [ ] Implement `GET /api/auth/me` for session restore
- [ ] Wire auth token storage (SecureStore on mobile)
- [ ] Login screen functional on mobile

### Gate 4 — Core screens (5 screens end-to-end)

- [ ] Today Dashboard — fetch `/api/dashboard/summary` and `/api/transactions`
- [ ] Transaction Detail — fetch `/api/transactions/{id}`
- [ ] Deadline Timeline — render deadlines from transaction detail
- [ ] Task Checklist — render tasks, `PATCH /api/tasks/{id}` on completion
- [ ] Test all 5 screens on a real iOS device before continuing

### Gate 5 — Upload + extraction + review flow

- [ ] Contract Upload screen — `expo-document-picker` + camera option
- [ ] `POST /api/documents/upload`
- [ ] Extraction Progress screen — poll `GET /api/documents/{id}/extraction`
- [ ] Human Review screen — approve/edit each field, `PATCH /api/extracted-fields/{id}`
- [ ] Confirm extraction, verify workspace populates

### Gate 6 — Remaining screens

- [ ] Contacts screen — tap to call/email
- [ ] Documents screen — document requirement checklist
- [ ] Weekly Summary screen — `/api/transactions/{id}/summary`
- [ ] Closeout / thank-you screen — post-close tasks
- [ ] Settings / notifications screen — push preferences

### Gate 7 — Push notifications

- [ ] `POST /api/notifications/register` — store Expo push token
- [ ] Backend sends deadline alerts via Expo push service
- [ ] Test push receipt on real device
- [ ] Deep link from notification → specific transaction/deadline

### Gate 8 — Native polish

- [ ] Haptics on task completion and field approval
- [ ] Biometric auth (Face ID / fingerprint)
- [ ] Offline deadline caching (AsyncStorage or MMKV)
- [ ] Pull-to-refresh on dashboard and transaction lists

### Gate 9 — Production hardening

- [ ] Real PDF extraction (replace `MockExtractionService`)
- [ ] Postgres database (replace SQLite)
- [ ] EAS Build configuration for iOS and Android
- [ ] App Store and Google Play submission

---

## Screen specifications

### 01 — Login

| Field            | Value                                                                                |
|------------------|--------------------------------------------------------------------------------------|
| Purpose          | Authenticate the broker                                                              |
| Primary action   | Sign in with email + password                                                        |
| Key data         | Email, password, optional biometric prompt                                           |
| API              | `POST /api/auth/login`                                                               |
| UI pattern       | Full-screen centered form, logo at top, CTA button                                   |
| Risk / edge case | Biometric not available on simulator; biometric not enrolled → fall back to password |

---

### 02 — Today Dashboard

| Field            | Value                                                                      |
|------------------|----------------------------------------------------------------------------|
| Purpose          | At-a-glance daily operations view                                          |
| Primary action   | Tap into an active transaction                                             |
| Key data         | Active transaction cards, next 3 deadlines, task counts, open alerts       |
| API              | `GET /api/transactions`, `GET /api/dashboard/summary`                      |
| UI pattern       | Alert banner (if overdue) + scrollable transaction card list               |
| Risk / edge case | Empty state if no active transactions; skeleton loading on slow connection |

---

### 03 — Active Transactions

| Field            | Value                                                                        |
|------------------|------------------------------------------------------------------------------|
| Purpose          | Full portfolio list                                                          |
| Primary action   | Open a specific transaction                                                  |
| Key data         | Address, status, closing date, progress ring, parties                        |
| API              | `GET /api/transactions`                                                      |
| UI pattern       | Searchable card list with filter tabs                                        |
| Risk / edge case | Large portfolios need pagination; search must handle partial address matches |

---

### 04 — Transaction Detail

| Field            | Value                                                                     |
|------------------|---------------------------------------------------------------------------|
| Purpose          | Workspace hub — entry point for all transaction sub-sections              |
| Primary action   | Navigate to timeline, tasks, contacts, or documents                       |
| Key data         | Address hero, stage rail, metric chips (tasks / deadlines / docs)         |
| API              | `GET /api/transactions/{id}`                                              |
| UI pattern       | Property hero card + metric row + quick-action grid + upcoming deadlines  |
| Risk / edge case | Must display even if extraction is not yet confirmed (show pending state) |

---

### 05 — Contract Upload

| Field            | Value                                                                       |
|------------------|-----------------------------------------------------------------------------|
| Purpose          | Start a new transaction by uploading a CTME PDF                             |
| Primary action   | Select file from Files app or photograph with camera                        |
| Key data         | File name, file size, upload progress                                       |
| API              | `POST /api/documents/upload`                                                |
| UI pattern       | Full-screen upload zone → progress bar after selection                      |
| Risk / edge case | PDFs over 20MB need size validation; network failure mid-upload needs retry |

---

### 06 — Extraction Progress

| Field            | Value                                                                                                    |
|------------------|----------------------------------------------------------------------------------------------------------|
| Purpose          | Show AI extraction progress while it runs                                                                |
| Primary action   | Wait — or cancel and re-upload                                                                           |
| Key data         | Extraction stage label, animated progress bar, field count                                               |
| API              | `GET /api/documents/{id}/extraction` (polled every 2s)                                                   |
| UI pattern       | Full-screen animated progress card                                                                       |
| Risk / edge case | Extraction timeout (> 60s) must show error + retry; do not show confidence percentages during extraction |

---

### 07 — Human Review

| Field            | Value                                                                                                  |
|------------------|--------------------------------------------------------------------------------------------------------|
| Purpose          | Broker reviews every AI-extracted field before confirming                                              |
| Primary action   | Approve or edit each field                                                                             |
| Key data         | Field name, extracted value, confidence %, source document/page                                        |
| API              | `PATCH /api/extracted-fields/{id}`, `POST /api/extractions/{jobId}/confirm`                            |
| UI pattern       | Swipeable review cards OR list with inline edit                                                        |
| Risk / edge case | Broker may reject all fields — must allow restarting extraction; evidence drawer must show source text |

---

### 08 — Deadline Timeline

| Field            | Value                                                                                     |
|------------------|-------------------------------------------------------------------------------------------|
| Purpose          | Track all CTME contract deadlines                                                         |
| Primary action   | Mark a deadline complete or N/A                                                           |
| Key data         | Date, event name, status, days remaining, section reference                               |
| API              | `GET /api/transactions/{id}` (deadlines array), `PATCH /api/deadlines/{id}`               |
| UI pattern       | Vertical timeline with color-coded status dots and today marker                           |
| Risk / edge case | Overdue items must appear at the top with urgent styling; N/A items should be collapsible |

---

### 09 — Task Checklist

| Field            | Value                                                                                              |
|------------------|----------------------------------------------------------------------------------------------------|
| Purpose          | Complete operational tasks generated from the contract                                             |
| Primary action   | Tap to complete a task (with haptic feedback)                                                      |
| Key data         | Task title, stage group, due date, current status                                                  |
| API              | `PATCH /api/tasks/{taskId}`                                                                        |
| UI pattern       | Grouped list by stage, completion toggles, filter tabs (active / done / N/A)                       |
| Risk / edge case | Tasks linked to deadlines — completing a task should not auto-mark the deadline; show relationship |

---

### 10 — Contacts

| Field            | Value                                                                                          |
|------------------|------------------------------------------------------------------------------------------------|
| Purpose          | All parties and vendors in one place                                                           |
| Primary action   | Tap to call or email a contact                                                                 |
| Key data         | Name, role, phone, email, company, license number                                              |
| API              | `GET /api/transactions/{id}` (contacts array)                                                  |
| UI pattern       | Role-grouped card list, tap-to-call with confirmation                                          |
| Risk / edge case | Multiple contacts per role (co-broker, dual-agent scenarios); phone numbers may not be present |

---

### 11 — Documents

| Field            | Value                                                                                |
|------------------|--------------------------------------------------------------------------------------|
| Purpose          | Track required, conditional, and missing documents                                   |
| Primary action   | Mark a document as received or reviewed                                              |
| Key data         | Document name, required/conditional status, received status                          |
| API              | `PATCH /api/documents/{id}`                                                          |
| UI pattern       | Grouped checklist by required status, status badge per item                          |
| Risk / edge case | Conditional documents depend on N/A fields from extraction — show dependency clearly |

---

### 12 — Weekly Summary

| Field            | Value                                                            |
|------------------|------------------------------------------------------------------|
| Purpose          | Deal health snapshot for the week                                |
| Primary action   | Share or forward to client/TC                                    |
| Key data         | Completed tasks, upcoming deadlines, flagged risks               |
| API              | `GET /api/transactions/{id}/summary`                             |
| UI pattern       | Single scrollable summary card                                   |
| Risk / edge case | Summary must be generated server-side; not derived in the client |

---

### 13 — Closeout / Thank-You Tracking

| Field            | Value                                                                                |
|------------------|--------------------------------------------------------------------------------------|
| Purpose          | Track post-close follow-up tasks so nothing falls through                            |
| Primary action   | Mark post-close tasks complete                                                       |
| Key data         | Task title, recipient role, completion status, date sent                             |
| API              | `GET /api/transactions/{id}/postclose`, `PATCH /api/post-close-tasks/{id}`           |
| UI pattern       | Completion progress bar + grouped checklist                                          |
| Risk / edge case | Often neglected — send a push notification reminder 3 days after close if incomplete |

---

### 14 — Settings / Notifications

| Field            | Value                                                                                                 |
|------------------|-------------------------------------------------------------------------------------------------------|
| Purpose          | Manage push notification preferences and broker profile                                               |
| Primary action   | Toggle notification categories                                                                        |
| Key data         | Notification toggles, broker name, brokerage, push permission status                                  |
| API              | `GET/PATCH /api/notifications/preferences`                                                            |
| UI pattern       | Standard settings list with toggle switches                                                           |
| Risk / edge case | Push permission may be denied at OS level; always show current permission status and link to Settings |

---

## Implementation risks

| Risk                                    | Mitigation                                                                            |
|-----------------------------------------|---------------------------------------------------------------------------------------|
| Monorepo wiring breaks web or API       | Test both apps before adding mobile                                                   |
| Camera permissions vary by OS           | Graceful fallback to file picker                                                      |
| Large PDF upload (slow / unreliable)    | File size limit (20MB), chunked upload or presigned URL                               |
| Push notification credentials           | Use Expo's managed push service; credentials stored in EAS, never in code             |
| Extraction timeout                      | Show error with retry; never leave broker on a progress spinner indefinitely          |
| Mock extraction misrepresented          | Always label extracted data as "AI-extracted — pending your review"                   |
| Gold overuse in UI                      | Gold only on primary CTA, progress, in-progress badge — see ALTITUDE_DESIGN_SYSTEM.md |
| Over-engineering before user validation | Ship 5 core screens before adding notifications or offline support                    |

---

## Next step

**Brett approves this checklist → proceed to Gate 1 (monorepo wiring decision).**

Do not create `apps/mobile` until Gate 1 is approved.
