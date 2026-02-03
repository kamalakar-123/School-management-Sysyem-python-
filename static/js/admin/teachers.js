/* ============================================
   TEACHERS PAGE - JAVASCRIPT
   Dynamic Table, Filtering, Search
   ============================================ */

// ==================== GLOBAL VARIABLES ====================
let allTeachers = [];
let filteredTeachers = [];
let teacherAttendanceData = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('👨‍🏫 Teachers Page Initialized');
    
    // Initialize components
    initializeDate();
    initializeSidebar();
    loadDepartments();
    loadTeachers(false); // Load teachers but don't render table yet since section is hidden
    
    // Setup event listeners
    setupEventListeners();
    setupAttendanceListeners();
    setupReportsListeners();
    
    // Load departments for filters
    loadTeacherDepartmentsForFilter();
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
    
    // Department filter
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.addEventListener('change', function(e) {
        const selectedDepartment = e.target.value;
        filterByDepartment(selectedDepartment);
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    refreshBtn.addEventListener('click', function() {
        this.querySelector('i').classList.add('fa-spin');
        setTimeout(() => {
            this.querySelector('i').classList.remove('fa-spin');
        }, 1000);
        
        loadTeachers();
    });
    
    // Add Teacher button
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    if (addTeacherBtn) {
        addTeacherBtn.addEventListener('click', function() {
            openAddTeacherModal();
        });
    }
}

// ==================== LOAD DEPARTMENTS FOR FILTER ====================
async function loadDepartments() {
    try {
        console.log('🏢 Loading departments...');
        
        const response = await fetch('/api/departments');
        const data = await response.json();
        
        console.log('✅ Departments loaded:', data);
        
        const departmentFilter = document.getElementById('departmentFilter');
        
        // Clear existing options (keep "All Departments")
        while (departmentFilter.options.length > 1) {
            departmentFilter.remove(1);
        }
        
        // Add department options
        data.departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = department;
            departmentFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('❌ Error loading departments:', error);
    }
}

// ==================== LOAD ALL TEACHERS ====================
async function loadTeachers(shouldRenderTable = false) {
    try {
        console.log('👨‍🏫 Loading all teachers...');
        
        const response = await fetch('/api/teachers');
        const data = await response.json();
        
        console.log('✅ Teachers loaded:', data);
        
        if (!data.success) {
            throw new Error('Failed to load teachers');
        }
        
        // Store teachers data - normalize to use 'id' consistently
        allTeachers = data.teachers.map(t => ({
            id: t.teacher_id || t.id,
            teacher_id: t.teacher_id || t.id,
            name: t.name,
            subject: t.subject,
            department: t.department,
            joining_date: t.joining_date,
            years_experience: t.years_experience,
            status: t.status
        }));
        filteredTeachers = [...allTeachers];
        
        // Update total count
        updateTotalCount(data.total);
        
        // Only render table if requested (when section is visible)
        if (shouldRenderTable) {
            await renderTeachersTable(filteredTeachers);
        }
        
        // Hide loading overlay
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('❌ Error loading teachers:', error);
        hideLoadingOverlay();
        showError('Failed to load teachers data');
    }
}

// ==================== RENDER TEACHERS TABLE ====================
async function renderTeachersTable(teachers) {
    const tableBody = document.getElementById('teachersTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Check if no teachers
    if (teachers.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    let attendanceData = {};
    try {
        const response = await fetch(`/api/teacher-attendance?date=${today}`);
        const data = await response.json();
        if (data.success) {
            attendanceData = data.attendance;
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
    }
    
    // Render each teacher row
    teachers.forEach(teacher => {
        const row = createTeacherRow(teacher, attendanceData);
        tableBody.appendChild(row);
    });
    
    // Update teacher count display
    updateTeacherCount();
    
    console.log(`✅ Rendered ${teachers.length} teacher(s)`);
}

// ==================== CREATE TEACHER ROW ====================
function createTeacherRow(teacher, attendanceData = {}) {
    const row = document.createElement('tr');
    row.classList.add('teacher-row');
    row.setAttribute('data-teacher-id', teacher.id);
    
    // Format joining date
    const joiningDate = new Date(teacher.joining_date);
    const formattedDate = joiningDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Experience badge
    const experienceBadge = teacher.years_experience > 5 
        ? `<span class="badge badge-success">${teacher.years_experience} years</span>`
        : `<span class="badge badge-info">${teacher.years_experience} years</span>`;
    
    // Attendance status badge
    // Use teacher.id or teacher.teacher_id depending on which exists
    const teacherId = teacher.teacher_id || teacher.id;
    const attendance = attendanceData[teacherId];
    let attendanceBadge = '';
    if (attendance) {
        const statusColors = {
            'present': { bg: '#c6f6d5', color: '#22543d', icon: 'check' },
            'absent': { bg: '#fed7d7', color: '#742a2a', icon: 'times' },
            'leave': { bg: '#bee3f8', color: '#2c5282', icon: 'file-alt' }
        };
        const style = statusColors[attendance.status] || { bg: '#e2e8f0', color: '#4a5568', icon: 'question' };
        attendanceBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${style.bg}; color: ${style.color};"><i class="fas fa-${style.icon}"></i> ${attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}</span>`;
    } else {
        attendanceBadge = '<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e2e8f0; color: #718096;"><i class="fas fa-minus"></i> Not Marked</span>';
    }
    
    row.innerHTML = `
        <td class="teacher-id">${teacher.id}</td>
        <td class="teacher-name">
            <div class="name-cell">
                <div class="teacher-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <span>${teacher.name}</span>
            </div>
        </td>
        <td class="teacher-subject">${teacher.subject}</td>
        <td class="teacher-department">
            <span class="badge badge-department">${teacher.department}</span>
        </td>
        <td class="teacher-attendance">${attendanceBadge}</td>
        <td class="teacher-joining">${formattedDate}</td>
        <td class="teacher-experience">${experienceBadge}</td>
        <td class="teacher-actions">
            <button class="action-btn-small" title="View Details" onclick="viewTeacher(${teacher.id})">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn-small" title="Edit" onclick="editTeacher(${teacher.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn-small danger" title="Delete" onclick="deleteTeacher(${teacher.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// ==================== PERFORM SEARCH ====================
function performSearch(query) {
    if (!query) {
        // Reset to filtered or all teachers
        const departmentFilter = document.getElementById('departmentFilter');
        const selectedDepartment = departmentFilter.value;
        
        if (selectedDepartment === 'all') {
            filteredTeachers = [...allTeachers];
        } else {
            filteredTeachers = allTeachers.filter(t => t.department === selectedDepartment);
        }
    } else {
        // Search in name and subject
        const searchLower = query.toLowerCase();
        filteredTeachers = allTeachers.filter(teacher => {
            return teacher.name.toLowerCase().includes(searchLower) ||
                   teacher.subject.toLowerCase().includes(searchLower);
        });
    }
    
    // Update total count
    updateTotalCount(filteredTeachers.length);
    
    // Re-render table
    renderTeachersTable(filteredTeachers);
    
    // Update teacher count if visible
    if (document.getElementById('teachersContent') && document.getElementById('teachersContent').style.display === 'block') {
        updateTeacherCount();
    }
    
    console.log(`🔍 Search: "${query}" - Found ${filteredTeachers.length} teacher(s)`);
}

// ==================== FILTER BY DEPARTMENT ====================
function filterByDepartment(department) {
    if (department === 'all') {
        filteredTeachers = [...allTeachers];
    } else {
        filteredTeachers = allTeachers.filter(t => t.department === department);
    }
    
    // Clear search
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Update total count
    updateTotalCount(filteredTeachers.length);
    
    // Re-render table
    renderTeachersTable(filteredTeachers);
    
    // Update teacher count if visible
    if (document.getElementById('teachersContent') && document.getElementById('teachersContent').style.display === 'block') {
        updateTeacherCount();
    }
    
    console.log(`🔍 Filter: ${department} - Found ${filteredTeachers.length} teacher(s)`);
}

// ==================== UPDATE TOTAL COUNT ====================
function updateTotalCount(count) {
    const totalCountElement = document.getElementById('totalCount');
    totalCountElement.textContent = count;
}

// ==================== HIDE LOADING OVERLAY ====================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }, 500);
    }
}

// ==================== SHOW ERROR MESSAGE ====================
function showError(message) {
    const tableBody = document.getElementById('teachersTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; font-weight: 600;">${message}</p>
            </td>
        </tr>
    `;
}

// ==================== ACTION FUNCTIONS ====================
function viewTeacher(teacherId) {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (teacher) {
        alert(`View Teacher Details:\n\nName: ${teacher.name}\nSubject: ${teacher.subject}\nDepartment: ${teacher.department}\nJoining Date: ${teacher.joining_date}\nExperience: ${teacher.years_experience} years`);
    }
}

function editTeacher(teacherId) {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (teacher) {
        alert(`Edit functionality coming soon for:\n${teacher.name}`);
    }
}

function deleteTeacher(teacherId) {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (teacher) {
        if (confirm(`Are you sure you want to delete ${teacher.name}?`)) {
            alert('Delete functionality coming soon!');
        }
    }
}

function openAddTeacherModal() {
    const modal = document.getElementById('addTeacherModal');
    const form = document.getElementById('addTeacherForm');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('joiningDate').value = today;
    
    // Reset form
    form.reset();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('teacherName').focus();
    }, 100);
}

function closeAddTeacherModal() {
    const modal = document.getElementById('addTeacherModal');
    modal.style.display = 'none';
}

// Setup modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('addTeacherModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('addTeacherForm');
    
    // Close modal buttons
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddTeacherModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAddTeacherModal);
    }
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddTeacherModal();
        }
    });
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const teacherData = {
                name: formData.get('name'),
                subject: formData.get('subject'),
                department: formData.get('department'),
                joining_date: formData.get('joining_date')
            };
            
            // Call API to add teacher
            await addTeacherToDatabase(teacherData);
        });
    }
});

