"""Phases 2-3 tests: upload -> storage -> extraction pipeline -> review queue.

Under TestClient, FastAPI background tasks run synchronously after the
response, so the mock extraction completes before the next request — uploads
targeted at a checklist row land that row in `in_review`.
"""
from __future__ import annotations

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


def _item_status(client, headers, tx_id, item_id) -> str:
    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=headers).json()
    return next(i for s in checklist["sections"] for i in s["items"] if i["id"] == item_id)[
        "status"
    ]


# ─── Upload (Phase 2) ─────────────────────────────────────────────────────────

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

    # Mock extraction ran synchronously: needed -> uploaded -> in_review
    assert _item_status(client, admin_headers, tx_id, item["id"]) == "in_review"


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


# ─── Files: list + download (Phase 2) ────────────────────────────────────────

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


# ─── Extraction pipeline (Phase 3) ───────────────────────────────────────────

def test_extraction_completes_with_classification(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, filename="contract.pdf").json()

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    assert job["status"] == "needs_review"
    assert job["documentType"] == "contract_to_buy_and_sell"
    assert job["classificationConfidence"] > 0.5
    assert job["provider"] == "mock"
    assert job["completedAt"] is not None
    assert len(job["fields"]) > 10


def test_extracted_fields_have_source_evidence(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, filename="contract.pdf").json()

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    for field in job["fields"]:
        assert field["fieldKey"]
        assert field["label"]
        assert field["group"]
        assert "confidence" in field
    evidenced = [f for f in job["fields"] if f["value"]]
    assert evidenced, "Expected fields with values"
    for field in evidenced:
        assert field["sourcePage"] is not None, f"{field['fieldKey']} missing sourcePage"
        assert field["sourceText"], f"{field['fieldKey']} missing sourceText"


def test_cbs_extraction_has_deadline_table_fields(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, filename="cbs_contract.pdf").json()

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    deadlines = [f for f in job["fields"] if f["group"] == "deadlines"]
    assert len(deadlines) > 20  # CBS fixture has a 45-row dates & deadlines table

    dated = [f for f in deadlines if f["valueType"] == "date"]
    assert dated
    for f in dated:
        assert f["normalizedValue"], f"{f['fieldKey']} missing ISO normalized value"
        assert len(f["normalizedValue"]) == 10  # YYYY-MM-DD

    keys = {f["fieldKey"] for f in deadlines}
    assert "deadline.inspection_objection_deadline" in keys
    assert "deadline.closing_date" in keys

    # core terms extracted from the bundled real CBS fixture
    by_key = {f["fieldKey"]: f for f in job["fields"]}
    assert by_key["purchase_price"]["normalizedValue"] == "520000"
    assert by_key["earnest_money"]["normalizedValue"] == "5000"
    assert by_key["closing_date"]["normalizedValue"] == "2025-11-20"


def test_classification_by_filename(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    cases = [
        ("hoa_status_letter.pdf", "hoa_status_letter", "hoa"),
        ("amend_extend_agreement.pdf", "amend_extend", "deadline_changes"),
        ("earnest_money_receipt.pdf", "earnest_money_receipt", "terms"),
        ("inspection_objection.pdf", "inspection_objection", "items"),
        ("radon_test.pdf", "radon_report", "items"),
    ]
    for filename, expected_type, expected_group in cases:
        up = _upload(client, admin_headers, tx_id, filename=filename).json()
        job = client.get(
            f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
        ).json()
        assert job["documentType"] == expected_type, filename
        groups = {f["group"] for f in job["fields"]}
        assert expected_group in groups, f"{filename}: groups={groups}"


def test_amend_extend_produces_deadline_change_fields(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, filename="amend_extend.pdf").json()

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    changes = [f for f in job["fields"] if f["group"] == "deadline_changes"]
    assert changes, "Amend/Extend must emit deadline_change.* fields"
    for f in changes:
        assert f["fieldKey"].startswith("deadline_change.")
        assert f["normalizedValue"]  # ISO new date


def test_unassigned_upload_gets_checklist_suggestion(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, filename="contract.pdf").json()
    assert up["checklistItemId"] is None  # nothing assigned at upload time

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    assert job["checklistItemId"] is not None  # classifier suggested the CBS row

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    suggested = next(
        i for s in checklist["sections"] for i in s["items"] if i["id"] == job["checklistItemId"]
    )
    assert suggested["name"] == "Contract to Buy and Sell Real Estate"


def test_extraction_audit_trail(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)
    _upload(client, admin_headers, tx_id, item["id"])

    events = client.get(f"/api/transactions/{tx_id}/audit", headers=admin_headers).json()
    types = [e["eventType"] for e in events]
    assert "document_uploaded" in types
    assert "extraction_started" in types
    assert "document_classified" in types
    assert "extraction_completed" in types

    classified = next(e for e in events if e["eventType"] == "document_classified")
    assert classified["actorType"] == "ai"


def test_list_extraction_jobs_for_transaction(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up1 = _upload(client, admin_headers, tx_id, filename="contract.pdf").json()
    up2 = _upload(client, admin_headers, tx_id, filename="hoa.pdf").json()

    jobs = client.get(
        f"/api/transactions/{tx_id}/extraction-jobs", headers=admin_headers
    ).json()
    ids = {j["id"] for j in jobs}
    assert up1["extractionJobId"] in ids
    assert up2["extractionJobId"] in ids
    assert all(j["status"] == "needs_review" for j in jobs)


def test_retry_rejected_for_completed_job(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id).json()
    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/retry", headers=admin_headers
    )
    assert resp.status_code == 409


def test_extraction_job_requires_auth_and_org(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id).json()
    assert client.get(f"/api/extraction-jobs/{up['extractionJobId']}").status_code == 401
    assert (
        client.get("/api/extraction-jobs/nope", headers=admin_headers).status_code == 404
    )


def test_failed_job_can_be_retried(client, admin_headers):
    """Force a storage failure, verify failed status + successful retry."""
    import app.db.session as db_session
    from sqlmodel import Session as DbSession

    from app.models import ExtractionJob, ExtractionJobStatus, UploadedFile
    from app.services.extraction import run_extraction_job

    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id).json()
    job_id = up["extractionJobId"]

    # Sabotage the stored object key, mark the job failed by re-running against it
    with DbSession(db_session.engine) as s:
        file = s.exec(
            __import__("sqlmodel").select(UploadedFile).where(UploadedFile.id == up["fileId"])
        ).first()
        good_key = file.storage_key
        file.storage_key = "missing/object.pdf"
        job = s.get(ExtractionJob, job_id)
        job.status = ExtractionJobStatus.pending
        s.add(file)
        s.add(job)
        s.commit()

    run_extraction_job(job_id)
    job_body = client.get(f"/api/extraction-jobs/{job_id}", headers=admin_headers).json()
    assert job_body["status"] == "failed"
    assert job_body["errorMessage"]

    # Restore the object and retry through the API
    with DbSession(db_session.engine) as s:
        file = s.get(UploadedFile, up["fileId"])
        file.storage_key = good_key
        s.add(file)
        s.commit()

    resp = client.post(f"/api/extraction-jobs/{job_id}/retry", headers=admin_headers)
    assert resp.status_code == 200
    job_body = client.get(f"/api/extraction-jobs/{job_id}", headers=admin_headers).json()
    assert job_body["status"] == "needs_review"


