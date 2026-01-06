# crud.py
from sqlalchemy.orm import Session
from models import Task as TaskModel
from schemas import TaskCreate, Task
from typing import Optional

# Create a task
def create_task(db: Session, task_data: TaskCreate) -> TaskModel:
    db_task = TaskModel(**task_data.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)  # get auto-generated ID
    return db_task

# Get all tasks
def get_tasks(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[int] = None,
    due_before=None,
    due_after=None,
    limit: int = 10,
    offset: int = 0,
    sort_by: str = "created_at",
    order: str = "desc",
):
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

# Get task by ID
def get_task(db: Session, task_id: int):
    return db.query(TaskModel).filter(TaskModel.id == task_id).first()

# Update task
def update_task(db: Session, task_id: int, task_data: TaskCreate):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        return None
    for key, value in task_data.dict().items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

# Delete task
def delete_task(db: Session, task_id: int):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
