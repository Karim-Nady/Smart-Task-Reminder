# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class Task(Base):
    __tablename__ = "tasks"  # Table name in SQLite

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)

    due_date = Column(DateTime, nullable=True)
    priority = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="pending")  # "pending" / "cancelled" / "done"
    created_at = Column(DateTime, nullable=False, default=datetime.now)


