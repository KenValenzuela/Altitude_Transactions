# Broker Portal Checklist States

_Started 2026-05-17 19:30 UTC_

---

## User

The broker portal should show:

Real-time transaction status
Deadlines and due dates
Calendar items
Buyer / seller / lender / title contacts
Document checklist
Task completion status
Comments / notes
Upcoming deadlines
Completed items
N/A items hidden from summaries

This lines up with the business plan’s agent portal spec: open files, deadline countdowns, transaction details, parties, dates, documents, communication logs, task lists, and reports.

Brett specifically said:

If septic documentation is not needed, he wants to click N/A so it does not show up in weekly summaries.

That means every checklist item needs at least four possible states:

Not Started
In Progress
Complete
Not Applicable

This matters because real estate transactions vary. A rural property may need septic or well documentation. A condo may need HOA documents. A cash deal may not need loan documents.

The Colorado document checklist supports this because it contains many conditional documents: HOA, septic, well, mineral rights, water rights, VA/FHA clauses, new construction, 1031 exchange, and other situational items.

## Assistant

_[tool: questions_v2]_

This is a meaty brief — a broker-facing operating system for Colorado contract-to-close transaction management. Before I start designing, I want to make sure I'm building the right thing. Let me ask a focused round of questions.

## User

Questions timed out; go with defaults

## Assistant

_[tool: list_files]_

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

The design system folder is empty, so I'll commit to a deliberate aesthetic direction: editorial + Colorado-coded — warm neutrals, deep slate, sage accent, an Instrument Serif/Geist Mono pairing. Premium and broker-friendly but not corporate fintech.

Let me set up the project and pull in the iOS frame.

_[tool: read_file]_

_[tool: read_file]_

_[tool: set_project_title]_

_[tool: write_file]_

Now to build. Starting with design tokens.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

## Assistant

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Built **Altitude.html** — a 12-screen interactive broker prototype.

**What's there**
- Login → Dashboard → Upload → AI Extracting (animated) → Review → Transaction Overview → Checklist → Deadlines → Parties → Documents → Weekly Summary → Post-close
- Every checklist item cycles through 4 states (tap the circle, or open the row for explicit picker)
- N/A items are hidden from active counts and the weekly summary
- Conditional docs (septic, well, HOA, mineral rights) flagged by the AI on extraction; sewer scope / full HOA covenants pre-marked N/A in the Conifer rural scenario
- CTME framed as the contract source of truth throughout — Altitude tracks around it

**Aesthetic**
- Editorial + Colorado-coded: bone neutrals, deep slate ink, sage accent, clay for warnings
- Instrument Serif (italic display) + Geist + Geist Mono
- Subtle topographic motifs in the property hero and post-close celebration

**Navigation**
- Click flow chips at top, use ← / → keys, or tap inside the phone
- **Tweaks**: theme (light/dark), accent palette, density, focus vs. filmstrip view, AI reasoning toggle, demo stage selector, and a 12-screen jump grid

**Caveats / next moves**
- Tweaks for `stage` and `showAIReasoning` are exposed but don't deeply rewire the demo data yet — let me know if you want stage to actually rewind the timeline
- Filmstrip view shows all 12 phones at once for board presentations; might want a print/PDF version of that
- All AI text and contract data is mocked from the Conifer scenario; happy to swap in a Denver condo or new-construction scenario if you want a second deal

