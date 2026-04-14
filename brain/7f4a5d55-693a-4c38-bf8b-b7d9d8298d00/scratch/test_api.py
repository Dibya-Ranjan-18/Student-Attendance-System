import requests
import json

base_url = "http://127.0.0.1:8000/api/"

# Need to login first to get a token
login_data = {"username": "admin", "password": "admin123"} # Trying admin/admin123
resp = requests.post(base_url + "login/", json=login_data)

if resp.status_code == 200:
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check daily report
    report_resp = requests.get(base_url + "attendance/daily_report/", headers=headers)
    print("Daily Report Status:", report_resp.status_code)
    print("Daily Report Response Body:")
    print(report_resp.text)
else:
    print(f"Login failed: {resp.status_code}")
    print(resp.text)
