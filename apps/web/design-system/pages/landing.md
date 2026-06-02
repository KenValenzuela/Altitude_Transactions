# Landing Page — Design System Override

**Inherits from:** `design-system/MASTER.md`  
**Route:** `/` (src/app/page.tsx)  
**Purpose:** Marketing / trust-building page for brokers who haven't yet signed in.

---

## Deviations from MASTER

### Layout

- No `AppShell`, no `dk-app` grid, no `dk-rail`, no `ak-bottomnav`
- Full-width sections with `clamp()` responsive padding
- Not constrained to `ops-main` max-width

### Colors

- Hero and CTA sections use `--bg-navy` background with white text
- Feature cards use `--bg-surface` (white) on `--bg-app` (paper) canvas
- Trust section uses `--bg-surface`
- Alternating section backgrounds create visual rhythm: navy → white → paper → white → navy

### Typography

- Hero h1: `.lp-hero-h1` — `var(--font-serif)`, `clamp(2.25rem, 6vw, 4rem)`, white on navy
- Section h2: `.lp-section-h2` — `var(--font-serif)`, `clamp(1.5rem, 4vw, 2.5rem)`
- Eyebrows: `.alt-eyebrow` — `var(--font-mono)` 10px uppercase (special landing variant)
- Body: `var(--font-sans)` 15px, color `rgba(255,255,255,0.72)` on dark, `--fg2` on light

### Touch targets

- All nav and CTA links: `height: 44px` minimum (44px touch target rule)
- Hero CTAs: `height: 52px` (primary) for visual prominence

### CTAs

- Primary CTA: `.lp-cta-primary` — brass-500 background, navy text, 52px height
- Outline CTA: `.lp-cta-outline` — transparent, white border, white text
- Nav sign-in: `.lp-nav-signin` — ghost with white border, 44px
- Nav get-started: `.lp-nav-cta` — brass-500, 44px

### Hover

- Step cards: `translateY(-2px)` + `shadow-md` + `brass-300` border (CSS-only)
- Feature cards: `translateY(-2px)` + `shadow-md` (CSS-only)
- No `onMouseEnter`/`onMouseLeave` — all hover via CSS classes

### Icons

- Feature cards each have a 36×36px `.lp-feature-icon` SVG badge
- Icon color families: `--warn` (deadlines), `--info` (contacts/review), `--brass` (documents), `--ok` (closeout)
- No emoji icons anywhere

### Performance

- Fonts: Spectral, Hanken Grotesk, IBM Plex Mono via `next/font` (preloaded in layout.tsx) ✓
- No images requiring `next/image` (SVG brand marks only)
- No heavy dependencies

### Accessibility

- Skip link present: `href="#main-content"` ✓
- `aria-labelledby` on all `<section>` elements ✓
- `role="navigation"` + `aria-label` on nav ✓
- `role="contentinfo"` on footer ✓
- All icon-only elements use `aria-hidden="true"` ✓

---

## Do NOT do on landing page

- Do not show AppShell, sidebar, or bottom nav
- Do not use Tailwind utility classes (not loaded on this page)
- Do not use inline `style={{}}` for colors, layout, or typography — use `.lp-*` classes
- Do not use `onMouseEnter`/`onMouseLeave` — use CSS hover
- Do not add CTAs to routes that don't exist
