# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    
    due_date = Column(DateTime, nullable=True)
    priority = Column(Integer, nullable=False, default=2)  # 1=low, 2=medium, 3=high
    status = Column(String, nullable=False, default="pending")  # "pending"/"cancelled"/"done"
    category = Column(String, nullable=True, default="General")  # NEW FIELD
    reminder_enabled = Column(Boolean, default=True)  # NEW FIELD
    
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.now)