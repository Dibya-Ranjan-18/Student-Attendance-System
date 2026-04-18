import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from attendance.models import RegistrationRequest, Domain, Branch, Semester
from django.contrib.auth.models import User

# Check if we can run the bulk approval logic manually for one request
req = RegistrationRequest.objects.first()
if req:
    print(f"Testing with request: {req.registration_no}")
    try:
        user, created = User.objects.get_or_create(
            username=req.registration_no,
            defaults={
                'email': req.email,
                'first_name': req.full_name
            }
        )
        print(f"User check: {user.username}, created: {created}")
    except Exception as e:
        print(f"Error in User get_or_create: {e}")
else:
    print("No registration requests found.")
