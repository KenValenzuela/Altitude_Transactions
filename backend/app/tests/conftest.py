"""Pytest fixtures: temp SQLite DB + TestClient with dependency overrides."""
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

    # Patch the shared engine / settings before importing app modules that use them.
    import app.db.session as session_module
    from app.core.config import settings

    session_module.engine = test_engine
    settings.upload_dir = str(upload_dir)

    import app.models  # noqa: F401

    SQLModel.metadata.create_all(test_engine)

    def get_session_override() -> Generator[Session, None, None]:
        with Session(test_engine) as session:
            yield session

    from app.api.deps import get_session as deps_get_session
    from app.db.seed import seed_demo_data
    from app.db.session import get_session as db_get_session
    from app.main import app

    # Ensure seed + all session usages hit the test engine.
    seed_demo_data()

    app.dependency_overrides[deps_get_session] = get_session_override
    app.dependency_overrides[db_get_session] = get_session_override

    with TestClient(app) as c:
        # Disable lifespan re-seed against the real DB by overriding init.
        yield c

    app.dependency_overrides.clear()
