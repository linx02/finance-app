from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from datetime import datetime, timedelta
import time

class ScheduledJob:
    def __init__(self, func, args=None, date=None, hour=None, minute=None):
        self.scheduler = BackgroundScheduler()
        args = args if args is not None else []

        if date:
            self.scheduler.add_job(func, 'date', run_date=date, args=args)
        elif hour is not None and minute is not None:
            print(f"Scheduling job for {hour}:{minute}")
            self.scheduler.add_job(func, 'cron', hour=hour, minute=minute, args=args)
        else:
            raise ValueError("Either date or hour and minute must be provided.")
        self.scheduler.start()
        self.scheduler.add_listener(self.job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

    def job_listener(self, event):
        print("Job completed or errored. Shutting down scheduler.")
        self.scheduler.shutdown(wait=False)

if __name__ == '__main__':
    def print_time():
        print(f"Time: {datetime.now()}")

    def print_error():
        print("Error occurred.")

    job = ScheduledJob(print_time, hour=12, minute=32)
    job_error = ScheduledJob(print_error, hour=12, minute=33)

    while True:
        time.sleep(1)
    print("Main thread finished.")