async function addTeacherToDatabase(teacherData) {
    try {
        console.log('➕ Adding new teacher:', teacherData);
        
        // Show loading state
        const submitBtn = document.querySelector('#addTeacherForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        const response = await fetch('/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alert(`✅ Teacher "${teacherData.name}" added successfully!`);
            
            // Close modal
            closeAddTeacherModal();
            
            // Reload teachers list
            loadTeachers();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('❌ Error adding teacher:', error);
        alert('Failed to add teacher. Please try again.');
        
        // Restore button
        const submitBtn = document.querySelector('#addTeacherForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Add Teacher';
    }
}

// ==================== TEACHER ATTENDANCE FUNCTIONALITY ====================

function setupAttendanceListeners() {
    console.log('🎯 Setting up attendance listeners...');
    
    // Set today's date as default
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        // Date change event
        dateInput.addEventListener('change', function() {
            console.log('📅 Date changed to:', this.value);
            // If teachers are already loaded, reload with new date
            if (teacherAttendanceData.length > 0) {
                loadTeacherAttendance();
            }
        });
    }
    
    // Load Teachers button
    const loadTeachersBtn = document.getElementById('loadTeachersBtn');
    if (loadTeachersBtn) {
        loadTeachersBtn.addEventListener('click', function() {
            console.log('🔄 Load Teachers button clicked');
            // Show loading state
            const tbody = document.getElementById('attendanceTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 40px; text-align: center; color: #a0aec0;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <p>Loading teachers...</p>
                    </td>
                </tr>
            `;
            loadTeacherAttendance();
        });
    }
    
    // Toggle teachers table section
    const toggleTeachersBtn = document.getElementById('toggleTeachersBtn');
    if (toggleTeachersBtn) {
        toggleTeachersBtn.addEventListener('click', async function() {
            console.log('🔄 Toggle teachers button clicked');
            const content = document.getElementById('teachersContent');
            const toggleIcon = document.getElementById('toggleTeachersIcon');
            const toggleText = document.getElementById('toggleTeachersText');
            
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                toggleIcon.className = 'fas fa-chevron-up';
                toggleText.textContent = 'Hide';
                
                // Load departments for filter
                loadTeacherDepartmentsForFilter();
                
                if (allTeachers.length === 0) {
                    console.log('📥 Loading teachers for first time...');
                    await loadTeachers(true);
                } else {
                    // Just render existing data
                    await renderTeachersTable(filteredTeachers);
                }
                
                updateTeacherCount();
            } else {
                content.style.display = 'none';
                toggleIcon.className = 'fas fa-chevron-down';
                toggleText.textContent = 'Show';
            }
        });
    }
    
    // Teacher search functionality
    const teacherSearchInput = document.getElementById('teacherSearchInput');
    const clearTeacherSearch = document.getElementById('clearTeacherSearch');
    
    if (teacherSearchInput) {
        teacherSearchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                clearTeacherSearch.style.display = 'block';
            } else {
                clearTeacherSearch.style.display = 'none';
            }
            
            filterTeachersTable(query, document.getElementById('teacherDepartmentFilter').value);
        });
    }
    
    if (clearTeacherSearch) {
        clearTeacherSearch.addEventListener('click', function() {
            teacherSearchInput.value = '';
            clearTeacherSearch.style.display = 'none';
            filterTeachersTable('', document.getElementById('teacherDepartmentFilter').value);
        });
    }
    
    // Teacher department filter
    const teacherDepartmentFilter = document.getElementById('teacherDepartmentFilter');
    if (teacherDepartmentFilter) {
        teacherDepartmentFilter.addEventListener('change', function(e) {
            filterTeachersTable(teacherSearchInput.value, e.target.value);
        });
    }
    
    // Mark all present button
    const markAllPresentBtn = document.getElementById('markAllPresentBtn');
    if (markAllPresentBtn) {
        markAllPresentBtn.addEventListener('click', markAllTeachersPresent);
    }
    
    // Save attendance button
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', saveTeacherAttendance);
    }
}

function loadTeacherDepartmentsForFilter() {
    fetch('/api/departments')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('teacherDepartmentFilter');
            select.innerHTML = '<option value="all">All Departments</option>';
            data.departments.forEach(dept => {
                select.innerHTML += `<option value="${dept}">${dept}</option>`;
            });
        })
        .catch(error => console.error('Error loading departments:', error));
}

function filterTeachersTable(searchQuery, department) {
    const tbody = document.getElementById('teachersTableBody');
    const rows = tbody.getElementsByTagName('tr');
    let visibleCount = 0;
    
    const query = searchQuery.toLowerCase();
    
    for (let row of rows) {
        if (row.classList.contains('loading-row')) continue;
        
        const cells = row.getElementsByTagName('td');
        if (cells.length === 0) continue;
        
        const name = cells[1]?.textContent.toLowerCase() || '';
        const subject = cells[2]?.textContent.toLowerCase() || '';
        const dept = cells[3]?.textContent.toLowerCase() || '';
        
        const matchesSearch = name.includes(query) || subject.includes(query) || dept.includes(query);
        const matchesDepartment = department === 'all' || dept.includes(department.toLowerCase());
        
        if (matchesSearch && matchesDepartment) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
    
    document.getElementById('teacherShowingCount').textContent = visibleCount;
}

function updateTeacherCount() {
    const tbody = document.getElementById('teachersTableBody');
    const rows = tbody.querySelectorAll('tr:not(.loading-row)');
    let count = 0;
    rows.forEach(row => {
        if (row.style.display !== 'none') count++;
    });
    document.getElementById('teacherShowingCount').textContent = count;
}

async function loadTeacherAttendance() {
    try {
        console.log('📋 Loading teacher attendance...');
        
        // Get selected date
        const dateInput = document.getElementById('attendanceDate');
        const selectedDate = dateInput.value;
        
        if (!selectedDate) {
            alert('⚠️ Please select a date first.');
            return;
        }
        
        console.log('📅 Loading attendance for date:', selectedDate);
        
        // Fetch teachers and attendance for selected date in parallel
        const [teachersResponse, attendanceResponse] = await Promise.all([
            fetch('/api/teachers'),
            fetch(`/api/teacher-attendance?date=${selectedDate}`)
        ]);
        
        console.log('Teachers response status:', teachersResponse.status);
        console.log('Attendance response status:', attendanceResponse.status);
        
        const teachersData = await teachersResponse.json();
        const attendanceData = await attendanceResponse.json();
        
        console.log('Received teachers data:', teachersData);
        console.log('Received attendance data:', attendanceData);
        
        if (teachersData.success) {
            // Transform teachers data and merge with saved attendance
            teacherAttendanceData = teachersData.teachers.map(teacher => {
                const savedAttendance = attendanceData.success && attendanceData.attendance[teacher.teacher_id];
                
                return {
                    id: teacher.teacher_id,
                    name: teacher.name,
                    subject: teacher.subject,
                    department: teacher.department,
                    status: savedAttendance ? savedAttendance.status : 'not_marked',
                    remarks: savedAttendance ? savedAttendance.remarks : ''
                };
            });
            
            console.log('Teacher attendance data with saved status:', teacherAttendanceData);
            renderAttendanceTable();
            updateAttendanceStats();
        } else {
            console.error('API returned success: false');
        }
    } catch (error) {
        console.error('❌ Error loading teacher attendance:', error);
        const tbody = document.getElementById('attendanceTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #e53e3e;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Error loading teachers: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    
    if (teacherAttendanceData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #a0aec0;">
                    <i class="fas fa-users-slash" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>No teachers found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = teacherAttendanceData.map((teacher, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 15px;">${teacher.id}</td>
            <td style="padding: 15px; font-weight: 500;">${teacher.name}</td>
            <td style="padding: 15px;">${teacher.subject}</td>
            <td style="padding: 15px;">${teacher.department}</td>
            <td style="padding: 15px; text-align: center;">
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="attendance-btn ${teacher.status === 'present' ? 'active' : ''}" 
                            onclick="updateTeacherStatus(${index}, 'present')"
                            style="background: ${teacher.status === 'present' ? '#48bb78' : '#f7fafc'}; 
                                   color: ${teacher.status === 'present' ? 'white' : '#4a5568'}; 
                                   border: 1px solid ${teacher.status === 'present' ? '#48bb78' : '#cbd5e0'}; 
                                   padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s;">
                        <i class="fas fa-check"></i> Present
                    </button>
                    <button class="attendance-btn ${teacher.status === 'absent' ? 'active' : ''}" 
                            onclick="updateTeacherStatus(${index}, 'absent')"
                            style="background: ${teacher.status === 'absent' ? '#f56565' : '#f7fafc'}; 
                                   color: ${teacher.status === 'absent' ? 'white' : '#4a5568'}; 
                                   border: 1px solid ${teacher.status === 'absent' ? '#f56565' : '#cbd5e0'}; 
                                   padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s;">
                        <i class="fas fa-times"></i> Absent
                    </button>
                    <button class="attendance-btn ${teacher.status === 'leave' ? 'active' : ''}" 
                            onclick="updateTeacherStatus(${index}, 'leave')"
                            style="background: ${teacher.status === 'leave' ? '#4299e1' : '#f7fafc'}; 
                                   color: ${teacher.status === 'leave' ? 'white' : '#4a5568'}; 
                                   border: 1px solid ${teacher.status === 'leave' ? '#4299e1' : '#cbd5e0'}; 
                                   padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s;">
                        <i class="fas fa-file-alt"></i> Leave
                    </button>
                </div>
            </td>
            <td style="padding: 15px;">
                <input type="text" 
                       value="${teacher.remarks}" 
                       onchange="updateTeacherRemarks(${index}, this.value)"
                       placeholder="Add remarks..."
                       style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 13px;">
            </td>
        </tr>
    `).join('');
}

// Make these functions globally accessible for inline onclick handlers
window.updateTeacherStatus = function(index, status) {
    teacherAttendanceData[index].status = status;
    renderAttendanceTable();
    updateAttendanceStats();
}

window.updateTeacherRemarks = function(index, remarks) {
    teacherAttendanceData[index].remarks = remarks;
}

function updateAttendanceStats() {
    const present = teacherAttendanceData.filter(t => t.status === 'present').length;
    const absent = teacherAttendanceData.filter(t => t.status === 'absent').length;
    const leave = teacherAttendanceData.filter(t => t.status === 'leave').length;
    const notMarked = teacherAttendanceData.filter(t => t.status === 'not_marked').length;
    
    document.getElementById('presentTeachers').textContent = present;
    document.getElementById('absentTeachers').textContent = absent;
    document.getElementById('leaveTeachers').textContent = leave;
    document.getElementById('notMarkedTeachers').textContent = notMarked;
}

function markAllTeachersPresent() {
    if (confirm('Mark all teachers as present?')) {
        teacherAttendanceData.forEach(teacher => {
            teacher.status = 'present';
        });
        renderAttendanceTable();
        updateAttendanceStats();
    }
}

async function saveTeacherAttendance() {
    try {
        console.log('💾 Starting save attendance...');
        console.log('📋 Teacher attendance data:', teacherAttendanceData);
        
        // Check if there's any data to save
        if (!teacherAttendanceData || teacherAttendanceData.length === 0) {
            alert('⚠️ No teachers loaded. Please click "Load Teachers" first.');
            return;
        }
        
        // Check if all attendance is marked
        const notMarked = teacherAttendanceData.filter(t => t.status === 'not_marked');
        
        if (notMarked.length > 0) {
            if (!confirm(`${notMarked.length} teacher(s) attendance not marked. Continue saving?`)) {
                return;
            }
        }
        
        const saveBtn = document.getElementById('saveAttendanceBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        // Get selected date
        const dateInput = document.getElementById('attendanceDate');
        const selectedDate = dateInput.value;
        
        console.log('📅 Saving attendance for date:', selectedDate);
        
        // Prepare attendance data with validation
        const attendanceRecords = teacherAttendanceData.map(teacher => {
            const teacherId = teacher.id;
            if (!teacherId) {
                console.error('❌ Teacher missing id:', teacher);
                throw new Error(`Teacher "${teacher.name}" is missing an ID`);
            }
            return {
                teacher_id: teacherId,
                date: selectedDate,
                status: teacher.status,
                remarks: teacher.remarks || ''
            };
        });
        
        console.log('📤 Sending attendance records:', attendanceRecords);
        
        // Send to backend
        const response = await fetch('/api/teacher-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: attendanceRecords })
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Save result:', result);
        
        if (result.success) {
            alert('✅ Teacher attendance saved successfully!');
            
            // Reload teachers table to show updated attendance
            loadTeachers();
            
            // Reload attendance data to show saved status
            await loadTeacherAttendance();
        } else {
            console.error('❌ Save failed:', result.error);
            alert(`❌ Error: ${result.error || 'Failed to save attendance'}`);
        }
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('❌ Error saving attendance:', error);
        console.error('Error details:', error.message, error.stack);
        alert(`Failed to save attendance: ${error.message}`);
        
        const saveBtn = document.getElementById('saveAttendanceBtn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Attendance';
    }
}

// ==================== REPORTS FUNCTIONALITY ====================

let currentReportData = null; // Store current report data for export

function setupReportsListeners() {
    // Toggle reports section
    const toggleReportsBtn = document.getElementById('toggleReportsBtn');
    if (toggleReportsBtn) {
        toggleReportsBtn.addEventListener('click', function() {
            const content = document.getElementById('reportsContent');
            const icon = document.getElementById('toggleReportsIcon');
            const text = document.getElementById('toggleReportsText');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.className = 'fas fa-chevron-up';
                text.textContent = 'Hide';
            } else {
                content.style.display = 'none';
                icon.className = 'fas fa-chevron-down';
                text.textContent = 'Show';
            }
        });
    }
    
    // Report type change
    const reportType = document.getElementById('reportType');
    if (reportType) {
        reportType.addEventListener('change', function() {
            const monthDiv = document.getElementById('monthPickerDiv');
            const dateRangeDiv = document.getElementById('dateRangeDiv');
            
            if (this.value === 'month') {
                monthDiv.style.display = 'block';
                dateRangeDiv.style.display = 'none';
            } else {
                monthDiv.style.display = 'none';
                dateRangeDiv.style.display = 'flex';
            }
        });
    }
    
    // Set default month to current month
    const reportMonth = document.getElementById('reportMonth');
    if (reportMonth) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        reportMonth.value = currentMonth;
    }
    
    // Set default date range to current month
    const reportStartDate = document.getElementById('reportStartDate');
    const reportEndDate = document.getElementById('reportEndDate');
    if (reportStartDate && reportEndDate) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        reportStartDate.value = firstDay.toISOString().split('T')[0];
        reportEndDate.value = lastDay.toISOString().split('T')[0];
    }
    
    // Generate report button
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateAttendanceReport);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }
    
    // Print button
    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printReport);
    }
}

