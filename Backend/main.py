from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from workers.scheduler import start_scheduler
from database import Base, engine
from routes import auth, tasks, notifications

app = FastAPI(title="Task Manager API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Smart Task Reminder API is running",
        "version": "1.0.0"
    }

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
