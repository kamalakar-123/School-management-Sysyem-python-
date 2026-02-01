@echo off
echo ============================================
echo  SCHOOL MANAGEMENT DASHBOARD - QUICK START
echo ============================================
echo.

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo.
echo Installing Flask...
pip install -r requirements.txt

echo.
echo ============================================
echo  Starting Dashboard Server...
echo ============================================
echo.

python app.py

pause
