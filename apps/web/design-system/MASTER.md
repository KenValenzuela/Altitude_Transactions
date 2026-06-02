# Altitude Transactions — Design System MASTER

**Source of truth:** `apps/web/src/app/globals.css`
**Stack:** Next.js 15, pure CSS custom properties, no Tailwind
**Date:** 2026-05-31

---

## Brand principles

Altitude is a premium, trust-first operations tool for Colorado residential real estate brokers. It is not a generic
SaaS dashboard, not a flashy AI demo, and not a cheap CRM.

- **Calm precision** — every element earns its presence
- **Source-backed** — AI prepares, human approves; never hide this distinction
- **Mobile-first** — brokers use this in the field, not just at a desk
- **Colorado mountain** — deep navy + warm paper + muted brass; premium but functional
- **Trustworthy data** — audit trail, confidence scores, evidence sources always visible

---

## Color tokens (`globals.css`)

### Foundation

| Token            | Value     | Use                              |
|------------------|-----------|----------------------------------|
| `--bg-app`       | `#faf6ef` | Page canvas (warm off-white)     |
| `--bg-surface`   | `#ffffff` | Cards, panels, inputs            |
| `--bg-surface-2` | `#f5efe4` | Nested surfaces, recessed areas  |
| `--bg-inset`     | `#ece3d4` | Inset areas, disabled fields     |
| `--bg-navy`      | `#0b1530` | Nav rail, workspace header bands |
| `--bg-navy-2`    | `#14213f` | Hover/gradient stops on navy     |

### Ink (text on paper)

| Token        | Value     | Use                                   |
|--------------|-----------|---------------------------------------|
| `--fg1`      | `#2a2620` | Primary text                          |
| `--fg2`      | `#5c554a` | Supporting text, labels               |
| `--fg3`      | `#948b7b` | Captions, placeholders, muted         |
| `--fg-brass` | `#8a7142` | Eyebrows, section labels, accent text |

### Text on navy surfaces

| Token                | Use                     |
|----------------------|-------------------------|
| `--fg1-on-navy`      | Primary text on dark    |
| `--fg2-on-navy`      | Supporting text on dark |
| `--fg3-on-navy`      | Muted/captions on dark  |
| `--fg-brass-on-navy` | Brass accent on dark    |

### Brass (accent — 20% of UI)

Use brass for: active nav states, CTA buttons, eyebrows, progress fills, deadline emphasis.
Never use brass as a background for body text.

| Token         | Value                                |
|---------------|--------------------------------------|
| `--brass-400` | `#bda475` — icon color on active nav |
| `--brass-500` | `#ac8d53` — accent color             |
| `--brass-600` | `#8a7142` — CTA button background    |
| `--brass-700` | `#675532` — CTA hover                |

### Status colors

Always pair color with a text label or icon. Never use color alone as the only indicator.

| Status      | Background                    | Text                    | Border                     |
|-------------|-------------------------------|-------------------------|----------------------------|
| Success/OK  | `--ok-surface` `#e8f0ea`      | `--ok-text` `#235540`   | `--ok-line` `#bcd4c5`      |
| Warning     | `--warn-surface` `#f7eed8`    | `--warn-text` `#7d5615` | `--warn-line` `#e3cd9c`    |
| Danger/Risk | `--risk-surface` `#f6e4e1`    | `--risk-text` `#842f27` | `--risk-line` `#e3bdb6`    |
| Info        | `--info-surface` `#e7eef7`    | `--info-text` `#224274` | `--info-line` `#c2d2e6`    |
| Neutral     | `--neutral-surface` `#ece3d4` | `--neutral` `#6b6459`   | `--neutral-line` `#ddd0bc` |

### Lines/borders

| Token                     | Use                             |
|---------------------------|---------------------------------|
| `--line` `#e7ddcd`        | Standard dividers, card borders |
| `--line-strong` `#ddd0bc` | Emphasized separators           |
| `--line-on-navy`          | Dividers on dark surfaces       |

---

## Typography

Three-font system — never mix casually.

| Role            | Font                  | Variable       | Use                                                              |
|-----------------|-----------------------|----------------|------------------------------------------------------------------|
| Display/heading | Spectral (serif)      | `--font-serif` | Page titles, property addresses, metric values                   |
| UI / body       | Hanken Grotesk (sans) | `--font-sans`  | Nav, buttons, labels, body text, forms                           |
| Data / code     | IBM Plex Mono (mono)  | `--font-mono`  | IDs, timestamps, evidence refs, audit entries, confidence values |

