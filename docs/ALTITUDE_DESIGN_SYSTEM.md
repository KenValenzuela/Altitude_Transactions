# Altitude Transactions — Design System

**Date:** 2026-05-29
**Stack:** Next.js 15 (web) → React Native / Expo (mobile, planned)
**Source of truth for CSS tokens:** `project/tokens.css` and `apps/web/src/app/globals.css`
**Source of truth for shared theme:** `packages/shared/src/theme.ts` (planned Phase 4)

---

## Brand Context

The Altitude brand communicates:

- Premium but not flashy
- Colorado mountain trust signal
- Deep navy foundation with restrained gold accent
- Calm operational confidence
- Concierge-level service, not luxury hotel aesthetic
- Intelligent systems — AI-enabled workflow with human review

**Design translation rule:** Translate inspiration into a usable product interface. Readable, fast, mobile-first,
accessible, operational. Not a navy/gold luxury poster.

---

## 1. Semantic Color Tokens

All tokens are defined as CSS custom properties. The token names below are the canonical semantic names; the CSS
variable names in parentheses are the implementation aliases used in the current app.

### Foundation — surfaces and canvas

| Semantic name    | CSS variable    | Value (light) | Value (dark) | Use                               |
|------------------|-----------------|---------------|--------------|-----------------------------------|
| Canvas           | `--bone`        | `#F2F4F7`     | `#0E1626`    | App background, page canvas       |
| Surface          | `--paper`       | `#FFFFFF`     | `#16203A`    | Cards, panels, inputs             |
| Recessed surface | `--paper-2`     | `#ECEFF4`     | `#111A30`    | Nested surfaces, tab bars         |
| Hairline         | `--line`        | `#E3E7EE`     | `#243150`    | Dividers, borders, input outlines |
| Strong border    | `--line-strong` | `#C9D1DC`     | `#364668`    | Emphasized borders, separators    |

### Ink — text hierarchy

| Semantic name          | CSS variable | Value (light) | Value (dark) | Use                                  |
|------------------------|--------------|---------------|--------------|--------------------------------------|
| Primary text           | `--ink`      | `#14223F`     | `#EDF1F7`    | Body text, headings, primary content |
| Secondary text         | `--ink-2`    | `#38445C`     | `#C2CADB`    | Supporting text, labels              |
| Tertiary text          | `--ink-3`    | `#6B7488`     | `#8B95AC`    | Captions, eyebrows, placeholder      |
| Disabled / placeholder | `--ink-4`    | `#9AA1B0`     | `#646E86`    | Placeholder text, disabled states    |

### Brand navy — 20% of UI

| Semantic name | CSS variable  | Value (light) | Value (dark) | Use                                    |
|---------------|---------------|---------------|--------------|----------------------------------------|
| Brand navy    | `--sage`      | `#1E3A66`     | `#6E97D6`    | Links, icons, active states, nav       |
| Deep navy     | `--sage-deep` | `#14223F`     | `#A9C3EC`    | Headings on tinted backgrounds         |
| Navy fill     | `--sage-soft` | `#D6DFEC`     | `#1E3157`    | Complete badge background              |
| Navy tint     | `--sage-tint` | `#EAF0F8`     | `#182646`    | Section tints, tinted card backgrounds |

*Note: The CSS variable names use `--sage*` for historical compatibility. Semantically these are all navy tones.*

### Gold — 10% accent only

| Semantic name          | CSS variable      | Value                                                                         | Use                                                                        |
|------------------------|-------------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| Gold accent            | `--gold`          | `#B8862F`                                                                     | In-progress status, active timeline progress, primary CTA on dark surfaces |
| Gold soft              | `--gold-soft`     | `#F4E8CC` (light) / `#382C16` (dark)                                          | In-progress badge background                                               |
| Gold metallic gradient | `--gold-metallic` | `linear-gradient(150deg, #E7CB7E 0%, #C9A14A 40%, #9C7726 78%, #D8B968 100%)` | Logo/brand moments only                                                    |

