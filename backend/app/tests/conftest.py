"""Pytest fixtures: temp SQLite DB + TestClient with auth helpers."""
from __future__ import annotations

import os
import tempfile
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture()
def client(tmp_path) -> Generator[TestClient, None, None]:
    db_path = tmp_path / "test_altitude.db"
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()

    test_engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )

    import app.db.session as session_module
    from app.core.config import settings

    session_module.engine = test_engine
    settings.upload_dir = str(upload_dir)

    import app.models  # noqa: F401

    SQLModel.metadata.create_all(test_engine)

    def get_session_override() -> Generator[Session, None, None]:
        with Session(test_engine) as session:
            yield session

    from app.api.deps import extraction_rate_limiter
    from app.api.deps import get_session as deps_get_session
    from app.db.seed import seed_initial_data
    from app.db.session import get_session as db_get_session
    from app.main import app

    seed_initial_data()
    # The limiter is module-level state; isolate tests from each other.
    extraction_rate_limiter._calls.clear()

    app.dependency_overrides[deps_get_session] = get_session_override
    app.dependency_overrides[db_get_session] = get_session_override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def admin_headers(client: TestClient) -> dict:
    """Authorization headers for the seeded admin user."""
    from app.core.config import settings

    resp = client.post(
        "/api/auth/login",
        json={"email": settings.seed_admin_email, "password": settings.seed_admin_password},
    )
    assert resp.status_code == 200, f"Admin login failed: {resp.json()}"
    token = resp.json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def agent_headers(client: TestClient) -> dict:
    """Authorization headers for the seeded agent user."""
    from app.core.config import settings

    resp = client.post(
        "/api/auth/login",
        json={"email": settings.seed_agent_email, "password": settings.seed_agent_password},
    )
    assert resp.status_code == 200, f"Agent login failed: {resp.json()}"
    token = resp.json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}
