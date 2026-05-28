# Altitude Backend

Production-shaped FastAPI + SQLModel (SQLite) backend for **Altitude** — an
AI-assisted contract-to-close transaction coordinator for Colorado residential
real-estate brokers.

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

cp .env.example .env                 # optional; defaults work out of the box
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health:   http://localhost:8000/api/health

On first startup the DB (`altitude.db`) is created and seeded with the demo
broker **Brett Predmore** (RE/MAX Real Estate Group) and one fully-built demo
transaction — **4902 Cherry Springs Drive, Colorado Springs** — so
`GET /api/transactions` is non-empty immediately. Seeding is idempotent.

## Environment variables

| Variable          | Default                       | Purpose                                  |
| ----------------- | ----------------------------- | ---------------------------------------- |
| `DATABASE_URL`    | `sqlite:///./altitude.db`     | DB connection (Postgres-compatible code) |
| `FRONTEND_ORIGIN` | `http://localhost:3000`       | Allowed CORS origin                      |
| `APP_VERSION`     | `0.1.0`                       | Reported by `GET /api/health`            |

## API

All endpoints are under `/api`, all JSON is **camelCase**. Key routes:

- `GET  /api/health`
- `POST /api/auth/session`
- `GET  /api/transactions` (dashboard cards)
- `GET  /api/transactions/{id}` (full detail: stages, money, deadlines, grouped tasks, documents, counts)
- `GET  /api/transactions/{id}/deadlines`
- `POST /api/documents/upload` (multipart `file`, optional `transactionId`; PDF only)
- `GET  /api/documents/{id}/extraction`
- `POST /api/extractions/{jobId}/confirm` (human-in-the-loop commit -> builds the transaction)
- `PATCH /api/tasks/{id}` (`{ "state": ... }`)
- `PATCH /api/documents/{id}` (`{ "state": ... }`)

## What is MOCKED vs real

**Extraction is MOCKED.** `MockExtractionService` does **not** parse uploaded
PDF bytes. It replays a real bundled structured extraction of a Colorado CTM
"Contract to Buy and Sell Real Estate (Residential)" form (CBS1-8-24), stored at
`app/services/data/sample_contract_extraction.json`. The uploaded file is saved
to disk and a real-shaped `ExtractionJob` lifecycle (pending -> running ->
complete) runs, but the parsed result always reflects the bundled sample. The
`ExtractionService` Protocol is the service boundary — implement it against a
live OCR/LLM parser and swap the instance in
`app/services/extraction_service.py` (`get_extraction_service`).

**Auth is STUBBED.** `get_current_user` returns the seeded demo broker; no
passwords/OAuth. `POST /api/auth/session` returns `{ user, token }` with a fake
token. The dependency is real-shaped so it is swappable for JWT/OAuth.

Everything else (DB persistence, transaction/deadline/task derivation, the
upload pipeline, document storage, the confirm/commit flow) is real.

## Tests

```bash
cd backend
pytest
```

Tests use a temporary SQLite DB and FastAPI `TestClient`: health, seeded
transactions list, and the full upload -> extract -> confirm flow.
