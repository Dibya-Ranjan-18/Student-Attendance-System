from django.db import models
from django.contrib.auth.models import User

class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g. B.Tech

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g. Mathematics
    branch = models.ForeignKey('Branch', on_delete=models.CASCADE, null=True, blank=True)
    semester = models.ForeignKey('Semester', on_delete=models.CASCADE, null=True, blank=True)
    total_students = models.PositiveIntegerField(default=60) # Default class size

    def __str__(self):
        branch_name = self.branch.name if self.branch else 'All'
        semester_name = self.semester.name if self.semester else 'All'
        return f"{self.name} ({branch_name} - {semester_name})"

class Holiday(models.Model):
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    reason = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.start_date} to {self.end_date} - {self.reason}"

class Branch(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g. CSE

    def __str__(self):
        return self.name

class Semester(models.Model):
    name = models.CharField(max_length=50, unique=True) # e.g. 1st Semester

    def __str__(self):
        return self.name

class CollegeLocation(models.Model):
    name = models.CharField(max_length=100, default="College Campus")
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(default=100) # radius in meters
    is_active = models.BooleanField(default=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    days_of_week = models.CharField(max_length=50, default="0,1,2,3,4,5") # 0=Mon, 6=Sun. Default Mon-Sat

    def __str__(self):
        subject_name = self.subject.name if self.subject else "General"
        return f"{self.name} - {subject_name} ({self.start_time} to {self.end_time})"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    registration_no = models.CharField(max_length=50, unique=True)
    phone_no = models.CharField(max_length=15, unique=True)
    domain = models.ForeignKey(Domain, on_delete=models.SET_NULL, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True)
    semester = models.ForeignKey(Semester, on_delete=models.SET_NULL, null=True)
    is_approved = models.BooleanField(default=False)
    approval_date = models.DateField(null=True, blank=True)
    is_google_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.registration_no})"

class RegistrationRequest(models.Model):
    full_name = models.CharField(max_length=255)
    registration_no = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    phone_no = models.CharField(max_length=15, unique=True)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    password = models.CharField(max_length=128) # Hashed password for registration
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    is_google_verified = models.BooleanField(default=True)

    def __str__(self):
        return f"Request from {self.full_name} ({self.registration_no})"

class AttendanceRecord(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=[('present', 'Present'), ('absent', 'Absent')])
    class_name = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'date', 'subject')

    def __str__(self):
        return f"{self.student.registration_no} - {self.date} - {self.subject.name if self.subject else 'General'} - {self.status}"

class OTPReset(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.email}"
