"""
Management command: check_attendance
-------------------------------------
Diagnoses why a student might not appear in the attendance warning panel.

Usage:
    python manage.py check_attendance            # show all approved students
    python manage.py check_attendance --id 5     # check a specific student by DB id
"""

from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone as tz


class Command(BaseCommand):
    help = 'Diagnose attendance warning issues for students.'

    def add_arguments(self, parser):
        parser.add_argument('--id', type=int, default=None, help='StudentProfile ID to check.')

    def handle(self, *args, **options):
        from attendance.models import StudentProfile, AttendanceRecord, CollegeLocation, Holiday

        today = tz.localdate()
        now = tz.localtime(tz.now()).replace(tzinfo=None)

        self.stdout.write(f"\n=== Attendance Warning Diagnostics | {today} {now.strftime('%H:%M')} IST ===\n")

        # --- Sessions configured today ---
        day_idx = str(today.weekday())
        sessions = CollegeLocation.objects.filter(
            is_active=True,
            days_of_week__contains=day_idx
        ).exclude(start_time__isnull=True, end_time__isnull=True)

        self.stdout.write(f"[Sessions today (weekday={day_idx})]")
        if not sessions.exists():
            self.stdout.write(self.style.ERROR("  NONE FOUND - No active sessions scheduled for today!"))
            self.stdout.write("  --> Go to Geofencing and ensure sessions have days/times/subject set.\n")
        else:
            from datetime import datetime
            for s in sessions:
                ended = datetime.combine(today, s.end_time) < now
                self.stdout.write(
                    f"  Session: '{s.name}' | Subject: {s.subject} | "
                    f"{s.start_time}-{s.end_time} | Ended: {'YES' if ended else 'NO (still open)'}"
                )
        self.stdout.write("")

        # --- Students ---
        students_qs = StudentProfile.objects.filter(is_approved=True)
        if options['id']:
            students_qs = students_qs.filter(id=options['id'])

        for student in students_qs:
            name = student.user.get_full_name()
            self.stdout.write(f"[Student] {name} | ID={student.id} | Approved={student.approval_date} | Branch={student.branch} | Semester={student.semester}")

            records = AttendanceRecord.objects.filter(student=student, date__gte=student.approval_date)
            total = records.count()
            present = records.filter(status='present').count()
            absent = records.filter(status='absent').count()
            pct = round(present / total * 100, 1) if total > 0 else 0

            if total == 0:
                self.stdout.write(self.style.ERROR(
                    f"  --> NO attendance records at all! Absent sync may not have run.\n"
                    f"      Run: python manage.py sync_absent\n"
                    f"      Reason could be: no matching sessions, sessions not ended, or branch/semester mismatch."
                ))
            else:
                self.stdout.write(f"  Records: {total} total | {present} present | {absent} absent | {pct}%")
                if pct < 85:
                    self.stdout.write(self.style.WARNING(f"  --> Should show in WARNING panel ({pct}% < 85%)"))
                else:
                    self.stdout.write(self.style.SUCCESS(f"  --> OK (above 85% threshold)"))

            # Check why absent sync might skip this student
            if sessions.exists():
                for s in sessions:
                    if not s.subject:
                        self.stdout.write(self.style.ERROR(f"  [!] Session '{s.name}' has NO subject linked!"))
                        continue
                    sub = s.subject
                    branch_match = (sub.branch is None or sub.branch == student.branch)
                    sem_match = (sub.semester is None or sub.semester == student.semester)
                    if not branch_match or not sem_match:
                        self.stdout.write(self.style.WARNING(
                            f"  [!] Student branch/semester does not match session '{s.name}' subject '{sub.name}' "
                            f"(expects branch={sub.branch}, sem={sub.semester})"
                        ))
            self.stdout.write("")

        self.stdout.write("=== End Diagnostics ===\n")
