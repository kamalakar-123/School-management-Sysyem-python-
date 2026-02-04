-- ============================================
-- SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    email TEXT NOT NULL,
    parent_email TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active'
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    department TEXT NOT NULL,
    joining_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active'
);

-- Teacher Attendance Table
CREATE TABLE IF NOT EXISTS teacher_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'leave', 'not_marked')),
    remarks TEXT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    UNIQUE(teacher_id, date)
);

-- Attendance Table (Summary)
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    total_students INTEGER NOT NULL,
    present_students INTEGER NOT NULL,
    absent_students INTEGER NOT NULL,
    attendance_percentage REAL NOT NULL
);

-- Daily Student Attendance Table
CREATE TABLE IF NOT EXISTS daily_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    UNIQUE(student_id, date)
);

-- Fees Table
CREATE TABLE IF NOT EXISTS fees (
    fee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    paid_amount REAL NOT NULL,
    pending_amount REAL NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_name TEXT NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    max_marks INTEGER NOT NULL,
    status TEXT DEFAULT 'upcoming'
);

-- Performance Table (Stores exam results)
CREATE TABLE IF NOT EXISTS performance (
    performance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    class TEXT NOT NULL,
    marks_obtained INTEGER NOT NULL,
    max_marks INTEGER NOT NULL,
    percentage REAL NOT NULL,
    grade TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
);

-- Alert Logs Table (Stores parent notification logs)
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
);

-- ============================================
-- SAMPLE DATA FOR DEMONSTRATION
-- ============================================

-- Insert Sample Students (30 students with roll numbers and emails)
INSERT INTO students (roll_no, name, class, section, email, parent_email) VALUES
('10A001', 'Rahul Sharma', 'Class 10', 'A', 'rahul.sharma@school.edu', 'gm8432419@gmail.com'),
('10A002', 'Priya Patel', 'Class 10', 'A', 'priya.patel@school.edu', NULL),
('10A003', 'Arjun Nair', 'Class 10', 'A', 'arjun.nair@school.edu', NULL),
('10A004', 'Aditya Bhat', 'Class 10', 'A', 'aditya.bhat@school.edu', NULL),
('10A005', 'Meera Singh', 'Class 10', 'A', 'meera.singh@school.edu', NULL),
('10B001', 'Amit Kumar', 'Class 10', 'B', 'amit.kumar@school.edu', NULL),
('10B002', 'Karan Kapoor', 'Class 10', 'B', 'karan.kapoor@school.edu', NULL),
('10B003', 'Tanvi Agarwal', 'Class 10', 'B', 'tanvi.agarwal@school.edu', NULL),
('10B004', 'Rohan Desai', 'Class 10', 'B', 'rohan.desai@school.edu', NULL),
('10B005', 'Ishita Verma', 'Class 10', 'B', 'ishita.verma@school.edu', NULL),
('9A001', 'Sneha Reddy', 'Class 9', 'A', 'sneha.reddy@school.edu', NULL),
('9A002', 'Divya Iyer', 'Class 9', 'A', 'divya.iyer@school.edu', NULL),
('9A003', 'Riya Shah', 'Class 9', 'A', 'riya.shah@school.edu', NULL),
('9A004', 'Harsh Malhotra', 'Class 9', 'A', 'harsh.malhotra@school.edu', NULL),
('9A005', 'Ananya Gupta', 'Class 9', 'A', 'ananya.gupta@school.edu', NULL),
('9B001', 'Vikram Singh', 'Class 9', 'B', 'vikram.singh@school.edu', NULL),
('9B002', 'Siddharth Roy', 'Class 9', 'B', 'siddharth.roy@school.edu', NULL),
('9B003', 'Nisha Jain', 'Class 9', 'B', 'nisha.jain@school.edu', NULL),
('9B004', 'Kabir Sharma', 'Class 9', 'B', 'kabir.sharma@school.edu', NULL),
('9B005', 'Lavanya Nair', 'Class 9', 'B', 'lavanya.nair@school.edu', NULL),
('8A001', 'Anjali Verma', 'Class 8', 'A', 'anjali.verma@school.edu', NULL),
('8A002', 'Neha Gupta', 'Class 8', 'A', 'neha.gupta@school.edu', NULL),
('8A003', 'Dev Patel', 'Class 8', 'A', 'dev.patel@school.edu', NULL),
('8A004', 'Tara Kumar', 'Class 8', 'A', 'tara.kumar@school.edu', NULL),
('8B001', 'Rohit Mehta', 'Class 8', 'B', 'rohit.mehta@school.edu', NULL),
('8B002', 'Manish Pillai', 'Class 8', 'B', 'manish.pillai@school.edu', NULL),
('8B003', 'Sanya Singh', 'Class 8', 'B', 'sanya.singh@school.edu', NULL),
('7A001', 'Kavya Joshi', 'Class 7', 'A', 'kavya.joshi@school.edu', NULL),
('7A002', 'Pooja Desai', 'Class 7', 'A', 'pooja.desai@school.edu', NULL),
('7A003', 'Megha Srinivas', 'Class 7', 'A', 'megha.srinivas@school.edu', NULL);

