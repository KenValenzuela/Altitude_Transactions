"""Phase 2 tests: file upload → checklist state machine → workspace reads.

Extraction execution (Phase 3) and review/apply (Phase 4) tests live here too,
as skips, so the file tracks the full document-to-workflow pipeline.
"""
from __future__ import annotations

import pytest

FAKE_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _demo_tx(client, headers) -> str:
    return client.get("/api/transactions", headers=headers).json()[0]["id"]


def _first_needed_item(client, headers, tx_id) -> dict:
    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=headers).json()
    return next(
        i for s in checklist["sections"] for i in s["items"] if i["status"] == "needed"
    )


def _upload(client, headers, tx_id, item_id=None, filename="contract.pdf", content=FAKE_PDF):
    data = {"checklistItemId": item_id} if item_id else {}
    return client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": (filename, content, "application/pdf")},
        data=data,
        headers=headers,
    )


# ─── Upload ───────────────────────────────────────────────────────────────────

def test_upload_pdf_to_checklist_item(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)

    resp = _upload(client, admin_headers, tx_id, item["id"])
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "uploaded"
    assert body["checklistItemId"] == item["id"]
    assert body["extractionJobId"]
    assert body["version"] == 1

    # Checklist row moved needed -> uploaded
    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    updated = next(i for s in checklist["sections"] for i in s["items"] if i["id"] == item["id"])
    assert updated["status"] == "uploaded"


def test_reupload_increments_version(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)

    first = _upload(client, admin_headers, tx_id, item["id"]).json()
    second = _upload(client, admin_headers, tx_id, item["id"]).json()
    assert first["version"] == 1
    assert second["version"] == 2


def test_upload_rejects_non_pdf(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    resp = client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": ("notes.txt", b"hello", "text/plain")},
        headers=admin_headers,
    )
    assert resp.status_code == 400


def test_upload_rejects_empty_file(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    resp = client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        headers=admin_headers,
    )
    assert resp.status_code == 400


def test_upload_rejects_oversize_file(client, admin_headers):
    from app.core.config import settings

    tx_id = _demo_tx(client, admin_headers)
    original = settings.max_upload_bytes
    settings.max_upload_bytes = 100
    try:
        resp = _upload(client, admin_headers, tx_id, content=b"%PDF-1.4" + b"x" * 200)
        assert resp.status_code == 413
    finally:
        settings.max_upload_bytes = original


def test_upload_requires_auth(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    resp = client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": ("contract.pdf", FAKE_PDF, "application/pdf")},
    )
    assert resp.status_code == 401


