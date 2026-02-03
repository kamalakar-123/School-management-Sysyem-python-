import sqlite3

conn = sqlite3.connect('school_management.db')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print('Tables in database:')
for t in tables:
    print(f'  - {t[0]}')

# Check students count
try:
    count = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    print(f'\nTotal students: {count}')
    
    if count > 0:
        print('\nSample students:')
        for row in conn.execute('SELECT student_id, name, class FROM students LIMIT 5').fetchall():
            print(f'  {row}')
except Exception as e:
    print(f'\nError reading students: {e}')

conn.close()
