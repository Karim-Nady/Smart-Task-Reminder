from apscheduler.schedulers.background import BackgroundScheduler
from workers.reminder_worker import process_due_reminders
from tzlocal import get_localzone
from zoneinfo import ZoneInfo

local_tz = ZoneInfo("Africa/Cairo")

def start_scheduler():
    scheduler = BackgroundScheduler(timezone=local_tz)
    scheduler.add_job(
        process_due_reminders,
        trigger="interval",
        minutes=1,
        id="reminder_worker",
        replace_existing=True,
    )
    scheduler.start()