def test_upload_unknown_checklist_item(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    resp = _upload(client, admin_headers, tx_id, item_id="nonexistent")
    assert resp.status_code == 404


def test_upload_unassigned_creates_pending_job(client, admin_headers):
    """Upload without a checklist row: file stored, job queued for classification."""
    tx_id = _demo_tx(client, admin_headers)
    resp = _upload(client, admin_headers, tx_id)
    assert resp.status_code == 201
    body = resp.json()
    assert body["checklistItemId"] is None
    assert body["extractionJobId"]


def test_upload_rate_limited(client, admin_headers):
    from app.api.deps import extraction_rate_limiter

    tx_id = _demo_tx(client, admin_headers)
    original = extraction_rate_limiter.max_calls
    extraction_rate_limiter.max_calls = 2
    try:
        assert _upload(client, admin_headers, tx_id).status_code == 201
        assert _upload(client, admin_headers, tx_id).status_code == 201
        assert _upload(client, admin_headers, tx_id).status_code == 429
    finally:
        extraction_rate_limiter.max_calls = original
        extraction_rate_limiter._calls.clear()


# ─── Files: list + download ──────────────────────────────────────────────────

def test_list_and_download_file(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id).json()

    files = client.get(f"/api/transactions/{tx_id}/files", headers=admin_headers).json()
    assert any(f["id"] == up["fileId"] for f in files)
    rec = next(f for f in files if f["id"] == up["fileId"])
    assert rec["originalFilename"] == "contract.pdf"
    assert rec["sizeBytes"] == len(FAKE_PDF)
    assert rec["sha256"]

    dl = client.get(f"/api/files/{up['fileId']}/download", headers=admin_headers)
    assert dl.status_code == 200
    assert dl.content == FAKE_PDF
    assert dl.headers["content-type"].startswith("application/pdf")


def test_download_requires_auth(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id).json()
    assert client.get(f"/api/files/{up['fileId']}/download").status_code == 401


# ─── Audit trail ──────────────────────────────────────────────────────────────

def test_upload_writes_audit_events(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)
    _upload(client, admin_headers, tx_id, item["id"])

    events = client.get(f"/api/transactions/{tx_id}/audit", headers=admin_headers).json()
    types = [e["eventType"] for e in events]
    assert "document_uploaded" in types
    assert "checklist_item_status_changed" in types

    status_event = next(e for e in events if e["eventType"] == "checklist_item_status_changed")
    assert status_event["oldValue"] == "needed"
    assert status_event["newValue"] == "uploaded"


# ─── Archive ──────────────────────────────────────────────────────────────────

def test_archive_and_unarchive(client, admin_headers):
    tx = client.post(
        "/api/transactions",
        json={"propertyAddress": "Arch St", "city": "Denver", "side": "buyer", "financingType": "cash"},
        headers=admin_headers,
    ).json()

    archived = client.post(f"/api/transactions/{tx['id']}/archive", headers=admin_headers).json()
    assert archived["status"] == "archived"

    restored = client.post(f"/api/transactions/{tx['id']}/unarchive", headers=admin_headers).json()
    assert restored["status"] == "active"


# ─── Contacts ─────────────────────────────────────────────────────────────────

def test_contacts_crud(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)

    created = client.post(
        f"/api/transactions/{tx_id}/contacts",
        json={"roleKey": "lender", "name": "Jane Lender", "company": "Peak Mortgage"},
        headers=admin_headers,
    )
    assert created.status_code == 201
    contact = created.json()
    assert contact["roleLabel"] == "Lender / Loan Officer"

    patched = client.patch(
        f"/api/transactions/{tx_id}/contacts/{contact['id']}",
        json={"phone": "719-555-0100"},
        headers=admin_headers,
    ).json()
    assert patched["phone"] == "719-555-0100"

    listed = client.get(f"/api/transactions/{tx_id}/contacts", headers=admin_headers).json()
    assert any(c["id"] == contact["id"] for c in listed)

    deleted = client.delete(
        f"/api/transactions/{tx_id}/contacts/{contact['id']}", headers=admin_headers
    )
    assert deleted.status_code == 204


def test_contact_unknown_role_rejected(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    resp = client.post(
        f"/api/transactions/{tx_id}/contacts",
        json={"roleKey": "alien_overlord", "name": "Zorp"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


# ─── Dashboard ────────────────────────────────────────────────────────────────

def test_dashboard_counts(client, admin_headers):
    dash = client.get("/api/dashboard", headers=admin_headers).json()
    assert dash["totalTransactions"] >= 1
    assert dash["missingDocuments"] > 0  # fresh demo checklist has required needed rows
    assert "pendingReviews" in dash
    assert "overdueItems" in dash
    assert isinstance(dash["missingDocumentItems"], list)
    assert isinstance(dash["upcomingDeadlines"], list)
    assert isinstance(dash["recentActivity"], list)


def test_dashboard_review_queue_updates_after_upload(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)

    before = client.get("/api/dashboard", headers=admin_headers).json()
    _upload(client, admin_headers, tx_id, item["id"])
    after = client.get("/api/dashboard", headers=admin_headers).json()

    assert after["pendingReviews"] == before["pendingReviews"] + 1


# ─── Admin: templates & contact roles ────────────────────────────────────────

def test_admin_templates_crud_and_core_protection(client, admin_headers):
    templates = client.get("/api/admin/templates", headers=admin_headers).json()
    assert len(templates) == 23
    core = templates[0]

    # Core template: deletable -> 403; deactivate -> ok
    assert (
        client.delete(f"/api/admin/templates/{core['id']}", headers=admin_headers).status_code
        == 403
    )
    deactivated = client.patch(
        f"/api/admin/templates/{core['id']}", json={"active": False}, headers=admin_headers
    ).json()
    assert deactivated["active"] is False

    # Custom template: create then delete
    created = client.post(
        "/api/admin/templates",
        json={"name": "Septic Inspection", "section": "inspection_due_diligence"},
        headers=admin_headers,
    )
    assert created.status_code == 201
    assert (
        client.delete(
            f"/api/admin/templates/{created.json()['id']}", headers=admin_headers
        ).status_code
        == 204
    )


def test_admin_routes_blocked_for_agent(client, agent_headers):
    assert client.get("/api/admin/templates", headers=agent_headers).status_code == 403
    assert client.get("/api/admin/contact-roles", headers=agent_headers).status_code == 403


def test_admin_contact_roles(client, admin_headers):
    roles = client.get("/api/admin/contact-roles", headers=admin_headers).json()
    assert len(roles) == 10
    core_role = roles[0]
    assert (
        client.delete(
            f"/api/admin/contact-roles/{core_role['id']}", headers=admin_headers
        ).status_code
        == 403
    )

    created = client.post(
        "/api/admin/contact-roles",
        json={"key": "stager", "label": "Home Stager"},
        headers=admin_headers,
    )
    assert created.status_code == 201
    # Duplicate key -> 409
    dup = client.post(
        "/api/admin/contact-roles",
        json={"key": "stager", "label": "Home Stager"},
        headers=admin_headers,
    )
    assert dup.status_code == 409


# ─── Checklist custom row delete ─────────────────────────────────────────────

def test_delete_custom_checklist_row(client, admin_headers, agent_headers):
    tx_id = _demo_tx(client, admin_headers)
    custom = client.post(
        f"/api/transactions/{tx_id}/checklist",
        json={"name": "Well Water Test", "section": "inspection_due_diligence"},
        headers=admin_headers,
    ).json()

    # Agent cannot delete checklist rows
    assert (
        client.delete(
            f"/api/transactions/{tx_id}/checklist/{custom['id']}", headers=agent_headers
        ).status_code
        == 403
    )
    # Admin can delete custom rows
    assert (
        client.delete(
            f"/api/transactions/{tx_id}/checklist/{custom['id']}", headers=admin_headers
        ).status_code
        == 204
    )

    # Core rows cannot be deleted even by admin
    core = next(
        i
        for s in client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()[
            "sections"
        ]
        for i in s["items"]
        if i["isCore"]
    )
    assert (
        client.delete(
            f"/api/transactions/{tx_id}/checklist/{core['id']}", headers=admin_headers
        ).status_code
        == 403
    )


# ─── Transaction status derivation ───────────────────────────────────────────

def test_transaction_approved_when_required_items_resolved(client, admin_headers):
    tx = client.post(
        "/api/transactions",
        json={"propertyAddress": "Done Dr", "city": "Pueblo", "side": "buyer", "financingType": "cash"},
        headers=admin_headers,
    ).json()
    tx_id = tx["id"]

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    required = [i for s in checklist["sections"] for i in s["items"] if i["required"]]
    assert required

    for item in required:
        resp = client.patch(
            f"/api/transactions/{tx_id}/checklist/{item['id']}",
            json={"status": "approved"},
            headers=admin_headers,
        )
        assert resp.status_code == 200

    detail = client.get(f"/api/transactions/{tx_id}", headers=admin_headers).json()
    assert detail["status"] == "approved"

    # Knocking one back to needed reverts the transaction to active
    client.patch(
        f"/api/transactions/{tx_id}/checklist/{required[0]['id']}",
        json={"status": "needed"},
        headers=admin_headers,
    )
    detail = client.get(f"/api/transactions/{tx_id}", headers=admin_headers).json()
    assert detail["status"] == "active"


# ─── Phase 3/4 placeholders ──────────────────────────────────────────────────

@pytest.mark.skip(reason="Phase 3: extraction pipeline not yet implemented")
def test_extracted_fields_have_source_evidence(client, admin_headers):
    """Every extracted field carries source_page and source_text."""


@pytest.mark.skip(reason="Phase 4: review decisions and canonical fields")
def test_approve_field_writes_canonical_field(client, admin_headers):
    """Approving an extracted field writes a CanonicalField row."""


@pytest.mark.skip(reason="Phase 4: amendment proposals require explicit approval")
def test_amendment_deadline_proposal_requires_approval(client, admin_headers):
    """An Amend/Extend extraction creates a DeadlineChangeProposal, not a direct write."""
