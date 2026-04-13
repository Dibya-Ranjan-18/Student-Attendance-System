from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_student, login_view, google_login_view, send_otp_view, verify_otp_view, reset_password_view,
    DomainViewSet, SubjectViewSet, HolidayViewSet, BranchViewSet, SemesterViewSet,
    CollegeLocationViewSet, RegistrationRequestViewSet, StudentProfileViewSet, AttendanceViewSet
)

router = DefaultRouter()
router.register(r'domains', DomainViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'holidays', HolidayViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'semesters', SemesterViewSet)
router.register(r'locations', CollegeLocationViewSet)
router.register(r'requests', RegistrationRequestViewSet)
router.register(r'students', StudentProfileViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_student, name='register-student'),
    path('login/', login_view, name='login-view'),
    path('google-login/', google_login_view, name='google-login'),
    path('forgot-password/send-otp/', send_otp_view, name='send-otp'),
    path('forgot-password/verify-otp/', verify_otp_view, name='verify-otp'),
    path('forgot-password/reset-password/', reset_password_view, name='reset-password'),
]