**Gold usage rule:** Gold is only used for:

1. The logo mark and brand lockup
2. The primary action button on dark/navy surfaces
3. Active timeline segment and progress fill
4. In-progress status badge
5. Splash/brand moment screens

Gold is **not** used for: every border, every icon, every heading, card backgrounds, hover states, or decorative
dividers.

### Status palette — 10% of UI

| Semantic name         | CSS variable               | Bg (light) | Fg        | Use                                 |
|-----------------------|----------------------------|------------|-----------|-------------------------------------|
| Overdue / error       | `--clay` / `--clay-soft`   | `#F3DCD6`  | `#B0493B` | Overdue deadlines, errors, alerts   |
| In progress / warning | `--gold` / `--gold-soft`   | `#F4E8CC`  | `#B8862F` | In-progress tasks and fields        |
| Not started           | `--slate` / `--slate-soft` | `#DEE3EC`  | `#5C6B82` | Not-started tasks, pending items    |
| Complete / success    | `--sage-soft` / `--sage`   | `#D6DFEC`  | `#1E3A66` | Completed items, approved fields    |
| N/A                   | `--na` / `--na-soft`       | `#E8EBF0`  | `#9AA1B0` | Not-applicable fields and deadlines |

---

## 2. Typography Hierarchy

**Two typefaces only.** Do not introduce a third.

| Role                 | Family           | CSS variable  | Weight  | Size range                 | Use                                       |
|----------------------|------------------|---------------|---------|----------------------------|-------------------------------------------|
| Display / hero       | Instrument Serif | `--f-display` | 400     | `clamp(2rem, 6vw, 4.5rem)` | Screen titles, hero moments, walkthrough  |
| Screen title         | Geist            | `--f-sans`    | 600     | `1.5rem – 2rem`            | Page `<h1>` in operational screens        |
| Section heading      | Geist            | `--f-sans`    | 600     | `1rem – 1.125rem`          | Card headers, section labels              |
| Body                 | Geist            | `--f-sans`    | 400     | `1rem` (16px min)          | All operational content                   |
| Caption              | Geist            | `--f-sans`    | 400     | `0.875rem`                 | Supporting text, timestamps               |
| Eyebrow label        | Geist            | `--f-mono`    | 600     | `0.625rem` (10px)          | Uppercase section categories, field types |
| Data / date / amount | Geist + tnum     | `--f-mono`    | 400–500 | `0.875rem – 1rem`          | Dates, prices, counts, deadlines          |

**Line height:** 1.5–1.6 for body text. 1.0–1.1 for display. 1.3 for headings.
**Line length:** Maximum 70 characters for body paragraphs. Operational data rows have no cap.
**Font features:** `"ss01"` and `"cv11"` on body for Geist OpenType polish. `"tnum"` on data/mono for tabular number
alignment.

### Mobile typography adjustments

- Body text minimum: 16px — never below this on mobile
- Touch labels minimum: 14px — readable at arm's length
- Display text: use `clamp()` to scale down gracefully on 375px screens
- Do not use Instrument Serif for body — too heavy to render well at small sizes

---

## 3. Spacing Scale

| Token name | Value  | Use                                              |
|------------|--------|--------------------------------------------------|
| `--sp-1`   | `4px`  | Tight gap between inline elements                |
| `--sp-2`   | `8px`  | Gap between icon and label, badge padding        |
| `--sp-3`   | `12px` | Compact internal padding                         |
| `--sp-4`   | `16px` | Standard card padding, form field height padding |
| `--sp-5`   | `20px` | Comfortable card padding                         |
| `--sp-6`   | `24px` | Section gap                                      |
| `--sp-8`   | `32px` | Major section break                              |
| `--sp-10`  | `40px` | Page-level spacing                               |
| `--sp-12`  | `48px` | Hero padding                                     |

**Density system (existing):** `--row-h`, `--pad`, `--gap` are driven by `[data-density]` attribute:

- `compact`: 48px rows, 12px pad, 10px gap
- `regular`: 56px rows, 16px pad, 14px gap
- `comfy`: 64px rows, 20px pad, 18px gap

