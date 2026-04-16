from datetime import date, datetime, timedelta
from django.db.models import Count, Q, F, ExpressionWrapper, FloatField
from rest_framework.response import Response

from ..models import StudentProfile, AttendanceRecord, CollegeLocation, Holiday
from .attendance_logic import sync_absent_attendance

def get_student_analytics():
    today = date.today()

    # ------------------------------------------------------------------ #
    #  STEP 1 — Sync absent records FIRST so all queries below see        #
    #           fresh, up-to-date data.                                   #
    # ------------------------------------------------------------------ #
    # Back-fill absent records for the last 30 days only.
    # The APScheduler handles full history every 30 min; this covers any gaps
    # since the last scheduler run without scanning months of history on every load.
    earliest = StudentProfile.objects.filter(
        is_approved=True, approval_date__isnull=False
    ).order_by('approval_date').values_list('approval_date', flat=True).first()

    backfill_start = max(earliest, today - timedelta(days=30)) if earliest else None

    if backfill_start:
        cursor = backfill_start
        while cursor < today:
            # Skip Sundays and holidays
            if cursor.weekday() != 6 and not Holiday.objects.filter(
                start_date__lte=cursor, end_date__gte=cursor
            ).exists():
                sync_absent_attendance(cursor)
            cursor += timedelta(days=1)


    # Sync today (respects the session-end time guard inside the function)
    sync_absent_attendance(today)

    # ------------------------------------------------------------------ #
    #  STEP 2 — Now query the database (absent records are already there) #
    # ------------------------------------------------------------------ #
    students = StudentProfile.objects.all()
    total_students = students.count()
    present_today = AttendanceRecord.objects.filter(date=today, status='present').values('student').distinct().count()
    active_geofences = CollegeLocation.objects.filter(is_active=True).count()
    
    student_stats = StudentProfile.objects.annotate(
        total_days=Count('attendancerecord', filter=Q(attendancerecord__date__gte=F('approval_date'))),
        present_days=Count('attendancerecord', filter=Q(attendancerecord__status='present', attendancerecord__date__gte=F('approval_date')))
    )
    
    stats = []
    low_attendance_alerts = []
    total_percentage = 0
    
    for student in student_stats:
        overall_percentage = (student.present_days / student.total_days * 100) if student.total_days > 0 else 0
        stats.append({
            'id': student.id,
            'name': student.user.get_full_name(),
            'registration_no': student.registration_no,
            'percentage': round(overall_percentage, 2)
        })
        total_percentage += overall_percentage

    avg_attendance = (total_percentage / total_students) if total_students > 0 else 0

    failing_records = AttendanceRecord.objects.filter(
        date__gte=F('student__approval_date')
        ).values('student', 'subject', 'subject__name').annotate(
        sub_total=Count('id'),
        sub_present=Count('id', filter=Q(status='present'))
    ).annotate(
        sub_perc=ExpressionWrapper(F('sub_present') * 100.0 / F('sub_total'), output_field=FloatField())
    ).filter(sub_perc__lt=85)

    failing_map = {}
    for rec in failing_records:
        sid = rec['student']
        if sid not in failing_map: failing_map[sid] = []
        failing_map[sid].append(f"{rec['subject__name']} ({round(rec['sub_perc'], 1)}%)")

    # Collect student IDs that already have records (present or absent)
    students_with_records = set(
        AttendanceRecord.objects.filter(
            date__gte=F('student__approval_date')
        ).values_list('student_id', flat=True).distinct()
    )

    # Fallback: students approved on or before today with ZERO records → 0% attendance
    for s_profile in students.filter(is_approved=True, approval_date__lte=today):
        if s_profile.id not in students_with_records and s_profile.id not in failing_map:
            failing_map[s_profile.id] = ['0% — No attendance records found']

    for sid, details in failing_map.items():
        s_profile = students.filter(id=sid).first()
        if s_profile:
            low_attendance_alerts.append({
                'id': sid,
                'name': s_profile.user.get_full_name(),
                'details': ", ".join(details)
            })

    daily_stats = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = AttendanceRecord.objects.filter(date=day, status='present').values('student').distinct().count()
        daily_stats.append({
            'name': day.strftime('%a'),
            'present': count
        })

    return {
        'total_students': total_students,
        'present_today': present_today,
        'avg_attendance': round(min(avg_attendance, 100), 1),
        'active_geofences': active_geofences,
        'individual_stats': stats,
        'low_attendance_alerts': low_attendance_alerts,
        'daily_stats': daily_stats
    }
