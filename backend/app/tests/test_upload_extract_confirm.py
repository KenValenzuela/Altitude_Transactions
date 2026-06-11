"""Phase 2/3 tests: file upload, AI extraction, and human review.

These tests cover the document-to-workflow pipeline:
  - Phase 2: upload a file to a transaction checklist item
  - Phase 3: AI classification + field extraction with source evidence
  - Phase 4: human approve/edit/reject + apply engine → canonical fields + deadlines

Placeholder tests are marked skip; they will be filled out as each phase lands.
"""
import pytest


@pytest.mark.skip(reason="Phase 2: file upload endpoint not yet implemented")
def test_upload_pdf_to_checklist_item(client, admin_headers):
    """POST /api/transactions/{id}/files: upload a PDF, link to checklist item."""
    pass


@pytest.mark.skip(reason="Phase 2: only PDF accepted")
def test_upload_rejects_non_pdf(client, admin_headers):
    """Non-PDF upload must return 400."""
    pass


@pytest.mark.skip(reason="Phase 3: extraction pipeline not yet implemented")
def test_extraction_job_created_on_upload(client, admin_headers):
    """Uploading a classified document creates an ExtractionJob and enqueues AI work."""
    pass


@pytest.mark.skip(reason="Phase 3: extracted fields with source evidence")
def test_extracted_fields_have_source_evidence(client, admin_headers):
    """Every extracted field carries source_page and source_text."""
    pass


@pytest.mark.skip(reason="Phase 4: review decisions and canonical fields")
def test_approve_field_writes_canonical_field(client, admin_headers):
    """Approving an extracted field writes a CanonicalField row."""
    pass


@pytest.mark.skip(reason="Phase 4: amendment proposals require explicit approval")
def test_amendment_deadline_proposal_requires_approval(client, admin_headers):
    """An Amend/Extend extraction creates a DeadlineChangeProposal, not a direct write."""
    pass
