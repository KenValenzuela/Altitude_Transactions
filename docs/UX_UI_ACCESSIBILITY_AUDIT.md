# Altitude UX, Visual Design, Accessibility, and Architecture Audit

Date: 2026-05-30
Scope: Next.js App Router frontend, FastAPI API boundaries, typed workflow for dashboard → upload → extraction review → transaction workspace.

## Executive summary

Altitude already has a strong product concept and real FastAPI-backed workflow, but the current production-facing workflow is still too prototype-like. The main risks are compressed one-line components, weak semantic grouping, inconsistent component layering (`components/ui` vs `components/workflow`), limited empty/success/error states, insufficient mobile data-table behavior, and API contracts that exist but are not documented in a developer-friendly way. The upgrade should preserve the workflow while making the app feel more operational, review-oriented, source-backed, and trustworthy.

## Screens audited

| Screen | User goal | Current assessment |
| --- | --- | --- |
| `/dashboard` | Understand active transactions, risks, and next actions. | Functional but visually flat; metrics and cards need stronger hierarchy, empty state, clearer primary CTA, and less hardcoded deadline construction. |
| `/upload` | Upload a CTME PDF and begin extraction. | Core behavior is real, but the file input is visually hidden without an accessible label; success/progress state is minimal; route pushes to a missing extraction route. |
| `/review/[documentId]` | Review source-backed extracted fields and approve/build workspace. | Useful table and evidence drawer, but selected field is not keyboard-selectable, no approved count, no empty/error state, and primary action can be unclear before fields load. |
| `/transactions/[id]` | Operate a transaction: fields, deadlines, tasks, contacts, documents, activity. | Good domain coverage but too dense; tab links point to routes that do not exist; headings/sections need hierarchy; task updates are not wired from the workspace. |
| `/login` | Stub session and enter app. | Preserved prototype shell differs from workflow shell; acceptable for demo but should be reconciled later. |
| `/walkthrough` | Historical prototype reference. | Redirects to dashboard; README still describes it as preserved/runnable, which is inaccurate. |

## Audit findings and recommendations

### UX audit

| Issue                                                                       | Why it matters                                                                         | Recommended fix                                                                                           | Files/components affected                                          | Priority |
|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|----------|
| Dashboard loads into a skeleton-like state but has no explicit empty state. | Empty demos or API failures need clear recovery paths.                                 | Add `EmptyState`, improve error retry guidance, and clarify upload CTA.                                   | `apps/web/src/app/dashboard/page.tsx`, feedback components         | P0       |
| Transaction workspace has too many equally weighted sections.               | Users cannot quickly identify what needs attention next.                               | Add an overview/action strip, group sections with `SectionHeader`, and prioritize review/tasks/deadlines. | `apps/web/src/app/transactions/[id]/page.tsx`, workflow components | P0       |
| Upload success/progress is ambiguous.                                       | Uploading a contract is the first high-trust moment; users need reassurance.           | Add file requirements, status messaging, `aria-live`, busy state, and clear mocked extraction disclosure. | `UploadDropzone`, `/upload`                                        | P0       |
| Review flow lacks selection affordance and progress summary.                | Human review should make source confidence and next action obvious.                    | Add approved/pending summary, selectable table rows, disabled build action until ready, evidence details. | `/review/[documentId]`, review components                          | P1       |
| Workspace nav links point to non-existent nested routes.                    | Dead links break trust and keyboard users hit confusing navigation.                    | Convert tab links to in-page anchors until routes exist.                                                  | `/transactions/[id]`                                               | P0       |
| Task/deadline update workflow is incomplete.                                | The workflow promises operational tracking but updates are not wired in the workspace. | Wire task toggles to `PATCH /api/tasks/{id}` and reflect local state.                                     | `TaskChecklist`, `/transactions/[id]`, API client                  | P1       |
| Fake/local behavior is not visually marked.                                 | Users and developers need to know extraction/auth limitations.                         | Add copy in upload/review and document real-vs-mocked boundaries.                                         | README, docs, upload/review screens                                | P1       |

### Visual design audit

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| One-line components make UI hard to maintain and visually inconsistent. | Tiny changes are risky and hard to review. | Reformat and split primitives with clear variants and props. | `components/workflow/*` | P0 |
| Cards, rows, tables, and buttons share limited state styling. | Users cannot distinguish action, status, and static content. | Define button variants, status tones, section cards, compact rows, table captions. | CSS, `Button`, `StatusBadge`, cards/tables | P0 |
| Dashboard information density is low at top but high in workspace body. | Visual hierarchy should guide attention. | Use page header actions, metric grid, attention panel, and section grouping. | Dashboard/workspace pages | P1 |
| Mobile table behavior can overflow. | Review table is central to the workflow and must be usable on phones. | Add horizontal scroll with accessible label/caption, preserve cards/list layout elsewhere. | `ExtractionReviewTable`, CSS | P0 |
| Navigation lacks active/current context. | Users need orientation. | Add labels, semantic lists, consistent sidebar/mobile nav. | `SidebarNav`, `MobileNav` | P1 |

