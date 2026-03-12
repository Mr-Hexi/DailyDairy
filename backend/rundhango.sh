#!/bin/bash
cd /home/azureuser/DailyDairy/backend
source venv/bin/activate
gunicorn --workers 3 --bind unix:/home/azureuser/DailyDairy/backend/dailydairy.sock config.wsgi:application
