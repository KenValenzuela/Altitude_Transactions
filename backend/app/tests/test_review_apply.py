"""Phase 4 tests: review decisions, apply engine, amendment proposals.

Core invariants under test:
- Decisions are append-only; raw ExtractedField rows never change.
- Only approved/edited fields become canonical; rejected/N-A never do.
- Deadline changes from amendments (and conflicting re-extractions) become
  proposals requiring a second explicit approval — never silent overwrites.
"""
from __future__ import annotations

FAKE_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _demo_tx(client, headers) -> str:
    return client.get("/api/transactions", headers=headers).json()[0]["id"]


def _upload(client, headers, tx_id, filename="contract.pdf", item_id=None):
    data = {"checklistItemId": item_id} if item_id else {}
    resp = client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": (filename, FAKE_PDF, "application/pdf")},
        data=data,
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _job_fields(client, headers, job_id) -> list[dict]:
    return client.get(f"/api/extraction-jobs/{job_id}", headers=headers).json()["fields"]


def _approve_cbs(client, headers, tx_id) -> dict:
    """Upload + approve a CBS contract; returns the apply result."""
    up = _upload(client, headers, tx_id, "contract.pdf")
    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=headers
    )
    assert resp.status_code == 200, resp.json()
    return resp.json()


# ─── Field decisions ──────────────────────────────────────────────────────────

