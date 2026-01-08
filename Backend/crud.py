# crud.py
from sqlalchemy.orm import Session
from models import Task as TaskModel
from schemas import TaskCreate, TaskUpdate
from typing import Optional
from datetime import datetime


def create_task(db: Session, task_data: TaskCreate) -> TaskModel:
    """Create a new task"""
    db_task = TaskModel(**task_data.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


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


def get_task(db: Session, task_id: int) -> Optional[TaskModel]:
    """Get a single task by ID"""
    return db.query(TaskModel).filter(TaskModel.id == task_id).first()


def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Optional[TaskModel]:
    """Update a task with partial data"""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
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


def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task"""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True