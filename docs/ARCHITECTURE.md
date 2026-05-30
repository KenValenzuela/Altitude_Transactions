# Architecture

## Frontend route structure

The active app is TypeScript-first under `frontend/src/app` using the Next.js App Router:

- `/dashboard` for Brett's navy/gold operations cockpit.
- `/upload` for CTME PDF upload.
- `/upload/[documentId]/extracting` for polling extraction progress.
- `/review/[documentId]` for pre-workspace human review.
- `/transactions/[id]` for the overview workspace.
- `/transactions/[id]/review`, `/deadlines`, `/tasks`, `/contacts`, `/documents`, and `/audit` for focused operational views.

Old `/checklist`, `/parties`, `/summary`, and `/postclose` routes redirect into the operations model. Legacy JSX prototypes are archived in `project/archive/legacy-jsx-prototypes/`; `frontend/src` is the source of truth.

## Backend module structure

`backend/app/models` defines SQLModel tables for transactions, source documents, extraction runs, extracted fields, deadlines, tasks, contacts, document requirements, post-close tasks, and audit events. `backend/app/services/demo_workflow.py` contains the deterministic CTME demo extractor and generation logic. API routes under `backend/app/api/routes` expose upload, extraction, transaction, task, field review, contact, document, and audit endpoints.

## Data flow

1. Brett uploads a CTME PDF through `POST /api/documents/upload`.
2. The backend creates `source_documents` and `extraction_runs` rows.
3. The deterministic extractor materializes source-backed `extracted_fields`, row-based `deadlines`, generated operational `tasks`, real estate `contacts`, `document_requirements`, `post_close_tasks`, and `audit_events`.
4. The frontend polls extraction status and shows progress.
5. Brett reviews and approves/edits fields using `PATCH /api/extracted-fields/{id}`.
6. The transaction workspace reads populated operational data from `/api/transactions/{id}` and focused subresource endpoints.

## Modeling decisions

Deadlines are rows instead of transaction columns because CTME forms and amendments can add, delete, complete, or mark individual deadline items N/A. Row storage preserves item number, section, source evidence, raw value, due date, due time, and applicability.

Extracted fields preserve source evidence because the AI is an intake assistant, not a final compliance judge. Every field carries the source document, page/section when known, confidence, population status, and review state.

Tasks are separate from deadlines because a populated deadline is not a completed operational task. For example, Inspection Objection Deadline can be populated while “Confirm inspection objection decision” remains not started until Brett completes it or uploads/reviews the supporting document.

Contacts are separate from parties because transaction operations include vendors and service providers beyond contract parties, such as loan officers, escrow officers, inspectors, insurance agents, and contractors.

Document requirements are separate from source documents because a source document is an uploaded evidence file, while requirements express required, conditional, missing, received, reviewed, approved, or N/A operational checklist items.

Audit events are required for document uploads, extraction, field approval/editing, task changes, contact updates, and document status changes so the demo makes accountability visible.

## Tailwind

Tailwind was deferred. The existing app already used a CSS-variable system and custom components; adding Tailwind would have added configuration churn without materially improving the demo. The refactor centralizes responsive cockpit styles in `frontend/src/app/globals.css` using CSS Grid, Flexbox, rem spacing, accessible focus states, and design tokens.
