from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth.dependencies import get_current_user
from models import User
from schemas import Task, Notification as NotificationSchema
import operations.features as features

router = APIRouter()

from models import Notification

@router.get("/", response_model=list[NotificationSchema])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.sent == True
        )
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/reminders", response_model=List[Task])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return features.reminders(db, current_user.id)


@router.get("/upcoming", response_model=List[Task])
def get_upcoming_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return features.upcoming_tasks(db, current_user.id)


@router.get("/overdue", response_model=List[Task])
def get_overdue_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return features.overdue_tasks(db, current_user.id)


@router.get("/summary")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return features.insights(db, current_user.id)
