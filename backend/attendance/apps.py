"""
attendance/apps.py
------------------
Starts a background APScheduler when Django boots (gunicorn / runserver).

Jobs:
  • sync_absent_job  – runs every 30 minutes.
    Marks absent records for all approved students who missed a session
    whose attendance window has already closed.

The scheduler is intentionally NOT started when Django is in test mode
(django.test.utils.setup_test_environment sets IS_TESTING=True) or when
there is no database yet (migrate / makemigrations).
"""

import os
import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


def _run_absent_sync():
    """Called by APScheduler every 30 minutes in a background thread."""
    try:
        from datetime import timedelta
        from django.utils import timezone as tz
        from attendance.models import StudentProfile, Holiday
        from attendance.views.attendance_logic import sync_absent_attendance

        today = tz.localdate()

        # Always sync today so sessions that just ended get marked immediately
        sync_absent_attendance(today)

        # Back-fill the last 30 days only — older history is stable and already synced.
        # This keeps the scheduler fast even after months of operation.
        from datetime import timedelta
        earliest = (
            StudentProfile.objects
            .filter(is_approved=True, approval_date__isnull=False)
            .order_by('approval_date')
            .values_list('approval_date', flat=True)
            .first()
        )
        backfill_start = max(earliest, today - timedelta(days=30)) if earliest else None
        if backfill_start:
            cursor = backfill_start
            while cursor < today:
                if cursor.weekday() != 6 and not Holiday.objects.filter(
                    start_date__lte=cursor, end_date__gte=cursor
                ).exists():
                    sync_absent_attendance(cursor)
                cursor += timedelta(days=1)

        logger.info('[AbsentSync] Scheduler run complete for %s', today)
    except Exception as exc:
        logger.error('[AbsentSync] Error during scheduled sync: %s', exc, exc_info=True)


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'attendance'

    def ready(self):
        # Don't start the scheduler during management commands that don't need it
        # (migrate, makemigrations, collectstatic, etc.)
        running_command = os.environ.get('DJANGO_SETTINGS_MODULE', '')
        is_manage_command = any(
            cmd in os.sys.argv
            for cmd in ('migrate', 'makemigrations', 'collectstatic', 'test',
                        'shell', 'dbshell', 'createsuperuser', 'flush', 'sync_absent')
        )
        if is_manage_command:
            return

        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.interval import IntervalTrigger
            import atexit

            scheduler = BackgroundScheduler(timezone='Asia/Kolkata')
            scheduler.add_job(
                _run_absent_sync,
                trigger=IntervalTrigger(minutes=30),
                id='sync_absent_job',
                name='Auto mark absent for closed sessions',
                replace_existing=True,
                misfire_grace_time=120,   # allow up to 2-min delay before skipping
            )
            scheduler.start()
            logger.info('[AbsentSync] APScheduler started — absent sync runs every 30 min (IST).')

            # Gracefully shut down when the process exits
            atexit.register(lambda: scheduler.shutdown(wait=False))

        except Exception as exc:
            # Don't crash the server if the scheduler fails to start
            logger.warning('[AbsentSync] Could not start scheduler: %s', exc)