### Semantic HTML audit

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| App shell uses an `aside` for primary navigation. | Primary navigation should be a `nav` landmark. | Use `header`/`nav`/`main` landmarks; keep only complementary content as aside. | `AppShell`, `SidebarNav`, `MobileNav` | P0 |
| Page header nests actions inside title wrapper. | Screen reader and visual structure are less predictable. | Separate eyebrow/title/description from action slot. | `PageHeader` and pages | P0 |
| Upload file input has no explicit label. | Screen reader users need file input purpose and constraints. | Add `label`, helper text, accept text, and keep input keyboard reachable. | `UploadDropzone` | P0 |
| Repeated rows are plain div stacks. | Lists of tasks/deadlines should use list semantics. | Use `ul/li` or `ol/li` where appropriate. | `TaskChecklist`, `DeadlineList`, `AuditTimeline` | P1 |
| Tables lack caption/context and row header scope. | Review table needs accessible context. | Add caption, scoped headers, meaningful action text. | `ExtractionReviewTable`, `ExtractedFieldRow` | P0 |

### Accessibility audit

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| Focus styling is partial. | Keyboard users need visible focus across links, controls, file inputs. | Add universal `:focus-visible` styles and disabled styling. | `globals.css` | P0 |
| Async status is not announced. | Upload/review state changes can be missed. | Add `role="status"`/`aria-live` to loading and upload states. | `LoadingState`, `UploadDropzone`, pages | P0 |
| Icon/abbreviation-like brand mark has no accessible name. | Navigation landmark should identify product. | Add text alternative and labels. | `SidebarNav` | P2 |
| Touch targets may be under 44px. | WCAG 2.2 target size principle. | Ensure buttons/nav links are at least 44px high. | CSS/buttons/nav | P0 |
| Review action labels repeat “Approve”. | Screen reader users need context. | Use `aria-label`/visible field-specific labels. | `ExtractedFieldRow` | P1 |

### Component architecture recommendation

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| `components/workflow` mixes primitives and feature components. | Reuse and ownership are unclear. | Keep current path for low-risk migration but define primitives: `Button`, `Card`, `PageHeader`, feedback, data-display rows. | `components/workflow/*` | P1 |
| Pages contain data loading, layout, and feature composition together. | Harder to test and maintain. | Keep current pages but extract section components and utility helpers incrementally. | app routes, future `features/*` | P2 |
| Types are duplicated between `domain.ts` and `api.ts` with `any`. | Weak contracts undermine TypeScript. | Replace `any` with domain exports and `Record<string, unknown>` only where compatibility is required. | `types/api.ts`, `types/domain.ts` | P0 |

### Design system recommendation

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| Tokens exist but operational rules are undocumented. | Future developers need guidance. | Document color, spacing, radius, elevation, statuses, buttons, forms, responsive rules. | README, docs | P1 |
| Status colors are not consistently mapped to domain state. | Incorrect color semantics can mislead users. | Centralize status tone mapping. | `StatusBadge`, `DeadlineBadge`, `TaskStatusToggle` | P1 |
| Forms do not expose states consistently. | Upload/review forms require trust. | Add field labels, helper/error text, disabled states. | Upload/review components | P0 |

### Full-stack/API audit

| Issue | Why it matters | Recommended fix | Files/components affected | Priority |
| --- | --- | --- | --- | --- |
| Dashboard summary is computed client-side from transaction cards. | Fine for demo, but API contract should be explicit. | Add documented `DashboardSummary` contract and typed client method; backend endpoint can follow. | `types/domain.ts`, `api-client`, docs | P2 |
| Upload redirects to `/upload/{id}/extracting`, but route is absent. | Broken workflow after upload. | Create extraction progress route or redirect to existing review route when extraction is ready. | `/upload`, new route | P0 |
| Extraction review supports approve but not edit UI. | Product promises edit/approve; backend supports edits. | Add future task/known limitation and typed API method stays edit-capable. | README/docs, review components | P2 |
| Mock extraction is real-shaped but not visible enough in UI. | Trust and implementation honesty. | Add disclosure copy and docs. | Upload/review, README | P1 |

## Migration/refactor plan

1. Structural cleanup: format workflow components, strengthen domain/API types, add reusable section/card/feedback primitives.
2. Semantic/accessibility upgrade: landmarks, headings, captions, labels, focus, live status, button/link semantics.
3. Visual system upgrade: polish operational layout, metric cards, transaction cards, table, badges, upload panel, mobile nav.
4. Workflow polish: fix upload route, add extraction progress page, improve review/workspace states, wire task status updates.
5. Full-stack alignment: document API contracts and real vs mocked behavior; avoid pretending mocked extraction is real parsing.
6. Documentation/hardening: update README with architecture, contracts, setup, limitations, and next tasks.

## Risk list

| Risk | Mitigation |
| --- | --- |
| Large visual refactor could break existing route behavior. | Keep routes and API methods stable; change components in place. |
| CSS changes may affect legacy prototype components. | Scope new operational styles under `.ops-*` where possible. |
| Backend tests may rely on current response shapes. | Preserve existing fields and aliases while adding docs/types. |
| Adding interactivity can increase client rendering. | Keep only data/action routes as client components; avoid global state. |
| Upload/extract route mismatch can block the workflow. | Add a dedicated extracting page that polls existing API and redirects to review. |

## Priority list

1. P0: Fix broken upload → extraction route.
2. P0: Improve semantic app shell, page headers, upload labels, table captions, focus states.
3. P0: Strengthen TypeScript contracts and remove `any` from API-facing frontend types.
4. P1: Improve dashboard/workspace visual hierarchy, empty/error/loading states.
5. P1: Wire task status updates in workspace.
6. P1: Document API contracts and real-vs-mocked behavior.
7. P2: Longer-term feature folder migration, field editing UI, real extraction parser, auth/org scoping.