**Mobile:** Default to `regular` density on mobile. `compact` only for dense data tables.

---

## 4. Radius and Elevation

### Radius scale

| Token    | Value     | Use                                |
|----------|-----------|------------------------------------|
| `--r-xs` | `6px`     | Chips, pills, small badges         |
| `--r-sm` | `10px`    | Inputs, small cards, toggle tracks |
| `--r-md` | `14px`    | Standard cards, dropdowns          |
| `--r-lg` | `20px`    | Large panels, section containers   |
| `--r-xl` | `28px`    | Sheets, modals, bottom sheets      |
| `999px`  | Full pill | Status pills, avatar circles       |

### Elevation (shadow)

| Token    | Value                                                          | Use                            |
|----------|----------------------------------------------------------------|--------------------------------|
| `--sh-1` | `0 1px 0 rgba(20,34,63,.04), 0 1px 2px rgba(20,34,63,.05)`     | Subtle — standard card surface |
| `--sh-2` | `0 2px 4px rgba(20,34,63,.05), 0 8px 24px rgba(20,34,63,.07)`  | Raised — hover state, dropdown |
| `--sh-3` | `0 30px 70px rgba(20,34,63,.20), 0 0 0 1px rgba(20,34,63,.08)` | Modal — drawers, dialogs       |

**Elevation rule:** Shadows use navy-tinted color (`rgba(20,34,63,...)`) not black. This maintains brand coherence on
both light and dark surfaces.

---

## 5. Button Variants

| Variant         | Background           | Text                | Border       | Use                                                            |
|-----------------|----------------------|---------------------|--------------|----------------------------------------------------------------|
| **Primary**     | `--sage` (`#1E3A66`) | white               | none         | Default main action in light context                           |
| **CTA accent**  | `--gold` (`#B8862F`) | `--ink` (`#14223F`) | none         | Single most important action on dark surfaces (one per screen) |
| **Secondary**   | `--paper` (white)    | `--ink`             | `1px --line` | Supporting actions                                             |
| **Ghost**       | transparent          | `--ink-3`           | none         | Tertiary actions, icon buttons                                 |
| **Destructive** | `--clay-soft`        | `--clay`            | `1px --clay` | Delete, reject, overdue actions                                |
| **Disabled**    | `--line`             | `--ink-4`           | none         | Any button in loading/disabled state                           |

**Minimum size:** 44×44px touch target on all interactive elements.
**Hover:** `background-color` transition at 150ms. No layout-shifting scale transforms.
**Loading state:** Disable button and show inline spinner. Never submit twice.
**Cursor:** `cursor: pointer` on all clickable elements.

---

## 6. Card Variants

| Variant           | Background                | Border                                          | Shadow   | Use                                  |
|-------------------|---------------------------|-------------------------------------------------|----------|--------------------------------------|
| **Default**       | `--paper`                 | `1px --line`                                    | `--sh-1` | Standard content card                |
| **Tinted**        | `--sage-tint`             | `1px --line`                                    | none     | Section groupings, review queue rows |
| **Dark**          | `--sage-deep` / `#0f1d36` | none                                            | `--sh-2` | Sidebar, top bar, mobile nav         |
| **Status accent** | `--paper`                 | `1px --line`, `3px left border in status color` | `--sh-1` | Deadline and task cards with status  |
| **Elevated**      | `--paper`                 | `1px --line`                                    | `--sh-2` | Hover state, expanded cards          |
| **Recessed**      | `--paper-2`               | `1px --line`                                    | none     | Evidence drawers, nested content     |

---

## 7. Status Badge Variants

All badges use `.alt-pill` base class: `height: 22px`, `padding: 0 8px`, `border-radius: 999px`, `font-size: 11px`,
`font-weight: 500`.

