from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from models import Notification

def process_due_reminders():
    db: Session = SessionLocal()
    try:
        now = datetime.now()

        reminders = (
            db.query(Notification)
            .filter(
                Notification.sent.is_(False),
                Notification.scheduled_for <= now
            )
            .all()
        )

        for reminder in reminders:
            reminder.sent = True

        if reminders:
            db.commit()

    finally:
        db.close()