-- Insert Sample Teachers
INSERT INTO teachers (name, subject, department, joining_date) VALUES
('Dr. Ramesh Kumar', 'Mathematics', 'Science', '2018-01-15'),
('Prof. Shalini Sharma', 'Physics', 'Science', '2020-03-20'),
('Mr. Anil Verma', 'English', 'Languages', '2016-07-10'),
('Ms. Deepa Nair', 'Chemistry', 'Science', '2021-02-28'),
('Dr. Suresh Patel', 'Computer Science', 'Technology', '2019-08-15'),
('Ms. Priya Reddy', 'History', 'Social Studies', '2022-01-10'),
('Mr. Rajesh Singh', 'Biology', 'Science', '2017-09-05'),
('Ms. Meera Iyer', 'Hindi', 'Languages', '2023-04-12'),
('Dr. Arvind Kulkarni', 'Advanced Mathematics', 'Science', '2014-06-01'),
('Ms. Kavita Menon', 'Geography', 'Social Studies', '2020-05-18'),
('Mr. Vikram Desai', 'Physical Education', 'Sports', '2021-07-22'),
('Prof. Anjali Bhatt', 'Economics', 'Commerce', '2018-09-10'),
('Dr. Manoj Gupta', 'Environmental Science', 'Science', '2019-11-25'),
('Ms. Ritu Kapoor', 'Sanskrit', 'Languages', '2022-03-08'),
('Mr. Arun Joshi', 'Political Science', 'Social Studies', '2016-01-20'),
('Ms. Sneha Pandey', 'Art and Craft', 'Fine Arts', '2023-06-15'),
('Prof. Rajiv Saxena', 'Business Studies', 'Commerce', '2015-10-05'),
('Dr. Sunita Rao', 'Psychology', 'Social Studies', '2020-12-14');

-- Insert Attendance Data (Last 7 days)
INSERT INTO attendance (date, total_students, present_students, absent_students, attendance_percentage) VALUES
(date('now', '-6 days'), 30, 27, 3, 90.0),
(date('now', '-5 days'), 30, 26, 4, 86.7),
(date('now', '-4 days'), 30, 28, 2, 93.3),
(date('now', '-3 days'), 30, 24, 6, 80.0),
(date('now', '-2 days'), 30, 22, 8, 73.3),
(date('now', '-1 days'), 30, 23, 7, 76.7),
(date('now'), 30, 25, 5, 83.3);

