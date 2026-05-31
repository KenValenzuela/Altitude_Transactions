from sqlmodel import Session, select
import app.db.session as db_session
from app.core.config import settings
from app.models import User
from app.services.fixture_provider import seed_fixture_transaction

def seed_initial_data() -> None:
    with Session(db_session.engine) as session:
        user = session.exec(select(User)).first()
        if user is None:
            user = User(
                name=settings.seed_broker_name,
                email=settings.seed_broker_email,
                brokerage=settings.seed_broker_brokerage or None,
                license_no=settings.seed_broker_license or None,
            )
            session.add(user); session.commit(); session.refresh(user)
        seed_fixture_transaction(session, user)
