# features.py
import datetime
from typing import List
from sqlalchemy.orm import Session
from models import Task as TaskModel


# Upcoming tasks	
def upcoming_tasks(db: Session) -> List[TaskModel]:
    current_datetime = datetime.now()
    db_upcoming_tasks = db.query(TaskModel).filter(TaskModel.due_date >= current_datetime).all()
    return db_upcoming_tasks


# Overdue tasks	
def overdue_tasks(db: Session) -> List[TaskModel]:
    current_datetime = datetime.now()
    db_overdue_tasks = db.query(TaskModel).filter(TaskModel.due_date < current_datetime).all()
    return db_overdue_tasks

# Reminders
def reminders(db: Session) -> List[TaskModel]:
    current_datetime = datetime.now()
    db_reminder_tasks = db.query(TaskModel).filter(
        TaskModel.due_date >= current_datetime,
        TaskModel.due_date <= current_datetime + datetime.timedelta(hours=1)
    ).all()
    return db_reminder_tasks

# Insights
def insights(db: Session) -> dict:
    db_done_tasks = db.query(TaskModel).filter(TaskModel.status == "done").all()
    db_pending_tasks = db.query(TaskModel).filter(TaskModel.status == "pending").all()
    db_cancelled_tasks = db.query(TaskModel).filter(TaskModel.status == "cancelled").all()
    return {
        "done": len(db_done_tasks),
        "pending": len(db_pending_tasks),
        "cancelled": len(db_cancelled_tasks),
        "total": len(db_done_tasks) + len(db_pending_tasks) + len(db_cancelled_tasks)
    }


