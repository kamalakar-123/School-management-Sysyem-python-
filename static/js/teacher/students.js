// Students page functionality
let allStudents = [];
let filteredStudents = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Students page loaded');
    
    // Load initial data
    loadClasses();
    loadStudents();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Search input with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterStudents();
        }, 300);
    });
    
    // Filter changes
    document.getElementById('classFilter').addEventListener('change', filterStudents);
    document.getElementById('sectionFilter').addEventListener('change', filterStudents);
    document.getElementById('statusFilter').addEventListener('change', filterStudents);
    
    // Clear filters
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
        loadStudents();
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        }, 1000);
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportStudents);
    
    // Modal controls
    const modal = document.getElementById('viewStudentModal');
    const closeBtn = modal.querySelector('.close');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// Load classes for filter
async function loadClasses() {
    try {
        const response = await fetch('/api/teacher/classes');
        const data = await response.json();
        
        if (data.success && data.classes) {
            const select = document.getElementById('classFilter');
            data.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.class_name;
                option.textContent = cls.class_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load all students
async function loadStudents() {
    try {
        const response = await fetch('/api/teacher/students/all');
        const data = await response.json();
        
        if (data.success) {
            allStudents = data.students;
            filteredStudents = [...allStudents];
            displayStudents(filteredStudents);
            updateStats(filteredStudents);
        } else {
            showError('Failed to load students: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students: ' + error.message);
    }
}

// Filter students based on search and filters
function filterStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const classFilter = document.getElementById('classFilter').value;
    const sectionFilter = document.getElementById('sectionFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredStudents = allStudents.filter(student => {
        // Search filter
        const matchesSearch = !searchTerm || 
            student.name.toLowerCase().includes(searchTerm) ||
            student.roll_no.toLowerCase().includes(searchTerm) ||
            String(student.student_id).includes(searchTerm);
        
        // Class filter
        const matchesClass = !classFilter || student.class === classFilter;
        
        // Section filter
        const matchesSection = !sectionFilter || student.section === sectionFilter;
        
        // Status filter
        const matchesStatus = !statusFilter || student.status === statusFilter;
        
        return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });
    
    displayStudents(filteredStudents);
    updateStats(filteredStudents);
}

// Display students in table
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    const resultCount = document.getElementById('resultCount');
    
    resultCount.textContent = `${students.length} student${students.length !== 1 ? 's' : ''}`;
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No students found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.roll_no}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.section}</td>
            <td>${student.email}</td>
            <td>${formatDate(student.enrollment_date)}</td>
            <td>
                <span class="status-badge ${student.status}">
                    ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="icon-btn view" onclick="viewStudent(${student.student_id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn email" onclick="sendEmail('${student.email}')" title="Send Email">
                        <i class="fas fa-envelope"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStats(students) {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const uniqueClasses = [...new Set(students.map(s => s.class))].length;
    const uniqueSections = [...new Set(students.map(s => s.section))].length;
    
    animateCounter('totalStudents', totalStudents);
    animateCounter('activeStudents', activeStudents);
    animateCounter('totalClasses', uniqueClasses);
    animateCounter('totalSections', uniqueSections);
}

// Animate counter
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    
    // Simply update the value without animation to avoid issues
    element.textContent = targetValue;
}

// View student details
function viewStudent(studentId) {
    const student = allStudents.find(s => s.student_id === studentId);
    
    if (!student) {
        alert('Student not found');
        return;
    }
    
    // Populate modal
    document.getElementById('modalStudentName').textContent = student.name;
    document.getElementById('modalStudentClass').textContent = `${student.class} - Section ${student.section}`;
    document.getElementById('modalStudentId').textContent = student.student_id;
    document.getElementById('modalRollNo').textContent = student.roll_no;
    document.getElementById('modalEmail').textContent = student.email;
    document.getElementById('modalSection').textContent = student.section;
    document.getElementById('modalEnrollmentDate').textContent = formatDate(student.enrollment_date);
    
    const statusElement = document.getElementById('modalStatus');
    statusElement.innerHTML = `<span class="status-badge ${student.status}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>`;
    
    // Show modal
    document.getElementById('viewStudentModal').classList.add('show');
}

// Send email
function sendEmail(email) {
    window.location.href = `mailto:${email}`;
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('classFilter').value = '';
    document.getElementById('sectionFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filterStudents();
}

// Export students to CSV
function exportStudents() {
    if (filteredStudents.length === 0) {
        alert('No students to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Student ID', 'Roll No', 'Name', 'Class', 'Section', 'Email', 'Enrollment Date', 'Status'];
    const rows = filteredStudents.map(s => [
        s.student_id,
        s.roll_no,
        s.name,
        s.class,
        s.section,
        s.email,
        s.enrollment_date,
        s.status
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('✅ Students exported successfully!');
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
