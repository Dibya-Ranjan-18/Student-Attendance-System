from .auth import register_student, login_view, google_login_view, send_otp_view, verify_otp_view, reset_password_view
from .management import (
    AcademicViewSet, DomainViewSet, SubjectViewSet, HolidayViewSet, 
    BranchViewSet, SemesterViewSet, CollegeLocationViewSet, 
    RegistrationRequestViewSet, StudentProfileViewSet
)
from .attendance_logic import sync_absent_attendance, AttendanceViewSet
