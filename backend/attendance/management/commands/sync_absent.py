"""
Management command: sync_absent
-------------------------------
Automatically marks absent records for all approved students who did NOT
mark attendance within the scheduled session time window.

Usage:
    python manage.py sync_absent           # syncs today + every past day since earliest approval
    python manage.py sync_absent --date 2026-04-15   # sync a specific date only
    python manage.py sync_absent --days 7  # sync last N days

Schedule this with a system cron job (recommended: every 30 minutes):
    */30 * * * * cd /path/to/backend && python manage.py sync_absent
"""

from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone as tz


class Command(BaseCommand):
    help = 'Sync absent attendance records for sessions whose time window has passed.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            default=None,
            help='Specific date to sync (YYYY-MM-DD). Defaults to today + all historical gaps.',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=None,
            help='Sync last N days (including today). Overrides --date.',
        )

    def handle(self, *args, **options):
        from attendance.models import StudentProfile, Holiday
        from attendance.views.attendance_logic import sync_absent_attendance

        today = tz.localdate()  # IST-aware today

        # --- Determine which dates to sync ---
        if options['days']:
            dates_to_sync = [today - timedelta(days=i) for i in range(options['days'] - 1, -1, -1)]
        elif options['date']:
            from datetime import datetime
            dates_to_sync = [datetime.strptime(options['date'], '%Y-%m-%d').date()]
        else:
            # Default: sync from earliest approval date up to today
            earliest = (
                StudentProfile.objects
                .filter(is_approved=True, approval_date__isnull=False)
                .order_by('approval_date')
                .values_list('approval_date', flat=True)
                .first()
            )
            if not earliest:
                self.stdout.write(self.style.WARNING('No approved students found. Nothing to sync.'))
                return

            dates_to_sync = []
            cursor = earliest
            while cursor <= today:
                dates_to_sync.append(cursor)
                cursor += timedelta(days=1)

        # --- Sync each date ---
        synced = 0
        skipped = 0
        for d in dates_to_sync:
            if d.weekday() == 6:   # Sunday
                skipped += 1
                continue
            if Holiday.objects.filter(start_date__lte=d, end_date__gte=d).exists():
                skipped += 1
                continue
            sync_absent_attendance(d)
            synced += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'[OK] Absent sync complete -- {synced} day(s) processed, {skipped} skipped (Sunday/Holiday).'
            )
        )