async function generateAttendanceReport() {
    try {
        const reportType = document.getElementById('reportType').value;
        let url = '/api/teacher-attendance-report?';
        
        if (reportType === 'month') {
            const month = document.getElementById('reportMonth').value;
            if (!month) {
                alert('Please select a month');
                return;
            }
            url += `month=${month}`;
        } else {
            const startDate = document.getElementById('reportStartDate').value;
            const endDate = document.getElementById('reportEndDate').value;
            if (!startDate || !endDate) {
                alert('Please select both start and end dates');
                return;
            }
            if (startDate > endDate) {
                alert('Start date must be before end date');
                return;
            }
            url += `start_date=${startDate}&end_date=${endDate}`;
        }
        
        console.log('📊 Generating report:', url);
        
        // Show loading
        const generateBtn = document.getElementById('generateReportBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        const response = await fetch(url);
        const data = await response.json();
        
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        if (!data.success) {
            alert('Error: ' + data.error);
            return;
        }
        
        console.log('✅ Report data received:', data);
        
        // Store report data for export
        currentReportData = data;
        
        // Display report
        displayReport(data);
        
    } catch (error) {
        console.error('❌ Error generating report:', error);
        alert('Failed to generate report: ' + error.message);
    }
}

function displayReport(data) {
    // Hide empty state
    document.getElementById('reportEmptyState').style.display = 'none';
    
    // Show summary and table
    document.getElementById('reportSummary').style.display = 'block';
    document.getElementById('reportTableContainer').style.display = 'block';
    
    // Update summary cards
    document.getElementById('reportTotalPresent').textContent = data.overall_stats.total_present;
    document.getElementById('reportTotalAbsent').textContent = data.overall_stats.total_absent;
    document.getElementById('reportTotalLeave').textContent = data.overall_stats.total_leave;
    document.getElementById('reportAttendancePercentage').textContent = data.overall_stats.attendance_percentage + '%';
    
    // Update period info
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const periodText = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.getElementById('reportPeriod').textContent = periodText;
    document.getElementById('reportTotalDays').textContent = data.total_days;
    
    // Populate table
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    data.teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #e2e8f0';
        
        // Determine attendance color
        let percentageColor = '#48bb78'; // green
        if (teacher.attendance_percentage < 75) {
            percentageColor = '#f56565'; // red
        } else if (teacher.attendance_percentage < 85) {
            percentageColor = '#ed8936'; // orange
        }
        
        row.innerHTML = `
            <td style="padding: 12px; color: #4a5568;">${teacher.teacher_id}</td>
            <td style="padding: 12px; font-weight: 600; color: #2d3748;">${teacher.name}</td>
            <td style="padding: 12px; color: #4a5568;">${teacher.subject}</td>
            <td style="padding: 12px;"><span style="background: #e6f4ff; color: #0066cc; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${teacher.department}</span></td>
            <td style="padding: 12px; text-align: center; color: #48bb78; font-weight: 600;">${teacher.present}</td>
            <td style="padding: 12px; text-align: center; color: #f56565; font-weight: 600;">${teacher.absent}</td>
            <td style="padding: 12px; text-align: center; color: #4299e1; font-weight: 600;">${teacher.leave}</td>
            <td style="padding: 12px; text-align: center; color: #a0aec0; font-weight: 600;">${teacher.not_marked}</td>
            <td style="padding: 12px; text-align: center;"><span style="background: ${percentageColor}20; color: ${percentageColor}; padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 13px;">${teacher.attendance_percentage}%</span></td>
        `;
        tbody.appendChild(row);
    });
}

