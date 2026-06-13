"""Phase 5 tests: deterministic deadline -> task engine and dashboard widgets."""
from __future__ import annotations

FAKE_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _demo_tx(client, headers) -> str:
    return client.get("/api/transactions", headers=headers).json()[0]["id"]


def _upload_and_approve(client, headers, tx_id, filename="contract.pdf") -> dict:
    up = client.post(
        f"/api/transactions/{tx_id}/files",
        files={"file": (filename, FAKE_PDF, "application/pdf")},
        headers=headers,
    ).json()
    resp = client.post(f"/api/extraction-jobs/{up['extractionJobId']}/approve", headers=headers)
    assert resp.status_code == 200, resp.json()
    return resp.json()


def _tasks(client, headers, tx_id) -> list[dict]:
    return client.get(f"/api/transactions/{tx_id}/tasks", headers=headers).json()


def _deadlines(client, headers, tx_id) -> list[dict]:
    return client.get(f"/api/transactions/{tx_id}/deadlines", headers=headers).json()


# ─── Task generation ──────────────────────────────────────────────────────────

def test_approving_contract_generates_deadline_tasks(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)

    deadlines = _deadlines(client, admin_headers, tx_id)
    active_dated = [
        d for d in deadlines if d["applicability"] == "active" and d["dueDate"]
    ]
    tasks = _tasks(client, admin_headers, tx_id)
    deadline_tasks = [t for t in tasks if t["source"] == "deadline"]

    assert len(deadline_tasks) == len(active_dated)
    assert len(deadline_tasks) > 20

    # Every deadline task carries the link + due date of its deadline
    by_deadline = {d["id"]: d for d in deadlines}
    for task in deadline_tasks:
        deadline = by_deadline[task["linkedDeadlineId"]]
        assert task["dueDate"] == deadline["dueDate"]
        assert task["status"] == "open"


def test_registry_titles_for_known_deadlines(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)

    deadlines = {d["deadlineKey"]: d for d in _deadlines(client, admin_headers, tx_id)}
    tasks = _tasks(client, admin_headers, tx_id)
    by_deadline_id = {t["linkedDeadlineId"]: t for t in tasks if t["linkedDeadlineId"]}

    objection_task = by_deadline_id[deadlines["inspection_objection_deadline"]["id"]]
    assert objection_task["title"] == "Send inspection objection or confirm waiver"

    closing_task = by_deadline_id[deadlines["closing_date"]["id"]]
    assert "closing logistics" in closing_task["title"].lower()


def test_na_deadlines_get_no_tasks(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)

    deadlines = _deadlines(client, admin_headers, tx_id)
    na_ids = {d["id"] for d in deadlines if d["applicability"] == "not_applicable"}
    assert na_ids, "Fixture includes N/A deadline rows"

    tasks = _tasks(client, admin_headers, tx_id)
    linked = {t["linkedDeadlineId"] for t in tasks if t["linkedDeadlineId"]}
    assert not (na_ids & linked)


def test_task_sync_is_idempotent(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)
    count_first = len(_tasks(client, admin_headers, tx_id))

    _upload_and_approve(client, admin_headers, tx_id)  # same document again
    count_second = len(_tasks(client, admin_headers, tx_id))
    assert count_second == count_first


def test_proposal_approval_moves_linked_task(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)
    _upload_and_approve(client, admin_headers, tx_id, "amend_extend.pdf")

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    closing = next(
        p for p in proposals if p["deadlineKey"] == "closing_date" and p["status"] == "pending"
    )
    client.post(f"/api/deadline-proposals/{closing['id']}/approve", headers=admin_headers)

    deadlines = {d["deadlineKey"]: d for d in _deadlines(client, admin_headers, tx_id)}
    tasks = _tasks(client, admin_headers, tx_id)
    closing_task = next(
        t for t in tasks if t["linkedDeadlineId"] == deadlines["closing_date"]["id"]
    )
    assert closing_task["dueDate"] == "2025-12-05"  # moved with the approved proposal


