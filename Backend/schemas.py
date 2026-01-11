# schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=2, ge=1, le=3)  # 1=low, 2=medium, 3=high
    status: str = "pending"
    category: Optional[str] = "General"
    reminder_enabled: bool = True
    completed: bool = False


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=None, ge=1, le=3)
    status: Optional[str] = None
    category: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    completed: Optional[bool] = None


class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InsightsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    tasks_due_today: int
    upcoming_tasks: int
    completion_rate: float
    avg_completion_time: Optional[float] = None


class Notification(BaseModel):
    id: int
    task_id: int
    message: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str

    class Config:
        from_attributes = True

# Update Token to use UserResponse
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse