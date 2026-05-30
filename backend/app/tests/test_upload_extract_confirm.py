"""Full human-in-the-loop flow: upload -> poll extraction -> confirm -> detail."""

# A minimal but valid PDF byte sequence.
FAKE_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _upload_and_extract(client):
    """Helper: upload a PDF and return (document_id, job_id, extraction_body)."""
    up = client.post(
        "/api/documents/upload",
        files={"file": ("contract.pdf", FAKE_PDF, "application/pdf")},
    ).json()
    ext = client.get(f"/api/documents/{up['documentId']}/extraction").json()
    return up["documentId"], up["extractionJobId"], ext


def test_upload_rejects_non_pdf(client):
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert resp.status_code == 400


def test_upload_extract_confirm_flow(client):
    # 1. Upload a fake PDF
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("contract.pdf", FAKE_PDF, "application/pdf")},
    )
    assert resp.status_code == 200
    up = resp.json()
    document_id = up["documentId"]
    job_id = up["extractionJobId"]
    assert up["status"] == "uploaded"

    # 2. Poll extraction (mock completes synchronously)
    ext = client.get(f"/api/documents/{document_id}/extraction")
    assert ext.status_code == 200
    ext_body = ext.json()
    assert ext_body["status"] == "complete"
    assert len(ext_body["fields"]) > 0
    assert len(ext_body["deadlines"]) > 0
    assert any(f["title"].startswith("Additional Provision") for f in ext_body["flags"])

    # extraction for missing doc -> 404
    assert client.get("/api/documents/missing/extraction").status_code == 404

    # 3. Confirm -> builds a new transaction
    confirm = client.post(
        f"/api/extractions/{job_id}/confirm",
        json={"overrides": {"city": "Colorado Springs"}},
    )
    assert confirm.status_code == 200
    detail = confirm.json()
    assert len(detail["deadlines"]) > 0
    assert len(detail["tasks"]) > 0
    assert detail["money"]["price"] == 520000

    # 4. New transaction appears in the dashboard list
    cards = client.get("/api/transactions").json()
    assert any(c["id"] == detail["id"] for c in cards)


def test_confirm_requires_complete_job(client):
    resp = client.post("/api/extractions/no-such-job/confirm", json={})
    assert resp.status_code == 404


# ── New field shape and review workflow tests ─────────────────────────────────

def test_extracted_fields_have_triage_fields(client):
    """Every extracted field must carry the new triage classification fields."""
    _, _, ext = _upload_and_extract(client)
    fields = ext["fields"]
    assert len(fields) > 0, "Expected at least one extracted field"

    for field in fields:
        assert "availabilityStatus" in field, f"Missing availabilityStatus on {field.get('fieldKey')}"
        assert "applicabilityStatus" in field, f"Missing applicabilityStatus on {field.get('fieldKey')}"
        assert "requiredLevel" in field, f"Missing requiredLevel on {field.get('fieldKey')}"
        assert "reviewDecision" in field, f"Missing reviewDecision on {field.get('fieldKey')}"
        assert "blocking" in field, f"Missing blocking on {field.get('fieldKey')}"
        assert field["availabilityStatus"] in (
            "available", "missing", "unavailable_now", "redacted", "unreadable"
        ), f"Unexpected availabilityStatus on {field.get('fieldKey')}"
        assert field["applicabilityStatus"] in (
            "applicable", "not_applicable", "conditional", "unknown"
        ), f"Unexpected applicabilityStatus on {field.get('fieldKey')}"
        assert field["requiredLevel"] in (
            "required_to_create", "required_before_closing", "optional", "informational"
        ), f"Unexpected requiredLevel on {field.get('fieldKey')}"
        assert field["reviewDecision"] in (
            "unreviewed", "approved", "edited", "marked_not_applicable", "marked_unavailable", "rejected"
        ), f"Unexpected reviewDecision on {field.get('fieldKey')}"


def test_review_summary_in_extraction_response(client):
    """Extraction response must include a populated reviewSummary."""
    _, _, ext = _upload_and_extract(client)

    assert "reviewSummary" in ext, "reviewSummary missing from extraction response"
    rs = ext["reviewSummary"]
    assert rs["total"] > 0
    assert isinstance(rs["blockingUnreviewed"], int)
    assert isinstance(rs["needsReview"], int)
    assert isinstance(rs["confirmedNa"], int)
    assert isinstance(rs["approved"], int)
    assert isinstance(rs["canCreateTransaction"], bool)