-- Insert Daily Student Attendance (Today's attendance)
INSERT INTO daily_attendance (student_id, date, status) VALUES
-- Class 10A - 4 present, 1 absent
(1, date('now'), 'present'),
(2, date('now'), 'present'),
(3, date('now'), 'absent'),
(4, date('now'), 'present'),
(5, date('now'), 'present'),
-- Class 10B - 4 present, 1 absent
(6, date('now'), 'present'),
(7, date('now'), 'present'),
(8, date('now'), 'present'),
(9, date('now'), 'absent'),
(10, date('now'), 'present'),
-- Class 9A - 4 present, 1 absent
(11, date('now'), 'present'),
(12, date('now'), 'present'),
(13, date('now'), 'present'),
(14, date('now'), 'absent'),
(15, date('now'), 'present'),
-- Class 9B - 5 present
(16, date('now'), 'present'),
(17, date('now'), 'present'),
(18, date('now'), 'present'),
(19, date('now'), 'present'),
(20, date('now'), 'present'),
-- Class 8A - 3 present, 1 absent
(21, date('now'), 'present'),
(22, date('now'), 'present'),
(23, date('now'), 'absent'),
(24, date('now'), 'present'),
-- Class 8B - 3 present
(25, date('now'), 'present'),
(26, date('now'), 'present'),
(27, date('now'), 'present'),
-- Class 7A - 2 present, 1 absent
(28, date('now'), 'present'),
(29, date('now'), 'present'),
(30, date('now'), 'absent');

-- Insert Attendance Data (Last 7 days)
INSERT INTO attendance (date, total_students, present_students, absent_students, attendance_percentage) VALUES
(date('now', '-6 days'), 30, 27, 3, 90.0),
(date('now', '-5 days'), 30, 26, 4, 86.7),
(date('now', '-4 days'), 30, 28, 2, 93.3),
(date('now', '-3 days'), 30, 24, 6, 80.0),
(date('now', '-2 days'), 30, 22, 8, 73.3),
(date('now', '-1 days'), 30, 23, 7, 76.7),
(date('now'), 20, 18, 2, 90.0);

-- Insert Fees Data (Some pending)
INSERT INTO fees (student_id, total_amount, paid_amount, pending_amount, due_date, status) VALUES
(1, 15000, 15000, 0, date('now', '+30 days'), 'paid'),
(2, 15000, 10000, 5000, date('now', '+5 days'), 'pending'),
(3, 15000, 0, 15000, date('now', '-5 days'), 'overdue'),
(4, 12000, 12000, 0, date('now', '+30 days'), 'paid'),
(5, 12000, 8000, 4000, date('now', '+10 days'), 'pending'),
(6, 10000, 0, 10000, date('now', '-2 days'), 'overdue'),
(7, 10000, 10000, 0, date('now', '+30 days'), 'paid'),
(8, 8000, 8000, 0, date('now', '+30 days'), 'paid'),
(9, 15000, 5000, 10000, date('now', '+3 days'), 'pending'),
(10, 12000, 0, 12000, date('now', '-1 days'), 'overdue'),
(11, 15000, 15000, 0, date('now', '+30 days'), 'paid'),
(12, 15000, 12000, 3000, date('now', '+8 days'), 'pending'),
(13, 15000, 15000, 0, date('now', '+30 days'), 'paid'),
(14, 12000, 9000, 3000, date('now', '+12 days'), 'pending'),
(15, 12000, 12000, 0, date('now', '+30 days'), 'paid'),
(16, 15000, 7000, 8000, date('now', '+6 days'), 'pending'),
(17, 15000, 15000, 0, date('now', '+30 days'), 'paid'),
(18, 15000, 10000, 5000, date('now', '+15 days'), 'pending'),
(19, 12000, 12000, 0, date('now', '+30 days'), 'paid'),
(20, 12000, 6000, 6000, date('now', '+4 days'), 'pending'),
(21, 10000, 10000, 0, date('now', '+30 days'), 'paid'),
(22, 10000, 8000, 2000, date('now', '+20 days'), 'pending'),
(23, 10000, 0, 10000, date('now', '-3 days'), 'overdue'),
(24, 10000, 10000, 0, date('now', '+30 days'), 'paid'),
(25, 8000, 8000, 0, date('now', '+30 days'), 'paid'),
(26, 8000, 5000, 3000, date('now', '+10 days'), 'pending'),
(27, 8000, 8000, 0, date('now', '+30 days'), 'paid'),
(28, 10000, 7000, 3000, date('now', '+18 days'), 'pending'),
(29, 10000, 10000, 0, date('now', '+30 days'), 'paid'),
(30, 10000, 0, 10000, date('now', '-4 days'), 'overdue');

-- Insert Upcoming Exams
INSERT INTO exams (exam_name, class, subject, exam_date, max_marks, status) VALUES
('Mid-Term Exam', 'Class 10', 'Mathematics', date('now', '+2 days'), 100, 'upcoming'),
('Mid-Term Exam', 'Class 10', 'Physics', date('now', '+5 days'), 100, 'upcoming'),
('Unit Test', 'Class 9', 'Chemistry', date('now', '+1 days'), 50, 'upcoming'),
('Final Exam', 'Class 8', 'English', date('now', '+10 days'), 100, 'upcoming'),
('Mid-Term Exam', 'Class 7', 'Biology', date('now', '+15 days'), 100, 'upcoming');

-- Insert Performance Data (Class-wise averages)
INSERT INTO performance (student_id, exam_id, class, marks_obtained, max_marks, percentage, grade) VALUES
-- Class 10 Performance
(1, 1, 'Class 10', 85, 100, 85.0, 'A'),
(2, 1, 'Class 10', 78, 100, 78.0, 'B+'),
(3, 1, 'Class 10', 92, 100, 92.0, 'A+'),
(9, 1, 'Class 10', 88, 100, 88.0, 'A'),
(11, 1, 'Class 10', 76, 100, 76.0, 'B+'),
-- Class 9 Performance
(4, 2, 'Class 9', 82, 100, 82.0, 'A'),
(5, 2, 'Class 9', 74, 100, 74.0, 'B'),
(10, 2, 'Class 9', 89, 100, 89.0, 'A'),
(13, 2, 'Class 9', 91, 100, 91.0, 'A+'),
-- Class 8 Performance
(6, 3, 'Class 8', 68, 100, 68.0, 'B'),
(7, 3, 'Class 8', 79, 100, 79.0, 'B+'),
(12, 3, 'Class 8', 85, 100, 85.0, 'A'),
-- Class 7 Performance
(8, 4, 'Class 7', 72, 100, 72.0, 'B'),
(14, 4, 'Class 7', 88, 100, 88.0, 'A');
