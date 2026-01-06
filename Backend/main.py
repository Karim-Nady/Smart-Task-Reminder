# main.py
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud
import features
from database import get_db, Base, engine
from schemas import InsightsResponse, Task, TaskCreate
from datetime import datetime

app = FastAPI(title="Smart Task Reminder API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/tasks", response_model=List[Task])
def read_tasks(
    status: str | None = None,
    priority: int | None = None,
    due_before: datetime | None = None,
    due_after: datetime | None = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = "created_at",
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
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

@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)


@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskCreate, db: Session = Depends(get_db)):
    updated = crud.update_task(db, task_id, task)
    if updated is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted"}

@app.get("/tasks/upcoming-tasks", response_model=List[Task])
def get_upcoming_tasks(db: Session = Depends(get_db)):
    return features.upcoming_task(db)

@app.get("/tasks/overdue-tasks", response_model=List[Task])
def get_overdue_tasks(db: Session = Depends(get_db)):
    return features.overdue_task(db)

@app.get("/tasks/reminders", response_model=List[Task])
def get_reminders(db: Session = Depends(get_db)):
    return features.reminders(db)

@app.get("/tasks/summary", response_model=InsightsResponse)
def get_insights(db: Session = Depends(get_db)):
    return features.insights(db)