"""Phase 1 API tests: auth, transactions, and checklist."""
from __future__ import annotations


# ─── Auth ─────────────────────────────────────────────────────────────────────

def test_login_success(client):
    from app.core.config import settings

    resp = client.post(
        "/api/auth/login",
        json={"email": settings.seed_admin_email, "password": settings.seed_admin_password},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "accessToken" in body
    assert body["tokenType"] == "bearer"
    user = body["user"]
    assert user["email"] == settings.seed_admin_email
    assert user["role"] == "admin"
    assert user["organizationId"] is not None


def test_login_bad_password(client):
    from app.core.config import settings

    resp = client.post(
        "/api/auth/login",
        json={"email": settings.seed_admin_email, "password": "wrong"},
    )
    assert resp.status_code == 401


def test_login_unknown_user(client):
    resp = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "x"})
    assert resp.status_code == 401


def test_me_returns_current_user(client, admin_headers):
    resp = client.get("/api/auth/me", headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["role"] == "admin"
    assert body["organizationId"] is not None


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_agent_login_and_role(client):
    from app.core.config import settings

    resp = client.post(
        "/api/auth/login",
        json={"email": settings.seed_agent_email, "password": settings.seed_agent_password},
    )
    assert resp.status_code == 200
    assert resp.json()["user"]["role"] == "agent"


# ─── Transactions ─────────────────────────────────────────────────────────────

def test_list_transactions_requires_auth(client):
    assert client.get("/api/transactions").status_code == 401


def test_list_transactions_includes_seeded_demo(client, admin_headers):
    resp = client.get("/api/transactions", headers=admin_headers)
    assert resp.status_code == 200
    cards = resp.json()
    assert len(cards) >= 1
    card = cards[0]
    assert "propertyAddress" in card
    assert "checklistTotal" in card
    assert "daysToClose" in card
    assert card["propertyAddress"] == "4902 Cherry Springs Drive"
    assert card["city"] == "Colorado Springs"
    assert card["side"] == "buyer"
    assert card["financingType"] == "conventional"


def test_create_transaction(client, admin_headers):
    payload = {
        "propertyAddress": "123 Main St",
        "city": "Denver",
        "state": "CO",
        "zip": "80202",
        "county": "Denver",
        "side": "buyer",
        "financingType": "conventional",
        "contractDate": "2026-06-01",
        "closingDate": "2026-07-15",
    }
    resp = client.post("/api/transactions", json=payload, headers=admin_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["propertyAddress"] == "123 Main St"
    assert body["side"] == "buyer"
    assert body["financingType"] == "conventional"
    assert body["status"] == "active"
    assert "id" in body
    assert body["daysToClose"] is not None


def test_create_transaction_invalid_side(client, admin_headers):
    resp = client.post(
        "/api/transactions",
        json={"propertyAddress": "X", "city": "Denver", "side": "notaside", "financingType": "fha"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_create_transaction_requires_auth(client):
    resp = client.post(
        "/api/transactions",
        json={"propertyAddress": "X", "city": "Denver", "side": "buyer", "financingType": "fha"},
    )
    assert resp.status_code == 401


def test_get_transaction(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    resp = client.get(f"/api/transactions/{tx_id}", headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == tx_id
    assert "propertyAddress" in body
    assert "organizationId" in body


def test_get_transaction_not_found(client, admin_headers):
    resp = client.get("/api/transactions/does-not-exist", headers=admin_headers)
    assert resp.status_code == 404


def test_patch_transaction(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    resp = client.patch(
        f"/api/transactions/{tx_id}",
        json={"county": "El Paso", "purchasePrice": 550000},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["county"] == "El Paso"
    assert body["purchasePrice"] == 550000


def test_delete_transaction_requires_admin(client, agent_headers, admin_headers):
    tx = client.post(
        "/api/transactions",
        json={"propertyAddress": "Del Me", "city": "Denver", "side": "seller", "financingType": "cash"},
        headers=admin_headers,
    ).json()
    tx_id = tx["id"]

    # Agent cannot delete
    resp = client.delete(f"/api/transactions/{tx_id}", headers=agent_headers)
    assert resp.status_code == 403

    # Admin can delete
    resp = client.delete(f"/api/transactions/{tx_id}", headers=admin_headers)
    assert resp.status_code == 204


# ─── Checklist ────────────────────────────────────────────────────────────────

def test_checklist_returns_sections(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    resp = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers)
    assert resp.status_code == 200
    body = resp.json()

    assert body["transactionId"] == tx_id
    assert body["total"] > 0
    sections = body["sections"]
    assert len(sections) == 8  # Colorado 8-section workflow

    section_keys = {s["key"] for s in sections}
    assert "purchase_contract" in section_keys
    assert "title_escrow" in section_keys
    assert "inspection_due_diligence" in section_keys

    for sec in sections:
        for item in sec["items"]:
            assert "id" in item
            assert "name" in item
            assert "status" in item
            assert "required" in item
            assert "isCore" in item


def test_checklist_counts_match(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    all_items = [i for s in checklist["sections"] for i in s["items"]]
    assert len(all_items) == checklist["total"]
    assert sum(1 for i in all_items if i["status"] == "approved") == checklist["approved"]
    assert sum(1 for i in all_items if i["status"] == "needed") == checklist["needed"]


def test_patch_checklist_item_status(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    needed_items = [
        i for s in checklist["sections"] for i in s["items"] if i["status"] == "needed"
    ]
    assert needed_items, "Expected at least one needed item"
    item_id = needed_items[0]["id"]

    resp = client.patch(
        f"/api/transactions/{tx_id}/checklist/{item_id}",
        json={"status": "uploaded"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "uploaded"


def test_patch_checklist_item_invalid_status(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=admin_headers).json()
    item_id = checklist["sections"][0]["items"][0]["id"]

    resp = client.patch(
        f"/api/transactions/{tx_id}/checklist/{item_id}",
        json={"status": "totally_made_up"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_patch_core_item_na_blocked_for_agent(client, agent_headers):
    cards = client.get("/api/transactions", headers=agent_headers).json()
    tx_id = cards[0]["id"]

    checklist = client.get(f"/api/transactions/{tx_id}/checklist", headers=agent_headers).json()
    core_items = [
        i
        for s in checklist["sections"]
        for i in s["items"]
        if i["isCore"] and i["status"] != "not_applicable"
    ]
    assert core_items, "Expected at least one core item"

    resp = client.patch(
        f"/api/transactions/{tx_id}/checklist/{core_items[0]['id']}",
        json={"status": "not_applicable"},
        headers=agent_headers,
    )
    assert resp.status_code == 403


def test_add_custom_checklist_item(client, admin_headers):
    cards = client.get("/api/transactions", headers=admin_headers).json()
    tx_id = cards[0]["id"]

    resp = client.post(
        f"/api/transactions/{tx_id}/checklist",
        json={
            "name": "Custom Due Diligence Item",
            "section": "inspection_due_diligence",
            "required": False,
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Custom Due Diligence Item"
    assert body["section"] == "inspection_due_diligence"
    assert body["isCore"] is False
    assert body["status"] == "needed"


def test_new_transaction_has_checklist(client, admin_headers):
    tx = client.post(
        "/api/transactions",
        json={"propertyAddress": "999 New St", "city": "Boulder", "side": "buyer", "financingType": "fha"},
        headers=admin_headers,
    ).json()

    checklist = client.get(
        f"/api/transactions/{tx['id']}/checklist", headers=admin_headers
    ).json()
    assert checklist["total"] == 23  # 23 core template rows
    assert checklist["needed"] == 23
    assert checklist["approved"] == 0
