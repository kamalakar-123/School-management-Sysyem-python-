// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });

    // Load Students button
    document.getElementById('loadStudentsBtn').addEventListener('click', loadStudentsForGrades);

    // Save Grades button
    document.getElementById('saveGradesBtn').addEventListener('click', saveGrades);

    // Reset Grades button
    document.getElementById('resetGradesBtn').addEventListener('click', resetGrades);

    // Search Grades button
    document.getElementById('searchGradesBtn').addEventListener('click', searchGrades);

    // Generate Analytics button
    document.getElementById('generateAnalyticsBtn').addEventListener('click', generateAnalytics);

    // Export Grades button
    document.getElementById('exportGradesBtn').addEventListener('click', exportGrades);

    // Load classes for all filters
    loadClassesForFilters();
});

// Load classes for filters
function loadClassesForFilters() {
    fetch('/api/teacher/classes')
        .then(response => response.json())
        .then(data => {
            const classSelects = [
                document.getElementById('enterClassFilter'),
                document.getElementById('viewClassFilter'),
                document.getElementById('analyticsClassFilter')
            ];

            classSelects.forEach(select => {
                // Clear existing options except first one
                while (select.options.length > 1) {
                    select.remove(1);
                }

                if (data.classes && data.classes.length > 0) {
                    data.classes.forEach(cls => {
                        const option = document.createElement('option');
                        option.value = cls.class_id;
                        option.textContent = `Class ${cls.grade} - ${cls.section}`;
                        select.appendChild(option);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading classes:', error));
}

// Load students for grade entry
function loadStudentsForGrades() {
    const classId = document.getElementById('enterClassFilter').value;
    const section = document.getElementById('enterSectionFilter').value;
    const subject = document.getElementById('enterSubjectFilter').value;
    const examType = document.getElementById('enterExamType').value;
    const maxMarks = document.getElementById('enterMaxMarks').value;
    const tbody = document.getElementById('gradesTableBody');

    if (!classId || !subject || !examType || !maxMarks) {
        alert('Please fill in all required fields');
        return;
    }

    // Sample data - replace with actual API call
    const students = [
        { id: 1, rollNo: '101', name: 'John Doe' },
        { id: 2, rollNo: '102', name: 'Jane Smith' },
        { id: 3, rollNo: '103', name: 'Mike Johnson' },
        { id: 4, rollNo: '104', name: 'Sarah Williams' },
        { id: 5, rollNo: '105', name: 'Tom Brown' }
    ];

    tbody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.rollNo}</td>
            <td>${student.name}</td>
            <td>
                <input type="number" 
                       class="marks-input" 
                       data-student-id="${student.id}" 
                       min="0" 
                       max="${maxMarks}" 
                       placeholder="0">
            </td>
            <td class="grade-cell"></td>
            <td>
                <input type="text" 
                       class="remarks-input" 
                       data-student-id="${student.id}" 
                       placeholder="Optional remarks">
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners to marks inputs
    document.querySelectorAll('.marks-input').forEach(input => {
        input.addEventListener('input', function() {
            calculateGrade(this);
        });
    });

    // Show save actions
    document.getElementById('saveGradesActions').style.display = 'flex';
}

// Calculate grade based on marks
function calculateGrade(input) {
    const marks = parseFloat(input.value);
    const maxMarks = parseFloat(document.getElementById('enterMaxMarks').value);
    const percentage = (marks / maxMarks) * 100;
    
    const row = input.closest('tr');
    const gradeCell = row.querySelector('.grade-cell');
    
    let grade = '';
    let gradeClass = '';
    
    if (percentage >= 90) {
        grade = 'A+';
        gradeClass = 'a-plus';
    } else if (percentage >= 80) {
        grade = 'A';
        gradeClass = 'a';
    } else if (percentage >= 70) {
        grade = 'B+';
        gradeClass = 'b-plus';
    } else if (percentage >= 60) {
        grade = 'B';
        gradeClass = 'b';
    } else if (percentage >= 50) {
        grade = 'C';
        gradeClass = 'c';
    } else {
        grade = 'F';
        gradeClass = 'f';
    }
    
    gradeCell.innerHTML = `<span class="grade-badge ${gradeClass}">${grade}</span>`;
}

// Save grades
function saveGrades() {
    const classId = document.getElementById('enterClassFilter').value;
    const subject = document.getElementById('enterSubjectFilter').value;
    const examType = document.getElementById('enterExamType').value;
    const maxMarks = document.getElementById('enterMaxMarks').value;
    
    const grades = [];
    document.querySelectorAll('.marks-input').forEach(input => {
        if (input.value) {
            const row = input.closest('tr');
            const remarksInput = row.querySelector('.remarks-input');
            
            grades.push({
                student_id: input.dataset.studentId,
                marks: input.value,
                remarks: remarksInput.value
            });
        }
    });
    
    if (grades.length === 0) {
        alert('Please enter marks for at least one student');
        return;
    }
    
    const data = {
        class_id: classId,
        subject: subject,
        exam_type: examType,
        max_marks: maxMarks,
        grades: grades
    };
    
    console.log('Saving grades:', data);
    alert('✅ Grades saved successfully!');
    
    // Reset form
    resetGrades();
}

// Reset grades form
function resetGrades() {
    document.getElementById('gradesTableBody').innerHTML = `
        <tr>
            <td colspan="5" class="empty-state">
                <i class="fas fa-info-circle"></i>
                Select class, subject, and exam type to load students
            </td>
        </tr>
    `;
    document.getElementById('saveGradesActions').style.display = 'none';
}

// Search grades
function searchGrades() {
    const classId = document.getElementById('viewClassFilter').value;
    const section = document.getElementById('viewSectionFilter').value;
    const subject = document.getElementById('viewSubjectFilter').value;
    const examType = document.getElementById('viewExamType').value;
    const tbody = document.getElementById('viewGradesTableBody');
    
    // Sample data
    const grades = [
        {
            rollNo: '101',
            studentName: 'John Doe',
            class: 'Class 10 - A',
            subject: 'Mathematics',
            examType: 'Mid Term',
            marks: '45/50',
            grade: 'A+'
        },
        {
            rollNo: '102',
            studentName: 'Jane Smith',
            class: 'Class 10 - A',
            subject: 'Mathematics',
            examType: 'Mid Term',
            marks: '42/50',
            grade: 'A'
        }
    ];
    
    tbody.innerHTML = '';
    
    if (grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-search"></i>No grades found</td></tr>';
        return;
    }
    
    grades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grade.rollNo}</td>
            <td>${grade.studentName}</td>
            <td>${grade.class}</td>
            <td>${grade.subject}</td>
            <td>${grade.examType}</td>
            <td>${grade.marks}</td>
            <td><span class="grade-badge a-plus">${grade.grade}</span></td>
            <td>
                <button class="icon-btn edit" title="Edit Grade">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Generate analytics
function generateAnalytics() {
    const classId = document.getElementById('analyticsClassFilter').value;
    const subject = document.getElementById('analyticsSubjectFilter').value;
    const examType = document.getElementById('analyticsExamType').value;
    
    if (!classId || !subject || !examType) {
        alert('Please select class, subject, and exam type');
        return;
    }
    
    // Sample analytics data
    const analytics = {
        totalStudents: 30,
        averagePercentage: 78.5,
        highestMarks: 98,
        lowestMarks: 45,
        gradeDistribution: {
            aPlus: 8,
            a: 10,
            bPlus: 6,
            b: 4,
            c: 2,
            f: 0
        }
    };
    
    // Update stat cards
    document.getElementById('totalStudentsCount').textContent = analytics.totalStudents;
    document.getElementById('averageMarks').textContent = analytics.averagePercentage + '%';
    document.getElementById('highestMarks').textContent = analytics.highestMarks;
    document.getElementById('lowestMarks').textContent = analytics.lowestMarks;
    
    // Update grade distribution
    const total = analytics.totalStudents;
    
    document.getElementById('gradeAPlus').style.width = (analytics.gradeDistribution.aPlus / total * 100) + '%';
    document.getElementById('countAPlus').textContent = analytics.gradeDistribution.aPlus;
    
    document.getElementById('gradeA').style.width = (analytics.gradeDistribution.a / total * 100) + '%';
    document.getElementById('countA').textContent = analytics.gradeDistribution.a;
    
    document.getElementById('gradeBPlus').style.width = (analytics.gradeDistribution.bPlus / total * 100) + '%';
    document.getElementById('countBPlus').textContent = analytics.gradeDistribution.bPlus;
    
    document.getElementById('gradeB').style.width = (analytics.gradeDistribution.b / total * 100) + '%';
    document.getElementById('countB').textContent = analytics.gradeDistribution.b;
    
    document.getElementById('gradeC').style.width = (analytics.gradeDistribution.c / total * 100) + '%';
    document.getElementById('countC').textContent = analytics.gradeDistribution.c;
    
    document.getElementById('gradeF').style.width = (analytics.gradeDistribution.f / total * 100) + '%';
    document.getElementById('countF').textContent = analytics.gradeDistribution.f;
}

// Export grades
function exportGrades() {
    console.log('Exporting grades to CSV...');
    alert('Grades export functionality will be implemented soon!');
}
