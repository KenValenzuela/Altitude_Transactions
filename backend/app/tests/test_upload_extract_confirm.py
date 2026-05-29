"""Full human-in-the-loop flow: upload -> poll extraction -> confirm -> detail."""

# A minimal but valid PDF byte sequence.
FAKE_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


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


def test_patch_document(client):
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("contract.pdf", FAKE_PDF, "application/pdf")},
    )
    document_id = resp.json()["documentId"]

    patched = client.patch(f"/api/documents/{document_id}", json={"state": "pending"})
    assert patched.status_code == 200
    assert patched.json()["state"] == "pending"

    assert client.patch(f"/api/documents/{document_id}", json={"state": "nope"}).status_code == 400
