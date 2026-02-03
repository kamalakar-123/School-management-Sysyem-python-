"""
============================================
SCHOOL MANAGEMENT SYSTEM - FLASK BACKEND
============================================
Features:
- Real-time dashboard statistics
- Automated attendance tracking
- Smart alert generation
- Performance analytics
- RESTful API endpoints
============================================
"""

from flask import Flask, render_template, jsonify, request
import sqlite3
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Database configuration
DATABASE = 'database.db'

# ============================================
# DATABASE HELPER FUNCTIONS
# ============================================

def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn

def init_database():
    """Initialize database with schema and sample data"""
    if not os.path.exists(DATABASE):
        print("📦 Creating database...")
        conn = sqlite3.connect(DATABASE)
        
        # Read and execute schema
        with open('schema.sql', 'r') as f:
            conn.executescript(f.read())
        
        conn.commit()
        conn.close()
        print("✅ Database created successfully!")
    else:
        print("✅ Database already exists")

# ============================================
# ROUTE: MAIN DASHBOARD
# ============================================

@app.route('/')
@app.route('/dashboard')
def dashboard():
    """Render the main dashboard page"""
    return render_template('admin/dashboard.html')

# ============================================
# ROUTE: STUDENTS PAGE
# ============================================

@app.route('/students')
def students():
    """Render the students list page"""
    return render_template('admin/students.html')

# ============================================
# ROUTE: TEACHERS PAGE
# ============================================

@app.route('/teachers')
def teachers():
    """Render the teachers list page"""
    return render_template('admin/teachers.html')

# ============================================
# ROUTE: ATTENDANCE PAGE
# ============================================

@app.route('/attendance')
def attendance():
    """Render the attendance page"""
    return render_template('admin/attendance.html')

# ============================================
# ROUTE: FEES PAGE
# ============================================

@app.route('/fees')
def fees():
    """Render the fees page"""
    return render_template('admin/fees.html')

# ============================================
# ROUTE: TEACHER LOGIN PAGE
# ============================================

@app.route('/teacher/login')
def teacher_login():
    """Render the teacher login page"""
    return render_template('teacher/login.html')

# ============================================
# ROUTE: TEACHER DASHBOARD PAGE
# ============================================

@app.route('/teacher/dashboard')
def teacher_dashboard():
    """Render the teacher dashboard page"""
    return render_template('teacher/dashboard.html')

# ============================================
# ROUTE: TEACHER CLASSES PAGE
# ============================================

@app.route('/teacher/classes')
def teacher_classes():
    """Render the teacher classes page"""
    return render_template('teacher/classes.html')

# ============================================
# ROUTE: TEACHER ATTENDANCE PAGE
# ============================================

@app.route('/teacher/attendance')
def teacher_attendance():
    """Render the teacher attendance page"""
    return render_template('teacher/attendance.html')

@app.route('/teacher/assignments')
def teacher_assignments():
    """Render the teacher assignments page"""
    return render_template('teacher/assignments.html')

@app.route('/teacher/grades')
def teacher_grades():
    """Render the teacher grades page"""
    return render_template('teacher/grades.html')

@app.route('/teacher/messages')
def teacher_messages():
    """Render the teacher messages page"""
    return render_template('teacher/messages.html')

# ============================================
# API ROUTE: TEACHER STATISTICS
# ============================================

@app.route('/api/teacher/stats')
def get_teacher_stats():
    """
    Get teacher dashboard statistics
    Returns: JSON with teacher stats data
    """
    conn = get_db_connection()
    
    try:
        # Get total classes assigned (using teachers table)
        total_classes = conn.execute(
            'SELECT COUNT(DISTINCT subject) FROM teachers'
        ).fetchone()[0]
        
        # Get total students (all students in the school)
        total_students = conn.execute(
            'SELECT COUNT(*) FROM students'
        ).fetchone()[0]
        
        # Calculate today's attendance percentage
        today = datetime.now().strftime('%Y-%m-%d')
        attendance_stats = conn.execute(
            '''SELECT 
                COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
                COUNT(*) as total
               FROM attendance
               WHERE date = ?''',
            (today,)
        ).fetchone()
        
        if attendance_stats['total'] > 0:
            attendance_percentage = round((attendance_stats['present'] / attendance_stats['total']) * 100, 1)
        else:
            attendance_percentage = 0
        
        # Get pending assignments (mock data - can be replaced with actual assignments table)
        pending_assignments = 5  # TODO: Replace with actual query when assignments table is created
        
        # Get new messages (mock data - can be replaced with actual messages table)
        new_messages = 3  # TODO: Replace with actual query when messages table is created
        
        conn.close()
        
        return jsonify({
            'success': True,
            'total_classes': total_classes,
            'total_students': total_students,
            'attendance_percentage': attendance_percentage,
            'pending_assignments': pending_assignments,
            'new_messages': new_messages
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e),
            'total_classes': 0,
            'total_students': 0,
            'attendance_percentage': 0,
            'pending_assignments': 0,
            'new_messages': 0
        }), 500

# ============================================
# API ROUTE: TEACHER CLASSES DATA
# ============================================