### Scale (use these classes, not ad-hoc sizes)

| Class                    | Size                                  | Use                             |
|--------------------------|---------------------------------------|---------------------------------|
| `h1 / .dk-h1`            | 30px serif                            | Page title                      |
| `h2`                     | 23px serif                            | Section title                   |
| `h3`                     | 19px serif                            | Card heading                    |
| `.eyebrow / .dk-eyebrow` | 11px sans, 0.14em tracking, uppercase | Section labels, status eyebrows |
| `.body` / `p`            | 15px sans, 1.55 lh                    | Body text                       |
| `.body-sm`               | 13px sans                             | Supporting text                 |
| `.label`                 | 13px sans, 600                        | Form labels, strong UI labels   |
| `.meta`                  | 11.5px sans                           | Metadata, timestamps (light)    |
| `.mono`                  | 12.5px mono                           | Evidence text, IDs, timestamps  |

**Rule:** Property addresses always use `.dk-deal-addr` (serif 15.5px). Transaction IDs always use `.dk-deal-id` (mono
10.5px). Confidence values always use `--font-mono`.

---

## Spacing

4px base grid. Use `--s-*` tokens.

```
--s-1: 4px   --s-2: 8px   --s-3: 12px  --s-4: 16px
--s-5: 20px  --s-6: 24px  --s-8: 32px  --s-10: 40px
--s-12: 48px --s-16: 64px
```

Standard card padding: `17px 18px` (desktop), `14px 16px` (compact).

---

## Radius

```
--r-xs: 4px    --r-sm: 7px    --r-md: 11px
--r-lg: 16px   --r-xl: 22px   --r-pill: 999px
```

Cards use `--r-lg`. Badges use `--r-pill`. Icon buttons use `--r-md`. Inputs use `--r-sm`.

---

## Shadows (warm, no harsh black)

```
--shadow-xs: subtle card lift
--shadow-sm: standard card
--shadow-md: hover state card
--shadow-lg: modal / elevated panel
--shadow-navy: dark panel / decision bar
```

---

## Z-index scale

```
--z-base: 0      --z-raised: 10    --z-overlay: 20
--z-modal: 30    --z-toast: 50
```

---

## Transitions

```
--t-fast: 140ms   --t-base: 180ms   --t-slow: 280ms
```

All using `cubic-bezier(.2,.6,.2,1)`. Interactive elements use `--t-fast`. Card hover uses `--t-base`.

---

## Shell layout

### Desktop (≥901px)

```
.dk-app = grid: 248px | 1fr
  .dk-rail    = navy nav rail (left, full height, sticky)
  .dk-main    = flex column
    .dk-topbar  = frosted header (60px, search + actions)
    .dk-scroll  = scrollable main content area
      .ops-main   = page content (max-width 1180px, centered)
```

### Mobile (<900px)

```
.ops-shell (single column)
  .ak-bottomnav (fixed, bottom, 70px, navy)
    4 nav items + 1 brass FAB (center, 52px circle, elevated)
```

**Rule:** `.dk-rail` is `display:none` on mobile. `.ak-bottomnav` is `display:none` on desktop.

---

## Component classes

### Desktop buttons (`.dk-btn`)

```
.dk-btn.dk-primary   = brass background (#8a7142), white text
.dk-btn.dk-secondary = white background, border, dark text
.dk-btn.dk-ghost     = transparent, brass text
.dk-btn.sm           = compact height (34px)
```

### Legacy operational buttons (`.ops-button`)

```
.ops-button--primary  = navy background
.ops-button--gold     = brass background
.ops-button--secondary = white, bordered
.ops-button--ghost    = transparent, brass text
.ops-button--danger   = risk red
```

Min-height: **44px** on all interactive elements.

### Badges

```
.dk-badge + .dk-badge--ok / --warn / --risk / --info / --neutral
.status-badge + .success / .warning / .danger / .info / .gold / .neutral
```

### Cards

```
.dk-card                = standard surface card
.dk-card-head           = card header (title + action link)
.dk-statcard            = metric/stat card with edge accent
.ops-card               = operational section card
.field-review-card      = extraction review card (with blocking/warning/approved/na states)
```

