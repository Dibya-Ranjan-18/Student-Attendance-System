from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Domain, Subject, Holiday, Branch, Semester, CollegeLocation, StudentProfile, RegistrationRequest, AttendanceRecord

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'

class CollegeLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollegeLocation
        fields = ['id', 'name', 'latitude', 'longitude', 'radius', 'is_active', 'subject', 'start_time', 'end_time', 'days_of_week']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class StudentProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    domain_name = serializers.ReadOnlyField(source='domain.name')
    branch_name = serializers.ReadOnlyField(source='branch.name')
    semester_name = serializers.ReadOnlyField(source='semester.name')
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'user_details', 'first_name', 'email', 
            'registration_no', 'phone_no', 'domain', 'domain_name', 
            'branch', 'branch_name', 'semester', 'semester_name', 'is_approved', 'approval_date'
        ]
        read_only_fields = ['user']

    def get_user_details(self, obj):
        return {
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email
        }

    def update(self, instance, validated_data):
        # DRF maps source='user.first_name' into validated_data['user'] as a dict
        # if the 'user' field itself is read-only.
        user_data = validated_data.pop('user', {})
        first_name = user_data.get('first_name') if isinstance(user_data, dict) else None
        email = user_data.get('email') if isinstance(user_data, dict) else None
        registration_no = validated_data.get('registration_no')

        try:
            # Sync with User model
            user = instance.user
            if first_name is not None:
                user.first_name = first_name
            if email is not None:
                user.email = email
            if registration_no:
                # Update username to match registration_no for login consistency
                from django.contrib.auth.models import User
                if User.objects.filter(username=registration_no).exclude(id=user.id).exists():
                    raise serializers.ValidationError({"registration_no": "A user with this registration number already exists."})
                user.username = registration_no
            
            if email:
                from django.contrib.auth.models import User
                if User.objects.filter(email=email).exclude(id=user.id).exists():
                    raise serializers.ValidationError({"email": "A user with this email already exists."})
            
            user.save()
        except serializers.ValidationError:
            raise
        except Exception as e:
            raise serializers.ValidationError(str(e))

        return super().update(instance, validated_data)

    def validate_registration_no(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Registration number must contain only digits.")
        return value

class RegistrationRequestSerializer(serializers.ModelSerializer):
    domain_name = serializers.ReadOnlyField(source='domain.name')
    branch_name = serializers.ReadOnlyField(source='branch.name')
    semester_name = serializers.ReadOnlyField(source='semester.name')

    class Meta:
        model = RegistrationRequest
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def validate_registration_no(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Registration number must contain only digits.")
        return value

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    registration_no = serializers.ReadOnlyField(source='student.registration_no')
    subject_name = serializers.ReadOnlyField(source='subject.name')

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