@app.route('/api/teacher/classes')
def get_teacher_classes():
    """
    Get all classes assigned to the teacher
    Returns: JSON with classes data
    """
    conn = get_db_connection()
    
    try:
        # Get unique classes from students table grouped by class
        classes_data = conn.execute(
            '''SELECT 
                class as class_name,
                COUNT(*) as total_students
               FROM students
               GROUP BY class
               ORDER BY class'''
        ).fetchall()
        
        classes_list = []
        
        for class_row in classes_data:
            class_name = class_row['class_name']
            total_students = class_row['total_students']
            
            # Calculate attendance rate for this class (simplified)
            today = datetime.now().strftime('%Y-%m-%d')
            try:
                attendance_stats = conn.execute(
                    '''SELECT 
                        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present,
                        COUNT(*) as total
                       FROM attendance a
                       JOIN students s ON a.student_id = s.student_id
                       WHERE s.class = ? AND a.date = ?''',
                    (class_name, today)
                ).fetchone()
                
                if attendance_stats and attendance_stats['total'] > 0:
                    attendance_rate = round((attendance_stats['present'] / attendance_stats['total']) * 100)
                else:
                    attendance_rate = 0
            except:
                attendance_rate = 0
            
            # Get subject from teachers table (match first word of class with grade)
            try:
                subject_data = conn.execute(
                    'SELECT subject FROM teachers LIMIT 1'
                ).fetchone()
                subject = subject_data['subject'] if subject_data else 'General'
            except:
                subject = 'General'
            
            classes_list.append({
                'class_name': class_name,
                'subject': subject,
                'total_students': total_students,
                'attendance_rate': attendance_rate,
                'avg_grade': 'B+',  # TODO: Calculate from grades table when available
                'schedule': 'Mon, Wed, Fri - 9:00 AM'  # TODO: Get from schedule table
            })
        
        return jsonify({
            'success': True,
            'classes': classes_list
        })
        
    except Exception as e:
        print(f"Error in get_teacher_classes: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'classes': []
        }), 500
    finally:
        conn.close()

# ============================================
# API ROUTE: GET STUDENTS FOR ATTENDANCE
# ============================================

@app.route('/api/teacher/students')
def get_teacher_students():
    """Get students for attendance marking"""
    class_name = request.args.get('class', '')
    section = request.args.get('section', 'A')
    
    conn = get_db_connection()
    
    try:
        # If no class specified, return empty or get first available class
        if not class_name or class_name == '':
            return jsonify({
                'success': False,
                'error': 'Please select a class',
                'students': []
            })
        
        students = conn.execute(
            '''SELECT student_id, name, class
               FROM students
               WHERE class = ?
               ORDER BY student_id''',
            (class_name,)
        ).fetchall()
        
        students_list = [{
            'student_id': s['student_id'],
            'name': s['name'],
            'class': s['class']
        } for s in students]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'students': students_list
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e),
            'students': []
        }), 500

# ============================================
# API ROUTE: SAVE ATTENDANCE
# ============================================

@app.route('/api/teacher/attendance/save', methods=['POST'])
def save_attendance():
    """Save attendance records"""
    try:
        data = request.json
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        attendance_records = data.get('attendance', [])
        
        if not attendance_records:
            return jsonify({
                'success': False,
                'error': 'No attendance records provided'
            }), 400
        
        conn = get_db_connection()
        
        for record in attendance_records:
            # Validate required fields
            if not record.get('student_id') or not record.get('date'):
                continue
            
            # Check if attendance already exists in daily_attendance table
            existing = conn.execute(
                '''SELECT id FROM daily_attendance
                   WHERE student_id = ? AND date = ?''',
                (record['student_id'], record['date'])
            ).fetchone()
            
            # Map status to match database constraint (lowercase)
            status_map = {
                'Present': 'present',
                'Absent': 'absent',
                'Late': 'late',
                'On Leave': 'absent'  # Map "On Leave" to absent
            }
            db_status = status_map.get(record.get('status', 'Present'), 'present')
            
            if existing:
                # Update existing record
                conn.execute(
                    '''UPDATE daily_attendance
                       SET status = ?
                       WHERE student_id = ? AND date = ?''',
                    (db_status, record['student_id'], record['date'])
                )
            else:
                # Insert new record
                conn.execute(
                    '''INSERT INTO daily_attendance (student_id, date, status)
                       VALUES (?, ?, ?)''',
                    (record['student_id'], record['date'], db_status)
                )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Attendance saved successfully for {len(attendance_records)} students'
        })
        
    except Exception as e:
        print(f"Error saving attendance: {e}")
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: DAILY ATTENDANCE REPORT
# ============================================

@app.route('/api/teacher/attendance/daily')
def get_daily_attendance():
    """Get daily attendance report"""
    date = request.args.get('date')
    class_name = request.args.get('class', '')
    section = request.args.get('section', '')
    
    conn = get_db_connection()
    
    try:
        # Build query based on filters
        query = '''SELECT a.*, s.name, s.class, s.section
                   FROM daily_attendance a
                   JOIN students s ON a.student_id = s.student_id
                   WHERE a.date = ?'''
        params = [date]
        
        if class_name:
            query += ' AND s.class = ?'
            params.append(class_name)
        
        if section:
            query += ' AND s.section = ?'
            params.append(section)
        
        query += ' ORDER BY s.student_id'
        
        records = conn.execute(query, params).fetchall()
        
        # Calculate stats
        stats = {
            'total': len(records),
            'present': sum(1 for r in records if r['status'] == 'present'),
            'absent': sum(1 for r in records if r['status'] == 'absent'),
            'late': sum(1 for r in records if r['status'] == 'late'),
            'on_leave': 0,
            'unmarked': 0
        }
        
        details = [{
            'student_id': r['student_id'],
            'name': r['name'],
            'class': r['class'],
            'section': r['section'],
            'status': r['status'].capitalize(),  # Convert to Title Case for display
            'remarks': ''
        } for r in records]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': stats,
            'details': details
        })
        
    except Exception as e:
        print(f"Error in get_daily_attendance: {e}")
        import traceback
        traceback.print_exc()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: MONTHLY ATTENDANCE REPORT
