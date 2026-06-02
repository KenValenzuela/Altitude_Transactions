# Contacts Page — Design System Override

**Inherits from:** `design-system/MASTER.md`  
**Route:** `/contacts` (src/app/contacts/page.tsx)  
**Purpose:** Broker vendor rolodex — preferred vendors by trade category.

---

## Data model note

This page manages the broker's **vendor rolodex** (preferred service providers by trade).
It is **not** the transaction-party contact list (Buyer, Seller, Lender, etc.).

Transaction-specific contacts (Buyer, Seller, Buyer Agent, Seller Agent, Lender, Title, Inspector)
live in `ContactMatrix` inside the transaction workspace (`/transactions/[id]` → Contacts tab).

**Edit persistence:** Vendor edits are in local React state (no vendor API endpoint).
This is acceptable for the rolodex since vendors are broker-local preferences.
Transaction party contacts in `ContactMatrix` do persist via `PATCH /contacts/{id}`.

---

## Trade categories

```
inspection | plumbing | hvac | electrical | roofing | handyman
pest | title | lending | attorney | photography | staging | moving | landscaping
```

Each trade has: icon (SVG), label, and a color chip (mapped to design tokens or explicit hex).

---

## Deviations from MASTER

### Layout

- Uses `AppShell` (`.dk-app`, `.dk-rail`, `.dk-main`, `.dk-scroll`)
- `.dk-pagehead.dk-global-head` for page header
- Tables inside scrollable `<div style={{ overflowX: 'auto' }}>` with `min-width: 580px` — correct per rule

### Hover

- Table rows: use CSS class `.dk-vendor-row` (CSS hover, no JS handlers) ✓
- Add-vendor button: use CSS class `.dk-vendor-addlink` (CSS hover, no JS handlers) ✓
- **Do not** use `onMouseEnter`/`onMouseLeave` for style changes

### Tables

- Each trade group is a `<table>` with `<caption className="sr-only">` (accessibility ✓)
- Collapsed state hides `<tbody>` — uses `aria-expanded` + `aria-controls` ✓
- Minimum `minWidth: 580px` on table, wrapping `overflowX: 'auto'` on container ✓

### Search

- Search input: inline style for focus ring via `onFocus`/`onBlur` — acceptable since it's state-based (not hover)
- Filter chip buttons: inline style with active state toggle — acceptable since it's React state, not hover

### Editing

- Inline row edit (`VendorEditRow`) with 2-column grid of labeled inputs ✓
- Add vendor panel with trade selector ✓
- Error state with `role="alert"` ✓
- Labels use `htmlFor` ✓

---

## Do NOT do on contacts page

- Do not use `onMouseEnter`/`onMouseLeave` for visual hover effects — use CSS `.dk-vendor-row:hover`
- Do not create fake API persistence for vendor edits — keep in local state
- Do not mix transaction party roles (Buyer/Seller) into the vendor rolodex
- Do not render 4+ column tables without `overflowX: auto` wrapper on mobile
