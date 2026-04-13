from django.contrib import admin
from .models import Domain, Branch, Semester, CollegeLocation, StudentProfile, RegistrationRequest, AttendanceRecord

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(CollegeLocation)
class CollegeLocationAdmin(admin.ModelAdmin):
    list_display = ['latitude', 'longitude', 'radius', 'is_active']
    list_editable = ['is_active']

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'registration_no', 'phone_no', 'domain', 'branch', 'semester', 'is_approved']
    list_filter = ['domain', 'branch', 'semester', 'is_approved']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'registration_no']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Full Name'

@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'registration_no', 'email', 'phone_no', 'is_processed', 'created_at']
    list_filter = ['is_processed', 'domain', 'branch']
    actions = ['approve_requests']

    def approve_requests(self, request, queryset):
        # Implementation of approval logic will go here
        # (Alternatively, through a custom API/View)
        pass

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'time', 'status', 'class_name']
    list_filter = ['status', 'date']
    search_fields = ['student__registration_no', 'student__user__username']
