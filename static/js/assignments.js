// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const modal = document.getElementById('createAssignmentModal');
    const createBtn = document.getElementById('createAssignmentBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelCreateBtn');
    const form = document.getElementById('createAssignmentForm');

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
            
            // Load data for the active tab
            if (tabName === 'active') {
                loadActiveAssignments();
            } else if (tabName === 'past') {
                loadPastAssignments();
            } else if (tabName === 'submissions') {
                loadSubmissions();
            }
        });
    });

    // Modal controls
    createBtn.addEventListener('click', function() {
        modal.classList.add('show');
        loadClassesForModal();
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        form.reset();
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        form.reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            form.reset();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createAssignment();
    });

    // Filter changes
    document.getElementById('activeClassFilter').addEventListener('change', loadActiveAssignments);
    document.getElementById('activeSubjectFilter').addEventListener('change', loadActiveAssignments);
    document.getElementById('pastClassFilter').addEventListener('change', loadPastAssignments);
    document.getElementById('pastSubjectFilter').addEventListener('change', loadPastAssignments);
    document.getElementById('submissionAssignmentFilter').addEventListener('change', loadSubmissions);
    document.getElementById('submissionStatusFilter').addEventListener('change', loadSubmissions);

    // Initial load
    loadActiveAssignments();
    loadAssignmentsForFilter();
    loadClassesForFilters();
});

