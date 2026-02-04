import sqlite3

conn = sqlite3.connect('database.db')
conn.row_factory = sqlite3.Row

# Get column names
row = conn.execute('SELECT * FROM students LIMIT 1').fetchone()
print('Columns:', list(row.keys()))

print('\nSample students with section and parent email:')
students = conn.execute('SELECT student_id, name, class, section, email, parent_email FROM students LIMIT 5').fetchall()
for s in students:
    print(f"  ID: {s['student_id']}, Name: {s['name']}, Class: {s['class']}, Section: {s['section']}")
    print(f"    Student Email: {s['email']}")
    print(f"    Parent Email: {s['parent_email']}")
    print()

conn.close()