def test_na_fields_do_not_block_workspace_creation(client):
    """Confirmed N/A fields must not be counted as blocking."""
    _, _, ext = _upload_and_extract(client)

    na_fields = [
        f for f in ext["fields"]
        if f["applicabilityStatus"] == "not_applicable"
    ]
    assert len(na_fields) > 0, "Expected at least one N/A field in the fixture"

    for f in na_fields:
        assert not f["blocking"], (
            f"N/A field '{f.get('fieldKey')}' should not be blocking"
        )

    rs = ext["reviewSummary"]
    # Blocking count should not include N/A fields
    blocking_na = sum(
        1 for f in ext["fields"]
        if f["applicabilityStatus"] == "not_applicable" and f.get("blocking")
    )
    assert blocking_na == 0, "N/A fields must not be blocking"


def test_blocking_fields_prevent_can_create(client):
    """If any blocking required fields are unreviewed, canCreateTransaction must be False."""
    _, _, ext = _upload_and_extract(client)

    blocking_unreviewed = [
        f for f in ext["fields"]
        if f.get("blocking") and f["reviewDecision"] == "unreviewed"
    ]
    rs = ext["reviewSummary"]

    if blocking_unreviewed:
        assert rs["blockingUnreviewed"] == len(blocking_unreviewed)
        assert rs["canCreateTransaction"] is False
    else:
        assert rs["canCreateTransaction"] is True


def test_approve_field_updates_review_decision(client):
    """PATCH approve sets reviewDecision to 'approved'."""
    _, _, ext = _upload_and_extract(client)

    approvable = next(
        (f for f in ext["fields"]
         if f["reviewDecision"] == "unreviewed"
         and f["availabilityStatus"] == "available"),
        None,
    )
    assert approvable, "No approvable field found"

    resp = client.patch(f"/api/extracted-fields/{approvable['id']}", json={"decision": "approve"})
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["reviewDecision"] == "approved"
    assert updated["reviewStatus"] == "approved"


def test_edit_field_preserves_original_value(client):
    """Editing a field must preserve the original extracted value in originalValue."""
    _, _, ext = _upload_and_extract(client)

    editable = next(
        (f for f in ext["fields"]
         if f["reviewDecision"] == "unreviewed"
         and f["availabilityStatus"] == "available"
         and f.get("value")),
        None,
    )
    assert editable, "No editable field with a value found"

    original = editable["value"]
    resp = client.patch(
        f"/api/extracted-fields/{editable['id']}",
        json={"decision": "edit", "value": "EDITED VALUE"},
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["reviewDecision"] == "edited"
    assert updated["value"] == "EDITED VALUE"
    assert updated["editedValue"] == "EDITED VALUE"
    assert updated["originalValue"] == original


def test_mark_not_applicable_updates_applicability(client):
    """Marking a field N/A must set applicabilityStatus and reviewDecision."""
    _, _, ext = _upload_and_extract(client)

    target = next(
        (f for f in ext["fields"]
         if f["reviewDecision"] == "unreviewed"
         and f["applicabilityStatus"] != "not_applicable"),
        None,
    )
    assert target, "No field eligible for mark-N/A found"

    resp = client.patch(
        f"/api/extracted-fields/{target['id']}",
        json={"decision": "mark_not_applicable", "reason": "Not applicable for this property"},
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["reviewDecision"] == "marked_not_applicable"
    assert updated["applicabilityStatus"] == "not_applicable"


def test_mark_unavailable_updates_review_decision(client):
    """Marking a field unavailable must set reviewDecision to marked_unavailable."""
    _, _, ext = _upload_and_extract(client)

    target = next(
        (f for f in ext["fields"] if f["reviewDecision"] == "unreviewed"),
        None,
    )
    assert target, "No unreviewed field found"

    resp = client.patch(
        f"/api/extracted-fields/{target['id']}",
        json={"decision": "mark_unavailable", "unavailable_reason": "Will provide at closing"},
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["reviewDecision"] == "marked_unavailable"


def test_patch_document(client):
    """Patch a DocumentRequirement (not a SourceDocument) to verify state transitions."""
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("contract.pdf", FAKE_PDF, "application/pdf")},
    )
    assert resp.status_code == 200
    tx_id = resp.json()["transactionId"]
    assert tx_id, "Upload should create a transaction via FixtureExtractionProvider"

    # Get a DocumentRequirement that is in 'missing' state to patch.
    docs_resp = client.get(f"/api/transactions/{tx_id}/documents")
    assert docs_resp.status_code == 200
    docs = docs_resp.json()
    missing_docs = [d for d in docs if d.get("receivedStatus") == "missing" or d.get("state") == "pending"]
    assert missing_docs, "Expected at least one missing document requirement"

    req_id = missing_docs[0]["id"]
    patched = client.patch(f"/api/documents/{req_id}", json={"received_status": "received"})
    assert patched.status_code == 200
    assert patched.json()["receivedStatus"] == "received"

    # Invalid state → 400
    assert client.patch(f"/api/documents/{req_id}", json={"received_status": "nope"}).status_code == 400