# ============================================

@app.route('/api/teacher/attendance/monthly')
def get_monthly_attendance():
    """Get monthly attendance report"""
    month = request.args.get('month')  # Format: YYYY-MM
    class_name = request.args.get('class', '')
    section = request.args.get('section', '')
    
    conn = get_db_connection()
    
    try:
        # Get all students
        query = 'SELECT student_id, name, class, section FROM students WHERE 1=1'
        params = []
        
        if class_name:
            query += ' AND class = ?'
            params.append(class_name)
        
        if section:
            query += ' AND section = ?'
            params.append(section)
        
        students = conn.execute(query, params).fetchall()
        
        # Calculate attendance for each student
        students_data = []
        total_present = 0
        total_records = 0
        
        for student in students:
            # Get attendance for the month from daily_attendance
            attendance = conn.execute(
                '''SELECT status FROM daily_attendance
                   WHERE student_id = ? AND strftime('%Y-%m', date) = ?''',
                (student['student_id'], month)
            ).fetchall()
            
            total_days = len(attendance)
            present = sum(1 for a in attendance if a['status'] == 'present')
            absent = sum(1 for a in attendance if a['status'] == 'absent')
            
            if total_days > 0:
                percentage = round((present / total_days) * 100, 1)
            else:
                percentage = 0
            
            students_data.append({
                'student_id': student['student_id'],
                'name': student['name'],
                'class': student['class'],
                'section': student['section'],
                'total_days': total_days,
                'present': present,
                'absent': absent,
                'percentage': percentage
            })
            
            total_present += present
            total_records += total_days
        
        # Calculate overall percentage
        if total_records > 0:
            overall_percentage = round((total_present / total_records) * 100, 2)
        else:
            overall_percentage = 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'overall_percentage': overall_percentage,
            'students': students_data
        })
        
    except Exception as e:
        print(f"Error in get_monthly_attendance: {e}")
        import traceback
        traceback.print_exc()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: LOW ATTENDANCE ALERT
# ============================================

@app.route('/api/teacher/attendance/low')
def get_low_attendance():
    """Get students with low attendance"""
    month = request.args.get('month')
    threshold = float(request.args.get('threshold', 75))
    class_name = request.args.get('class', '')
    section = request.args.get('section', '')
    
    conn = get_db_connection()
    
    try:
        query = 'SELECT student_id, name, class, section FROM students WHERE 1=1'
        params = []
        
        if class_name:
            query += ' AND class = ?'
            params.append(class_name)
        
        if section:
            query += ' AND section = ?'
            params.append(section)
        
        students = conn.execute(query, params).fetchall()
        
        low_attendance_students = []
        
        for student in students:
            # Get attendance for the month from daily_attendance
            attendance = conn.execute(
                '''SELECT status FROM daily_attendance
                   WHERE student_id = ? AND strftime('%Y-%m', date) = ?''',
                (student['student_id'], month)
            ).fetchall()
            
            total_days = len(attendance)
            present = sum(1 for a in attendance if a['status'] == 'present')
            absent = total_days - present
            
            if total_days > 0:
                percentage = round((present / total_days) * 100, 1)
                
                if percentage < threshold:
                    low_attendance_students.append({
                        'student_id': student['student_id'],
                        'name': student['name'],
                        'class': student['class'],
                        'section': student['section'],
                        'total_days': total_days,
                        'present': present,
                        'absent': absent,
                        'percentage': percentage
                    })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'students': low_attendance_students
        })
        
    except Exception as e:
        print(f"Error in get_low_attendance: {e}")
        import traceback
        traceback.print_exc()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: ALERT LOGS
# ============================================

@app.route('/api/teacher/alert-logs')
def get_alert_logs():
    """Get parent alert logs (simulated)"""
    
    # Sample alert logs data
    sample_logs = [
        {
            'date': '02/01/2026',
            'student_name': 'Amit Kumar',
            'roll_no': '103',
            'class': '10',
            'section': 'A',
            'parent_contact': '9876543212',
            'parent_email': 'kamalakara2005@gmail.com',
            'message': 'Dear Parent, Your child Amit Kumar (Roll No: 103, Class: 10-A) has been marked absent today (02/01/2026). If this information is incorrect, please contact the school immediately.',
            'status': 'SENT'
        },
        {
            'date': '12/12/2025',
            'student_name': 'Kamalakara',
            'roll_no': '111',
            'class': '10',
            'section': 'A',
            'parent_contact': '8431521612',
            'parent_email': 'vivek.tr2023@gmail.com',
            'message': 'Dear Parent, Your child Kamalakara (Roll No: 111, Class: 10-A) has been marked absent today (12/12/2025). If this information is incorrect, please contact the school immediately.',
            'status': 'SENT'
        },
        {
            'date': '12/12/2025',
            'student_name': 'Amit Kumar',
            'roll_no': '103',
            'class': '10',
            'section': 'A',
            'parent_contact': '9876543212',
            'parent_email': 'kamalakara2005@gmail.com',
            'message': 'Dear Parent, Your child Amit Kumar (Roll No: 103, Class: 10-A) has been marked absent today (12/12/2025). If this information is incorrect, please contact the school immediately.',
            'status': 'SENT'
        },
        {
            'date': '10/12/2025',
            'student_name': 'Amit Kumar',
            'roll_no': '103',
            'class': '10',
            'section': 'A',
            'parent_contact': '9876543212',
            'parent_email': 'kamalakara2005@gmail.com',
            'message': 'Dear Parent, Your child Amit Kumar (Roll No: 103, Class: 10-A) has been marked absent today (10/12/2025). If this information is incorrect, please contact the school immediately.',
            'status': 'SENT'
        }
    ]
    
    return jsonify({
        'success': True,
        'logs': sample_logs
    })