// Load classes for filters
function loadClassesForFilters() {
    fetch('/api/teacher/classes')
        .then(response => response.json())
        .then(data => {
            const classSelects = [
                document.getElementById('activeClassFilter'),
                document.getElementById('pastClassFilter')
            ];

            classSelects.forEach(select => {
                // Clear existing options except "All Classes"
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

// Load classes for modal
function loadClassesForModal() {
    fetch('/api/teacher/classes')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('assignmentClass');
            
            // Clear existing options except "Select Class"
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
        })
        .catch(error => console.error('Error loading classes for modal:', error));
}

// Load active assignments
function loadActiveAssignments() {
    const classFilter = document.getElementById('activeClassFilter').value;
    const subjectFilter = document.getElementById('activeSubjectFilter').value;
    const grid = document.getElementById('activeAssignmentsGrid');
    
    // Sample data - replace with actual API call
    const assignments = [
        {
            id: 1,
            title: 'Algebra Problem Set',
            class: 'Class 10 - A',
            subject: 'Mathematics',
            dueDate: '2024-01-25',
            description: 'Complete problems 1-20 from Chapter 3',
            maxMarks: 50,
            submissions: 15,
            totalStudents: 30
        },
        {
            id: 2,
            title: 'Essay on Climate Change',
            class: 'Class 10 - B',
            subject: 'English',
            dueDate: '2024-01-28',
            description: 'Write a 500-word essay on climate change and its effects',
            maxMarks: 100,
            submissions: 20,
            totalStudents: 28
        }
    ];
    
    grid.innerHTML = '';
    
    if (assignments.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No active assignments found</p></div>';
        return;
    }
    
    assignments.forEach(assignment => {
        const isOverdue = new Date(assignment.dueDate) < new Date();
        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.innerHTML = `
            <div class="assignment-header">
                <div>
                    <div class="assignment-title">${assignment.title}</div>
                </div>
            </div>
            <div class="assignment-meta">
                <div class="meta-item">
                    <i class="fas fa-book"></i>
                    <span>${assignment.subject}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-chalkboard"></i>
                    <span>${assignment.class}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Due: ${formatDate(assignment.dueDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>Max Marks: ${assignment.maxMarks}</span>
                </div>
            </div>
            <div class="assignment-description">
                ${assignment.description}
            </div>
            <div class="assignment-footer">
                <span class="status-badge ${isOverdue ? 'overdue' : 'active'}">
                    ${isOverdue ? 'Overdue' : 'Active'}
                </span>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${assignment.submissions}/${assignment.totalStudents} submitted</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load past assignments
function loadPastAssignments() {
    const classFilter = document.getElementById('pastClassFilter').value;
    const subjectFilter = document.getElementById('pastSubjectFilter').value;
    const grid = document.getElementById('pastAssignmentsGrid');
    
    // Sample data
    const assignments = [
        {
            id: 1,
            title: 'Trigonometry Quiz',
            class: 'Class 10 - A',
            subject: 'Mathematics',
            dueDate: '2024-01-10',
            description: 'Quiz on trigonometric ratios and identities',
            maxMarks: 25,
            submissions: 30,
            totalStudents: 30
        }
    ];
    
    grid.innerHTML = '';
    
    if (assignments.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No past assignments found</p></div>';
        return;
    }
    
    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.innerHTML = `
            <div class="assignment-header">
                <div>
                    <div class="assignment-title">${assignment.title}</div>
                </div>
            </div>
            <div class="assignment-meta">
                <div class="meta-item">
                    <i class="fas fa-book"></i>
                    <span>${assignment.subject}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-chalkboard"></i>
                    <span>${assignment.class}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Due: ${formatDate(assignment.dueDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>Max Marks: ${assignment.maxMarks}</span>
                </div>
            </div>
            <div class="assignment-description">
                ${assignment.description}
            </div>
            <div class="assignment-footer">
                <span class="status-badge" style="background: #e5e7eb; color: #6b7280;">
                    Completed
                </span>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${assignment.submissions}/${assignment.totalStudents} submitted</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load submissions
function loadSubmissions() {
    const assignmentFilter = document.getElementById('submissionAssignmentFilter').value;
    const statusFilter = document.getElementById('submissionStatusFilter').value;
    const tbody = document.getElementById('submissionsTableBody');
    
    // Sample data
    const submissions = [
        {
            studentName: 'John Doe',
            rollNumber: '101',
            submissionDate: '2024-01-20',
            status: 'submitted',
            grade: 'A'
        },
        {
            studentName: 'Jane Smith',
            rollNumber: '102',
            submissionDate: null,
            status: 'pending',
            grade: '-'
        }
    ];
    
    tbody.innerHTML = '';
    
    if (submissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i>No submissions found</td></tr>';
        return;
    }
    
    submissions.forEach(sub => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sub.studentName}</td>
            <td>${sub.rollNumber}</td>
            <td>${sub.submissionDate ? formatDate(sub.submissionDate) : '-'}</td>
            <td>
                <span class="status-badge ${sub.status}">
                    ${sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                </span>
            </td>
            <td>${sub.grade}</td>
            <td>
                <button class="icon-btn edit" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load assignments for filter dropdown
function loadAssignmentsForFilter() {
    // Sample data
    const assignments = [
        { id: 1, title: 'Algebra Problem Set' },
        { id: 2, title: 'Essay on Climate Change' }
    ];
    
    const select = document.getElementById('submissionAssignmentFilter');
    assignments.forEach(assignment => {
        const option = document.createElement('option');
        option.value = assignment.id;
        option.textContent = assignment.title;
        select.appendChild(option);
    });
}

// Create new assignment
function createAssignment() {
    const formData = {
        title: document.getElementById('assignmentTitle').value,
        class_id: document.getElementById('assignmentClass').value,
        subject: document.getElementById('assignmentSubject').value,
        description: document.getElementById('assignmentDescription').value,
        due_date: document.getElementById('assignmentDueDate').value,
        max_marks: document.getElementById('assignmentMaxMarks').value
    };
    
    // Validation
    if (!formData.class_id || !formData.subject) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Simulate API call
    console.log('Creating assignment:', formData);
    alert('✅ Assignment created successfully!');
    
    // Close modal and reload
    document.getElementById('createAssignmentModal').classList.remove('show');
    document.getElementById('createAssignmentForm').reset();
    loadActiveAssignments();
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