def test_decide_field_approve(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id)
    field = _job_fields(client, admin_headers, up["extractionJobId"])[0]

    resp = client.post(
        f"/api/extracted-fields/{field['id']}/decision",
        json={"decision": "approved"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "approved"
    assert body["originalValue"] == field["value"]
    assert body["reviewerId"]


def test_decide_field_edit_requires_value(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id)
    field = _job_fields(client, admin_headers, up["extractionJobId"])[0]

    resp = client.post(
        f"/api/extracted-fields/{field['id']}/decision",
        json={"decision": "edited"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_decide_field_edit_preserves_raw_field(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id)
    fields = _job_fields(client, admin_headers, up["extractionJobId"])
    target = next(f for f in fields if f["fieldKey"] == "purchase_price")

    resp = client.post(
        f"/api/extracted-fields/{target['id']}/decision",
        json={"decision": "edited", "correctedValue": "530000", "reason": "Counterproposal price"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["correctedValue"] == "530000"

    # Immutability: the raw extracted field still holds the original AI value
    fields_after = _job_fields(client, admin_headers, up["extractionJobId"])
    raw = next(f for f in fields_after if f["id"] == target["id"])
    assert raw["value"] == target["value"]


def test_decision_invalid_type(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id)
    field = _job_fields(client, admin_headers, up["extractionJobId"])[0]
    resp = client.post(
        f"/api/extracted-fields/{field['id']}/decision",
        json={"decision": "maybe"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_review_queue_shows_latest_decision(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id)
    fields = _job_fields(client, admin_headers, up["extractionJobId"])
    target = fields[0]

    # Two decisions; the queue must reflect the latest (append-only log)
    client.post(
        f"/api/extracted-fields/{target['id']}/decision",
        json={"decision": "rejected", "reason": "wrong"},
        headers=admin_headers,
    )
    client.post(
        f"/api/extracted-fields/{target['id']}/decision",
        json={"decision": "approved"},
        headers=admin_headers,
    )

    queue = client.get(f"/api/transactions/{tx_id}/review", headers=admin_headers).json()
    job_entry = next(j for j in queue if j["job"]["id"] == up["extractionJobId"])
    field_entry = next(f for f in job_entry["fields"] if f["id"] == target["id"])
    assert field_entry["decision"] == "approved"
    assert job_entry["undecidedCount"] == len(fields) - 1


# ─── Document approve -> apply engine ────────────────────────────────────────

def test_approve_document_writes_canonical_state(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    result = _approve_cbs(client, admin_headers, tx_id)

    assert result["status"] == "completed"
    assert result["canonical"] > 10
    assert result["deadlinesCreated"] > 20

    canonical = client.get(
        f"/api/transactions/{tx_id}/canonical-fields", headers=admin_headers
    ).json()
    by_key = {c["fieldKey"]: c for c in canonical}
    assert by_key["purchase_price"]["value"] == "520000"
    assert by_key["closing_date"]["value"] == "2025-11-20"
    assert by_key["buyer_name"]["approvedBy"]
    assert by_key["purchase_price"]["sourceFieldId"]

    # Transaction columns written back deterministically
    tx = client.get(f"/api/transactions/{tx_id}", headers=admin_headers).json()
    assert tx["purchasePrice"] == 520000
    assert tx["earnestMoney"] == 5000
    assert tx["closingDate"] == "2025-11-20"
    assert tx["county"] == "El Paso"

    # Deadlines created from the CBS dates & deadlines table
    deadlines = client.get(
        f"/api/transactions/{tx_id}/deadlines", headers=admin_headers
    ).json()
    keys = {d["deadlineKey"] for d in deadlines}
    assert "inspection_objection_deadline" in keys
    assert "closing_date" in keys
    na = [d for d in deadlines if d["applicability"] == "not_applicable"]
    assert na, "N/A table rows become not_applicable deadlines"


def test_rejected_field_not_canonical(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, "hoa_status_letter.pdf")
    fields = _job_fields(client, admin_headers, up["extractionJobId"])
    rejected = next(f for f in fields if f["fieldKey"] == "transfer_fee")

    client.post(
        f"/api/extracted-fields/{rejected['id']}/decision",
        json={"decision": "rejected", "reason": "Illegible in source"},
        headers=admin_headers,
    )
    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers
    )
    assert resp.status_code == 200

    canonical = client.get(
        f"/api/transactions/{tx_id}/canonical-fields", headers=admin_headers
    ).json()
    keys = {c["fieldKey"] for c in canonical}
    assert "hoa_name" in keys  # bulk-approved sibling landed
    assert "transfer_fee" not in keys  # rejected never becomes canonical


def test_edited_value_becomes_canonical(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, "earnest_money_receipt.pdf")
    fields = _job_fields(client, admin_headers, up["extractionJobId"])
    amount = next(f for f in fields if f["fieldKey"] == "amount")

    client.post(
        f"/api/extracted-fields/{amount['id']}/decision",
        json={"decision": "edited", "correctedValue": "$6,000", "reason": "Amended receipt"},
        headers=admin_headers,
    )
    client.post(f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers)

    canonical = client.get(
        f"/api/transactions/{tx_id}/canonical-fields", headers=admin_headers
    ).json()
    amount_row = next(c for c in canonical if c["fieldKey"] == "amount")
    assert amount_row["value"] == "6000"  # edited + re-normalized


def test_approve_strict_mode_blocks_undecided(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    up = _upload(client, admin_headers, tx_id, "radon_test.pdf")

    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/approve",
        json={"approveRemaining": False},
        headers=admin_headers,
    )
    assert resp.status_code == 409
    assert "no decision" in resp.json()["detail"]


def test_approve_moves_checklist_item_and_completes_job(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    cbs_item = next(
        i for s in checklist["sections"] for i in s["items"]
        if i["name"] == "Contract to Buy and Sell Real Estate"
    )
    up = _upload(client, admin_headers, tx_id, "contract.pdf", item_id=cbs_item["id"])

    client.post(f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers)

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    item = next(i for s in checklist["sections"] for i in s["items"] if i["id"] == cbs_item["id"])
    assert item["status"] == "approved"

    job = client.get(
        f"/api/extraction-jobs/{up['extractionJobId']}", headers=admin_headers
    ).json()
    assert job["status"] == "completed"

    # Approving twice is a conflict
    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers
    )
    assert resp.status_code == 409


def test_reject_document_needs_correction(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    item = next(
        i for s in checklist["sections"] for i in s["items"] if i["status"] == "needed"
    )
    up = _upload(client, admin_headers, tx_id, "contract.pdf", item_id=item["id"])

    resp = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/reject",
        json={"reason": "Wrong property — upload the correct contract"},
        headers=admin_headers,
    )
    assert resp.status_code == 200

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    updated = next(i for s in checklist["sections"] for i in s["items"] if i["id"] == item["id"])
    assert updated["status"] == "needs_correction"

    events = client.get(f"/api/transactions/{tx_id}/audit", headers=admin_headers).json()
    rejected = next(e for e in events if e["eventType"] == "document_rejected")
    assert "Wrong property" in rejected["newValue"]

    # No canonical state from a rejected document
    canonical = client.get(
        f"/api/transactions/{tx_id}/canonical-fields", headers=admin_headers
    ).json()
    assert canonical == []


# ─── Amendment proposals ──────────────────────────────────────────────────────

def test_amendment_creates_proposals_not_overwrites(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _approve_cbs(client, admin_headers, tx_id)  # base deadlines in place

    deadlines_before = client.get(
        f"/api/transactions/{tx_id}/deadlines", headers=admin_headers
    ).json()
    resolution_before = next(
        d for d in deadlines_before if d["deadlineKey"] == "inspection_resolution_deadline"
    )

    up = _upload(client, admin_headers, tx_id, "amend_extend.pdf")
    result = client.post(
        f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers
    ).json()
    assert result["proposals"] == 2  # inspection resolution + closing date

    # Deadlines untouched until the proposal itself is approved
    deadlines_after = client.get(
        f"/api/transactions/{tx_id}/deadlines", headers=admin_headers
    ).json()
    resolution_after = next(
        d for d in deadlines_after if d["deadlineKey"] == "inspection_resolution_deadline"
    )
    assert resolution_after["dueDate"] == resolution_before["dueDate"]

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    pending = [p for p in proposals if p["status"] == "pending"]
    assert len(pending) == 2
    by_key = {p["deadlineKey"]: p for p in pending}
    assert by_key["inspection_resolution_deadline"]["oldDate"] == resolution_before["dueDate"]
    assert by_key["inspection_resolution_deadline"]["newDate"] == "2025-11-14"
    assert by_key["closing_date"]["newDate"] == "2025-12-05"


def test_approve_proposal_updates_deadline_and_transaction(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _approve_cbs(client, admin_headers, tx_id)
    up = _upload(client, admin_headers, tx_id, "amend_extend.pdf")
    client.post(f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers)

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    closing = next(
        p for p in proposals if p["deadlineKey"] == "closing_date" and p["status"] == "pending"
    )

    resp = client.post(
        f"/api/deadline-proposals/{closing['id']}/approve", headers=admin_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"
    assert resp.json()["decidedBy"]

    deadlines = client.get(
        f"/api/transactions/{tx_id}/deadlines", headers=admin_headers
    ).json()
    closing_deadline = next(d for d in deadlines if d["deadlineKey"] == "closing_date")
    assert closing_deadline["dueDate"] == "2025-12-05"

    # closing_date mirrors onto the transaction
    tx = client.get(f"/api/transactions/{tx_id}", headers=admin_headers).json()
    assert tx["closingDate"] == "2025-12-05"

    # Decided proposals cannot be re-decided
    assert (
        client.post(
            f"/api/deadline-proposals/{closing['id']}/approve", headers=admin_headers
        ).status_code
        == 409
    )


def test_reject_proposal_leaves_deadline_unchanged(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _approve_cbs(client, admin_headers, tx_id)
    up = _upload(client, admin_headers, tx_id, "amend_extend.pdf")
    client.post(f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=admin_headers)

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    target = next(
        p
        for p in proposals
        if p["deadlineKey"] == "inspection_resolution_deadline" and p["status"] == "pending"
    )
    before = next(
        d
        for d in client.get(f"/api/transactions/{tx_id}/deadlines", headers=admin_headers).json()
        if d["deadlineKey"] == "inspection_resolution_deadline"
    )

    resp = client.post(
        f"/api/deadline-proposals/{target['id']}/reject", headers=admin_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"

    after = next(
        d
        for d in client.get(f"/api/transactions/{tx_id}/deadlines", headers=admin_headers).json()
        if d["deadlineKey"] == "inspection_resolution_deadline"
    )
    assert after["dueDate"] == before["dueDate"]


def test_conflicting_reextraction_creates_proposal(client, admin_headers):
    """Re-approving a base contract over changed deadlines must propose, not overwrite."""
    import datetime as dt

    import app.db.session as db_session
    from sqlmodel import Session as DbSession
    from sqlmodel import select

    from app.models import Deadline

    tx_id = _demo_tx(client, admin_headers)
    _approve_cbs(client, admin_headers, tx_id)

    # Simulate an established deadline that drifted from the document value
    with DbSession(db_session.engine) as s:
        deadline = s.exec(
            select(Deadline).where(
                Deadline.transaction_id == tx_id,
                Deadline.deadline_key == "inspection_objection_deadline",
            )
        ).first()
        original_date = deadline.due_date
        deadline.due_date = original_date + dt.timedelta(days=3)
        s.add(deadline)
        s.commit()
        shifted = deadline.due_date

    result = _approve_cbs(client, admin_headers, tx_id)  # same doc, conflicting date
    assert result["proposals"] >= 1

    deadlines = client.get(f"/api/transactions/{tx_id}/deadlines", headers=admin_headers).json()
    objection = next(
        d for d in deadlines if d["deadlineKey"] == "inspection_objection_deadline"
    )
    assert objection["dueDate"] == shifted.isoformat()  # not silently overwritten

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    conflict = next(
        p
        for p in proposals
        if p["deadlineKey"] == "inspection_objection_deadline" and p["status"] == "pending"
    )
    assert conflict["oldDate"] == shifted.isoformat()
    assert conflict["newDate"] == original_date.isoformat()


def test_reapproving_same_document_is_idempotent(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    first = _approve_cbs(client, admin_headers, tx_id)
    assert first["deadlinesCreated"] > 20

    second = _approve_cbs(client, admin_headers, tx_id)  # identical values
    assert second["deadlinesCreated"] == 0
    assert second["deadlinesUpdated"] == 0
    assert second["proposals"] == 0
