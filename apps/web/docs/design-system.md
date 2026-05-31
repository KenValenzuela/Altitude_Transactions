# Altitude Transactions — Design System

Colorado residential real estate transaction management.
Brand thesis: **"Altitude combines white-glove real estate transaction coordination with intelligent contract-to-close systems."**

---

## Palette

All canonical tokens are defined as `--alt-*` CSS variables in `globals.css`.

| Token | Hex | Usage |
|---|---|---|
| `--alt-navy` | `#00102A` | Midnight navy — sidebar, deep backgrounds |
| `--alt-navy-900` | `#071827` | Primary brand — page headers, primary buttons |
| `--alt-navy-800` | `#0B2239` | Navy surface — secondary actions, progress |
| `--alt-gold` | `#D6A84F` | Refined gold — primary CTAs, milestones, brand accents |
| `--alt-gold-dk` | `#B98A2E` | Gold hover state |
| `--alt-gold-lt` | `#F7ECD0` | Gold tint — badge backgrounds |
| `--alt-bg` | `#F8FAFC` | App background |
| `--alt-surface` | `#FFFFFF` | Card / panel surface |
| `--alt-border` | `#E2E8F0` | Default border |
| `--alt-border-strong` | `#CBD5E1` | Emphasized border |
| `--alt-text` | `#0F172A` | Primary text |
| `--alt-muted` | `#64748B` | Secondary text, labels, metadata |
| `--alt-success` | `#2E7D5B` | Completed states |
| `--alt-warning` | `#B7791F` | Due-soon / deadline risk / amber urgency |
| `--alt-danger` | `#B42318` | Overdue / critical / error |
| `--alt-info` | `#2563EB` | AI extraction, evidence, confidence, review metadata |
| `--alt-info-tint` | `#EFF6FF` | AI badge background |

---

## Color Usage Rules (60/30/10)

- **60%** Neutral surfaces and backgrounds (`--alt-bg`, `--alt-surface`, `--alt-border`)
- **30%** Navy/slate brand structure (`--alt-navy-900`, `--alt-navy-800`, `--alt-navy`)
- **10%** Gold accent/action (`--alt-gold`, `--alt-gold-dk`)

### Semantic rules

| Color | Use for | Do NOT use for |
|---|---|---|
| Gold | Primary CTAs, milestones, selected states, brand marks | AI confidence, status logic, extraction evidence |
| Blue (info) | AI extraction, source evidence, confidence scores, review metadata | Brand, navigation, primary actions |
| Green | Completed / success states only | Progress indicators mid-deal |
| Amber | Due-soon, deadline risk, attention items | Generic information |
| Red | Critical / overdue / errors | Warnings or attention |
| Muted gray | N/A, archived, disabled, low-priority | Active workflow items |

---

## Typography

- **Display / headings**: `Instrument Serif` — hero text, property names, milestone labels
- **UI / body**: `Geist` — all operational interfaces, forms, tables, metadata
- **Mono**: `Geist` with `font-feature-settings: "tnum"` — dates, prices, confidence %, contract refs

### Hierarchy

| Level | Size | Weight | Usage |
|---|---|---|---|
| Page title | `clamp(1.75rem, 5vw, 3rem)` | 700 | Dashboard/screen headings |
| Section title | `clamp(1.35rem, 4vw, 2rem)` | 600 | Card/section headings |
| Label | `.7rem` + `letter-spacing: .13em` | 700 | Eyebrows, column headers |
| Body | `.9rem–1rem` | 400–500 | Content, descriptions |
| Metadata | `.8rem–.85rem` | 400 | Dates, sub-labels |
| Badge | `.73–.78rem` | 700 | Status pills |

---

## Component Rules

### Buttons

| Class / variant | Background | Text | Use |
|---|---|---|---|
| `ops-button--gold` | `--alt-gold` | `--alt-navy` | Primary CTA — upload, confirm, start |
| `ops-button--primary` | `--alt-navy-900` | white | Secondary primary — nav actions |
| `ops-button--secondary` | white | `--alt-navy-900` | Outline actions |
| `ops-button--ghost` | transparent | `--alt-navy-900` | Dismissal, cancel |
| `ops-button--danger` | `--alt-danger` | white | Destructive actions |

All buttons: `min-height: 44px` (touch target), `border-radius: 999px`.

### Cards

- `ops-card`: white surface, `--alt-border` border, `1.15rem` radius, soft shadow
- Urgent transactions: `border-left: 3px solid var(--alt-warning)`
- AI/extraction panels: `background: var(--alt-info-tint)`, `border: 1px solid var(--alt-info-border)`

### Badges

- `status-badge.neutral` — Gray, archived / N/A
- `status-badge.success` — Green, completed
- `status-badge.warning` — Amber, deadline risk / needs attention
- `status-badge.danger` — Red, overdue / critical
- `status-badge.gold` — Gold, in-progress / under contract
- `status-badge.info` — Blue, AI-extracted / pending review

### Audit timeline

- Left border: `3px solid var(--alt-gold)` — gold mark for milestone events
- White surface cards on app background

### Progress bars

- Background: `--alt-border`
- Fill: `--alt-navy-800` (complete), `--alt-gold` (in-progress via stacked divs in screen components)

---

## Sidebar / Navigation

- Background: `--alt-navy` (`#00102A`)
- Brand mark: gold metallic gradient (`linear-gradient(150deg, #E7CB7E, #C9A14A, #9C7726, #D8B968)`)
- Active nav item: `background: rgba(214,168,79,.12)`, `color: var(--alt-gold)`
- Hover: `background: rgba(255,255,255,.07)`, `color: white`
- Footer note: `rgba(255,255,255,.45)` — CTME trust disclaimer

## Mobile Nav

- Background: `rgba(7,24,39,.95)` (dark navy glass)
- Border: `rgba(214,168,79,.18)` — subtle gold ring
- Active/hover: gold icon + gold-tinted background

---

## Accessibility Checklist

- All interactive elements: `min-height: 44px` touch targets
- Focus states: `outline: 3px solid rgba(37,99,235,.4)` (info blue)
- Color is never the sole indicator — always pair with text or icon
- Screen reader: `.sr-status` class for ARIA live regions
- Reduced motion: all animations disabled via `prefers-reduced-motion: reduce`
- Skip link: `.skip-link` → `#main-content`
- Form labels: all inputs must have associated `<label>`
- Contrast: minimum 4.5:1 for normal text, 3:1 for large text
- Keyboard nav: tab order matches visual order; no focus traps

---

## Screen Contexts

| Context | Visual register | Notes |
|---|---|---|
| Landing / hero | Cinematic — navy dark, gold accents | `alt-topo` topographic gradient |
| Dashboard / ops | Clean, operational SaaS | White cards, navy structure |
| Extraction / loading | Dark immersive — navy bg | Info blue for AI steps |
| Review screen | Clean table / form | Blue for AI evidence, navy for confirmed |
| Deadlines / tasks | Urgency-forward | Amber for due-soon, red for overdue |
| Post-close | Lighter, celebratory | Success green for completed items |
