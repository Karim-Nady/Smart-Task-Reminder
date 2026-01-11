```markdown
# 🧠 Smart Task Reminder API

A clean, modular, and production-ready **FastAPI backend** for managing tasks, notifications, and scheduled reminders using a background worker.  
Designed with scalability, clarity, and best practices in mind.

---

## 📌 Project Overview

**Smart Task Reminder API** allows users to:

- Create and manage tasks
- Schedule reminders for tasks
- Automatically process due reminders using a background worker
- Authenticate users securely using JWT
- Interact with a clean, well-structured REST API

The project is suitable as:

- A real-world backend portfolio project
- A base for mobile/web task reminder apps
- A learning reference for FastAPI + background jobs

---

## 🏗️ Architecture & Tech Stack

### 🔧 Technologies Used

- **Python 3.10+**
- **FastAPI** – API framework
- **SQLAlchemy** – ORM
- **SQLite** – Database (easy to replace with PostgreSQL)
- **APScheduler** – Background reminder worker
- **JWT (python-jose)** – Authentication
- **Pydantic** – Data validation
- **Uvicorn** – ASGI server

---

## 📂 Project Structure
```

Backend/
│
├── main.py # Application entry point
│
├── database/
│ ├── database.py # DB engine & session
│ └── models.py # SQLAlchemy models
│
├── schemas/
│ ├── task.py # Task schemas
│ ├── notification.py # Notification schemas
│ └── user.py # User schemas
│
├── crud/
│ ├── task.py # Task DB operations
│ ├── notification.py # Notification DB operations
│
├── routes/
│ ├── auth.py # Authentication routes
│ ├── tasks.py # Task routes
│ └── notifications.py # Notification routes
│
├── auth/
│ ├── security.py # JWT & password hashing
│ └── dependencies.py # Auth dependencies
│
├── workers/
│ └── reminder_worker.py # Background reminder logic
│
├── scheduler/
│ └── scheduler.py # APScheduler setup
│
├── requirements.txt
└── README.md

````

---

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing
- Protected routes using FastAPI dependencies

### Auth Flow
1. User logs in
2. Server returns JWT token
3. Token is sent via `Authorization: Bearer <token>`
4. Protected endpoints validate the token

---

## ⏰ Reminder Background Worker

### How it works

- APScheduler runs **every 1 minute**
- The worker:
  - Checks for due notifications
  - Marks them as triggered
  - (Optional) Sends email / push notification later

### Why APScheduler?

- Lightweight
- In-process
- Perfect for small–medium APIs
- Easy to replace with Celery later if needed

### Scheduler Setup (Simplified)

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import timezone
from workers.reminder_worker import process_due_reminders

scheduler = BackgroundScheduler(timezone=timezone.utc)
scheduler.add_job(process_due_reminders, trigger="interval", minutes=1)
scheduler.start()
````

---

## 🕒 Timezone Strategy (Important)

- **All datetimes are stored in UTC**
- Scheduler runs in UTC
- No `pytz` dependency
- Uses Python’s built-in `datetime.timezone.utc`

✅ This avoids:

- Time drift bugs
- Deployment timezone issues
- APScheduler warnings

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/smart-task-reminder-api.git
cd smart-task-reminder-api/Backend
```

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Linux / macOS
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Run the Application

```bash
uvicorn main:app --reload
```

---

### 5️⃣ Open API Docs

- Swagger UI:
  👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

- ReDoc:
  👉 [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📬 API Modules

### 🧩 Tasks

- Create task
- Update task
- List user tasks
- Delete task

### 🔔 Notifications

- Create reminder
- Attach reminder to task
- Auto-trigger via background worker

### 👤 Auth

- Login
- Token validation
- Protected endpoints

---

## 🧪 Testing Tips

- Use **Swagger UI** for quick testing
- Use **Postman** for auth + reminder flow
- Create reminders a few minutes in the future and observe logs

---

## 📈 Future Improvements (Not Implemented Yet)

- Email notifications
- Push notifications (Firebase)
- Celery + Redis for distributed workers
- PostgreSQL production database
- Role-based permissions
- Refresh tokens

---

## 🎯 Project Status

✅ Core backend complete
✅ Clean architecture
✅ Background worker implemented
✅ Ready for production extension
⏳ Ready to move to next project

---

## 🧠 Author Notes

This project intentionally focuses on:

- Backend correctness
- Separation of concerns
- Real-world patterns
- Interview-ready structure

It is **not over-engineered**, but it is **production-aware**.

---

**Happy building 🚀**
