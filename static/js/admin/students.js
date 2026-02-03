/* ============================================
   STUDENTS PAGE - JAVASCRIPT
   Dynamic Table, Filtering, Search, Toggle
   ============================================ */

// ==================== GLOBAL VARIABLES ====================
let allStudents = [];
let filteredStudents = [];
let currentView = 'all'; // 'all' or 'absent'

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Students Page Initialized');
    
    // Initialize components
    initializeDate();
    initializeSidebar();
    loadClasses();
    loadStudents();
    
    // Setup event listeners
    setupEventListeners();
});

// ==================== DATE DISPLAY ====================
function initializeDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// ==================== SIDEBAR TOGGLE ====================
function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            clearSearch.style.display = 'flex';
        } else {
            clearSearch.style.display = 'none';
        }
        
        // Perform search
        performSearch(query);
    });
    
    // Clear search button
    clearSearch.addEventListener('click', function() {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        performSearch('');
    });
    
    // Class filter
    const classFilter = document.getElementById('classFilter');
    classFilter.addEventListener('change', function(e) {
        const selectedClass = e.target.value;
        filterByClass(selectedClass);
    });
    
    // Toggle view button
    const toggleBtn = document.getElementById('toggleView');
    toggleBtn.addEventListener('click', function() {
        toggleView();
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    refreshBtn.addEventListener('click', function() {
        this.querySelector('i').classList.add('fa-spin');
        setTimeout(() => {
            this.querySelector('i').classList.remove('fa-spin');
        }, 1000);
        
        if (currentView === 'all') {
            loadStudents();
        } else {
            loadAbsentStudents();
        }
    });
    
    // Add Student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
    }
    
    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (closeModal) closeModal.addEventListener('click', closeAddStudentModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAddStudentModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeAddStudentModal);
    
    // Add Student form submission
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }
}

// ==================== LOAD CLASSES FOR FILTER ====================
async function loadClasses() {
    try {
        console.log('📚 Loading classes...');
        
        const response = await fetch('/api/classes');
        const data = await response.json();
        
        console.log('✅ Classes loaded:', data);
        
        const classFilter = document.getElementById('classFilter');
        
        // Clear existing options (keep "All Classes")
        while (classFilter.options.length > 1) {
            classFilter.remove(1);
        }
        
        // Add class options
        data.classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('❌ Error loading classes:', error);
    }
}

// ==================== LOAD ALL STUDENTS ====================
async function loadStudents() {
    try {
        console.log('👥 Loading all students...');
        
        const response = await fetch('/api/students');
        const data = await response.json();
        
        console.log('✅ Students loaded:', data);
        
        // Store students data
        allStudents = data.students;
        filteredStudents = [...allStudents];
        
        // Update view
        currentView = 'all';
        updateTableTitle('All Students');
        renderStudentsTable(filteredStudents);
        updateTotalCount(filteredStudents.length);
        
        // Reset toggle button
        const toggleBtn = document.getElementById('toggleView');
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = `
            <i class="fas fa-eye"></i>
            <span>Show Absent Students</span>
        `;
        toggleBtn.setAttribute('data-mode', 'all');
        
    } catch (error) {
        console.error('❌ Error loading students:', error);
        showError('Failed to load students. Please try again.');
    }
}

// ==================== LOAD ABSENT STUDENTS ====================
async function loadAbsentStudents() {
    try {
        console.log('🚫 Loading absent students...');
        
        const response = await fetch('/api/absent');
        const data = await response.json();
        
        console.log('✅ Absent students loaded:', data);
        
        // Store students data
        allStudents = data.students;
        filteredStudents = [...allStudents];
        
        // Update view
        currentView = 'absent';
        updateTableTitle(`Today's Absent Students (${data.date})`);
        renderStudentsTable(filteredStudents);
        updateTotalCount(filteredStudents.length);
        
        // Update toggle button
        const toggleBtn = document.getElementById('toggleView');
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = `
            <i class="fas fa-users"></i>
            <span>Show All Students</span>
        `;
        toggleBtn.setAttribute('data-mode', 'absent');
        
    } catch (error) {
        console.error('❌ Error loading absent students:', error);
        showError('Failed to load absent students. Please try again.');
    }
}

// ==================== TOGGLE VIEW ====================
function toggleView() {
    const toggleBtn = document.getElementById('toggleView');
    const mode = toggleBtn.getAttribute('data-mode');
    
    if (mode === 'all') {
        // Switch to absent view
        loadAbsentStudents();
    } else {
        // Switch to all view
        loadStudents();
    }
    
    // Reset filters
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    document.getElementById('classFilter').value = 'all';
}

// ==================== RENDER STUDENTS TABLE ====================
function renderStudentsTable(students) {
    const tableBody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        // Show empty state
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }
    
    // Render students with staggered animation
    students.forEach((student, index) => {
        const row = createStudentRow(student, index);
        tableBody.appendChild(row);
    });
}