function exportReport() {
    if (!currentReportData) {
        alert('⚠️ No report data available. Please generate a report first.');
        return;
    }
    
    try {
        // Prepare CSV data
        const csvRows = [];
        
        // Add header with report info
        csvRows.push(['Teacher Attendance Report']);
        csvRows.push([`Period: ${currentReportData.start_date} to ${currentReportData.end_date}`]);
        csvRows.push([`Total Days: ${currentReportData.total_days}`]);
        csvRows.push([`Generated: ${new Date().toLocaleString()}`]);
        csvRows.push([]); // Empty row
        
        // Add overall statistics
        csvRows.push(['Overall Statistics']);
        csvRows.push(['Total Teachers', currentReportData.overall_stats.total_teachers]);
        csvRows.push(['Total Present', currentReportData.overall_stats.total_present]);
        csvRows.push(['Total Absent', currentReportData.overall_stats.total_absent]);
        csvRows.push(['Total Leave', currentReportData.overall_stats.total_leave]);
        csvRows.push(['Total Not Marked', currentReportData.overall_stats.total_not_marked]);
        csvRows.push(['Overall Attendance %', currentReportData.overall_stats.attendance_percentage + '%']);
        csvRows.push([]); // Empty row
        
        // Add table headers
        csvRows.push([
            'Teacher ID',
            'Name',
            'Subject',
            'Department',
            'Present Days',
            'Absent Days',
            'Leave Days',
            'Not Marked Days',
            'Total Days',
            'Attendance %'
        ]);
        
        // Add teacher data
        currentReportData.teachers.forEach(teacher => {
            csvRows.push([
                teacher.teacher_id,
                teacher.name,
                teacher.subject,
                teacher.department,
                teacher.present,
                teacher.absent,
                teacher.leave,
                teacher.not_marked,
                teacher.total_days,
                teacher.attendance_percentage + '%'
            ]);
        });
        
        // Convert to CSV string
        const csvContent = csvRows.map(row => {
            return row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma or quote
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return '"' + cellStr.replace(/"/g, '""') + '"';
                }
                return cellStr;
            }).join(',');
        }).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const filename = `Teacher_Attendance_Report_${currentReportData.start_date}_to_${currentReportData.end_date}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Report exported successfully');
            
            // Show success message
            const exportBtn = document.getElementById('exportReportBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-check"></i> Exported!';
            exportBtn.style.background = '#38a169';
            
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
                exportBtn.style.background = '#48bb78';
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error exporting report:', error);
        alert('Failed to export report: ' + error.message);
    }
}

function printReport() {
    window.print();
}
