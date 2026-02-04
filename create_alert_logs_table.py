"""
Create or update alert_logs table in the database
Run this script to add the alert logging functionality
"""

import sqlite3
import os

def create_alert_logs_table():
    """Create alert_logs table if it doesn't exist"""
    
    database_path = 'database.db'
    
    if not os.path.exists(database_path):
        print("❌ Database not found. Please run the application first to create the database.")
        return False
    
    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()
        
        # Check if table already exists
        cursor.execute('''
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='alert_logs'
        ''')
        
        if cursor.fetchone():
            print("ℹ️  Alert logs table already exists")
        else:
            print("Creating alert_logs table...")
            
            # Create alert_logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alert_logs (
                    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    alert_type TEXT NOT NULL CHECK(alert_type IN ('absence', 'low_attendance')),
                    date DATE NOT NULL,
                    parent_email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('sent', 'failed')),
                    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(student_id)
                )
            ''')
            
            conn.commit()
            print("✅ Alert logs table created successfully!")
        
        # Show table structure
        cursor.execute('PRAGMA table_info(alert_logs)')
        columns = cursor.fetchall()
        
        print("\nTable Structure:")
        print("-" * 60)
        for col in columns:
            print(f"  {col[1]}: {col[2]}")
        
        # Check if there are any logs
        cursor.execute('SELECT COUNT(*) FROM alert_logs')
        count = cursor.fetchone()[0]
        print(f"\nCurrent log entries: {count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("CREATING ALERT LOGS TABLE")
    print("=" * 60)
    create_alert_logs_table()
    print("\n✅ Setup complete! Alert logging is now enabled.")
    print("\nAlert logs will be stored when:")
    print("  - Teachers mark students as absent")
    print("  - Teachers send low attendance alerts")
    print("\nView logs in the Alert Logs tab in the teacher portal.")
