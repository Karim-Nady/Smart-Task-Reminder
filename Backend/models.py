# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    
    due_date = Column(DateTime, nullable=True)
    priority = Column(Integer, nullable=False, default=2)  # 1=low, 2=medium, 3=high
    status = Column(String, nullable=False, default="pending")  # "pending"/"cancelled"/"done"
    category = Column(String, nullable=True, default="General")
    reminder_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.now)

    user = relationship("User", back_populates="tasks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    scheduled_for = Column(DateTime, nullable=False)
    sent = Column(Boolean, default=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    is_read = Column(Boolean, default=False)

    task = relationship("Task")
    user = relationship("User", back_populates="notifications")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # is_active = Column(Boolean, default=True)
    # created_at = Column(DateTime, default=datetime.now)

    tasks = relationship("Task", back_populates="user")
    notifications = relationship("Notification", back_populates="user")