// Teacher Dashboard JavaScript

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Teacher Dashboard Loaded');
    
    // Load teacher info from localStorage
    loadTeacherInfo();
    
    // Set current date
    setCurrentDate();
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading overlay after data loads
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 1500);
});

// ============================================
// LOAD TEACHER INFORMATION
// ============================================

function loadTeacherInfo() {
    const teacherName = localStorage.getItem('teacherName') || 'Teacher';
    const teacherId = localStorage.getItem('teacherId') || '';
    
    // Update UI with teacher name
    document.getElementById('teacherName').textContent = teacherName;
    document.getElementById('welcomeName').textContent = teacherName;
    
    console.log(`👤 Logged in as: ${teacherName} (${teacherId})`);
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
// LOAD DASHBOARD STATISTICS
// ============================================

async function loadDashboardStats() {
    try {
        console.log('📊 Loading dashboard statistics...');
        
        const response = await fetch('/api/teacher/stats');
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const data = await response.json();
        console.log('✅ Statistics loaded:', data);
        
        // Update stat cards with animation
        updateStatCard('totalClasses', data.total_classes, 0);
        updateStatCard('totalStudents', data.total_students, 100);
        updateStatCard('attendancePercentage', data.attendance_percentage + '%', 200);
        updateStatCard('pendingAssignments', data.pending_assignments, 300);
        updateStatCard('newMessages', data.new_messages, 400);
        
        // Update notification badge
        const totalNotifications = data.pending_assignments + data.new_messages;
        document.getElementById('notificationBadge').textContent = totalNotifications;
        
        // Update attendance status color
        updateAttendanceStatus(data.attendance_percentage);
        
    } catch (error) {
        console.error('❌ Error loading statistics:', error);
        
        // Show default values on error
        updateStatCard('totalClasses', 0, 0);
        updateStatCard('totalStudents', 0, 0);
        updateStatCard('attendancePercentage', '0%', 0);
        updateStatCard('pendingAssignments', 0, 0);
        updateStatCard('newMessages', 0, 0);
    }
}

// ============================================
// UPDATE STAT CARD WITH ANIMATION
// ============================================

function updateStatCard(elementId, value, delay) {
    setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
            // Animate counting up for numbers
            if (typeof value === 'number' || (typeof value === 'string' && value.includes('%'))) {
                const numericValue = parseInt(value);
                animateValue(element, 0, numericValue, 1000, value.includes('%'));
            } else {
                element.textContent = value;
            }
        }
    }, delay);
}

// ============================================
// ANIMATE NUMBER COUNTING
// ============================================

function animateValue(element, start, end, duration, isPercentage = false) {
    const startTime = Date.now();
    
    function update() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(start + (end - start) * progress);
        element.textContent = isPercentage ? currentValue + '%' : currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// ============================================
// UPDATE ATTENDANCE STATUS COLOR
// ============================================

function updateAttendanceStatus(percentage) {
    const changeElement = document.getElementById('attendanceChange');
    const icon = changeElement.querySelector('i');
    
    if (percentage >= 90) {
        changeElement.className = 'stat-change positive';
        icon.className = 'fas fa-arrow-up';
        changeElement.querySelector('span').textContent = 'Excellent rate';
    } else if (percentage >= 75) {
        changeElement.className = 'stat-change neutral';
        icon.className = 'fas fa-minus';
        changeElement.querySelector('span').textContent = 'Good rate';
    } else {
        changeElement.className = 'stat-change negative';
        icon.className = 'fas fa-arrow-down';
        changeElement.querySelector('span').textContent = 'Needs attention';
    }
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }
    
    // Refresh stats every 5 minutes
    setInterval(loadDashboardStats, 5 * 60 * 1000);
}

// ============================================
// TOGGLE SIDEBAR (MOBILE)
// ============================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ============================================
// SHOW NOTIFICATIONS
// ============================================

function showNotifications() {
    alert('Notifications feature coming soon!');
}

// ============================================
// UTILITY: FORMAT DATE
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c🎓 Teacher Dashboard', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to the School Management System', 'color: #718096; font-size: 14px;');
