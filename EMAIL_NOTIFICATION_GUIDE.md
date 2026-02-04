# Email Notification System - Setup Guide

## Overview
The system has been configured to automatically send email notifications to parents when their child is marked absent during daily attendance.

## What Was Implemented

### 1. Email Configuration
- Added Flask-Mail dependency to `requirements.txt`
- Configured SMTP settings in `app.py`:
  - MAIL_SERVER = "smtp.gmail.com"
  - MAIL_PORT = 587
  - MAIL_USE_TLS = True
  - MAIL_USERNAME = "kamalakaramarathi13579@gmail.com"
  - MAIL_PASSWORD = "tkkj ylhg mszl efnt"

### 2. Database Schema Update
- Added `parent_email` column to the `students` table
- Updated Rahul Sharma's parent email to: gm8432419@gmail.com

### 3. Email Notification Function
Created `send_absence_notification()` function that:
- Creates professional HTML and plain text emails
- Matches the format from your screenshot exactly:
  - Header: "🔔 Absence Notification"
  - Greeting: "Dear Parent,"
  - Notification message with student details
  - Student Details box with Name, Roll No, Class, Date
  - Professional footer with "School Management System"

### 4. Modified Attendance Saving
Updated `save_attendance()` function to:
- Track all absent students when attendance is saved
- Automatically fetch student and parent email information
- Send email notifications to parents of absent students
- Return feedback about emails sent/failed

## Email Format (Matches Your Screenshot)

```
Subject: 🔔 Absence Notification

Dear Parent,

This is an automated notification from School Management System.

Your child [Student Name] (Roll No: [Roll No], Class: [Class]-[Section]) has been 
marked absent on [Date].

If this information is incorrect or if there are any concerns, please contact 
the school immediately.

Student Details:
- Name: [Student Name]
- Roll No: [Roll No]
- Class: [Class]-[Section]
- Date: [Date]

Thank you for your attention.

Best regards,
School Management System
```

## How It Works

1. **Teacher Takes Attendance**: Teacher opens attendance page and marks students as Present/Absent/Late
2. **Save Attendance**: When teacher clicks "Save Attendance" button
3. **System Checks**: System identifies all students marked as "Absent"
4. **Fetch Parent Info**: For each absent student, system retrieves parent email from database
5. **Send Email**: Automatically sends formatted absence notification to parent's email
6. **Confirmation**: System returns message showing how many emails were sent

## Gmail App Password Setup (IMPORTANT!)

The current setup uses a Gmail App Password. To make this work properly:

### Option 1: If Using Provided Gmail Account
The credentials are already configured:
- Email: kamalakaramarathi13579@gmail.com
- App Password: tkkj ylhg mszl efnt

**If emails are not sending**, you need to:
1. Log into this Gmail account
2. Go to Google Account Settings → Security
3. Enable 2-Factor Authentication (if not already enabled)
4. Generate a new App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other" device
   - Generate new 16-digit password
5. Update the password in `app.py` (line ~25)

### Option 2: Use Your Own Gmail Account
1. Update `MAIL_USERNAME` in `app.py` with your Gmail address
2. Generate App Password for your account:
   - Enable 2-Factor Authentication on your Gmail
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new App Password for "Mail"
   - Update `MAIL_PASSWORD` in `app.py`

## Testing the System

### Test 1: Send Test Email
```bash
python test_email.py
```
This will send a test absence notification for Rahul Sharma to gm8432419@gmail.com

### Test 2: Test Through Web Interface
1. Start the application: `python app.py`
2. Log in as teacher
3. Go to Attendance page
4. Mark Rahul Sharma (10A001) as "Absent"
5. Click "Save Attendance"
6. Check email at gm8432419@gmail.com for notification

## Adding Parent Emails for Other Students

To add parent emails for other students:

```python
# Connect to database
import sqlite3
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Update parent email for a student
cursor.execute('''
    UPDATE students 
    SET parent_email = 'parent@example.com' 
    WHERE roll_no = '10A002'
''')

conn.commit()
conn.close()
```

Or use the SQL query:
```sql
UPDATE students SET parent_email = 'parent@example.com' WHERE roll_no = '10A002';
```

## Files Modified

1. **requirements.txt** - Added Flask-Mail==0.9.1
2. **app.py** - Added email configuration and notification functionality
3. **schema.sql** - Added parent_email column to students table
4. **database.db** - Updated with parent_email column and Rahul Sharma's parent email

## Troubleshooting

### Issue: Emails not sending
**Solution**: 
- Verify Gmail credentials are correct
- Ensure App Password (not regular password) is used
- Check 2-Factor Authentication is enabled on Gmail
- Verify internet connection

### Issue: Some emails fail
**Solution**:
- Check if parent_email is NULL for those students
- Verify email addresses are valid format
- Check spam folder in recipient's email

### Issue: Authentication Error
**Solution**:
- Generate new App Password from Google Account
- Make sure using 16-digit app password (no spaces)
- Don't use regular Gmail password

## Security Note

⚠️ **IMPORTANT**: The email password is currently hardcoded in `app.py`. For production use:
1. Move credentials to environment variables
2. Use a `.env` file with python-dotenv
3. Add `.env` to `.gitignore`
4. Never commit passwords to version control

## Next Steps

1. ✅ Generate valid App Password from Gmail
2. ✅ Update password in `app.py` if needed
3. ✅ Test email functionality with `python test_email.py`
4. ✅ Add parent emails for all students in database
5. ✅ Test through web interface by marking students absent

## Success Indicators

When working correctly, you will see:
- ✅ Console message: "Email sent successfully to [email] for [student]"
- ✅ API response includes: "X absence notification(s) sent to parents"
- ✅ Parents receive formatted email matching screenshot design
- ✅ Email appears in parent's inbox (check spam folder first time)
