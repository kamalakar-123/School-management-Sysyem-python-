"""
Quick script to add parent emails for students
Run this to add parent email addresses to the database
"""

import sqlite3

def add_parent_emails():
    """Add parent emails for students"""
    
    # Connect to database
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Example: Add parent emails for multiple students
    student_emails = [
        # (roll_no, parent_email)
        ('10A001', 'gm8432419@gmail.com'),  # Rahul Sharma - Already added
        ('10A002', 'priya.parent@gmail.com'),  # Priya Patel
        ('10A003', 'arjun.parent@gmail.com'),  # Arjun Nair
        # Add more students as needed
    ]
    
    print("Adding parent emails to database...\n")
    
    for roll_no, parent_email in student_emails:
        try:
            # Get student info
            student = cursor.execute(
                'SELECT name, class, section FROM students WHERE roll_no = ?',
                (roll_no,)
            ).fetchone()
            
            if student:
                # Update parent email
                cursor.execute(
                    'UPDATE students SET parent_email = ? WHERE roll_no = ?',
                    (parent_email, roll_no)
                )
                print(f"✅ Updated: {student[0]} ({roll_no}) - {parent_email}")
            else:
                print(f"❌ Student not found: {roll_no}")
        
        except Exception as e:
            print(f"❌ Error updating {roll_no}: {e}")
    
    # Commit changes
    conn.commit()
    
    # Show all students with parent emails
    print("\n" + "="*60)
    print("Students with Parent Emails:")
    print("="*60)
    
    students = cursor.execute('''
        SELECT roll_no, name, class, section, parent_email 
        FROM students 
        WHERE parent_email IS NOT NULL
        ORDER BY roll_no
    ''').fetchall()
    
    for student in students:
        roll_no, name, class_name, section, parent_email = student
        print(f"{roll_no}: {name} ({class_name}-{section}) - {parent_email}")
    
    print(f"\nTotal students with parent emails: {len(students)}")
    
    conn.close()

if __name__ == "__main__":
    add_parent_emails()
