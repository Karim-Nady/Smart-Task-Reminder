from fastapi import APIRouter, Depends, HTTPException
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

@router.put("/{notification_id}", response_model=NotificationSchema)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get the notification
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
    
    # Check if notification exists
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check if notification belongs to current user
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this notification")
    
    # Mark as read
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification
