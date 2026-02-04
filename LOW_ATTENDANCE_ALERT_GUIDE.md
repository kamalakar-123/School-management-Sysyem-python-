# Low Attendance Alert Feature - Implementation Guide

## Overview
Teachers can now automatically send low attendance alerts to parents directly from the attendance management system. When a student's attendance falls below the threshold, teachers can click "Inform Parents" to send a professionally formatted email notification.

## Features Implemented

### 1. Low Attendance Email Notification
- **Email Format**: Matches the screenshot provided
- **Subject**: "🚨 Low Attendance Alert - [Student Name]"
- **Content Includes**:
  - Student details (Name, Roll No, Class, Section)
  - Attendance summary with yellow highlight box:
    - Total classes held
    - Classes attended
    - Classes absent
    - Attendance percentage
  - Important notice in red/pink box
  - Professional footer

### 2. User Interface Enhancements
- **Individual "Inform Parents" Button**: For each student with low attendance
- **"Inform All Parents" Button**: Send alerts to all parents at once
- **Real-time Feedback**: 
  - Loading spinner while sending
  - Success/Error toast notifications
  - Button state changes after sending

### 3. Backend API
- **Endpoint**: `/api/teacher/attendance/low/notify`
- **Method**: POST
- **Validates**: Student exists, parent email is available
- **Returns**: Success status, email counts, detailed results

## How to Use

### Step 1: Navigate to Low Attendance Tab
1. Log in as teacher
2. Go to Attendance Management
3. Click on "Low Attendance" tab

### Step 2: Find Students with Low Attendance
1. Select **Month** (e.g., 2026-02)
2. Set **Threshold %** (e.g., 75)
3. Optionally filter by **Class** and **Section**
4. Click **"Find Students"**

### Step 3: Send Alerts to Parents

#### Option A: Individual Alert
1. Locate the student in the results table
2. Click **"Inform Parents"** button for that student
3. Wait for confirmation (button changes to green "Sent")
4. Check toast notification for success/failure

#### Option B: Bulk Alert
1. After finding low attendance students
2. Click **"Inform All Parents"** button at the top
3. Confirm the action in the popup
4. Wait for processing
5. All successfully sent emails will show green checkmarks

## Email Template Example

```
Subject: 🚨 Low Attendance Alert - Rahul Sharma

Dear Parent,

This is an important attendance update for your child, Rahul Sharma 
(Roll No: 10A001, Class: Class 10-A).

┌─────────────────────────────────┐
│ Summary:                        │
│ • Total classes held: 3         │
│ • Classes attended: 1           │
│ • Classes absent: 2             │
│ • Attendance %: 33.3%           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Important Notice:               │
│ Your child's attendance is      │
│ below the required threshold.   │
│ Please ensure your child        │
│ attends school regularly...     │
└─────────────────────────────────┘

Best regards,
School Management System
```

## Technical Details

### Files Modified
1. **app.py**
   - Added `send_low_attendance_alert()` function
   - Added `/api/teacher/attendance/low/notify` endpoint
   - Updated `get_low_attendance()` to include roll_no

2. **static/js/teacher/attendance.js**
   - Updated `displayLowAttendance()` with new buttons
   - Added `informParent()` function for individual alerts
   - Added `informAllParents()` function for bulk alerts
   - Added `showToast()` for notifications

3. **static/css/teacher/attendance.css**
   - Added `.action-btn` styles
   - Added `.inform-all-btn` styles
   - Added `.toast` notification styles

### API Endpoints

#### Get Low Attendance Students
```
GET /api/teacher/attendance/low
Parameters:
  - month: YYYY-MM format
  - threshold: percentage (0-100)
  - class: optional filter
  - section: optional filter
Response:
  {
    "success": true,
    "students": [...]
  }
```

#### Send Low Attendance Alerts
```
POST /api/teacher/attendance/low/notify
Body:
  {
    "students": [
      {
        "student_id": 1,
        "total_days": 3,
        "present": 1,
        "absent": 2,
        "percentage": 33.3
      }
    ]
  }
Response:
  {
    "success": true,
    "message": "Processed 1 students: 1 alerts sent",
    "emails_sent": 1,
    "emails_failed": 0,
    "results": [...]
  }
```

## Testing

### Test with Python Script
```bash
python test_low_attendance_email.py
```

This will send a test email to gm8432419@gmail.com with:
- Student: Rahul Sharma
- Roll No: 10A001
- Attendance: 33.3% (1 out of 3 classes)

### Test Through Web Interface
1. Start the application: `python app.py`
2. Log in as teacher
3. Go to Attendance → Low Attendance tab
4. Set month to current month
5. Set threshold to 75%
6. Click "Find Students"
7. Click "Inform Parents" for any student

## Prerequisites

### 1. Parent Emails in Database
Students must have parent email addresses:
```python
# Add parent emails using add_parent_emails.py
python add_parent_emails.py
```

### 2. Valid Gmail Credentials
Ensure Gmail App Password is configured in app.py:
```python
MAIL_USERNAME = "kamalakaramarathi13579@gmail.com"
MAIL_PASSWORD = "tkkj ylhg mszl efnt"
```

### 3. Attendance Records
Students need attendance records in the database for the selected month.

## Success Indicators

✅ **Button State Changes**:
- Normal: Blue "Inform Parents" button
- Loading: Spinner with "Sending..." text
- Success: Green button with checkmark "Sent"
- Disabled after successful send

✅ **Toast Notifications**:
- Success: Green toast with checkmark
- Error: Red toast with error icon
- Message describes what happened

✅ **Email Received**:
- Check parent's inbox (or spam folder)
- Email should match the format in screenshot
- Subject includes student name
- All details are correctly filled

## Troubleshooting

### Issue: "No parent email on file"
**Solution**: Add parent email to database
```python
import sqlite3
conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute("UPDATE students SET parent_email='email@example.com' WHERE student_id=1")
conn.commit()
conn.close()
```

### Issue: Email not sending
**Solution**: 
1. Check Gmail credentials
2. Verify 2FA is enabled
3. Generate new App Password
4. Check internet connection

### Issue: No students found
**Solution**:
1. Ensure attendance records exist for selected month
2. Try lowering the threshold
3. Remove class/section filters

### Issue: Button stuck on "Sending..."
**Solution**:
1. Check browser console for errors
2. Verify API endpoint is responding
3. Check network tab in DevTools
4. Reload the page and try again

## Future Enhancements

Potential improvements:
- [ ] SMS notifications in addition to email
- [ ] Schedule automatic alerts (weekly/monthly)
- [ ] Parent acknowledgment tracking
- [ ] Multiple email recipients per student
- [ ] Customizable email templates
- [ ] Alert history log in database

## Security Notes

⚠️ **Email Credentials**:
- Currently hardcoded in app.py
- Should be moved to environment variables for production
- Use .env file and python-dotenv

⚠️ **Parent Email Validation**:
- Currently no email format validation
- Consider adding email validation before sending
- Implement bounce handling

⚠️ **Rate Limiting**:
- No rate limiting implemented
- Gmail has sending limits (~500 emails/day)
- Consider implementing queuing for bulk sends

## Summary

The Low Attendance Alert feature is now fully functional:
- ✅ Professional email format matching screenshot
- ✅ Individual and bulk sending options
- ✅ Real-time user feedback
- ✅ Proper error handling
- ✅ Toast notifications
- ✅ Button state management

Teachers can now efficiently notify parents about low attendance with just one click!