def test_done_task_not_reopened_by_deadline_move(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    _upload_and_approve(client, admin_headers, tx_id)

    deadlines = {d["deadlineKey"]: d for d in _deadlines(client, admin_headers, tx_id)}
    closing_deadline = deadlines["closing_date"]
    closing_task = next(
        t
        for t in _tasks(client, admin_headers, tx_id)
        if t["linkedDeadlineId"] == closing_deadline["id"]
    )
    original_due = closing_task["dueDate"]

    done = client.patch(
        f"/api/tasks/{closing_task['id']}", json={"status": "done"}, headers=admin_headers
    )
    assert done.status_code == 200
    assert done.json()["completedAt"] is not None

    # Amendment moves the closing date; the completed task must stay done
    _upload_and_approve(client, admin_headers, tx_id, "amend_extend.pdf")
    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    closing_prop = next(
        p for p in proposals if p["deadlineKey"] == "closing_date" and p["status"] == "pending"
    )
    client.post(f"/api/deadline-proposals/{closing_prop['id']}/approve", headers=admin_headers)

    refreshed = next(
        t
        for t in _tasks(client, admin_headers, tx_id)
        if t["id"] == closing_task["id"]
    )
    assert refreshed["status"] == "done"
    assert refreshed["dueDate"] == original_due


# ─── Manual tasks ─────────────────────────────────────────────────────────────

def test_manual_task_create_and_complete(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)

    created = client.post(
        f"/api/transactions/{tx_id}/tasks",
        json={"title": "Order home warranty", "dueDate": "2026-07-01"},
        headers=admin_headers,
    )
    assert created.status_code == 201
    task = created.json()
    assert task["source"] == "manual"
    assert task["status"] == "open"

    done = client.patch(
        f"/api/tasks/{task['id']}", json={"status": "done"}, headers=admin_headers
    ).json()
    assert done["status"] == "done"
    assert done["completedAt"] is not None

    reopened = client.patch(
        f"/api/tasks/{task['id']}", json={"status": "open"}, headers=admin_headers
    ).json()
    assert reopened["status"] == "open"
    assert reopened["completedAt"] is None


def test_task_patch_invalid_status(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    task = client.post(
        f"/api/transactions/{tx_id}/tasks",
        json={"title": "X"},
        headers=admin_headers,
    ).json()
    assert (
        client.patch(
            f"/api/tasks/{task['id']}", json={"status": "someday"}, headers=admin_headers
        ).status_code
        == 422
    )


# ─── Dashboard widgets ────────────────────────────────────────────────────────

def test_dashboard_tracks_tasks_and_proposals(client, admin_headers):
    tx_id = _demo_tx(client, admin_headers)
    base = client.get("/api/dashboard", headers=admin_headers).json()
    assert base["openTasks"] == 0
    assert base["pendingProposals"] == 0

    _upload_and_approve(client, admin_headers, tx_id)
    after_contract = client.get("/api/dashboard", headers=admin_headers).json()
    assert after_contract["openTasks"] > 20
    assert after_contract["upcomingDeadlines"] is not None

    _upload_and_approve(client, admin_headers, tx_id, "amend_extend.pdf")
    with_proposals = client.get("/api/dashboard", headers=admin_headers).json()
    assert with_proposals["pendingProposals"] == 2

    proposals = client.get(
        f"/api/transactions/{tx_id}/deadline-proposals", headers=admin_headers
    ).json()
    pending = [p for p in proposals if p["status"] == "pending"]
    client.post(f"/api/deadline-proposals/{pending[0]['id']}/approve", headers=admin_headers)
    client.post(f"/api/deadline-proposals/{pending[1]['id']}/reject", headers=admin_headers)

    settled = client.get("/api/dashboard", headers=admin_headers).json()
    assert settled["pendingProposals"] == 0
