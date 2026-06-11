from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# check_same_thread is a SQLite-specific connect arg; only pass it for SQLite.
_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, echo=False, connect_args=_connect_args)


def init_db() -> None:
    """Create all tables. Idempotent.

    Used for local SQLite quickstart and tests. Postgres deployments should run
    `alembic upgrade head` instead (create_all is still safe on a fresh DB).
    """
    import app.models  # noqa: F401 - populate SQLModel metadata

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
