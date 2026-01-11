# features.py
import datetime
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models import Task as TaskModel


def upcoming_tasks(db: Session, user_id: int) -> List[TaskModel]:
    """Get tasks due in the future (not overdue)"""
    current_datetime = datetime.datetime.now()
    return db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.due_date >= current_datetime,
            TaskModel.status == "pending"
        )
    ).all()


def overdue_tasks(db: Session, user_id: int) -> List[TaskModel]:
    """Get tasks that are past due date and not completed"""
    current_datetime = datetime.datetime.now()
    return db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.due_date < current_datetime,
            TaskModel.status == "pending",
            TaskModel.completed == False
        )
    ).all()


def reminders(db: Session, user_id: int) -> List[TaskModel]:
    """Get tasks with reminders enabled that are due within 24 hours"""
    current_datetime = datetime.datetime.now()
    deadline = current_datetime + datetime.timedelta(hours=24)
    
    print(db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.reminder_enabled == True,
            TaskModel.due_date >= current_datetime,
            TaskModel.due_date <= deadline,
            TaskModel.completed == False
        )
    ).all())
    return db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.reminder_enabled == True,
            TaskModel.due_date >= current_datetime,
            TaskModel.due_date <= deadline,
            TaskModel.completed == False
        )
    ).all()


def insights(db: Session, user_id: int) -> dict:
    """Calculate comprehensive task insights"""
    current_datetime = datetime.datetime.now()
    today_start = current_datetime.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + datetime.timedelta(days=1)
    
    # Basic counts
    all_tasks = db.query(TaskModel).filter(TaskModel.user_id == user_id).all()
    total_tasks = len(all_tasks)
    
    completed_tasks = db.query(TaskModel).filter(
        TaskModel.user_id == user_id,
        TaskModel.completed == True
    ).count()
    
    pending_tasks = db.query(TaskModel).filter(
        TaskModel.user_id == user_id,
        TaskModel.status == "pending"
    ).count()
    
    overdue_count = db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.due_date < current_datetime,
            TaskModel.status == "pending",
            TaskModel.completed == False
        )
    ).count()
    
    tasks_due_today = db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.due_date >= today_start,
            TaskModel.due_date < today_end,
            TaskModel.completed == False
        )
    ).count()
    
    upcoming_count = db.query(TaskModel).filter(
        and_(
            TaskModel.user_id == user_id,
            TaskModel.due_date >= current_datetime,
            TaskModel.status == "pending"
        )
    ).count()
    
    # Completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Average completion time
    completed_with_dates = db.query(TaskModel).filter(
        and_(
            TaskModel.completed == True,
            TaskModel.due_date.isnot(None)
        )
    ).all()
    
    avg_completion_time = None
    if completed_with_dates:
        total_days = sum([
            (task.due_date - task.created_at).days
            for task in completed_with_dates
            if task.due_date and task.created_at
        ])
        avg_completion_time = total_days / len(completed_with_dates) if len(completed_with_dates) > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_count,
        "tasks_due_today": tasks_due_today,
        "upcoming_tasks": upcoming_count,
        "completion_rate": round(completion_rate, 2),
        "avg_completion_time": round(avg_completion_time, 2) if avg_completion_time else None,
    }