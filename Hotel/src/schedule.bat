@echo off
cd /d %~dp0
call ..\.env\Scripts\activate
python manage.py update_reservation
exit