### Navigation

```
.dk-rail / .dk-navitem / .dk-navitem.on     = desktop rail
.ak-bottomnav / .ak-navitem / .ak-navadd   = mobile bottom nav
.tab-nav                                    = pill-style tab row
.dk-tabs / .dk-tab / .dk-tab.on            = navy workspace tabs
```

### Workspace header band

```
.dk-dealhead  = full-width navy header with property address + parties
.dk-tabs      = navy tab bar below dealhead
```

Use `dk-dealhead` on transaction workspace pages. Do not use the flat `PageHeader` for deal detail screens.

### Extraction review

```
.field-review-card      = individual field card
.field-review-card--blocking / --warning / --approved / --na
.field-action-btn       = action buttons (approve / edit / na / unavailable)
.field-action-btn--approve / --na / --danger
.evidence-drawer        = right-panel evidence panel
.review-decision-bar    = sticky top bar with progress + actions
.triage-section         = collapsible field group
.confidence-bar         = visual confidence indicator
```

### Data display

```
.dk-deal                = transaction row (house icon | address/meta | action)
.dk-dl                  = deadline row (date | title | right action)
.dk-task                = task row (checkbox | title | meta)
.dk-audit               = audit row (action | meta | timestamp)
.dk-kv                  = key-value grid (160px key | remaining value)
.dk-li                  = generic list item (icon | body)
```

---

## AI extraction review rules

These are hard rules — never relax them.

1. Every extracted field must show: label, extracted value, confidence score (visual + numeric), source/evidence
   reference, and review status.
2. Bulk approve is only enabled for `confidence ≥ 0.85`, non-blocking, non-required fields.
3. Never show "Approve All" without filtering — it must skip blocking and low-confidence fields.
4. Every field must have 4 actions: Approve, Edit, Mark N/A, Mark Unavailable.
5. The UI must communicate "AI prepares, human approves" — use language like "Contractor-prepared" not "AI generated."
6. Missing fields get a warning state, not a silent empty state.
7. Evidence text and source page are required display elements, not optional.
8. Review progress (X of Y reviewed) must be visible at all times during review.

---

## Status rules

| Status          | Badge class             | Meaning              |
|-----------------|-------------------------|----------------------|
| Deadline risk   | `dk-badge--risk`        | ≤3 days or past due  |
| Needs review    | `dk-badge--warn`        | Human review pending |
| Active/on-track | `dk-badge--ok` or brass | Working normally     |
| Closed          | `dk-badge--neutral`     | File complete        |
| Information     | `dk-badge--info`        | System information   |

---

## Mobile-first layout rules

1. Min touch target: **44×44px** on all interactive elements (buttons, nav items, task rows, deadline rows).
2. Cards over tables on mobile — never render horizontal-scroll tables below 640px without an explicit scroll wrapper
   and `aria-label`.
3. Bottom nav overlap: all page content must have `padding-bottom: 76px` on mobile (handled by `.ops-shell`).
4. Sticky action footer (`.saf`) for multi-step flows (upload, review): position `fixed`, `bottom: 70px` (above nav),
   full width.
5. Action sheets over dropdowns for status changes on mobile.
6. Single primary action visible above the fold on every mobile screen.
7. Property addresses truncate with `text-overflow: ellipsis` at narrow widths.
8. No hover-only affordances — all interactions must be keyboard and tap accessible.

---

## Accessibility rules

1. **Focus ring**: `3px solid rgba(172,141,83,.55)` — built into `:focus-visible` globally.
2. **Skip link**: Present on every AppShell page (`href="#main-content"`).
3. **Reduced motion**: Global `prefers-reduced-motion` handler in globals.css — do not add animations without testing.
4. **Semantic HTML**: Nav = `<nav>`, Page content = `<main>`, Sections = `<section aria-labelledby>`, Lists =
   `<ul>/<ol>/<li>`.
5. **Icon buttons**: Every icon-only button must have `aria-label`.
6. **Status not color alone**: Every status indicator must pair a color badge with a text label.
7. **Form labels**: Every input must have an explicit `<label>` with `htmlFor`.
8. **`aria-live`**: Any status change visible to the user (task update, bulk approve) must update an
   `aria-live="polite"` region.
