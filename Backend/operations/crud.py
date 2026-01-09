# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from models import Task as TaskModel, Notification
from schemas import TaskCreate, TaskUpdate
from typing import Optional
from datetime import datetime, timedelta

def create_task(db, task_data: TaskCreate, user_id):
    task = TaskModel(**task_data.dict(), user_id=user_id)
    db.add(task)
    db.commit()
    db.refresh(task)

    if task.due_date and task.reminder_enabled:
        reminder_time = task.due_date - timedelta(minutes=30)
        if reminder_time > datetime.now():  # Only create if in future
            reminder = Notification(
                user_id=user_id,
                task_id=task.id,
                scheduled_for=reminder_time,
                message=f"Reminder: {task.title} is due in 30 minutes"
            )

            db.add(reminder)
            db.commit()

    return task


def get_tasks(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[int] = None,
    due_before: Optional[datetime] = None,
    due_after: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: str = "created_at",
    order: str = "desc",
):
    """Get tasks with optional filtering and sorting"""
    query = db.query(TaskModel)

    # Filtering
    if status:
        query = query.filter(TaskModel.status == status)

    if priority is not None:
        query = query.filter(TaskModel.priority == priority)

    if due_before:
        query = query.filter(TaskModel.due_date <= due_before)

    if due_after:
        query = query.filter(TaskModel.due_date >= due_after)

    # Sorting
    sort_column = getattr(TaskModel, sort_by, TaskModel.created_at)
    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination
    query = query.offset(offset).limit(limit)

    return query.all()


def get_task_for_user(db: Session, task_id: int, user_id: int) -> Optional[TaskModel]:
    return db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == user_id
    ).first()

def update_task(db: Session, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[TaskModel]:
    """Update a task with partial data"""
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == user_id
    ).first()
    if not task:
        return None
    
    # Only update fields that are provided
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    task.updated_at = datetime.now()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, user_id: int) -> bool:
    """Delete a task"""
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == user_id
    ).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True




def get_tasks_for_user(
    db,
    user_id: int,
    status: str | None = None,
    priority: int | None = None,
    due_before = None,
    due_after = None,
    limit: int = 100,
    offset: int = 0,
    sort_by: str = "created_at",
    order: str = "desc",
):
    query = db.query(TaskModel).filter(TaskModel.user_id == user_id)

    # ---------- Filters ----------
    if status:
        query = query.filter(TaskModel.status == status)

    if priority is not None:
        query = query.filter(TaskModel.priority == priority)

    if due_before:
        query = query.filter(TaskModel.due_date <= due_before)

    if due_after:
        query = query.filter(TaskModel.due_date >= due_after)

    # ---------- Sorting ----------
    sort_column = getattr(TaskModel, sort_by, TaskModel.created_at)

    if order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # ---------- Pagination ----------
    query = query.offset(offset).limit(limit)

    return query.all()

