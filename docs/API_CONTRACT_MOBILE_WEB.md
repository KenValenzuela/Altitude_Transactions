# Altitude API Contract — Mobile and Web

**Date:** 2026-05-29
**Backend:** FastAPI + SQLModel (`backend/app/api/routes/`)
**Clients:** Next.js web app (`frontend/`) and planned Expo mobile app (`apps/mobile/`)

---

## Conventions

- All responses use camelCase JSON
- All timestamps are ISO 8601 UTC strings
- PATCH routes return the updated object (no full reload required)
- Status fields use domain-specific enums, not free-form strings
- `?cursor=` pagination on list endpoints that can grow large
- Auth: Bearer token (JWT, planned) — currently stubbed to seeded broker session

---

## Existing endpoints (working)

### Transactions

| Method | Route                          | Purpose                                             | Response            |
|--------|--------------------------------|-----------------------------------------------------|---------------------|
| `GET`  | `/api/transactions`            | List all active transaction cards for the dashboard | `TransactionCard[]` |
| `GET`  | `/api/transactions/{id}`       | Full transaction workspace detail                   | `Transaction`       |
| `GET`  | `/api/transactions/{id}/audit` | Audit event history                                 | `AuditEvent[]`      |

### Documents and Extraction

| Method  | Route                                    | Purpose                                            | Response                       |
|---------|------------------------------------------|----------------------------------------------------|--------------------------------|
| `POST`  | `/api/documents/upload`                  | Upload a CTME PDF                                  | `{ documentId, extractionId }` |
| `GET`   | `/api/documents/{documentId}/extraction` | Poll extraction status and review fields           | `ExtractionJob`                |
| `POST`  | `/api/extractions/{jobId}/confirm`       | Confirm extraction — creates transaction workspace | `Transaction`                  |
| `PATCH` | `/api/extracted-fields/{fieldId}`        | Approve, edit, or reject a single field            | `ExtractedField`               |

### Tasks and Documents

| Method  | Route                         | Purpose                            | Response              |
|---------|-------------------------------|------------------------------------|-----------------------|
| `PATCH` | `/api/tasks/{taskId}`         | Update task status                 | `Task`                |
| `PATCH` | `/api/documents/{documentId}` | Update document requirement status | `DocumentRequirement` |

---

## Proposed endpoints (not yet implemented)

### Auth

| Method | Route              | Purpose                             | Priority                 |
|--------|--------------------|-------------------------------------|--------------------------|
| `POST` | `/api/auth/login`  | Email + password login, returns JWT | P0 — required for mobile |
| `GET`  | `/api/auth/me`     | Validate token, return current user | P0                       |
| `POST` | `/api/auth/logout` | Invalidate session                  | P1                       |

### Dashboard

| Method | Route                    | Purpose                          | Priority |
|--------|--------------------------|----------------------------------|----------|
| `GET`  | `/api/dashboard/summary` | Aggregate metrics for today view | P1       |

**Sample response:**

```json
{
  "activeFiles": 4,
  "atRisk": 1,
  "closingThisWeek": 1,
  "overdueDeadlines": 2,
  "pendingReviews": 3
}
```

### Deadlines

| Method  | Route                 | Purpose             | Priority |
|---------|-----------------------|---------------------|----------|
| `PATCH` | `/api/deadlines/{id}` | Mark complete / N/A | P1       |

### Extraction (batch)

| Method  | Route                             | Purpose                            | Priority |
|---------|-----------------------------------|------------------------------------|----------|
| `PATCH` | `/api/extractions/{jobId}/fields` | Batch approve/edit multiple fields | P2       |

### Contacts

| Method  | Route                             | Purpose                        | Priority |
|---------|-----------------------------------|--------------------------------|----------|
| `POST`  | `/api/transactions/{id}/contacts` | Add a contact to a transaction | P2       |
| `PATCH` | `/api/contacts/{id}`              | Edit a contact                 | P2       |

### Weekly Summary

| Method | Route                            | Purpose                    | Priority |
|--------|----------------------------------|----------------------------|----------|
| `GET`  | `/api/transactions/{id}/summary` | Weekly deal health summary | P2       |

### Post-Close

| Method  | Route                              | Purpose                       | Priority |
|---------|------------------------------------|-------------------------------|----------|
| `GET`   | `/api/transactions/{id}/postclose` | Post-close task list          | P2       |
| `PATCH` | `/api/post-close-tasks/{id}`       | Mark post-close task complete | P2       |

### Notifications

| Method  | Route                            | Purpose                          | Priority |
|---------|----------------------------------|----------------------------------|----------|
| `POST`  | `/api/notifications/register`    | Store Expo push token per broker | P3       |
| `GET`   | `/api/notifications/preferences` | Fetch notification preferences   | P3       |
| `PATCH` | `/api/notifications/preferences` | Update notification preferences  | P3       |

---

## Sample resource shapes (camelCase)

### TransactionCard

```json
{
  "id": "txn_abc123",
  "address": "1234 Alpine Way",
  "city": "Boulder",
  "status": "active",
  "daysToClose": 47,
  "progress": 0.42,
  "next": "Inspection Objection Deadline in 6 days",
  "urgent": true,
  "parties": "Okonkwo / Hartmann Trust",
  "price": 875000,
  "active": true
}
```

### ExtractedField

```json
{
  "id": "field_xyz",
  "transactionId": "txn_abc123",
  "fieldName": "inspection_objection_deadline",
  "displayLabel": "Inspection Objection Deadline",
  "rawValue": "06/04/2026",
  "normalizedValue": "2026-06-04",
  "confidence": 0.94,
  "reviewStatus": "pending",
  "sourceDocumentId": "doc_111",
  "sourcePage": 3,
  "sourceSection": "Section 10.1",
  "updatedAt": "2026-05-29T14:30:00Z"
}
```

### Deadline

```json
{
  "id": "dl_001",
  "transactionId": "txn_abc123",
  "itemNumber": "10.1",
  "sectionReference": "§10.1 CBS1",
  "eventName": "Inspection Objection Deadline",
  "dueDate": "2026-06-04",
  "applicability": "active",
  "isUrgent": true,
  "isNa": false
}
```

---

## Mock / stub boundaries (current state)

| Area                  | Status          | Notes                                            |
|-----------------------|-----------------|--------------------------------------------------|
| PDF parsing           | Mocked          | `MockExtractionService` replays sample CTME data |
| Auth                  | Stubbed         | Seeded broker session — no real JWT              |
| Push notifications    | Not implemented | Planned Phase 8                                  |
| Real CTME integration | Not in scope    | PDFs exported manually from CTME and uploaded    |

---

## Response shape principles

1. camelCase for all field names
2. Domain enums for status fields (never raw strings)
3. `PATCH` returns the updated object — clients update local state without full reload
4. Source/evidence references on extracted field values
5. Mock behavior stays behind the service boundary — UI never mocks API responses directly
