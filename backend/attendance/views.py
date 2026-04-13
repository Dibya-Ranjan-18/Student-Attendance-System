import math
import random
import string
from datetime import date, datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.db.models import Count, Avg, F, Q
from django.http import HttpResponse

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

import pandas as pd
import io
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Domain, Subject, Holiday, Branch, Semester, CollegeLocation, StudentProfile, RegistrationRequest, AttendanceRecord, OTPReset
from .serializers import (
    DomainSerializer, SubjectSerializer, HolidaySerializer, BranchSerializer, SemesterSerializer, CollegeLocationSerializer,
    StudentProfileSerializer, RegistrationRequestSerializer, AttendanceRecordSerializer, UserSerializer
)

# Helper function for Geofencing
def get_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# --- AUTH VIEWS ---

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_student(request):
    reg_no = request.data.get('registration_no')
    email = request.data.get('email')
    
    # 1. Clean up "Orphaned" Student Users (User exists but NO StudentProfile and NOT Staff)
    orphans = User.objects.filter(Q(username=reg_no) | Q(email=email), is_staff=False)
    for orphan in orphans:
        if not hasattr(orphan, 'studentprofile'):
            orphan.delete()

    # 2. Clean up "Stale" Registration Requests (processed but not deleted)
    RegistrationRequest.objects.filter(Q(registration_no=reg_no) | Q(email=email), is_processed=True).delete()

    # 3. Check for ACTIVE students or PENDING requests
    if StudentProfile.objects.filter(registration_no=reg_no).exists() or RegistrationRequest.objects.filter(registration_no=reg_no, is_processed=False).exists():
        return Response({"message": "An active account or request with this Registration Number already exists."}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists() or RegistrationRequest.objects.filter(email=email, is_processed=False).exists():
        return Response({"message": "An active account or request with this Email Address already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # 4. Mandatory Google Token Verification
    google_token = request.data.get('google_token')
    if not google_token:
        return Response({"message": "Google verification required. Identity check failed."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        idinfo = id_token.verify_oauth2_token(google_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
        verified_email = idinfo['email']
        if verified_email != email:
            return Response({"message": "Security Violation: Verified email does not match registration email."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": f"Google verification failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    # 5. Proceed with Registration
    serializer = RegistrationRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            password=make_password(request.data['password']),
            is_google_verified=True
        )
        return Response({"message": "Registration request submitted for approval."}, status=status.HTTP_201_CREATED)
    
    # Return detailed errors if validation fails
    error_msg = "Please check your data: " + ", ".join([f"{k}: {v[0]}" for k, v in serializer.errors.items()])
    return Response({"message": error_msg, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username') # Registration No or Email
    password = request.data.get('password')

    user = User.objects.filter(Q(username=username) | Q(email=username)).first()
    
    if user and user.check_password(password):
        if user.is_staff: # Admin bypass
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh), 'access': str(refresh.access_token),
                'role': 'admin', 'user': UserSerializer(user).data
            })
        
        profile = getattr(user, 'studentprofile', None)
        if not profile or not profile.is_approved:
            return Response({"error": "Admin notice: Your account is approved but final setup is pending. Please wait for the admin to complete activation."}, status=status.HTTP_403_FORBIDDEN)
        

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh), 'access': str(refresh.access_token),
            'role': 'student', 'user': UserSerializer(user).data, 'profile': StudentProfileSerializer(profile).data
        })
    
    # 2. If login fails, check if there is a pending registration request for this ID/Email
    pending_request = RegistrationRequest.objects.filter(
        Q(registration_no=username) | Q(email=username),
        is_processed=False
    ).exists()

    if pending_request:
        return Response({"error": "Your registration is still in the queue. Please wait for an admin to approve your request."}, status=status.HTTP_403_FORBIDDEN)
    
    return Response({"error": "Invalid credentials. Please enter a valid Registration No and Password."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login_view(request):
    token = request.data.get('token')
    
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({
                "error": "Account not found. Please register first with this email.",
                "email": email,
                "name": name
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 1. Admin Bypass
        if user.is_staff:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': 'admin',
                'user': UserSerializer(user).data
            })

        # 2. Student Profile Check
        profile = getattr(user, 'studentprofile', None)
        if not profile or not profile.is_approved:
            return Response({"error": "Account pending approval."}, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': 'student',
            'user': UserSerializer(user).data,
            'profile': StudentProfileSerializer(profile).data
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp_view(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    if not user:
        return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    OTPReset.objects.filter(email=email).delete() # Clear old ones
    OTPReset.objects.create(email=email, otp=otp)
    
    # Send email
    subject = "Verification Code for Password Reset"
    message = f"Your verification code is: {otp}. This code is valid for 10 minutes."
    try:
        send_mail(subject, message, settings.EMAIL_HOST_USER, [email], fail_silently=False)
        return Response({"message": "Verification code sent to your email."})
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp_view(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    otp_record = OTPReset.objects.filter(email=email, otp=otp).first()
    if not otp_record:
        return Response({"error": "Invalid verification code."}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check expiry (10 mins)
    if (datetime.now(otp_record.created_at.tzinfo) - otp_record.created_at).total_seconds() > 600:
        otp_record.delete()
        return Response({"error": "Verification code expired."}, status=status.HTTP_401_UNAUTHORIZED)
    
    otp_record.is_verified = True
    otp_record.save()
    return Response({"message": "Verification code verified successfully."})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_view(request):
    email = request.data.get('email')
    new_password = request.data.get('password')
    
    otp_record = OTPReset.objects.filter(email=email, is_verified=True).first()
    if not otp_record:
        return Response({"error": "Protocol breach: Verification not completed."}, status=status.HTTP_403_FORBIDDEN)
    
    user = User.objects.get(email=email)
    user.password = make_password(new_password)
    user.save()
    
    otp_record.delete()
    return Response({"message": "Password updated successfully. You can now login."})

# --- ADMIN VIEWS ---

class AcademicViewSet(viewsets.ModelViewSet):
    """Base ViewSet for readable-to-all academic metadata"""
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class DomainViewSet(AcademicViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer

class SubjectViewSet(AcademicViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subject.objects.all()
        
        # For students, show subjects matching their branch/semester OR global subjects
        profile = getattr(user, 'studentprofile', None)
        if profile:
            from django.db.models import Q
            return Subject.objects.filter(
                Q(branch=profile.branch, semester=profile.semester) |
                Q(branch__isnull=True) |
                Q(semester__isnull=True)
            )
        return Subject.objects.none()

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    def get_permissions(self):
        if self.action in ['list', 'retrieve']: return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class BranchViewSet(AcademicViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class SemesterViewSet(AcademicViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

class CollegeLocationViewSet(viewsets.ModelViewSet):
    queryset = CollegeLocation.objects.all()
    serializer_class = CollegeLocationSerializer
    permission_classes = [permissions.IsAdminUser]

class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.filter(is_processed=False)
    serializer_class = RegistrationRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reg_request = self.get_object()
        user, created = User.objects.get_or_create(
            username=reg_request.registration_no,
            defaults={
                'email': reg_request.email,
                'first_name': reg_request.full_name
            }
        )
        user.password = reg_request.password # Use the already hashed password
        user.save()

        # Ensure profile doesn't exist already
        StudentProfile.objects.update_or_create(
            user=user,
            defaults={
                'registration_no': reg_request.registration_no,
                'phone_no': reg_request.phone_no,
                'domain': reg_request.domain,
                'branch': reg_request.branch,
                'semester': reg_request.semester,
                'is_approved': True,
                'approval_date': date.today()
            }
        )
        
        # Free up the identifiers by deleting the request
        reg_request.delete()
        return Response({"message": "Student approved and created."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reg_request = self.get_object()
        reg_request.delete()
        return Response({"message": "Request rejected and cleared from system."})

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        students = StudentProfile.objects.all()
        total_students = students.count()
        today = date.today()
        # Count unique students who marked present today
        present_today = AttendanceRecord.objects.filter(date=today, status='present').values('student').distinct().count()
        active_geofences = CollegeLocation.objects.filter(is_active=True).count()
        
        # Optimized Individual Stats & Low Attendance with Subjects
        from django.db.models import Count, Q, Avg
        
        # 1. Annotate students with overall attendance stats
        student_stats = StudentProfile.objects.annotate(
            total_days=Count('attendancerecord'),
            present_days=Count('attendancerecord', filter=Q(attendancerecord__status='present'))
        )
        
        stats = []
        low_attendance_alerts = []
        total_percentage = 0
        total_students_with_data = 0
        
        for student in student_stats:
            overall_percentage = (student.present_days / student.total_days * 100) if student.total_days > 0 else 0
            stats.append({
                'id': student.id,
                'name': student.user.get_full_name(),
                'registration_no': student.registration_no,
                'percentage': round(overall_percentage, 2)
            })
            total_percentage += overall_percentage
            if student.total_days > 0:
                total_students_with_data += 1

        avg_attendance = (total_percentage / total_students) if total_students > 0 else 0

        # 2. Optimized Low Attendance Check (<85% in ANY subject)
        # This will get students who have sub-85% attendance in at least one subject
        from django.db.models import OuterRef, Subquery, FloatField, ExpressionWrapper, F
        from django.db.models.functions import Cast, NullIf
        
        # We need a per-student-per-subject breakdown
        # For simplicity and performance, we'll query for subjects where the student is failing
        failing_records = AttendanceRecord.objects.values('student', 'subject', 'subject__name').annotate(
            sub_total=Count('id'),
            sub_present=Count('id', filter=Q(status='present'))
        ).annotate(
            sub_perc=ExpressionWrapper(F('sub_present') * 100.0 / F('sub_total'), output_field=FloatField())
        ).filter(sub_perc__lt=85)

        # Group by student
        failing_map = {}
        for rec in failing_records:
            sid = rec['student']
            if sid not in failing_map: failing_map[sid] = []
            failing_map[sid].append(f"{rec['subject__name']} ({round(rec['sub_perc'], 1)}%)")

        for sid, details in failing_map.items():
            s_profile = students.filter(id=sid).first()
            if s_profile:
                low_attendance_alerts.append({
                    'id': sid,
                    'name': s_profile.user.get_full_name(),
                    'details': ", ".join(details)
                })

        # Daily Stats for Chart (Last 7 Days)
        daily_stats = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = AttendanceRecord.objects.filter(date=day, status='present').values('student').distinct().count()
            daily_stats.append({
                'name': day.strftime('%a'),
                'present': count
            })

        # Sync last 14 days of absences before returning stats to ensure accuracy
        backfill_missing_attendance(lookback_days=14)

        return Response({
            'total_students': total_students,
            'present_today': present_today,
            'avg_attendance': round(min(avg_attendance, 100), 1),
            'active_geofences': active_geofences,
            'individual_stats': stats,
            'low_attendance_alerts': low_attendance_alerts, # NEW: for home page card
            'daily_stats': daily_stats
        })

    @action(detail=True, methods=['get'])
    def subject_stats(self, request, pk=None):
        instance = self.get_object()
        subjects = Subject.objects.filter(branch=instance.branch, semester=instance.semester)
        stats = []
        for sub in subjects:
            present = AttendanceRecord.objects.filter(student=instance, subject=sub, status='present').count()
            absent = AttendanceRecord.objects.filter(student=instance, subject=sub, status='absent').count()
            total = present + absent
            percentage = (present / total * 100) if total > 0 else 0
            stats.append({
                'subject_id': sub.id,
                'subject_name': sub.name,
                'present': present,
                'absent': absent,
                'total': total,
                'percentage': round(percentage, 2)
            })
        return Response(stats)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        reg_no = instance.registration_no
        user = instance.user
        email = user.email

        # 1. Delete matching Registration Requests
        RegistrationRequest.objects.filter(Q(registration_no=reg_no) | Q(email=email)).delete()
        
        # 2. Delete all Attendance Records for this student
        AttendanceRecord.objects.filter(student=instance).delete()
        
        # 3. Delete the User (Cascades to StudentProfile)
        user.delete()
        
        return Response({"message": "Student and all unique identifiers cleared from database."})

# --- HELPERS ---

def sync_absent_attendance(target_date, profile=None):
    """
    Identifies all scheduled classes for a date and marks students 
    as absent if they missed their marking window.
    """
    # 0. Skip Sundays and Holidays
    if target_date.weekday() == 6 or Holiday.objects.filter(start_date__lte=target_date, end_date__gte=target_date).exists():
        return
    
    now = datetime.now()
    day_idx = str(target_date.weekday())
    
    # 1. Get ALL active sessions for this day
    active_sessions = CollegeLocation.objects.filter(
        is_active=True, 
        days_of_week__contains=day_idx
    ).exclude(start_time__isnull=True, end_time__isnull=True).select_related('subject')
    
    # 2. Identify students to check
    # Optimization: Filter students who were approved ON OR BEFORE target_date OR have no date set
    base_students = StudentProfile.objects.filter(is_approved=True).filter(
        Q(approval_date__lte=target_date) | Q(approval_date__isnull=True)
    )
    if profile:
        base_students = base_students.filter(id=profile.id)
    
    records_to_create = []
    
    # Split sessions into Specific and General
    specific_sessions = [s for s in active_sessions if s.subject]
    general_sessions = [s for s in active_sessions if not s.subject]
    
    # Process Specific Sessions First
    for session in specific_sessions:
        # Skip if session hasn't ended yet today
        session_end = datetime.combine(target_date, session.end_time)
        if target_date == date.today() and now < session_end:
            continue
        
        subject = session.subject
        # Eligible students for this specific subject
        eligible_students = base_students
        if subject.branch:
            eligible_students = eligible_students.filter(branch=subject.branch)
        if subject.semester:
            eligible_students = eligible_students.filter(semester=subject.semester)
        
        # Check existing records for this subject/date to avoid dupes
        existing_student_ids = set(AttendanceRecord.objects.filter(
            date=target_date, 
            subject=subject
        ).values_list('student_id', flat=True))

        for s in eligible_students:
            if s.id not in existing_student_ids:
                records_to_create.append(AttendanceRecord(
                    student=s, 
                    date=target_date, 
                    subject=subject, 
                    status='absent',
                    time=session.end_time,
                    class_name=session.name
                ))

    # Process General Sessions (Fallback for subjects without specific geofences)
    for session in general_sessions:
        # Skip if session hasn't ended yet today
        session_end = datetime.combine(target_date, session.end_time)
        if target_date == date.today() and now < session_end:
            continue
            
        for s in base_students:
            # Find all subjects this student is enrolled in
            enrolled_subjects = Subject.objects.filter(
                (Q(branch=s.branch) | Q(branch__isnull=True)) &
                (Q(semester=s.semester) | Q(semester__isnull=True))
            )
            
            # For each enrolled subject, check if there's already a specific geofence for it
            # and if an attendance record already exists for today
            for sub in enrolled_subjects:
                # Does this subject have its OWN specific geofence?
                has_specific_geofence = CollegeLocation.objects.filter(
                    subject=sub, 
                    is_active=True,
                    days_of_week__contains=day_idx
                ).exists()
                
                # If it HAS a specific geofence, we don't use the general session for it
                if has_specific_geofence:
                    continue
                
                # Check if record already exists for this sub/date
                if not AttendanceRecord.objects.filter(student=s, date=target_date, subject=sub).exists():
                    records_to_create.append(AttendanceRecord(
                        student=s, 
                        date=target_date, 
                        subject=sub, 
                        status='absent',
                        time=session.end_time,
                        class_name=f"{session.name} (General)"
                    ))

    if records_to_create:
        AttendanceRecord.objects.bulk_create(records_to_create, ignore_conflicts=True)

def backfill_missing_attendance(lookback_days=7, profile=None):
    """
    Runs sync_absent_attendance for the last X days to ensure no gaps.
    """
    today = date.today()
    for i in range(lookback_days + 1):
        target_date = today - timedelta(days=i)
        sync_absent_attendance(target_date, profile=profile)

# --- ADMIN VIEWS ---

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AttendanceRecord.objects.all()
        return AttendanceRecord.objects.filter(student__user=user)

    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        user = request.user
        profile = getattr(user, 'studentprofile', None)
        if not profile: return Response({"error": "Profile not found"}, status=400)
        
        # Extract device_id from body or header
        device_id = request.data.get('device_id') or request.headers.get('X-Device-Id')
        
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        subject_id = request.data.get('subject_id')
        class_name = request.data.get('class_name', '')

        if not subject_id:
            return Response({"error": "Please select a subject."}, status=400)
            
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"error": "Invalid subject."}, status=400)
        
        # Geofencing & Time-window check
        active_locations = CollegeLocation.objects.filter(is_active=True, subject=subject)
        if not active_locations.exists():
            return Response({"error": "No attendance window scheduled for this subject."}, status=status.HTTP_400_BAD_REQUEST)
        
        is_inside = False
        is_in_time = False
        current_time = datetime.now().time()

        for target_location in active_locations:
            # 1. Location check
            dist = get_distance(lat, lng, target_location.latitude, target_location.longitude)
            if dist <= target_location.radius:
                is_inside = True
            
            # 2. Time check
            if target_location.start_time and target_location.end_time:
                if target_location.start_time <= current_time <= target_location.end_time:
                    is_in_time = True
            else:
                is_in_time = True # No time range set = open all day

            if is_inside and is_in_time:
                break
            
        if not is_inside:
            return Response({"error": "You are outside college premises for this subject."}, status=status.HTTP_403_FORBIDDEN)
        
        if not is_in_time:
            return Response({"error": f"Attendance window for {subject.name} is not active right now."}, status=status.HTTP_403_FORBIDDEN)
        
        today = date.today()
        # Check if already marked for THIS subject today
        if AttendanceRecord.objects.filter(student=profile, date=today, subject=subject).exists():
           return Response({"error": "Attendance already marked for this subject today!"}, status=status.HTTP_400_BAD_REQUEST)

        record, created = AttendanceRecord.objects.update_or_create(
            student=profile, date=today, subject=subject,
            defaults={'status': 'present', 'time': datetime.now().time(), 'latitude': lat, 'longitude': lng, 'class_name': class_name}
        )
        
        return Response({"message": "Attendance marked successfully.", "status": "present"})

    @action(detail=False, methods=['get'])
    def daily_report(self, request):
        date_str = request.query_params.get('date', str(date.today()))
        subject_id = request.query_params.get('subject')
        branch_id = request.query_params.get('branch')
        semester_id = request.query_params.get('semester')
        domain_id = request.query_params.get('domain')

        try:
            # Handle multiple formats just in case
            if '-' in date_str:
                parts = date_str.split('-')
                if len(parts[0]) == 4: # YYYY-MM-DD
                    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                else: # DD-MM-YYYY
                    target_date = datetime.strptime(date_str, '%d-%m-%Y').date()
            else:
                target_date = date.today()
        except Exception as e:
            print(f"Date parse error: {e}")
            target_date = date.today()
            
        students = StudentProfile.objects.all()
        if branch_id: students = students.filter(branch_id=branch_id)
        if semester_id: students = students.filter(semester_id=semester_id)
        if domain_id: students = students.filter(domain_id=domain_id)

        attendance = AttendanceRecord.objects.filter(date=target_date)
        if subject_id:
            try:
                attendance = attendance.filter(subject_id=int(subject_id))
            except (ValueError, TypeError):
                pass
        
        # Sync absences for the report date (handles bulk logic internally)
        sync_absent_attendance(target_date)
        
        # Re-fetch attendance after sync to include newly created sessions
        attendance = AttendanceRecord.objects.filter(date=target_date)
        if subject_id:
            try:
                attendance = attendance.filter(subject_id=int(subject_id))
            except (ValueError, TypeError):
                pass

        is_holiday = Holiday.objects.filter(start_date__lte=target_date, end_date__gte=target_date).first()
        # Map of student_id -> record
        att_map = {a.student_id: a for a in attendance}
        
        present_records = []
        absent_records = []
        
        mode_students = students
        if subject_id:
            try:
                subject_int_id = int(subject_id)
                target_sub = Subject.objects.filter(id=subject_int_id).first()
                
                # Optimized sub-percentage fetching using annotation
                student_sub_stats = StudentProfile.objects.filter(id__in=mode_students.values_list('id', flat=True)).annotate(
                    sub_total=Count('attendancerecord', filter=Q(attendancerecord__subject_id=subject_int_id)),
                    sub_present=Count('attendancerecord', filter=Q(attendancerecord__subject_id=subject_int_id, attendancerecord__status='present'))
                )
                sub_perc_map = {s.id: (s.sub_present * 100.0 / s.sub_total if s.sub_total > 0 else 0) for s in student_sub_stats}

                for s in mode_students:
                    record = att_map.get(s.id)
                    sub_perc = sub_perc_map.get(s.id, 0)
                    
                    entry = {
                        'id': s.id,
                        'record_id': record.id if record else None,
                        'student_name': s.user.get_full_name(),
                        'registration_no': s.registration_no,
                        'subject_name': target_sub.name if target_sub else 'N/A',
                        'status': 'holiday' if is_holiday else (record.status if record else 'absent' if target_date < date.today() else 'not_marked'),
                        'subject_percentage': round(sub_perc, 1),
                        'time': record.time.strftime('%H:%M') if record else None
                    }
                    
                    if record and record.status == 'present':
                        present_records.append(entry)
                    else:
                        absent_records.append(entry)
            except (ValueError, TypeError):
                pass # Fallback to general if ID invalid
        else:
            # Mode B: General History view (Show all registered students and their status)
            for s in mode_students:
                s_records = attendance.filter(student=s)
                for rec in s_records:
                    entry = {
                        'id': s.id,
                        'record_id': rec.id,
                        'student_name': s.user.get_full_name(),
                        'registration_no': s.registration_no,
                        'subject_name': rec.subject.name if rec.subject else 'General',
                        'status': rec.status,
                        'time': rec.time.strftime('%H:%M')
                    }
                    if rec.status == 'present': present_records.append(entry)
                    else: absent_records.append(entry)

        # 2. Optimized Subject Summary (Single Query)
        subject_summaries_qs = Subject.objects.annotate(
            p_count=Count('attendancerecord', filter=Q(attendancerecord__date=target_date, attendancerecord__status='present'))
        )
        
        subject_summaries = [
            {
                'id': sub.id,
                'name': sub.name,
                'present': sub.p_count,
                'total_capacity': sub.total_students,
                'percentage': round((sub.p_count / sub.total_students * 100), 1) if sub.total_students > 0 else 0
            }
            for sub in subject_summaries_qs
        ]
            
        return Response({
            'date': target_date,
            'is_holiday': bool(is_holiday),
            'holiday_reason': is_holiday.reason if is_holiday else '',
            'summary': {
                'total_present': AttendanceRecord.objects.filter(date=target_date, status='present').values('student').distinct().count(),
                'total_absent': len(absent_records),
                'total_subjects': subject_summaries_qs.count()
            },
            'subject_summaries': subject_summaries,
            'present_records': present_records,
            'absent_records': absent_records
        })

    @action(detail=False, methods=['get'])
    def student_history(self, request):
        user = request.user
        profile = getattr(user, 'studentprofile', None)
        if not profile: return Response({"error": "Profile not found"}, status=400)

        # Sync last 14 days of absences for this student before showing history
        backfill_missing_attendance(lookback_days=14, profile=profile)

        # Get last 30 days of records
        records = AttendanceRecord.objects.filter(student=profile).order_by('-date', '-time')[:50]
        serializer = AttendanceRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_subject_stats(self, request):
        user = request.user
        profile = getattr(user, 'studentprofile', None)
        if not profile: return Response({"error": "Profile not found"}, status=400)

        # Sync last 14 days of absences for this student before showing stats
        backfill_missing_attendance(lookback_days=14, profile=profile)

        from django.db.models import Q
        subjects = Subject.objects.filter(
            Q(branch=profile.branch, semester=profile.semester) |
            Q(branch__isnull=True) |
            Q(semester__isnull=True)
        )
        stats = []
        for sub in subjects:
            present = AttendanceRecord.objects.filter(student=profile, subject=sub, status='present').count()
            absent = AttendanceRecord.objects.filter(student=profile, subject=sub, status='absent').count()
            total = present + absent
            percentage = (present / total * 100) if total > 0 else 0
            stats.append({
                'subject_id': sub.id,
                'subject_name': sub.name,
                'present': present,
                'absent': absent,
                'total': total,
                'percentage': round(percentage, 2)
            })
        return Response(stats)

    @action(detail=False, methods=['post'])
    def manual_update(self, request):
        student_id = request.data.get('student_id')
        status_val = request.data.get('status')
        subject_id = request.data.get('subject_id')
        date_str = request.data.get('date', str(date.today()))
        
        try:
            if '-' in date_str:
                parts = date_str.split('-')
                if len(parts[0]) == 4:
                    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                else:
                    target_date = datetime.strptime(date_str, '%d-%m-%Y').date()
            else:
                target_date = date.today()
        except:
            target_date = date.today()

        profile = get_object_or_404(StudentProfile, id=student_id)
        subject = Subject.objects.filter(id=subject_id).first()
        
        if not subject:
            return Response({"error": "Subject is mandatory for manual presence/absence marking."}, status=400)
            
        AttendanceRecord.objects.update_or_create(
            student=profile, date=target_date, subject=subject,
            defaults={'status': status_val, 'time': datetime.now().time(), 'class_name': 'MANUAL_ENTRY'}
        )
        return Response({"message": f"Marked as {status_val}"})

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))
        subject_id = request.query_params.get('subject')
        branch_id = request.query_params.get('branch')
        semester_id = request.query_params.get('semester')

        if not subject_id:
            return Response({"error": "Subject is mandatory for monthly reports"}, status=400)

        import calendar
        _, num_days = calendar.monthrange(year, month)
        dates = [date(year, month, d) for d in range(1, num_days + 1)]
        
        students = StudentProfile.objects.all()
        if branch_id: students = students.filter(branch_id=branch_id)
        if semester_id: students = students.filter(semester_id=semester_id)

        # Get all holidays that occur in this month
        month_holidays = Holiday.objects.filter(
            Q(start_date__month=month, start_date__year=year) | 
            Q(end_date__month=month, end_date__year=year) |
            Q(start_date__lt=date(year, month, 1), end_date__gt=date(year, month, num_days))
        )
        attendance = AttendanceRecord.objects.filter(date__month=month, date__year=year, subject_id=subject_id)
        
        # Structure: student_id -> { date -> status }
        att_data = {}
        for att in attendance:
            if att.student_id not in att_data: att_data[att.student_id] = {}
            att_data[att.student_id][att.date] = att.status

        matrix = []
        for s in students:
            row = {
                'id': s.id,
                'name': s.user.get_full_name(),
                'reg_no': s.registration_no,
                'attendance': {}
            }
            present_count = 0
            for d in dates:
                status = 'A' # Default
                # Check if this date is a holiday
                is_h = any(h.start_date <= d <= h.end_date for h in month_holidays)
                if is_h: status = 'H'
                elif d in att_data.get(s.id, {}):
                    status = 'P' if att_data[s.id][d] == 'present' else 'A'
                
                if status == 'P': present_count += 1
                row['attendance'][d.strftime('%Y-%m-%d')] = status
            
            row['total_present'] = present_count
            row['percentage'] = round((present_count / len(dates) * 100), 1)
            matrix.append(row)

        return Response({
            'month': month, 'year': year,
            'dates': [d.strftime('%Y-%m-%d') for d in dates],
            'holidays': holidays,
            'report': matrix
        })

    @action(detail=False, methods=['get'])
    def download_excel(self, request):
        mode = request.query_params.get('mode', 'daily') # 'daily', 'monthly', or 'absent'
        subject_id = request.query_params.get('subject')
        date_str = request.query_params.get('date', str(date.today()))

        try:
            if '-' in date_str:
                parts = date_str.split('-')
                if len(parts[0]) == 4: target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                else: target_date = datetime.strptime(date_str, '%d-%m-%Y').date()
            else: target_date = date.today()
        except: target_date = date.today()

        if mode == 'monthly':
            # Monthly Report Export logic
            res = self.monthly_report(request)
            if res.status_code != 200: return res
            data = res.data
            
            rows = []
            for student in data['report']:
                row = {'Name': student['name'], 'Reg No': student['reg_no']}
                for d_str, status in student['attendance'].items():
                    day = d_str.split('-')[-1]
                    row[day] = status
                row['Total'] = student['total_present']
                row['%'] = student['percentage']
                rows.append(row)

            df = pd.DataFrame(rows)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Monthly Attendance')
            
            response = HttpResponse(output.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="Attendance_{data["month"]}_{data["year"]}.xlsx"'
            return response

        elif mode == 'absent' or mode == 'daily' or mode == 'present':
            # Sync absences before export to ensure data is correct
            sync_absent_attendance(target_date)
            
            # Fetch report data
            report_res = self.daily_report(request)
            data = report_res.data
            
            # Use 'present' or 'absent' specific lists
            if mode == 'absent':
                target_list = data['absent_records']
                sheet_name = 'Absent_Students'
                filename_prefix = 'Absent'
            else:
                target_list = data['present_records']
                sheet_name = 'Present_Students'
                filename_prefix = 'Present'
            
            rows = []
            for item in target_list:
                rows.append({
                    'Name': item['student_name'],
                    'Reg No': item['registration_no'],
                    'Subject': item['subject_name'],
                    'Status': item['status'].capitalize(),
                    'Date': target_date.strftime('%d-%m-%Y'),
                    'Time': item['time'] if item['time'] else 'N/A',
                })
            
            df = pd.DataFrame(rows)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name=sheet_name)
            
            response = HttpResponse(output.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            filename = f"Attendance_{filename_prefix}_{target_date.strftime('%d_%m_%Y')}.xlsx"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        
        return Response({"error": "Invalid export mode"}, status=400)
