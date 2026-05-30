def test_auth_session(client):
    resp = client.post("/api/auth/session")
    assert resp.status_code == 200
    body = resp.json()
    assert body["token"]
    assert body["user"]["name"] == "Brett Predmore"
    assert body["user"]["brokerage"] == "RE/MAX Real Estate Group"


def test_transactions_non_empty_after_seed(client):
    resp = client.get("/api/transactions")
    assert resp.status_code == 200
    cards = resp.json()
    assert len(cards) >= 1

    card = cards[0]
    # camelCase contract
    assert "daysToClose" in card
    assert "progress" in card
    assert card["address"] == "4902 Cherry Springs Drive"
    assert card["city"] == "Colorado Springs"
    assert card["price"] == 520000
    assert card["active"] is True


def test_transaction_detail(client):
    cards = client.get("/api/transactions").json()
    tx_id = cards[0]["id"]

    resp = client.get(f"/api/transactions/{tx_id}")
    assert resp.status_code == 200
    detail = resp.json()

    assert detail["property"]["hasHoa"] is True
    assert detail["property"]["isRural"] is False
    assert len(detail["parties"]) >= 2
    assert len(detail["stages"]) == 5
    assert detail["money"]["price"] == 520000
    assert detail["money"]["earnest"] == 5000
    assert len(detail["deadlines"]) > 0
    assert len(detail["tasks"]) > 0
    # tasks are grouped
    assert "group" in detail["tasks"][0]
    assert "items" in detail["tasks"][0]
    assert "counts" in detail


def test_transaction_deadlines_endpoint(client):
    tx_id = client.get("/api/transactions").json()[0]["id"]
    resp = client.get(f"/api/transactions/{tx_id}/deadlines")
    assert resp.status_code == 200
    deadlines = resp.json()
    assert len(deadlines) > 0
    # N/A deadlines (Lead-Based Paint, Water Rights, etc.) are stored but marked not_applicable.
    # "Closing Date" is a contract field (§12), not a CTME Dates & Deadlines row.
    events = {d["event"] for d in deadlines}
    assert "Appraisal Deadline" in events
    assert "Inspection Objection Deadline" in events
    # N/A deadlines should be present with not_applicable applicability.
    na_deadlines = [d for d in deadlines if d.get("isNa") or d.get("applicability") == "not_applicable"]
    assert len(na_deadlines) > 0


def test_transaction_404(client):
    resp = client.get("/api/transactions/does-not-exist")
    assert resp.status_code == 404
    assert "detail" in resp.json()


def test_patch_task(client):
    tx_id = client.get("/api/transactions").json()[0]["id"]
    detail = client.get(f"/api/transactions/{tx_id}").json()
    task_id = detail["tasks"][0]["items"][0]["id"]

    resp = client.patch(f"/api/tasks/{task_id}", json={"state": "doing"})
    assert resp.status_code == 200
    assert resp.json()["state"] == "doing"

    bad = client.patch(f"/api/tasks/{task_id}", json={"state": "bogus"})
    assert bad.status_code == 400
