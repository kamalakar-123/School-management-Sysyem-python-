"""
Test script to create sample alert logs and verify they appear in the Alert Logs tab
"""
import sqlite3
from datetime import datetime, timedelta

def create_sample_logs():
    """Create sample alert logs for testing"""
    
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Get some student IDs
    cursor.execute('SELECT student_id, roll_no, name FROM students LIMIT 5')
    students = cursor.fetchall()
    
    if not students:
        print("❌ No students found in database")
        return
    
    print(f"Creating sample alert logs for {len(students)} students...\n")
    
    # Create absence alerts
    for i, student in enumerate(students[:3]):
        student_id, roll_no, name = student
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        
        cursor.execute('''
            INSERT INTO alert_logs (student_id, alert_type, date, parent_email, message, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            student_id,
            'absence',
            date,
            'test@example.com',
            f'Absence notification for {name} on {date}',
            'sent'
        ))
        
        print(f"✅ Created absence alert for {name} ({roll_no})")
    
    # Create low attendance alerts
    for i, student in enumerate(students[3:]):
        student_id, roll_no, name = student
        date = datetime.now().strftime('%Y-%m-%d')
        
        cursor.execute('''
            INSERT INTO alert_logs (student_id, alert_type, date, parent_email, message, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            student_id,
            'low_attendance',
            date,
            'test@example.com',
            f'Low attendance alert: 45.5% attendance',
            'sent'
        ))
        
        print(f"✅ Created low attendance alert for {name} ({roll_no})")
    
    conn.commit()
    
    # Verify logs were created
    cursor.execute('SELECT COUNT(*) FROM alert_logs')
    count = cursor.fetchone()[0]
    
    print(f"\n📊 Total alert logs in database: {count}")
    
    # Show recent logs
    print("\n📋 Recent Alert Logs:")
    print("-" * 80)
    cursor.execute('''
        SELECT 
            al.alert_type,
            s.name,
            s.roll_no,
            al.date,
            al.status,
            al.sent_at
        FROM alert_logs al
        JOIN students s ON al.student_id = s.student_id
        ORDER BY al.sent_at DESC
        LIMIT 10
    ''')
    
    logs = cursor.fetchall()
    for log in logs:
        alert_type, name, roll_no, date, status, sent_at = log
        print(f"  {alert_type.upper():15} | {name:20} | {roll_no:8} | {status.upper():6} | {sent_at}")
    
    conn.close()
    print("\n✅ Sample logs created successfully!")
    print("\n📱 Open the Teacher Portal → Attendance → Alert Logs tab to view them")

if __name__ == "__main__":
    print("=" * 80)
    print("CREATING SAMPLE ALERT LOGS")
    print("=" * 80)
    create_sample_logs()