# ─── Audit trail (Phase 2) ────────────────────────────────────────────────────

def test_upload_writes_audit_events(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    item = _first_needed_item(client, admin_headers, tx_id)
    _upload(client, admin_headers, tx_id, item["id"])

    events = client.get(f"/api/transactions/{tx_id}/audit", headers=admin_headers).json()
    types = [e["eventType"] for e in events]
    assert "document_uploaded" in types
    assert "checklist_item_status_changed" in types

    transitions = [
        (e["oldValue"], e["newValue"])
        for e in events
        if e["eventType"] == "checklist_item_status_changed"
    ]
    assert ("needed", "uploaded") in transitions
    assert ("uploaded", "in_review") in transitions


# ─── Archive (Phase 2) ────────────────────────────────────────────────────────

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


# ─── Contacts (Phase 2) ───────────────────────────────────────────────────────

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


# ─── Dashboard (Phase 2) ──────────────────────────────────────────────────────

def test_dashboard_counts(client, admin_headers):
    dash = client.get("/api/dashboard", headers=admin_headers).json()
    assert dash["totalTransactions"] >= 1
    assert dash["missingDocuments"] > 0
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

    # needed -> in_review: one more pending review, one fewer missing doc
    assert after["pendingReviews"] == before["pendingReviews"] + 1


# ─── Admin (Phase 2) ──────────────────────────────────────────────────────────

def test_admin_templates_crud_and_core_protection(client, admin_headers):
    templates = client.get("/api/admin/templates", headers=admin_headers).json()
    assert len(templates) == 23
    core = templates[0]

    assert (
        client.delete(f"/api/admin/templates/{core['id']}", headers=admin_headers).status_code
        == 403
    )
    deactivated = client.patch(
        f"/api/admin/templates/{core['id']}", json={"active": False}, headers=admin_headers
    ).json()
    assert deactivated["active"] is False

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
    dup = client.post(
        "/api/admin/contact-roles",
        json={"key": "stager", "label": "Home Stager"},
        headers=admin_headers,
    )
    assert dup.status_code == 409


# ─── Checklist custom row delete (Phase 2) ───────────────────────────────────

def test_delete_custom_checklist_row(client, admin_headers, agent_headers):
    tx_id = _demo_tx(client, admin_headers)
    custom = client.post(
        f"/api/transactions/{tx_id}/checklist",
        json={"name": "Well Water Test", "section": "inspection_due_diligence"},
        headers=admin_headers,
    ).json()

    assert (
        client.delete(
            f"/api/transactions/{tx_id}/checklist/{custom['id']}", headers=agent_headers
        ).status_code
        == 403
    )
    assert (
        client.delete(
            f"/api/transactions/{tx_id}/checklist/{custom['id']}", headers=admin_headers
        ).status_code
        == 204
    )

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


# ─── Transaction status derivation (Phase 2) ─────────────────────────────────

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

    client.patch(
        f"/api/transactions/{tx_id}/checklist/{required[0]['id']}",
        json={"status": "needed"},
        headers=admin_headers,
    )
    detail = client.get(f"/api/transactions/{tx_id}", headers=admin_headers).json()
    assert detail["status"] == "active"