| State              | Background     | Text color    | Optional indicator         |
|--------------------|----------------|---------------|----------------------------|
| **Complete**       | `--sage-soft`  | `--sage-deep` | Filled dot                 |
| **In Progress**    | `--gold-soft`  | `--gold`      | Pulsing dot (`.alt-pulse`) |
| **Pending Review** | `--gold-soft`  | `--gold`      | Pulsing dot                |
| **Not Started**    | `--slate-soft` | `--slate`     | Empty dot                  |
| **Overdue**        | `--clay-soft`  | `--clay`      | Filled dot                 |
| **N/A**            | `--na-soft`    | `--na`        | Dash                       |
| **AI Extracted**   | `--sage-tint`  | `--sage`      | Sparkle icon (SVG)         |

**Rule:** Color is never the only indicator. Always pair color with a text label or icon. This satisfies WCAG 1.4.1.

---

## 8. Timeline and Deadline UI Rules

### Vertical timeline component

```
● [date label]  [days remaining]  [status badge]
│  Task or deadline description
│
● [date label]  [days remaining]  [status badge]
│  ...
```

- Rail: `2px` vertical line, color `--line`
- Dot: `10px` circle, color = status color
- Today marker: `1px` horizontal rule in `--gold` across the rail
- Overdue items: `--clay` dot + bold date + `.clay-soft` tint on row
- Completed items: `--sage` dot, text `--ink-3` (dimmed), optional strikethrough
- Active/upcoming: `--sage` dot, full ink text weight

### Mobile timeline rules

- Full-width rows with 16px left padding for the rail
- Date in `--f-mono` / `tnum`
- Days-remaining in bold if ≤ 7 days
- Tap target: entire row is tappable (min 44px height)
- Do not use horizontal timeline on mobile — vertical only

---

## 9. Document Upload and Review UI Rules

### Upload zone

- Border: `2px dashed --line`
- Background: `--sage-tint`
- Content: centered icon (upload SVG) + short label
- On drag hover: border → `2px solid --sage`, background → `--sage-soft`
- On file selected: replace with file name + size + remove action

### Extraction progress

- Progress bar with `--gold` fill, `--line` track
- Shimmer animation (`.alt-shimmer`) during active extraction
- Field count label: "Extracting 24 fields…"
- Never auto-advance without user confirmation

### Review table / cards

- Each field: name | extracted value | confidence chip | approve / edit actions
- Confidence chip: percentage in `--f-mono`, color scales from `--clay` (< 70%) to `--sage` (≥ 90%)
- Evidence drawer: slides up from bottom (bottom sheet on mobile), shows source document page/section
- Approved fields: `--sage` checkmark icon, row dimmed to `--ink-3`
- Edited fields: `--gold` pencil icon, value shown in `--gold` text
- Rejected fields: `--clay` X icon, row crossed out

### Review rules

- Every field must show its source evidence reference
- Never mark a field as approved automatically
- Always show "AI-extracted — pending your review" label
- Provide batch approve-all with a confirmation step

---

## 10. Empty, Loading, and Error States

### Loading

- Skeleton: `--line` background, shimmer animation, matches the shape of the content it replaces
- For lists: 3–4 skeleton rows, same height as real rows
- For cards: skeleton card with placeholder bar lines
- Never show a blank screen — always show skeleton or spinner

### Empty state

- Centered SVG icon (from the operational domain — document, calendar, person)
- Short label: `--ink-2`, 16px
- Supporting text: `--ink-3`, 14px, max 2 lines
- Optional CTA: secondary button
- No emojis

### Error state

- `--clay-soft` background banner or card
- `--clay` icon + error message
- Message: plain language, not technical error codes
- Retry action: secondary button
- If partial data loaded, show data with error banner — don't blank the screen

---

## 11. Mobile Accessibility Rules

