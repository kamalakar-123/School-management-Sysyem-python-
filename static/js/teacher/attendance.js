// Teacher Attendance Management JavaScript

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Attendance Management Loaded');
    
    // Load teacher info
    loadTeacherInfo();
    
    // Set current date
    setCurrentDate();
    
    // Load classes for dropdowns
    loadClassOptions();
    
    // Setup tab switching
    setupTabs();
    
    // Set default dates
    setDefaultDates();
    
    // Load initial data
    loadAlertLogs();
});

// ============================================
// LOAD TEACHER INFORMATION
// ============================================

function loadTeacherInfo() {
    const teacherName = localStorage.getItem('teacherName') || 'Teacher';
    document.getElementById('teacherName').textContent = teacherName;
}

// ============================================
// SET CURRENT DATE
// ============================================

function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// ============================================
// SET DEFAULT DATES
// ============================================

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    document.getElementById('attendanceDate').value = today;
    document.getElementById('dailyReportDate').value = today;
    document.getElementById('monthSelect').value = currentMonth;
    document.getElementById('alertMonth').value = currentMonth;
}

// ============================================
// LOAD CLASS OPTIONS
// ============================================

async function loadClassOptions() {
    try {
        const response = await fetch('/api/teacher/classes');
        const data = await response.json();
        
        if (data.success && data.classes) {
            const selects = [
                'classSelect', 'dailyClassSelect', 
                'monthlyClassSelect', 'alertClassSelect'
            ];
            
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                data.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.class_name;
                    option.textContent = cls.class_name;
                    select.appendChild(option);
                });
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// ============================================
// SETUP TAB SWITCHING
// ============================================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ============================================
// TAB 1: LOAD STUDENTS FOR ATTENDANCE
// ============================================

async function loadStudents() {
    const date = document.getElementById('attendanceDate').value;
    const className = document.getElementById('classSelect').value;
    const section = document.getElementById('sectionSelect').value;
    
    if (!date) {
        alert('⚠️ Please select a date');
        return;
    }
    
    if (!className) {
        alert('⚠️ Please select a class from the dropdown');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/teacher/students?class=${encodeURIComponent(className)}&section=${section}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success && data.students && data.students.length > 0) {
            displayStudents(data.students, date, className, section);
        } else if (data.students && data.students.length === 0) {
            alert(`No students found in class ${className}`);
        } else {
            alert(data.error || 'Failed to load students');
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading students:', error);
        alert('Failed to load students: ' + error.message);
    }
}

function displayStudents(students, date, className, section) {
    const tbody = document.getElementById('studentsTableBody');
    const section_elem = document.getElementById('attendanceSection');
    const title = document.getElementById('attendanceTitle');
    
    if (!students || students.length === 0) {
        alert('No students found for this class');
        return;
    }
    
    title.textContent = `Attendance for Section ${section} - ${date}`;
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${section}</td>
            <td>
                <div class="status-group">
                    <label class="status-radio">
                        <input type="radio" name="status-${student.student_id}" value="Present" checked>
                        <span class="status-label status-present">
                            <i class="far fa-circle"></i> Present
                        </span>
                    </label>
                    <label class="status-radio">
                        <input type="radio" name="status-${student.student_id}" value="Absent">
                        <span class="status-label status-absent">
                            <i class="far fa-circle"></i> Absent
                        </span>
                    </label>
                    <label class="status-radio">
                        <input type="radio" name="status-${student.student_id}" value="Late">
                        <span class="status-label status-late">
                            <i class="far fa-circle"></i> Late
                        </span>
                    </label>
                    <label class="status-radio">
                        <input type="radio" name="status-${student.student_id}" value="On Leave">
                        <span class="status-label status-leave">
                            <i class="far fa-circle"></i> On Leave
                        </span>
                    </label>
                </div>
            </td>
            <td>
                <input type="text" class="remarks-input" 
                       id="remarks-${student.student_id}" 
                       placeholder="Optional notes...">
            </td>
        `;
        tbody.appendChild(row);
    });
    
    section_elem.style.display = 'block';
    
    console.log(`✅ Loaded ${students.length} students for ${className}`);
}

function markAllPresent() {
    const presentRadios = document.querySelectorAll('input[value="Present"]');
    presentRadios.forEach(radio => radio.checked = true);
}

async function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const className = document.getElementById('classSelect').value;
    
    const attendanceData = [];
    const rows = document.querySelectorAll('#studentsTableBody tr');
    
    if (rows.length === 0) {
        alert('⚠️ No students to save. Please load students first.');
        return;
    }
    
    rows.forEach(row => {
        const studentId = row.cells[0].textContent;
        const statusInput = row.querySelector(`input[name="status-${studentId}"]:checked`);
        const status = statusInput ? statusInput.value : 'Present';
        const remarksInput = document.getElementById(`remarks-${studentId}`);
        const remarks = remarksInput ? remarksInput.value : '';
        
        attendanceData.push({
            student_id: studentId,
            date: date,
            status: status,
            remarks: remarks
        });
    });
    
    console.log('Saving attendance:', attendanceData);
    showLoading();
    
    try {
        const response = await fetch('/api/teacher/attendance/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendance: attendanceData })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            alert(`✅ Attendance saved successfully for ${attendanceData.length} students!`);
        } else {
            alert(`❌ Failed to save attendance: ${data.error || 'Unknown error'}`);
            console.error('Save error:', data);
        }
    } catch (error) {
        hideLoading();
        console.error('Error saving attendance:', error);
        alert(`❌ Error saving attendance: ${error.message}`);
    }
}

// ============================================
// TAB 2: DAILY REPORT
// ============================================

async function generateDailyReport() {
    const date = document.getElementById('dailyReportDate').value;
    const className = document.getElementById('dailyClassSelect').value;
    const section = document.getElementById('dailySectionSelect').value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/teacher/attendance/daily?date=${date}&class=${className}&section=${section}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            displayDailyStats(data.stats);
            displayDailyDetails(data.details, date);
        }
    } catch (error) {
        hideLoading();
        console.error('Error generating daily report:', error);
    }
}

function displayDailyStats(stats) {
    const statsDiv = document.getElementById('dailyStats');
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon total"><i class="fas fa-users"></i></div>
            <div class="stat-value">${stats.total || 0}</div>
            <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon present"><i class="fas fa-check"></i></div>
            <div class="stat-value">${stats.present || 0}</div>
            <div class="stat-label">Present</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon absent"><i class="fas fa-times"></i></div>
            <div class="stat-value">${stats.absent || 0}</div>
            <div class="stat-label">Absent</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon late"><i class="fas fa-clock"></i></div>
            <div class="stat-value">${stats.late || 0}</div>
            <div class="stat-label">Late</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon leave"><i class="fas fa-file-alt"></i></div>
            <div class="stat-value">${stats.on_leave || 0}</div>
            <div class="stat-label">On Leave</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon unmarked"><i class="fas fa-question"></i></div>
            <div class="stat-value">${stats.unmarked || 0}</div>
            <div class="stat-label">Not Marked</div>
        </div>
    `;
}

function displayDailyDetails(details, date) {
    const detailsDiv = document.getElementById('dailyReportDetails');
    
    if (!details || details.length === 0) {
        detailsDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: #718096;">No attendance records found for this date.</p>';
        return;
    }
    
    detailsDiv.innerHTML = `
        <h3>
            Detailed Attendance - ${date}
            <button class="export-btn" onclick="exportToCSV()">
                <i class="fas fa-download"></i> Export CSV
            </button>
        </h3>
        <div class="table-container">
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.map(record => `
                        <tr>
                            <td>${record.student_id}</td>
                            <td>${record.name}</td>
                            <td>${record.class}</td>
                            <td>${record.section || 'A'}</td>
                            <td>
                                <span class="status-badge ${getStatusClass(record.status)}">
                                    ${record.status || 'Not Marked'}
                                </span>
                            </td>
                            <td>${record.remarks || '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getStatusClass(status) {
    if (status === 'Present') return 'sent';
    if (status === 'Absent') return 'critical';
    if (status === 'Late') return 'warning';
    return '';
}

// ============================================
// TAB 3: MONTHLY REPORT
// ============================================

async function generateMonthlyReport() {
    const month = document.getElementById('monthSelect').value;
    const className = document.getElementById('monthlyClassSelect').value;
    const section = document.getElementById('monthlySectionSelect').value;
    
    if (!month) {
        alert('Please select a month');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/teacher/attendance/monthly?month=${month}&class=${className}&section=${section}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            displayMonthlyOverview(data.overall_percentage);
            displayMonthlyDetails(data.students, month);
        }
    } catch (error) {
        hideLoading();
        console.error('Error generating monthly report:', error);
    }
}

function displayMonthlyOverview(percentage) {
    const overviewDiv = document.getElementById('monthlyOverview');
    overviewDiv.innerHTML = `
        <h3>Overall Class Attendance</h3>
        <div class="monthly-percentage">${percentage}%</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
    `;
}

function displayMonthlyDetails(students, month) {
    const detailsDiv = document.getElementById('monthlyReportDetails');
    
    if (!students || students.length === 0) {
        detailsDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: #718096;">No attendance data available for this month.</p>';
        return;
    }
    
    detailsDiv.innerHTML = `
        <h3>
            Student Attendance Details - ${month}
            <button class="export-btn" onclick="exportToCSV()">
                <i class="fas fa-download"></i> Export CSV
            </button>
        </h3>
        <div class="table-container">
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Total Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.student_id}</td>
                            <td>${student.name}</td>
                            <td>${student.class}</td>
                            <td>${student.section || 'A'}</td>
                            <td>${student.total_days}</td>
                            <td style="color: #48bb78; font-weight: 600;">${student.present}</td>
                            <td style="color: #f56565; font-weight: 600;">${student.absent}</td>
                            <td style="font-weight: 700; color: ${student.percentage >= 75 ? '#48bb78' : '#f56565'};">
                                ${student.percentage}%
                            </td>
                            <td>
                                <div class="progress-bar" style="height: 8px;">
                                    <div class="progress-fill" style="width: ${student.percentage}%; background: ${student.percentage >= 75 ? '#48bb78' : '#f56565'};"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
// TAB 4: LOW ATTENDANCE ALERT
// ============================================

async function findLowAttendance() {
    const month = document.getElementById('alertMonth').value;
    const threshold = document.getElementById('thresholdInput').value;
    const className = document.getElementById('alertClassSelect').value;
    const section = document.getElementById('alertSectionSelect').value;
    
    if (!month || !threshold) {
        alert('Please select month and threshold');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`/api/teacher/attendance/low?month=${month}&threshold=${threshold}&class=${className}&section=${section}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            displayLowAttendance(data.students, threshold);
        }
    } catch (error) {
        hideLoading();
        console.error('Error finding low attendance:', error);
    }
}

