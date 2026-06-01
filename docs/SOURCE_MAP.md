# Source map

Altitude Transactions is intentionally modeled around Colorado real estate transaction operations instead of a generic CRM. Each entity is backed by a source artifact from the demo package.

| Entity | Backing source artifact | Source concept | Implementation purpose |
|---|---|---|---|
| transactions | CTME example contract + business plan | Property/contract file | Parent record |
| source_documents | CTME upload workflow + supporting docs | Uploaded PDF/source file | Evidence anchor |
| extraction_runs | AI contract intake workflow | Extraction attempt | Auditability/reproducibility |
| extracted_fields | CTME contract field extraction | Source-backed values | Human review |
| deadlines | CTME Dates and Deadlines section | Itemized contract deadlines | Deadline rows |
| tasks | Business plan click-to-complete chart | Status, completed date, deadline, assigned party, notes | Operational checklist |
| contacts | Contact Information chart | Parties/vendors/contact fields | Contact matrix |
| document_requirements | Colorado document checklist | CREC/common transaction docs | Required/missing docs |
| post_close_tasks | Thank You Tracking chart | Thank-you/review/referral/CRM follow-up | Post-close workflow |
| audit_events | AI human-review requirement | AI never final compliance judge | Accountability history |

The `FixtureExtractionProvider` (`backend/app/services/fixture_provider.py`) seeds the CTME example values for 4902
Cherry Springs Drive and preserves source document, page, section, confidence, and population status for review. N/A
values become `not_applicable`, COMPLETED values become `completed`, and redacted party names become
`redacted_in_source`.
