import random
import string
from datetime import datetime
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from ..models import StudentProfile, RegistrationRequest, OTPReset
from ..serializers import (
    StudentProfileSerializer, RegistrationRequestSerializer, UserSerializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_student(request):
    reg_no = request.data.get('registration_no')
    email = request.data.get('email')
    
    # Clean up any orphaned User accounts (no StudentProfile) with same reg_no or email
    orphans = User.objects.filter(Q(username=reg_no) | Q(email=email), is_staff=False)
    for orphan in orphans:
        if not hasattr(orphan, 'studentprofile'):
            orphan.delete()

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
    
    error_msg = "Please check your data: " + ", ".join([f"{k}: {v[0]}" for k, v in serializer.errors.items()])
    return Response({"message": error_msg, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.filter(Q(username=username) | Q(email=username)).first()
    
    if user and user.check_password(password):
        if user.is_staff:
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
            pending = RegistrationRequest.objects.filter(email=email).exists()
            if pending:
                return Response({"error": "Your registration is still in the queue. Please wait for an admin to approve your request."}, status=status.HTTP_403_FORBIDDEN)
                
            return Response({
                "error": "Account not found. Please register first with this institutional email.",
                "email": email,
                "name": name
            }, status=status.HTTP_404_NOT_FOUND)
        
        profile = getattr(user, 'studentprofile', None)
        if not profile or not profile.is_approved:
            return Response({"error": "Your account is approved but final setup is pending. Please wait for an admin to complete activation."}, status=status.HTTP_403_FORBIDDEN)
        
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
    
    otp = ''.join(random.choices(string.digits, k=6))
    OTPReset.objects.filter(email=email).delete()
    OTPReset.objects.create(email=email, otp=otp)
    
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
    
    from django.utils import timezone as tz
    if (tz.now() - otp_record.created_at).total_seconds() > 600:
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
    
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    user.password = make_password(new_password)
    user.save()
    
    otp_record.delete()
    return Response({"message": "Password updated successfully. You can now login."})
