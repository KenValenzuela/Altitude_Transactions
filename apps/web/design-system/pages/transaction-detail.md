# Transaction Detail — Design System Override

**Inherits from:** `design-system/MASTER.md`  
**Route:** `/transactions/[id]` (src/app/transactions/[id]/page.tsx)  
**Purpose:** Full transaction workspace for a single deal.

---

## Shell

Uses `AppShell` with special workspace header treatment:

- `.dk-dealhead.dk-bleed-top` — navy header band, full-width bleed above ops-main padding
- `.dk-tabs.dk-bleed` — navy tab bar, full-width bleed
- Tab panels inside `ops-main` padding

## Tabs

```
overview | review | deadlines | tasks | contacts | documents | activity | postclose
```

Each tab panel: `role="tabpanel"`, `aria-label`, `id="panel-{id}"`.
Tab buttons: `role="tab"`, `aria-selected`, `aria-controls`.

## Risk badge

Use CSS class variants — not inline style objects:

```
.dk-badge.dk-badge--risk-high    → var(--risk-*)
.dk-badge.dk-badge--risk-medium  → var(--warn-*)
.dk-badge.dk-badge--risk-low     → var(--ok-*)
```

## Contact editing

Handled by `ContactMatrix` → `ContactCard`. Each card has:

- Read state: role eyebrow, serif name, phone/email links, status badge, Edit button
- Edit state: inline form, 2-column grid (Name + Company / Email + Phone), Save/Cancel
- `PATCH /contacts/{id}` — real API call, real persistence
- Success toast fades after 3s
- Error alert with `role="alert"`

**Data scope:** Edits update the transaction-scoped contact record (`transactionId` is always set).
There is no separate global contact store. Editing a contact here does not affect vendor rolodex.

## Activity feed

`AuditTimeline` component:

- `Summary` card (`.dk-actsummary`) — dark navy, shows stats + notable recent actions
- Grouped by calendar day (Today / Yesterday / day name / full date)
- Events use `EVENT_LABELS` map — never raw `event_type_name`
- Tone-colored icon badges: ok | warn | info | risk | default
- Value change chips shown when `beforeValue` + `afterValue` are both ≤32 chars

## Post-close

`PostCloseKanban` component:

- Two columns: To-do (+ N/A) | Complete
- Cards: `.dk-kcard` with brass accent bar → green when done
- "Mark complete" → optimistic update + real API call + rollback on failure
- "Undo" available for completed cards
- Empty states for both columns

## Document viewer

`SourceDocumentList` + `DocumentViewer`:

- Documents list: `.dk-sourcedoc-row` list
- Viewer modal: `.dk-docviewer-backdrop` full-screen overlay
- Blob URL pattern: fetch via `api.getDocumentBlob(id)` → `URL.createObjectURL(blob)` → revoke on close
- Auth token in header — never in iframe src URL
- States: loading | error (try again + download fallback) | ready (iframe)
- PDF search hint: "Click inside, then press ⌘F / Ctrl+F to search" — shown only for PDF when ready
- Escape key closes, backdrop click closes

---

## Do NOT do on transaction detail

- Do not use the flat `PageHeader` component for this page — use `.dk-dealhead`
- Do not expose blob URLs after modal closes — always revoke
- Do not hide critical deadlines behind progressive disclosure
- Do not use inline `style={{}}` for status badge colors — use `.dk-badge--risk-*` classes
- Do not show raw underscored event types in activity feed — use `EVENT_LABELS` or title-case fallback