9. **Contrast**: All text ≥4.5:1 on its background. Never use `--fg3` for body text (captions/metadata only).
10. **Table captions**: All `<table>` elements must have a `<caption>`.

---

## Do NOT do

- Do not use `style={{}}` inline objects for color, layout, or typography — use CSS classes and tokens.
- Do not scatter one-off spacing/sizing — use `--s-*` tokens.
- Do not use emoji as UI icons — use SVG with `aria-hidden="true"`.
- Do not rely on hover for primary interactions — brokers use phones.
- Do not show raw UUID strings as primary identifiers in the broker UI — format or shorten.
- Do not say "AI generated" or "automatically extracted" — say "contract-prepared" or "extracted for review."
- Do not show confidence scores to clients in the client portal view.
- Do not enable bulk approve for blocking fields or fields with confidence < 0.85.
- Do not use the flat `PageHeader` for transaction detail screens — use `dk-dealhead`.
- Do not add dead routes to navigation — every nav item must point to a real page.
- Do not use `onMouseEnter`/`onMouseLeave` for CSS transitions — use CSS `:hover` rules instead.
- Do not render 4-column tables on mobile without a horizontal scroll wrapper.

---

## Activity feed patterns

### Activity summary card (`.dk-actsummary`)

Dark navy card at the top of the activity tab. Shows:

- Stats grid: fields reviewed, tasks completed, deadline updates, doc events, total events
- "Recent notable actions" list with color-coded dots

### Activity feed (`.dk-actfeed`, `.dk-actevent`)

Grouped by calendar day using `.dk-actday` headers (Today / Yesterday / day name / full date).

Each event row has:

- Icon badge (28px, rounded, tone-colored): `--ok`, `--warn`, `--info`, `--risk`, or `--default`
- Label (human-readable, not raw `event_type_name`)
- Detail line (entity type · actor)
- Value change chip (mono, green) if before/after values are short enough
- Timestamp (mono, right-aligned)

**Event label rule:** Always use `EVENT_LABELS` mapping or title-case fallback. Never display raw underscored event type
names to brokers.

**Tone rules:**

- `ok` — field approved, task completed, post-close done
- `warn` — deadline changes
- `info` — document uploads, extraction events, contact updates
- `risk` — field rejected
- `default` — everything else

---

## Editable contact cards (`.dk-contact-card`)

Used inside transaction workspace contacts tab. NOT for the vendor rolodex.

**Read state:** Role eyebrow → Name (serif) → Company → phone/email links → status badge + Edit button.

**Edit state:** Inline form replaces body. 2-column grid: Name + Company / Email + Phone. Save/Cancel buttons. Error
alert below fields. Success feedback appears in footer for 3s then fades.

**Data model note:** Contact edits PATCH `/contacts/{id}` which updates the transaction-specific contact record (not a
global vendor record). Contacts are always `transactionId`-scoped.

---

## Document viewer (`.dk-docviewer-*`)

Full-screen modal overlay. Structure:

- Header: Close button · filename (serif, truncated) · search hint · Download button
- Body: Loading/error/ready state

**Loading:** spinner + "Loading document…"
**Error:** alert icon + "Preview unavailable" + Try again + download fallback
**Ready:** full-height `<iframe>` with blob URL

**Security rule:** Documents are fetched as blobs via `api.getDocumentBlob(id)` which calls
`GET /documents/{id}/download` with the Authorization header. The blob URL is revoked on modal close. Never expose auth
tokens in iframe src URLs.

**Search hint:** Shows "Click inside, then press ⌘F / Ctrl+F to search" only on PDF files when viewer is ready.

---

## Source documents list (`.dk-sourcedoc-row`)

Compact list inside the documents tab above the requirement checklist. Each row:

- File icon (info-surface background)
- Filename + meta (type · size · upload date)
- "View" button → opens DocumentViewer modal

---

## Hierarchical overrides

Page-specific deviations from this MASTER live in `design-system/pages/`:

- `pages/landing.md` — marketing landing page (no AppShell, lp-* classes, touch targets, hover rules)
- `pages/contacts.md` — vendor rolodex page (trade categories, CSS hover, edit persistence model)
- `pages/transaction-detail.md` — workspace page (dk-dealhead, tabs, contact edit, activity feed, document viewer)
- `pages/review.md` — extraction review specific rules (if created)
- `pages/dashboard.md` — dashboard layout rules (if created)
