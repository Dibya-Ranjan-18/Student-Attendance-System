#!/bin/bash

# Exit on error
set -o errexit

echo "--- Building Backend ---"

# Install dependencies
python -m pip install -r requirements.txt

# Run migrations (Safe: does not delete data)
echo "--- Running Database Migrations ---"
python manage.py migrate --noinput

# Collect static files
echo "--- Collecting Static Files ---"
python manage.py collectstatic --noinput

echo "--- Backend Build Complete ---"
