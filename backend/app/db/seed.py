from sqlmodel import Session, select
import app.db.session as db_session
from app.models import User
from app.services.demo_workflow import seed_demo

def seed_demo_data() -> None:
    with Session(db_session.engine) as session:
        user = session.exec(select(User)).first()
        if user is None:
            user = User(name="Brett Predmore", email="brett.predmore@icloud.com", brokerage="RE/MAX Real Estate Group", license_no="FA100002032")
            session.add(user); session.commit(); session.refresh(user)
        seed_demo(session, user)