| Rule                  | Requirement                                                                |
|-----------------------|----------------------------------------------------------------------------|
| Touch target minimum  | 44×44px for all interactive elements                                       |
| Touch spacing         | 8px minimum gap between adjacent targets                                   |
| Text contrast         | 4.5:1 minimum for normal text; 3:1 for large text (18px+)                  |
| Focus state           | `outline: 3px solid rgba(201,161,74,.45); outline-offset: 3px` (existing)  |
| Color-only indicators | Never — always pair with text label or icon                                |
| Form labels           | Every input has a visible `<label>` or `aria-label`                        |
| Alt text              | All meaningful images; `alt=""` for decorative                             |
| Screen reader         | Use semantic HTML: `<main>`, `<nav>`, `<section>`, `<button>`              |
| Skip link             | Provide skip-to-main for keyboard users on nav-heavy pages                 |
| Reduced motion        | Disable shimmer and pulse animations when `prefers-reduced-motion: reduce` |
| Font size minimum     | 16px body text on mobile — never smaller                                   |
| Viewport              | `width=device-width, initial-scale=1` on all pages                         |

---

## 12. Motion Rules

| Motion type                              | Duration  | Easing                  | Notes                                            |
|------------------------------------------|-----------|-------------------------|--------------------------------------------------|
| Micro-interaction (button press, toggle) | 150ms     | ease                    | Color/opacity only                               |
| Hover state                              | 140–200ms | ease                    | No layout-shifting transforms                    |
| Screen transition                        | 280ms     | ease-in-out             | Slide or fade between pages                      |
| Progress bar fill                        | 400ms     | ease-out                | Communicates loading                             |
| Skeleton / shimmer pulse                 | 1.8s      | ease-in-out             | Infinite — disable with `prefers-reduced-motion` |
| Bottom sheet open                        | 300ms     | cubic-bezier(.4,0,.2,1) | Slide up from bottom                             |
| Dropdown open                            | 180ms     | ease-out                | Fade + translate Y -4px                          |
| Success animation                        | 250ms     | ease                    | Scale 0.9 → 1.0 + color change                   |

**Rules:**

- Use `transform` and `opacity` — never `width`, `height`, or `top/left` for animations
- Active press: `transform: scale(.985)` at 120ms (existing `.alt-tap:active`)
- No bouncy spring effects in a professional operations tool
- `@media (prefers-reduced-motion: reduce)` must disable all looping animations

---

## 13. Gold Usage Rules

Gold is a **signal of importance**, not a decoration. It appears in exactly these contexts:

### Always gold

1. **Logo mark** — the brand monogram/wordmark uses `--gold-metallic` gradient
2. **Primary CTA on dark surfaces** — one button per screen that needs maximum prominence on a navy background
3. **Active timeline progress** — the filled portion of a progress track or timeline rail
4. **Today marker** — the horizontal line across the timeline indicating the current date

### Sometimes gold (with restraint)

5. **In-progress badge** — background `--gold-soft`, text `--gold`
6. **Pending review badge** — same as in-progress
7. **Focus ring** — `rgba(201,161,74,.45)` soft gold focus outline (existing)

### Never gold

- Every card border
- Every section heading
- Every icon
- Row hover states
- Navigation backgrounds (use navy instead)
- Badge borders (use background fill instead)
- Loading states (use navy shimmer instead)
- Error states (use clay/red instead)

---

## Token Alignment Status

| Token                   | Defined in `globals.css` | Defined in `tokens.css` | Notes                                            |
|-------------------------|--------------------------|-------------------------|--------------------------------------------------|
| Color tokens            | Yes                      | Yes (source of truth)   | Synchronized                                     |
| Typography vars         | Yes                      | Yes                     | Synchronized                                     |
| Radius vars             | Yes                      | Yes                     | Synchronized                                     |
| Shadow vars             | Yes                      | Yes                     | Synchronized                                     |
| Density vars            | Yes                      | Yes                     | Synchronized                                     |
| Spacing vars (`--sp-*`) | No                       | No                      | **To add in Phase 4 `packages/shared/theme.ts`** |
| Z-index scale (`--z-*`) | No                       | No                      | **To add in Phase 2 CSS update**                 |
| Skip link class         | No                       | No                      | **To add in Phase 2 CSS update**                 |

See `apps/web/src/app/globals.css` for the live implementation and `project/tokens.css` for the documented canonical
version.
