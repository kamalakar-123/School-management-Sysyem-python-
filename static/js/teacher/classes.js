// Teacher Classes Page JavaScript

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Teacher Classes Page Loaded');
    
    // Load teacher info
    loadTeacherInfo();
    
    // Set current date
    setCurrentDate();
    
    // Load classes data
    loadClasses();
    
    // Setup event listeners
    setupEventListeners();
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
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// ============================================
// LOAD CLASSES DATA
// ============================================

async function loadClasses() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const classesGrid = document.getElementById('classesGrid');
    const emptyState = document.getElementById('emptyState');
    
    try {
        console.log('📚 Loading classes...');
        
        const response = await fetch('/api/teacher/classes');
        
        if (!response.ok) {
            throw new Error('Failed to load classes');
        }
        
        const data = await response.json();
        console.log('✅ Classes loaded:', data);
        
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
        
        if (data.classes && data.classes.length > 0) {
            // Display classes
            displayClasses(data.classes);
            emptyState.style.display = 'none';
        } else {
            // Show empty state
            classesGrid.innerHTML = '';
            emptyState.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Error loading classes:', error);
        loadingOverlay.style.display = 'none';
        
        // Show sample data on error
        displaySampleClasses();
    }
}

// ============================================
// DISPLAY CLASSES
// ============================================

function displayClasses(classes) {
    const classesGrid = document.getElementById('classesGrid');
    classesGrid.innerHTML = '';
    
    classes.forEach((classItem, index) => {
        const card = createClassCard(classItem, index);
        classesGrid.appendChild(card);
    });
}

// ============================================
// CREATE CLASS CARD
// ============================================

function createClassCard(classData, index) {
    const card = document.createElement('div');
    card.className = `class-card grade-${classData.class_name.replace(/[^0-9]/g, '')}`;
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', index * 100);
    
    card.innerHTML = `
        <div class="class-header">
            <div class="class-info">
                <h3>${classData.class_name}</h3>
                <p class="class-subject">${classData.subject}</p>
            </div>
            <div class="class-icon">
                <i class="fas ${getSubjectIcon(classData.subject)}"></i>
            </div>
        </div>
        
        <div class="class-stats">
            <div class="stat-item">
                <div class="stat-value">${classData.total_students}</div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${classData.attendance_rate}%</div>
                <div class="stat-label">Attendance</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${classData.avg_grade || 'N/A'}</div>
                <div class="stat-label">Avg Grade</div>
            </div>
        </div>
        
        <div class="class-footer">
            <div class="class-time">
                <i class="fas fa-clock"></i>
                <span>${classData.schedule || 'Schedule TBA'}</span>
            </div>
            <button class="view-btn" onclick="viewClassDetails('${classData.class_name}')">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

// ============================================
// GET SUBJECT ICON
// ============================================

function getSubjectIcon(subject) {
    const icons = {
        'Mathematics': 'fa-calculator',
        'Science': 'fa-flask',
        'English': 'fa-book',
        'History': 'fa-landmark',
        'Geography': 'fa-globe',
        'Physics': 'fa-atom',
        'Chemistry': 'fa-vial',
        'Biology': 'fa-dna',
        'Computer Science': 'fa-laptop-code',
        'Physical Education': 'fa-running',
        'Art': 'fa-palette',
        'Music': 'fa-music'
    };
    
    return icons[subject] || 'fa-book';
}

// ============================================
// DISPLAY SAMPLE CLASSES (FALLBACK)
// ============================================

function displaySampleClasses() {
    const sampleClasses = [
        {
            class_name: 'Grade 10-A',
            subject: 'Mathematics',
            total_students: 35,
            attendance_rate: 92,
            avg_grade: 'B+',
            schedule: 'Mon, Wed, Fri - 9:00 AM'
        },
        {
            class_name: 'Grade 10-B',
            subject: 'Mathematics',
            total_students: 32,
            attendance_rate: 88,
            avg_grade: 'B',
            schedule: 'Tue, Thu - 10:00 AM'
        },
        {
            class_name: 'Grade 11-A',
            subject: 'Physics',
            total_students: 28,
            attendance_rate: 95,
            avg_grade: 'A-',
            schedule: 'Mon, Wed - 11:00 AM'
        },
        {
            class_name: 'Grade 12-A',
            subject: 'Computer Science',
            total_students: 30,
            attendance_rate: 90,
            avg_grade: 'A',
            schedule: 'Tue, Thu, Fri - 2:00 PM'
        }
    ];
    
    displayClasses(sampleClasses);
}

// ============================================
// VIEW CLASS DETAILS
// ============================================

function viewClassDetails(className) {
    const modal = document.getElementById('classModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `${className} - Details`;
    modalBody.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <i class="fas fa-spinner fa-spin fa-3x" style="color: #667eea;"></i>
            <p style="margin-top: 15px; color: #718096;">Loading class details...</p>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Simulate loading details
    setTimeout(() => {
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 10px;">Class Schedule</h3>
                <p style="color: #718096;">Monday, Wednesday, Friday - 9:00 AM to 10:30 AM</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 10px;">Recent Activity</h3>
                <ul style="color: #718096; line-height: 2;">
                    <li>Attendance marked for today</li>
                    <li>3 assignments pending review</li>
                    <li>Mid-term exam scheduled for next week</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="window.location.href='/teacher/attendance'" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-clipboard-check"></i> Mark Attendance
                </button>
                <button onclick="window.location.href='/teacher/assignments'" style="flex: 1; padding: 12px; background: #f7fafc; color: #667eea; border: 2px solid #667eea; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-tasks"></i> View Assignments
                </button>
            </div>
        `;
    }, 1000);
}

// ============================================
// CLOSE MODAL
// ============================================

function closeModal() {
    const modal = document.getElementById('classModal');
    modal.classList.remove('active');
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterClasses(this.getAttribute('data-filter'));
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        searchClasses(this.value);
    });
    
    // Add class button
    const addClassBtn = document.getElementById('addClassBtn');
    addClassBtn.addEventListener('click', () => {
        alert('Add class feature coming soon!');
    });
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Close modal on outside click
    const modal = document.getElementById('classModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// ============================================
// FILTER CLASSES
// ============================================

function filterClasses(filter) {
    const cards = document.querySelectorAll('.class-card');
    
    cards.forEach(card => {
        switch(filter) {
            case 'all':
                card.style.display = 'block';
                break;
            case 'today':
                // Show only today's classes (you can enhance this logic)
                card.style.display = 'block';
                break;
            case 'upcoming':
                // Show upcoming classes
                card.style.display = 'block';
                break;
        }
    });
}

// ============================================
// SEARCH CLASSES
// ============================================

function searchClasses(query) {
    const cards = document.querySelectorAll('.class-card');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(lowerQuery) ? 'block' : 'none';
    });
}

// ============================================
// TOGGLE SIDEBAR (MOBILE)
// ============================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c📚 My Classes', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cTeacher Portal - Classes Management', 'color: #718096; font-size: 14px;');