function displayLowAttendance(students, threshold) {
    const resultsDiv = document.getElementById('alertResults');
    
    if (!students || students.length === 0) {
        resultsDiv.innerHTML = `
            <div class="alert-banner" style="background: #f0fff4; border-color: #48bb78;">
                <i class="fas fa-check-circle" style="color: #48bb78;"></i>
                <p style="color: #22543d;">Great! No students found with attendance below ${threshold}%</p>
            </div>
        `;
        return;
    }
    
    resultsDiv.innerHTML = `
        <div class="alert-banner">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${students.length} student(s) found with attendance below ${threshold}%</p>
        </div>
        
        <h3>Students Below ${threshold}% Attendance</h3>
        
        <div class="table-container">
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Total Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.student_id}</td>
                            <td>${student.name}</td>
                            <td>${student.class}</td>
                            <td>${student.section || 'A'}</td>
                            <td>${student.total_days}</td>
                            <td style="color: #48bb78; font-weight: 600;">${student.present}</td>
                            <td style="color: #f56565; font-weight: 600;">${student.absent}</td>
                            <td style="font-weight: 700; color: #f56565;">${student.percentage}%</td>
                            <td>
                                <span class="status-badge critical">CRITICAL</span>
                            </td>
                            <td>
                                <a href="#" class="action-link" onclick="informParent(${student.student_id})">
                                    <i class="fas fa-paper-plane"></i> Inform Parents
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function informParent(studentId) {
    alert(`Parent notification sent for student ID: ${studentId}`);
    return false;
}

// ============================================
// TAB 5: ALERT LOGS
// ============================================

async function loadAlertLogs() {
    try {
        const response = await fetch('/api/teacher/alert-logs');
        const data = await response.json();
        
        if (data.success && data.logs) {
            displayAlertLogs(data.logs);
        }
    } catch (error) {
        console.error('Error loading alert logs:', error);
    }
}

function displayAlertLogs(logs) {
    const tbody = document.getElementById('alertLogsBody');
    const countSpan = document.getElementById('alertCount');
    
    countSpan.textContent = `${logs.length} alerts`;
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #718096;">No alert logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${log.date}</td>
            <td>${log.student_name}</td>
            <td>${log.roll_no}</td>
            <td>${log.class}</td>
            <td>${log.section}</td>
            <td>
                <i class="fas fa-phone" style="color: #667eea; margin-right: 5px;"></i>
                ${log.parent_contact}<br>
                <small style="color: #718096;">
                    <i class="fas fa-envelope" style="margin-right: 5px;"></i>
                    ${log.parent_email}
                </small>
            </td>
            <td>
                <span class="status-badge" style="background: #e6f0ff; color: #667eea;">
                    Email (SMTP)
                </span>
            </td>
            <td style="font-size: 12px; max-width: 300px;">${log.message}</td>
            <td>
                <span class="status-badge sent">SENT</span>
            </td>
        </tr>
    `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function exportToCSV() {
    alert('CSV export feature coming soon!');
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c📋 Attendance Management', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cTeacher Portal - Mark & Track Attendance', 'color: #718096; font-size: 14px;');
