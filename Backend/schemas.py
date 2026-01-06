from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = 1  # e.g., 1 = low, 5 = high
    status: str = "pending"  # "pending" / "cancelled" / "done"
    created_at: Optional[datetime] = None
    completed: bool = False


class TaskCreate(TaskBase):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = 1  # e.g., 1 = low, 5 = high
    status: str = "pending"  # "pending" / "cancelled" / "done"
    completed: bool = False


class Task(TaskBase):
    id: int

class InsightsResponse(BaseModel):
    done: int
    pending: int
    cancelled: int
    total: int