// ==================== CREATE STUDENT ROW ====================
function createStudentRow(student, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.05}s`;
    
    // Determine attendance badge
    const status = student.attendance_status;
    let badgeClass = '';
    let badgeIcon = '';
    let badgeText = '';
    
    if (status === 'present') {
        badgeClass = 'present';
        badgeIcon = 'fa-check-circle';
        badgeText = 'Present';
    } else if (status === 'absent') {
        badgeClass = 'absent';
        badgeIcon = 'fa-times-circle';
        badgeText = 'Absent';
    } else if (status === 'late') {
        badgeClass = 'late';
        badgeIcon = 'fa-clock';
        badgeText = 'Late';
    }
    
    row.innerHTML = `
        <td>${student.roll_no}</td>
        <td><strong>${student.name}</strong></td>
        <td>${student.class} ${student.section}</td>
        <td>${student.email}</td>
        <td>
            <span class="attendance-badge ${badgeClass}">
                <i class="fas ${badgeIcon}"></i>
                ${badgeText}
            </span>
        </td>
        <td>
            <button class="table-action-btn" title="View Details" onclick="viewStudent(${student.id})">
                <i class="fas fa-eye"></i>
            </button>
            <button class="table-action-btn" title="Edit" onclick="editStudent(${student.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="table-action-btn danger" title="Delete" onclick="deleteStudent(${student.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// ==================== PERFORM SEARCH ====================
function performSearch(query) {
    if (!query) {
        // No search query - show all current students
        filteredStudents = [...allStudents];
    } else {
        // Filter by name or roll number
        const lowerQuery = query.toLowerCase();
        filteredStudents = allStudents.filter(student => {
            return student.name.toLowerCase().includes(lowerQuery) ||
                   student.roll_no.toLowerCase().includes(lowerQuery);
        });
    }
    
    // Apply class filter if set
    const classFilter = document.getElementById('classFilter');
    const selectedClass = classFilter.value;
    
    if (selectedClass !== 'all') {
        filteredStudents = filteredStudents.filter(student => 
            student.class === selectedClass
        );
    }
    
    // Render results with fade animation
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.style.opacity = '0';
    
    setTimeout(() => {
        renderStudentsTable(filteredStudents);
        updateTotalCount(filteredStudents.length);
        tableWrapper.style.opacity = '1';
    }, 150);
}

// ==================== FILTER BY CLASS ====================
function filterByClass(selectedClass) {
    if (selectedClass === 'all') {
        filteredStudents = [...allStudents];
    } else {
        filteredStudents = allStudents.filter(student => 
            student.class === selectedClass
        );
    }
    
    // Also apply search if active
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        const lowerQuery = query.toLowerCase();
        filteredStudents = filteredStudents.filter(student => {
            return student.name.toLowerCase().includes(lowerQuery) ||
                   student.roll_no.toLowerCase().includes(lowerQuery);
        });
    }
    
    // Render with animation
    const tableWrapper = document.querySelector('.table-wrapper');
    tableWrapper.style.opacity = '0';
    
    setTimeout(() => {
        renderStudentsTable(filteredStudents);
        updateTotalCount(filteredStudents.length);
        tableWrapper.style.opacity = '1';
    }, 150);
}

// ==================== UPDATE TOTAL COUNT ====================
function updateTotalCount(count) {
    const totalCount = document.getElementById('totalCount');
    
    // Directly update for instant feedback
    totalCount.textContent = count;
    
    // Add a subtle pulse effect
    totalCount.parentElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        totalCount.parentElement.style.transform = 'scale(1)';
    }, 200);
}

// ==================== ANIMATE NUMBER ====================
function animateNumber(element, start, end, duration) {
    const range = end - start;
    
    // If no change, just set it
    if (range === 0) {
        element.textContent = end;
        return;
    }
    
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(current);
    }, 16);
}

// ==================== UPDATE TABLE TITLE ====================
function updateTableTitle(title) {
    const tableTitle = document.getElementById('tableTitle');
    tableTitle.textContent = title;
}

// ==================== SHOW ERROR ====================
function showError(message) {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
}

// ==================== ACTION FUNCTIONS ====================

function viewStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (student) {
        console.log('👁️ Viewing student:', student);
        alert(`Student Details:\n\nName: ${student.name}\nRoll No: ${student.roll_no}\nClass: ${student.class} ${student.section}\nEmail: ${student.email}\nStatus: ${student.attendance_status}`);
    }
}

function editStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (student) {
        console.log('✏️ Editing student:', student);
        alert(`Edit functionality for ${student.name} will be implemented here.`);
    }
}

function deleteStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (student) {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            console.log('🗑️ Deleting student:', student);
            alert('Delete functionality will be implemented here.');
        }
    }
}

// ==================== MODAL FUNCTIONS ====================

function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log('📝 Opening Add Student Modal');
}

function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    const form = document.getElementById('addStudentForm');
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    form.reset();
    
    console.log('❌ Closing Add Student Modal');
}

async function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const studentData = {
        name: formData.get('name'),
        roll_no: formData.get('roll'),
        class: formData.get('class'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        address: formData.get('address') || '',
        attendance_status: formData.get('status'),
        section: 'A'  // Default section
    };
    
    console.log('💾 Adding new student:', studentData);
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
        
        // Send POST request to backend API
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alert(`✅ Student ${studentData.name} added successfully!\n\nRoll No: ${result.student.roll_no}\nClass: ${result.student.class}\nEmail: ${result.student.email}`);
            
            // Close modal
            closeAddStudentModal();
            
            // Reload students list to reflect the new addition
            await loadStudents();
            
            // Update the student count badge
            updateStudentCount();
            
        } else {
            // Show error message
            alert(`❌ Error: ${result.error}\n\nPlease check your input and try again.`);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ Error adding student:', error);
        alert(`❌ Failed to add student: ${error.message}\n\nPlease check your connection and try again.`);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Student';
        submitBtn.disabled = false;
    }
}

// ==================== UPDATE STUDENT COUNT ====================
function updateStudentCount() {
    const countBadge = document.getElementById('showingCount');
    if (countBadge && allStudents.length > 0) {
        countBadge.textContent = allStudents.length;
    }
}

// ==================== SMOOTH TRANSITIONS ====================
const style = document.createElement('style');
style.textContent = `
    .table-wrapper {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

console.log('✅ Students Page JavaScript loaded successfully!');
