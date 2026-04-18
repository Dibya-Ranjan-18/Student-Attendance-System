from datetime import date, datetime, timedelta
from django.db.models import Count, Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import TruncWeek, TruncMonth
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
    
    # Use the same subject-eligibility logic as the student dashboard for consistency.
    # Metrics should only count sessions for subjects the student is actually enrolled in.
    student_stats = StudentProfile.objects.annotate(
        total_days=Count(
            'attendancerecord', 
            filter=Q(
                attendancerecord__date__gte=F('approval_date'), # Count only since approval
                attendancerecord__status__in=['present', 'absent'] # Count only academic records
            ) & (
                # AND count only subjects matching the student's current curriculum
                Q(attendancerecord__subject__branch__isnull=True, attendancerecord__subject__semester__isnull=True) |           # All-All
                Q(attendancerecord__subject__branch__isnull=True, attendancerecord__subject__semester=F('semester')) |          # Any branch, same sem
                Q(attendancerecord__subject__branch=F('branch'), attendancerecord__subject__semester__isnull=True) |           # Same branch, any sem
                Q(attendancerecord__subject__branch=F('branch'), attendancerecord__subject__semester=F('semester'))            # Exact match
            )
        ),

        present_days=Count(
            'attendancerecord', 
            filter=Q(
                attendancerecord__status='present', 
                attendancerecord__date__gte=F('approval_date')
            ) & (
                Q(attendancerecord__subject__branch__isnull=True, attendancerecord__subject__semester__isnull=True) |
                Q(attendancerecord__subject__branch__isnull=True, attendancerecord__subject__semester=F('semester')) |
                Q(attendancerecord__subject__branch=F('branch'), attendancerecord__subject__semester__isnull=True) |
                Q(attendancerecord__subject__branch=F('branch'), attendancerecord__subject__semester=F('semester'))
            )
        )
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

    # Weekly Stats (last 8 weeks) - Average daily presence per week
    weekly_stats = []
    for i in range(7, -1, -1):
        start_of_week = today - timedelta(days=today.weekday(), weeks=i)
        end_of_week = start_of_week + timedelta(days=5) # Mon to Sat
        
        # Get counts for academic days in this week
        daily_counts = AttendanceRecord.objects.filter(
            date__range=[start_of_week, end_of_week],
            status='present'
        ).values('date').annotate(
            present_count=Count('student', distinct=True)
        ).values_list('present_count', flat=True)
        
        avg_val = sum(daily_counts) / len(daily_counts) if daily_counts else 0
        weekly_stats.append({
            'name': f"W{start_of_week.strftime('%W')}",
            'present': round(avg_val, 1)
        })

    # Monthly Stats (last 6 months) - Average daily presence per month
    monthly_stats = []
    for i in range(5, -1, -1):
        # Approximate month start
        target_date = today - timedelta(days=i*30)
        month_start = target_date.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        daily_counts = AttendanceRecord.objects.filter(
            date__range=[month_start, month_end],
            status='present'
        ).values('date').annotate(
            present_count=Count('student', distinct=True)
        ).values_list('present_count', flat=True)

        avg_val = sum(daily_counts) / len(daily_counts) if daily_counts else 0
        monthly_stats.append({
            'name': month_start.strftime('%b'),
            'present': round(avg_val, 1)
        })

    return {
        'total_students': total_students,
        'present_today': present_today,
        'avg_attendance': round(min(avg_attendance, 100), 1),
        'active_geofences': active_geofences,
        'individual_stats': stats,
        'low_attendance_alerts': low_attendance_alerts,
        'daily_stats': daily_stats,
        'weekly_stats': weekly_stats,
        'monthly_stats': monthly_stats
    }


def calculate_streak(profile):
    """
    Calculates the current consecutive academic days attendance streak for a student.
    A streak is shared across all subjects - if you attended at least one class on an academic day,
    the streak continues.
    """
    today = date.today()
    if not profile.approval_date:
        return 0
        
    # Get all unique dates with 'present' records for this student
    present_dates = set(AttendanceRecord.objects.filter(
        student=profile, 
        status='present',
        date__gte=profile.approval_date
    ).values_list('date', flat=True))
    
    def is_academic_day(check_date):
        if check_date.weekday() == 6: return False
        if Holiday.objects.filter(start_date__lte=check_date, end_date__gte=check_date).exists(): return False
        
        # Check if any sessions are scheduled for this student's branch/semester
        day_idx = str(check_date.weekday())
        return CollegeLocation.objects.filter(
            is_active=True,
            days_of_week__contains=day_idx
        ).filter(
            Q(subject__branch__isnull=True, subject__semester__isnull=True) |
            Q(subject__branch__isnull=True, subject__semester=profile.semester) |
            Q(subject__branch=profile.branch, subject__semester__isnull=True) |
            Q(subject__branch=profile.branch, subject__semester=profile.semester)
        ).exists()

    if not present_dates:
        return 0
    
    streak = 0
    check_day = today
    
    # If today is an academic day but student hasn't marked yet, 
    # we start counting from the previous academic day to keep the streak alive.
    if is_academic_day(today) and today not in present_dates:
        check_day = today - timedelta(days=1)

    # Safety margin to prevent long loops
    limit = 365 
    while limit > 0:
        limit -= 1
        if check_day < profile.approval_date:
            break
            
        if not is_academic_day(check_day):
            check_day -= timedelta(days=1)
            continue
            
        if check_day in present_dates:
            streak += 1
            check_day -= timedelta(days=1)
        else:
            # Streak broken
            break
            
    return streak


def calculate_badges(profile):
    """
    Calculates current week and current month badges based on 100% attendance.
    """
    today = date.today()
    if not profile.approval_date:
        return []
        
    # Get all presence dates for this student
    present_dates = set(AttendanceRecord.objects.filter(
        student=profile, status='present', date__gte=profile.approval_date
    ).values_list('date', flat=True))
    
    def get_academic_days(start, end):
        days = []
        curr = max(start, profile.approval_date)
        while curr <= end:
            # Check schedule consistency (Gap Day Fix)
            day_idx = str(curr.weekday())
            has_sessions = curr.weekday() != 6 and not Holiday.objects.filter(start_date__lte=curr, end_date__gte=curr).exists() and CollegeLocation.objects.filter(
                is_active=True,
                days_of_week__contains=day_idx
            ).filter(
                Q(subject__branch__isnull=True, subject__semester__isnull=True) |
                Q(subject__branch__isnull=True, subject__semester=profile.semester) |
                Q(subject__branch=profile.branch, subject__semester__isnull=True) |
                Q(subject__branch=profile.branch, subject__semester=profile.semester)
            ).exists()

            if has_sessions:
                days.append(curr)
            curr += timedelta(days=1)
        return days

    # 1. Perfect Week (Mon to Today/Sat)
    # Get the Monday of the current week
    start_of_week = today - timedelta(days=today.weekday()) 
    academic_days_week = get_academic_days(start_of_week, today)
    present_week = [d for d in academic_days_week if d in present_dates]
    
    # 2. Iron Man (Current Month so far)
    start_of_month = today.replace(day=1)
    academic_days_month = get_academic_days(start_of_month, today)
    present_month = [d for d in academic_days_month if d in present_dates]
    
    return [
        {
            "id": "perfect_week",
            "name": "Perfect Week",
            "count": len(present_week),
            "total": len(academic_days_week),
            "is_unlocked": len(present_week) == len(academic_days_week) and len(academic_days_week) > 0
        },
        {
            "id": "iron_man",
            "name": "Iron Man",
            "count": len(present_month),
            "total": len(academic_days_month),
            "is_unlocked": len(present_month) == len(academic_days_month) and len(academic_days_month) > 0
        }
    ]
