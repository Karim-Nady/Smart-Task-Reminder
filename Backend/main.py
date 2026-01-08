# main.py
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import features
from database import get_db, Base, engine
from schemas import InsightsResponse, Task, TaskCreate, TaskUpdate
from datetime import datetime

app = FastAPI(
    title="Smart Task Reminder API",
    description="A comprehensive task management API with reminders and insights",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Smart Task Reminder API is running",
        "version": "1.0.0"
    }


# Special routes MUST come before /tasks/{task_id} to avoid conflicts
@app.get("/tasks/upcoming-tasks", response_model=List[Task])
def get_upcoming_tasks(db: Session = Depends(get_db)):
    """Get all upcoming tasks (future due dates)"""
    return features.upcoming_tasks(db)


@app.get("/tasks/overdue-tasks", response_model=List[Task])
def get_overdue_tasks(db: Session = Depends(get_db)):
    """Get all overdue tasks (past due dates, not completed)"""
    return features.overdue_tasks(db)


@app.get("/tasks/reminders", response_model=List[Task])
def get_reminders(db: Session = Depends(get_db)):
    """Get tasks with reminders due within 24 hours"""
    return features.reminders(db)


@app.get("/tasks/summary", response_model=InsightsResponse)
def get_insights(db: Session = Depends(get_db)):
    """Get comprehensive task insights and statistics"""
    return features.insights(db)


# Standard CRUD operations
@app.get("/tasks", response_model=List[Task])
def read_tasks(
    status: Optional[str] = None,
    priority: Optional[int] = None,
    due_before: Optional[datetime] = None,
    due_after: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort_by: str = "created_at",
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """Get all tasks with optional filtering and pagination"""
    return crud.get_tasks(
        db=db,
        status=status,
        priority=priority,
        due_before=due_before,
        due_after=due_after,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        order=order,
    )


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    return crud.create_task(db, task)


@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task (partial updates supported)"""
    updated = crud.update_task(db, task_id, task)
    if updated is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted successfully", "id": task_id}