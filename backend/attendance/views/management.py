from datetime import date
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Domain, Subject, Holiday, Branch, Semester, CollegeLocation, StudentProfile, RegistrationRequest, AttendanceRecord
from ..serializers import (
    DomainSerializer, SubjectSerializer, HolidaySerializer, BranchSerializer, SemesterSerializer, 
    CollegeLocationSerializer, StudentProfileSerializer, RegistrationRequestSerializer
)

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
        
        profile = getattr(user, 'studentprofile', None)
        if profile:
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
        user.password = reg_request.password
        user.save()

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
        from .analytics import get_student_analytics
        data = get_student_analytics()
        return Response(data)

    @action(detail=True, methods=['get'])
    def subject_stats(self, request, pk=None):
        instance = self.get_object()
        subjects = Subject.objects.filter(branch=instance.branch, semester=instance.semester)
        stats = []
        for sub in subjects:
            present = AttendanceRecord.objects.filter(student=instance, subject=sub, status='present', date__gte=instance.approval_date).count()
            absent = AttendanceRecord.objects.filter(student=instance, subject=sub, status='absent', date__gte=instance.approval_date).count()
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