# ============================================
# API ROUTE: FEES DATA
# ============================================

@app.route('/api/fees')
def get_fees():
    """
    Get all fees records with student information
    Returns: JSON with fees data
    """
    conn = get_db_connection()
    
    fees_records = conn.execute(
        '''SELECT 
            f.fee_id,
            f.student_id,
            s.name,
            s.class,
            f.total_amount,
            f.paid_amount,
            f.pending_amount,
            f.due_date,
            f.status
           FROM fees f
           JOIN students s ON f.student_id = s.student_id
           ORDER BY f.status DESC, f.due_date ASC'''
    ).fetchall()
    
    conn.close()
    
    fees_list = []
    for record in fees_records:
        fees_list.append({
            'fee_id': record['fee_id'],
            'student_id': record['student_id'],
            'name': record['name'],
            'class': record['class'],
            'total_amount': record['total_amount'],
            'paid_amount': record['paid_amount'],
            'pending_amount': record['pending_amount'],
            'due_date': record['due_date'],
            'status': record['status']
        })
    
    return jsonify({
        'success': True,
        'fees': fees_list,
        'total': len(fees_list)
    })

# ============================================
# API ROUTE: UPDATE FEE PAYMENT
# ============================================

@app.route('/api/fees/<int:fee_id>/payment', methods=['POST'])
def update_fee_payment(fee_id):
    """
    Update fee payment for a student
    Request Body: JSON with payment amount
    Returns: JSON with success/error message
    """
    try:
        data = request.get_json()
        payment_amount = float(data.get('payment_amount', 0))
        
        if payment_amount <= 0:
            return jsonify({
                'success': False,
                'error': 'Payment amount must be greater than 0'
            }), 400
        
        conn = get_db_connection()
        
        # Get current fee record
        current_fee = conn.execute(
            'SELECT * FROM fees WHERE fee_id = ?',
            (fee_id,)
        ).fetchone()
        
        if not current_fee:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Fee record not found'
            }), 404
        
        # Calculate new amounts
        new_paid_amount = current_fee['paid_amount'] + payment_amount
        new_pending_amount = current_fee['total_amount'] - new_paid_amount
        
        # Check if payment exceeds pending amount
        if new_paid_amount > current_fee['total_amount']:
            conn.close()
            return jsonify({
                'success': False,
                'error': f'Payment amount (${payment_amount}) exceeds pending amount (${current_fee["pending_amount"]})'
            }), 400
        
        # Determine new status
        new_status = 'paid' if new_pending_amount == 0 else 'pending'
        if new_pending_amount > 0:
            # Check if overdue
            due_date = datetime.strptime(current_fee['due_date'], '%Y-%m-%d')
            if due_date < datetime.now():
                new_status = 'overdue'
        
        # Update fee record
        conn.execute(
            '''UPDATE fees 
               SET paid_amount = ?, 
                   pending_amount = ?,
                   status = ?
               WHERE fee_id = ?''',
            (new_paid_amount, new_pending_amount, new_status, fee_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Payment of ${payment_amount} recorded successfully',
            'new_paid_amount': new_paid_amount,
            'new_pending_amount': new_pending_amount,
            'new_status': new_status
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# ROUTE: EXAMS PAGE
# ============================================

@app.route('/exams')
def exams():
    """Render the exams page"""
    return render_template('admin/exams.html')

# ============================================
# ROUTE: SETTINGS PAGE
# ============================================

@app.route('/settings')
def settings():
    """Render the settings page"""
    return render_template('admin/settings.html')

# ============================================
# API ROUTE: GET ALL EXAMS
# ============================================

@app.route('/api/exams')
def get_exams():
    """
    Get all exams with their details
    Returns: JSON with exam information
    """
    conn = get_db_connection()
    
    exams_records = conn.execute(
        '''SELECT exam_id, exam_name, class, subject, exam_date, max_marks, status
           FROM exams
           ORDER BY exam_date DESC'''
    ).fetchall()
    
    conn.close()
    
    exams_list = []
    for record in exams_records:
        exams_list.append({
            'exam_id': record['exam_id'],
            'exam_name': record['exam_name'],
            'class': record['class'],
            'subject': record['subject'],
            'exam_date': record['exam_date'],
            'max_marks': record['max_marks'],
            'status': record['status']
        })
    
    return jsonify({
        'success': True,
        'exams': exams_list,
        'total': len(exams_list)
    })

# ============================================
# API ROUTE: ADD NEW EXAM
# ============================================

@app.route('/api/exams', methods=['POST'])
def add_exam():
    """
    Add a new exam to the database
    Request Body: JSON with exam details
    Returns: JSON with success/error message
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['exam_name', 'class', 'subject', 'exam_date', 'max_marks']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        conn = get_db_connection()
        
        # Insert new exam
        cursor = conn.execute(
            '''INSERT INTO exams (exam_name, class, subject, exam_date, max_marks, status)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (data['exam_name'], data['class'], data['subject'], 
             data['exam_date'], data['max_marks'], data.get('status', 'upcoming'))
        )
        
        exam_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Exam added successfully',
            'exam_id': exam_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: UPDATE EXAM
# ============================================

@app.route('/api/exams/<int:exam_id>', methods=['PUT'])
def update_exam(exam_id):
    """
    Update an existing exam
    Request Body: JSON with exam details to update
    Returns: JSON with success/error message
    """
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        
        # Check if exam exists
        existing = conn.execute(
            'SELECT * FROM exams WHERE exam_id = ?',
            (exam_id,)
        ).fetchone()
        
        if not existing:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Update exam
        conn.execute(
            '''UPDATE exams 
               SET exam_name = ?, class = ?, subject = ?, 
                   exam_date = ?, max_marks = ?, status = ?
               WHERE exam_id = ?''',
            (data.get('exam_name', existing['exam_name']),
             data.get('class', existing['class']),
             data.get('subject', existing['subject']),
             data.get('exam_date', existing['exam_date']),
             data.get('max_marks', existing['max_marks']),
             data.get('status', existing['status']),
             exam_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Exam updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: DELETE EXAM
# ============================================

@app.route('/api/exams/<int:exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    """
    Delete an exam
    Returns: JSON with success/error message
    """
    try:
        conn = get_db_connection()
        
        # Check if exam exists
        existing = conn.execute(
            'SELECT * FROM exams WHERE exam_id = ?',
            (exam_id,)
        ).fetchone()
        
        if not existing:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Delete exam
        conn.execute('DELETE FROM exams WHERE exam_id = ?', (exam_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Exam deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: DASHBOARD STATISTICS
# ============================================

@app.route('/api/stats')
def get_stats():
    """
    Get real-time dashboard statistics
    Returns: JSON with all key metrics
    """
    conn = get_db_connection()
    
    # Get total students count
    total_students = conn.execute(
        'SELECT COUNT(*) as count FROM students WHERE status = "active"'
    ).fetchone()['count']
    
    # Get total teachers count
    total_teachers = conn.execute(
        'SELECT COUNT(*) as count FROM teachers WHERE status = "active"'
    ).fetchone()['count']
    
    # Get today's attendance percentage
    today_attendance = conn.execute(
        'SELECT attendance_percentage FROM attendance WHERE date = date("now") LIMIT 1'
    ).fetchone()
    
    attendance_percentage = today_attendance['attendance_percentage'] if today_attendance else 0
    
    # Get pending fees count
    pending_fees_count = conn.execute(
        'SELECT COUNT(*) as count FROM fees WHERE status IN ("pending", "overdue")'
    ).fetchone()['count']
    
    # Get upcoming exams count (within next 7 days)
    upcoming_exams = conn.execute(
        '''SELECT COUNT(*) as count FROM exams 
           WHERE exam_date BETWEEN date("now") AND date("now", "+7 days")
           AND status = "upcoming"'''
    ).fetchone()['count']
    
    conn.close()
    
    # Determine status colors based on thresholds
    attendance_status = 'success' if attendance_percentage >= 85 else 'warning' if attendance_percentage >= 75 else 'danger'
    fees_status = 'success' if pending_fees_count == 0 else 'warning' if pending_fees_count <= 3 else 'danger'
    
    return jsonify({
        'total_students': total_students,
        'total_teachers': total_teachers,
        'attendance_percentage': round(attendance_percentage, 1),
        'attendance_status': attendance_status,
        'pending_fees_count': pending_fees_count,
        'fees_status': fees_status,
        'upcoming_exams': upcoming_exams
    })

# ============================================
# API ROUTE: ATTENDANCE DATA (7 DAYS)
# ============================================

@app.route('/api/attendance-data')
def get_attendance_data():
    """
    Get attendance data for the last 7 days
    Returns: JSON with dates and percentages for line chart
    """
    conn = get_db_connection()
    
    attendance_records = conn.execute(
        '''SELECT date, attendance_percentage 
           FROM attendance 
           ORDER BY date DESC 
           LIMIT 7'''
    ).fetchall()
    
    conn.close()
    
    # Reverse to show oldest to newest
    attendance_records = list(reversed(attendance_records))
    
    # Format data for Chart.js
    labels = []
    data = []
    
    for record in attendance_records:
        # Format date as "Mon 27" or "Jan 27"
        date_obj = datetime.strptime(record['date'], '%Y-%m-%d')
        labels.append(date_obj.strftime('%b %d'))
        data.append(record['attendance_percentage'])
    
    return jsonify({
        'labels': labels,
        'data': data
    })

# ============================================
# API ROUTE: PERFORMANCE DATA
# ============================================

@app.route('/api/performance-data')
def get_performance_data():
    """
    Get class-wise average performance
    Returns: JSON with class names and average percentages for bar chart
    """
    conn = get_db_connection()
    
    performance_records = conn.execute(
        '''SELECT class, AVG(percentage) as avg_percentage, AVG(marks_obtained) as avg_marks
           FROM performance
           GROUP BY class
           ORDER BY class'''
    ).fetchall()
    
    conn.close()
    
    # Format data for Chart.js
    labels = []
    data = []
    
    for record in performance_records:
        labels.append(record['class'])
        data.append(round(record['avg_percentage'], 1))
    
    return jsonify({
        'labels': labels,
        'data': data
    })

# ============================================
# API ROUTE: SMART ALERTS
# ============================================

@app.route('/api/alerts')
def get_alerts():
    """
    Generate smart alerts based on business rules
    Rules:
    - Low Attendance: < 75%
    - Unpaid Fees: pending_amount > 0 and due soon
    - Upcoming Exams: within next 3 days
    """
    conn = get_db_connection()
    alerts = []
    
    # ==========================================
    # ALERT 1: LOW ATTENDANCE WARNING
    # ==========================================
    today_attendance = conn.execute(
        'SELECT attendance_percentage FROM attendance WHERE date = date("now") LIMIT 1'
    ).fetchone()
    
    if today_attendance and today_attendance['attendance_percentage'] < 75:
        alerts.append({
            'id': 1,
            'type': 'danger',
            'icon': '🔴',
            'title': 'Low Attendance Alert',
            'message': f"Today's attendance is only {today_attendance['attendance_percentage']}%. Immediate action required!",
            'time': 'Just now'
        })
    
    # ==========================================
    # ALERT 2: UNPAID FEES WARNING
    # ==========================================
    unpaid_fees = conn.execute(
        '''SELECT COUNT(*) as count FROM fees 
           WHERE status IN ("pending", "overdue")'''
    ).fetchone()['count']
    
    if unpaid_fees > 0:
        alerts.append({
            'id': 2,
            'type': 'warning',
            'icon': '🟠',
            'title': 'Pending Fees Alert',
            'message': f'{unpaid_fees} students have pending or overdue fee payments. Send reminders.',
            'time': '10 mins ago'
        })
    
    # ==========================================
    # ALERT 3: UPCOMING EXAMS
    # ==========================================
    upcoming_exams = conn.execute(
        '''SELECT exam_name, class, subject, exam_date 
           FROM exams 
           WHERE exam_date BETWEEN date("now") AND date("now", "+3 days")
           AND status = "upcoming"
           ORDER BY exam_date ASC
           LIMIT 3'''
    ).fetchall()
    
    if upcoming_exams:
        for exam in upcoming_exams:
            exam_date = datetime.strptime(exam['exam_date'], '%Y-%m-%d')
            days_left = (exam_date - datetime.now()).days
            
            time_text = "Tomorrow" if days_left == 1 else f"In {days_left} days" if days_left > 1 else "Today"
            
            alerts.append({
                'id': 3,
                'type': 'info',
                'icon': '🔵',
                'title': f'Upcoming Exam: {exam["exam_name"]}',
                'message': f'{exam["class"]} - {exam["subject"]} exam on {exam_date.strftime("%b %d, %Y")}',
                'time': time_text
            })
    
    # ==========================================
    # ALERT 4: POSITIVE ATTENDANCE (If good)
    # ==========================================
    if today_attendance and today_attendance['attendance_percentage'] >= 90:
        alerts.append({
            'id': 4,
            'type': 'success',
            'icon': '🟢',
            'title': 'Excellent Attendance!',
            'message': f"Great job! Today's attendance is {today_attendance['attendance_percentage']}%",
            'time': '1 hour ago'
        })
    
    conn.close()
    
    return jsonify({
        'alerts': alerts,
        'total': len(alerts)
    })

# ============================================
# API ROUTE: ALL STUDENTS
# ============================================

@app.route('/api/students')
def get_students():
    """
    Get all active students with their attendance status
    Returns: JSON with student details including today's attendance
    """
    conn = get_db_connection()
    
    students_records = conn.execute(
        '''SELECT 
            s.student_id,
            s.roll_no,
            s.name,
            s.class,
            s.section,
            s.email,
            COALESCE(da.status, 'absent') as attendance_status
           FROM students s
           LEFT JOIN daily_attendance da ON s.student_id = da.student_id AND da.date = date("now")
           WHERE s.status = "active"
           ORDER BY s.class DESC, s.section ASC, s.roll_no ASC'''
    ).fetchall()
    
    conn.close()
    
    students_list = []
    for student in students_records:
        students_list.append({
            'id': student['student_id'],
            'roll_no': student['roll_no'],
            'name': student['name'],
            'class': student['class'],
            'section': student['section'],
            'email': student['email'],
            'attendance_status': student['attendance_status']
        })
    
    return jsonify({
        'students': students_list,
        'total': len(students_list)
    })

# ============================================
# API ROUTE: ADD NEW STUDENT
# ============================================

@app.route('/api/students', methods=['POST'])
def add_student():
    """
    Add a new student to the database
    Expects JSON with: name, roll_no, class, section, email, phone, address, attendance_status
    Returns: JSON with success message and new student data
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'roll_no', 'class', 'email']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        conn = get_db_connection()
        
        # Check if roll number already exists
        existing = conn.execute(
            'SELECT student_id FROM students WHERE roll_no = ?',
            (data['roll_no'],)
        ).fetchone()
        
        if existing:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Roll number already exists'
            }), 400
        
        # Extract section from class (e.g., "Class 10" -> section "A")
        section = data.get('section', 'A')
        
        # Insert new student
        cursor = conn.execute(
            '''INSERT INTO students (roll_no, name, class, section, email, phone, address, admission_date, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, date("now"), "active")''',
            (
                data['roll_no'],
                data['name'],
                data['class'],
                section,
                data['email'],
                data.get('phone', ''),
                data.get('address', '')
            )
        )
        
        student_id = cursor.lastrowid
        
        # Add today's attendance record
        attendance_status = data.get('attendance_status', 'present')
        conn.execute(
            '''INSERT INTO daily_attendance (student_id, date, status)
               VALUES (?, date("now"), ?)''',
            (student_id, attendance_status)
        )
        
        conn.commit()
        
        # Get the newly created student
        new_student = conn.execute(
            '''SELECT 
                student_id, roll_no, name, class, section, email, phone, address
               FROM students WHERE student_id = ?''',
            (student_id,)
        ).fetchone()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Student added successfully',
            'student': {
                'id': new_student['student_id'],
                'roll_no': new_student['roll_no'],
                'name': new_student['name'],
                'class': new_student['class'],
                'section': new_student['section'],
                'email': new_student['email'],
                'phone': new_student['phone'],
                'address': new_student['address'],
                'attendance_status': attendance_status
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: CLASS LIST
# ============================================

@app.route('/api/classes')
def get_classes():
    """
    Get list of unique classes
    Returns: JSON with class names
    """
    conn = get_db_connection()
    
    classes_records = conn.execute(
        '''SELECT DISTINCT class 
           FROM students 
           ORDER BY class DESC'''
    ).fetchall()
    
    conn.close()
    
    classes_list = [record['class'] for record in classes_records]
    
    return jsonify({
        'classes': classes_list,
        'total': len(classes_list)
    })

# ============================================
# API ROUTE: TODAY'S ABSENT STUDENTS
# ============================================

@app.route('/api/absent')
def get_absent_students():
    """
    Get today's absent students
    Returns: JSON with absent student details
    """
    conn = get_db_connection()
    
    absent_students = conn.execute(
        '''SELECT 
            s.student_id,
            s.roll_no,
            s.name,
            s.class,
            s.section,
            s.email,
            da.status as attendance_status
           FROM students s
           LEFT JOIN daily_attendance da ON s.student_id = da.student_id AND da.date = date("now")
           WHERE s.status = "active" 
           AND (da.status = "absent" OR da.status IS NULL)
           ORDER BY s.class DESC, s.section ASC, s.roll_no ASC'''
    ).fetchall()
    
    conn.close()
    
    absent_list = []
    for student in absent_students:
        absent_list.append({
            'id': student['student_id'],
            'roll_no': student['roll_no'],
            'name': student['name'],
            'class': student['class'],
            'section': student['section'],
            'email': student['email'],
            'attendance_status': 'absent'
        })
    
    return jsonify({
        'students': absent_list,
        'total': len(absent_list),
        'date': datetime.now().strftime('%Y-%m-%d')
    })

# ============================================
# API ROUTE: ALL TEACHERS
# ============================================

@app.route('/api/teachers')
def get_teachers():
    """
    Get all active teachers with their details
    Returns: JSON with teacher information
    """
    conn = get_db_connection()
    
    teachers_records = conn.execute(
        '''SELECT 
            teacher_id,
            name,
            subject,
            department,
            joining_date,
            status
           FROM teachers
           WHERE status = "active"
           ORDER BY name ASC'''
    ).fetchall()
    
    conn.close()
    
    teachers_list = []
    for teacher in teachers_records:
        # Calculate years of experience
        joining_date = datetime.strptime(teacher['joining_date'], '%Y-%m-%d')
        years_exp = (datetime.now() - joining_date).days // 365
        
        teachers_list.append({
            'id': teacher['teacher_id'],
            'teacher_id': teacher['teacher_id'],  # Include both for compatibility
            'name': teacher['name'],
            'subject': teacher['subject'],
            'department': teacher['department'],
            'joining_date': teacher['joining_date'],
            'years_experience': years_exp,
            'status': teacher['status']
        })
    
    return jsonify({
        'success': True,
        'teachers': teachers_list,
        'total': len(teachers_list)
    })

# ============================================
# API ROUTE: DEPARTMENTS LIST
# ============================================

@app.route('/api/departments')
def get_departments():
    """
    Get list of unique departments
    Returns: JSON with department names
    """
    conn = get_db_connection()
    
    departments_records = conn.execute(
        '''SELECT DISTINCT department 
           FROM teachers 
           WHERE status = "active"
           ORDER BY department ASC'''
    ).fetchall()
    
    conn.close()
    
    departments_list = [record['department'] for record in departments_records]
    
    return jsonify({
        'departments': departments_list,
        'total': len(departments_list)
    })

# ============================================
# API ROUTE: ADD NEW TEACHER
# ============================================

@app.route('/api/teachers', methods=['POST'])
def add_teacher():
    """
    Add a new teacher to the database
    Request Body: JSON with teacher details
    Returns: JSON with success/error message
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'subject', 'department', 'joining_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        conn = get_db_connection()
        
        # Insert new teacher
        cursor = conn.execute(
            '''INSERT INTO teachers (name, subject, department, joining_date, status)
               VALUES (?, ?, ?, ?, ?)''',
            (data['name'], data['subject'], data['department'], 
             data['joining_date'], 'active')
        )
        
        teacher_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Teacher added successfully',
            'teacher_id': teacher_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: GET/SAVE TEACHER ATTENDANCE
# ============================================

@app.route('/api/teacher-attendance', methods=['GET', 'POST'])
def api_teacher_attendance():
    """
    GET: Fetch attendance for a specific date (default: today)
    POST: Save teacher attendance records
    """
    if request.method == 'GET':
        try:
            # Get date from query params, default to today
            date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
            
            conn = get_db_connection()
            attendance = conn.execute(
                '''SELECT teacher_id, status, remarks, marked_at 
                   FROM teacher_attendance 
                   WHERE date = ?''',
                (date,)
            ).fetchall()
            conn.close()
            
            # Convert to dictionary
            attendance_dict = {
                row['teacher_id']: {
                    'status': row['status'],
                    'remarks': row['remarks'] or '',
                    'marked_at': row['marked_at']
                }
                for row in attendance
            }
            
            return jsonify({
                'success': True,
                'date': date,
                'attendance': attendance_dict
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    # POST method - Save attendance
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        if not records:
            return jsonify({
                'success': False,
                'error': 'No attendance records provided'
            }), 400
        
        conn = get_db_connection()
        
        # Insert or update attendance records
        for record in records:
            # Check if record already exists for this teacher and date
            existing = conn.execute(
                '''SELECT id FROM teacher_attendance 
                   WHERE teacher_id = ? AND date = ?''',
                (record['teacher_id'], record['date'])
            ).fetchone()
            
            if existing:
                # Update existing record
                conn.execute(
                    '''UPDATE teacher_attendance 
                       SET status = ?, remarks = ?, marked_at = CURRENT_TIMESTAMP
                       WHERE teacher_id = ? AND date = ?''',
                    (record['status'], record.get('remarks', ''), 
                     record['teacher_id'], record['date'])
                )
            else:
                # Insert new record
                conn.execute(
                    '''INSERT INTO teacher_attendance (teacher_id, date, status, remarks)
                       VALUES (?, ?, ?, ?)''',
                    (record['teacher_id'], record['date'], 
                     record['status'], record.get('remarks', ''))
                )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'{len(records)} attendance records saved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# API ROUTE: TEACHER ATTENDANCE REPORT
# ============================================

@app.route('/api/teacher-attendance-report')
def teacher_attendance_report():
    """
    Get teacher attendance report for a date range or specific month
    Query params: start_date, end_date OR month (YYYY-MM format)
    Returns: JSON with attendance statistics and records
    """
    try:
        conn = get_db_connection()
        
        # Check if month parameter is provided
        month = request.args.get('month')
        
        if month:
            # Parse month (format: YYYY-MM)
            start_date = f"{month}-01"
            # Get last day of month
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                next_month = datetime(year + 1, 1, 1)
            else:
                next_month = datetime(year, month_num + 1, 1)
            last_day = (next_month - timedelta(days=1)).day
            end_date = f"{month}-{last_day:02d}"
        else:
            # Use start_date and end_date parameters
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            if not start_date or not end_date:
                return jsonify({
                    'success': False,
                    'error': 'Please provide either month or start_date and end_date'
                }), 400
        
        # Get all teachers
        teachers = conn.execute(
            '''SELECT teacher_id, name, subject, department 
               FROM teachers 
               WHERE status = "active"
               ORDER BY name ASC'''
        ).fetchall()
        
        # Get attendance records for the date range
        attendance_records = conn.execute(
            '''SELECT teacher_id, date, status, remarks 
               FROM teacher_attendance 
               WHERE date BETWEEN ? AND ?
               ORDER BY date ASC, teacher_id ASC''',
            (start_date, end_date)
        ).fetchall()
        
        conn.close()
        
        # Organize data by teacher
        teacher_report = {}
        for teacher in teachers:
            tid = teacher['teacher_id']
            teacher_report[tid] = {
                'teacher_id': tid,
                'name': teacher['name'],
                'subject': teacher['subject'],
                'department': teacher['department'],
                'present': 0,
                'absent': 0,
                'leave': 0,
                'not_marked': 0,
                'total_days': 0,
                'attendance_percentage': 0,
                'daily_records': []
            }
        
        # Count total working days in range
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        total_days = (end - start).days + 1
        
        # Process attendance records
        for record in attendance_records:
            tid = record['teacher_id']
            if tid in teacher_report:
                status = record['status']
                teacher_report[tid][status] += 1
                teacher_report[tid]['daily_records'].append({
                    'date': record['date'],
                    'status': status,
                    'remarks': record['remarks'] or ''
                })
        
        # Calculate statistics
        for tid in teacher_report:
            marked_days = (teacher_report[tid]['present'] + 
                          teacher_report[tid]['absent'] + 
                          teacher_report[tid]['leave'])
            teacher_report[tid]['not_marked'] = total_days - marked_days
            teacher_report[tid]['total_days'] = total_days
            
            if marked_days > 0:
                teacher_report[tid]['attendance_percentage'] = round(
                    (teacher_report[tid]['present'] / marked_days) * 100, 2
                )
        
        # Calculate overall statistics
        total_present = sum(t['present'] for t in teacher_report.values())
        total_absent = sum(t['absent'] for t in teacher_report.values())
        total_leave = sum(t['leave'] for t in teacher_report.values())
        total_not_marked = sum(t['not_marked'] for t in teacher_report.values())
        total_teachers = len(teacher_report)
        
        overall_percentage = 0
        if total_present + total_absent + total_leave > 0:
            overall_percentage = round(
                (total_present / (total_present + total_absent + total_leave)) * 100, 2
            )
        
        return jsonify({
            'success': True,
            'start_date': start_date,
            'end_date': end_date,
            'total_days': total_days,
            'overall_stats': {
                'total_teachers': total_teachers,
                'total_present': total_present,
                'total_absent': total_absent,
                'total_leave': total_leave,
                'total_not_marked': total_not_marked,
                'attendance_percentage': overall_percentage
            },
            'teachers': list(teacher_report.values())
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not Found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal Server Error'}), 500

# ============================================
# MAIN APPLICATION ENTRY POINT
# ============================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎓 SCHOOL MANAGEMENT SYSTEM")
    print("="*50)
    
    # Initialize database
    init_database()
    
    print("\n🚀 Starting Flask server...")
    print("\n📊 ADMIN URLs:")
    print("   • Dashboard:   http://127.0.0.1:5000/dashboard")
    print("   • Students:    http://127.0.0.1:5000/students")
    print("   • Teachers:    http://127.0.0.1:5000/teachers")
    print("   • Attendance:  http://127.0.0.1:5000/attendance")
    print("   • Fees:        http://127.0.0.1:5000/fees")
    print("\n👨‍🏫 TEACHER URLs:")
    print("   • Login:       http://127.0.0.1:5000/teacher/login")
    print("   • Dashboard:   http://127.0.0.1:5000/teacher/dashboard")
    print("   • Classes:     http://127.0.0.1:5000/teacher/classes")
    print("   • Attendance:  http://127.0.0.1:5000/teacher/attendance")
    print("\n💡 Press CTRL+C to stop the server\n")
    print("="*50 + "\n")
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
