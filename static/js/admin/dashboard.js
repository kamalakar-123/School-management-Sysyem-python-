/* ============================================
   SCHOOL MANAGEMENT DASHBOARD - JAVASCRIPT
   Dynamic Data Loading & Animations
   ============================================ */

// ==================== GLOBAL VARIABLES ====================
let attendanceChart = null;
let performanceChart = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 School Management Dashboard Initialized');
    
    // Initialize all components
    initializeDate();
    initializeSidebar();
    loadDashboardStats();
    loadAttendanceChart();
    loadPerformanceChart();
    loadSmartAlerts();
    
    // Setup refresh button
    document.getElementById('refreshAlerts').addEventListener('click', loadSmartAlerts);
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

// ==================== LOAD DASHBOARD STATISTICS ====================
async function loadDashboardStats() {
    try {
        console.log('📊 Loading dashboard statistics...');
        
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        console.log('✅ Stats loaded:', data);
        
        // Animate counter for Total Students
        animateCounter('totalStudents', 0, data.total_students, 1500);
        
        // Animate counter for Total Teachers
        animateCounter('totalTeachers', 0, data.total_teachers, 1500);
        
        // Animate counter for Attendance Percentage
        animateCounter('attendancePercentage', 0, data.attendance_percentage, 1500, '%');
        
        // Update attendance icon color based on status
        updateStatusColor('attendanceIcon', data.attendance_status);
        updateStatusChange('attendanceChange', data.attendance_status, data.attendance_percentage);
        
        // Animate counter for Pending Fees
        animateCounter('pendingFees', 0, data.pending_fees_count, 1500);
        
        // Update fees icon color based on status
        updateStatusColor('feesIcon', data.fees_status);
        updateFeesChange('feesChange', data.fees_status, data.pending_fees_count);
        
        // Animate counter for Upcoming Exams
        animateCounter('upcomingExams', 0, data.upcoming_exams, 1500);
        
        // Update notification badge
        const totalAlerts = (data.attendance_percentage < 75 ? 1 : 0) + 
                           (data.pending_fees_count > 0 ? 1 : 0) + 
                           data.upcoming_exams;
        document.getElementById('notificationBadge').textContent = totalAlerts;
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
    }
}

// ==================== ANIMATED COUNTER ====================
function animateCounter(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

// ==================== UPDATE STATUS COLORS ====================
function updateStatusColor(elementId, status) {
    const element = document.getElementById(elementId);
    
    // Remove existing status classes
    element.classList.remove('success', 'warning', 'danger');
    
    // Add new status class
    element.classList.add(status);
}

function updateStatusChange(elementId, status, percentage) {
    const element = document.getElementById(elementId);
    
    // Remove existing status classes
    element.classList.remove('positive', 'negative', 'neutral');
    
    let icon = '';
    let text = '';
    let colorClass = '';
    
    if (percentage >= 90) {
        icon = 'fa-arrow-up';
        text = 'Excellent attendance!';
        colorClass = 'positive';
    } else if (percentage >= 75) {
        icon = 'fa-check';
        text = 'Good attendance';
        colorClass = 'positive';
    } else {
        icon = 'fa-arrow-down';
        text = 'Low attendance warning';
        colorClass = 'negative';
    }
    
    element.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${text}</span>
    `;
    element.classList.add(colorClass);
}

function updateFeesChange(elementId, status, count) {
    const element = document.getElementById(elementId);
    
    // Remove existing status classes
    element.classList.remove('positive', 'negative', 'neutral');
    
    let icon = '';
    let text = '';
    let colorClass = '';
    
    if (count === 0) {
        icon = 'fa-check-circle';
        text = 'All fees cleared!';
        colorClass = 'positive';
    } else if (count <= 3) {
        icon = 'fa-exclamation-triangle';
        text = `${count} students with dues`;
        colorClass = 'neutral';
    } else {
        icon = 'fa-exclamation-circle';
        text = `${count} students with dues`;
        colorClass = 'negative';
    }
    
    element.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${text}</span>
    `;
    element.classList.add(colorClass);
}

// ==================== LOAD ATTENDANCE CHART ====================
async function loadAttendanceChart() {
    try {
        console.log('📈 Loading attendance chart...');
        
        const response = await fetch('/api/attendance-data');
        const data = await response.json();
        
        console.log('✅ Attendance data loaded:', data);
        
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (attendanceChart) {
            attendanceChart.destroy();
        }
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
        
        attendanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Attendance %',
                    data: data.data,
                    borderColor: '#38BDF8',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#38BDF8',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#0EA5E9',
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart',
                    delay: (context) => {
                        return context.dataIndex * 100;
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Attendance: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading attendance chart:', error);
    }
}

// ==================== LOAD PERFORMANCE CHART ====================
async function loadPerformanceChart() {
    try {
        console.log('📊 Loading performance chart...');
        
        const response = await fetch('/api/performance-data');
        const data = await response.json();
        
        console.log('✅ Performance data loaded:', data);
        
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (performanceChart) {
            performanceChart.destroy();
        }
        
        // Generate gradient colors for each bar
        const gradientColors = data.data.map((value, index) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            
            if (value >= 85) {
                gradient.addColorStop(0, '#10B981');
                gradient.addColorStop(1, '#34D399');
            } else if (value >= 75) {
                gradient.addColorStop(0, '#38BDF8');
                gradient.addColorStop(1, '#60A5FA');
            } else {
                gradient.addColorStop(0, '#F59E0B');
                gradient.addColorStop(1, '#FBBF24');
            }
            
            return gradient;
        });
        
        performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Average Performance %',
                    data: data.data,
                    backgroundColor: gradientColors,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart',
                    delay: (context) => {
                        return context.dataIndex * 150;
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                let grade = '';
                                
                                if (value >= 90) grade = 'A+';
                                else if (value >= 85) grade = 'A';
                                else if (value >= 75) grade = 'B+';
                                else if (value >= 65) grade = 'B';
                                else grade = 'C';
                                
                                return `Performance: ${value}% (Grade: ${grade})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading performance chart:', error);
    }
}

// ==================== LOAD SMART ALERTS ====================
async function loadSmartAlerts() {
    try {
        console.log('🔔 Loading smart alerts...');
        
        const alertsContainer = document.getElementById('alertsContainer');
        const notificationBadge = document.getElementById('notificationBadge');
        
        // Show loading state
        alertsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading alerts...</p>
            </div>
        `;
        
        const response = await fetch('/api/alerts');
        const data = await response.json();
        
        console.log('✅ Alerts loaded:', data);
        
        // Update notification badge
        notificationBadge.textContent = data.total;
        
        // Clear loading state
        alertsContainer.innerHTML = '';
        
        if (data.alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="alert-item success">
                    <div class="alert-icon">🎉</div>
                    <div class="alert-content">
                        <h4 class="alert-title">All Clear!</h4>
                        <p class="alert-message">No alerts at the moment. Everything is running smoothly.</p>
                        <span class="alert-time">Just now</span>
                    </div>
                </div>
            `;
        } else {
            // Render alerts
            data.alerts.forEach((alert, index) => {
                const alertElement = createAlertElement(alert, index);
                alertsContainer.appendChild(alertElement);
            });
        }
        
    } catch (error) {
        console.error('❌ Error loading alerts:', error);
        
        const alertsContainer = document.getElementById('alertsContainer');
        alertsContainer.innerHTML = `
            <div class="alert-item danger">
                <div class="alert-icon">❌</div>
                <div class="alert-content">
                    <h4 class="alert-title">Error Loading Alerts</h4>
                    <p class="alert-message">Unable to fetch alerts. Please try again.</p>
                    <span class="alert-time">Just now</span>
                </div>
            </div>
        `;
    }
}

// ==================== CREATE ALERT ELEMENT ====================
function createAlertElement(alert, index) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${alert.type}`;
    alertDiv.style.animationDelay = `${index * 0.1}s`;
    
    alertDiv.innerHTML = `
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-content">
            <h4 class="alert-title">${alert.title}</h4>
            <p class="alert-message">${alert.message}</p>
            <span class="alert-time">${alert.time}</span>
        </div>
        <button class="alert-dismiss" onclick="dismissAlert(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return alertDiv;
}

// ==================== DISMISS ALERT ====================
function dismissAlert(button) {
    const alertItem = button.closest('.alert-item');
    
    // Add fade-out animation
    alertItem.style.animation = 'slideOutRight 0.5s ease forwards';
    
    // Remove element after animation
    setTimeout(() => {
        alertItem.remove();
        
        // Update notification badge
        const alertsContainer = document.getElementById('alertsContainer');
        const remainingAlerts = alertsContainer.querySelectorAll('.alert-item').length;
        document.getElementById('notificationBadge').textContent = remainingAlerts;
        
        // If no alerts left, show success message
        if (remainingAlerts === 0) {
            alertsContainer.innerHTML = `
                <div class="alert-item success">
                    <div class="alert-icon">🎉</div>
                    <div class="alert-content">
                        <h4 class="alert-title">All Clear!</h4>
                        <p class="alert-message">No alerts at the moment. Everything is running smoothly.</p>
                        <span class="alert-time">Just now</span>
                    </div>
                </div>
            `;
        }
    }, 500);
}

// ==================== SLIDE OUT ANIMATION ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// ==================== AUTO REFRESH (Every 30 seconds) ====================
setInterval(() => {
    console.log('🔄 Auto-refreshing dashboard data...');
    loadDashboardStats();
    loadAttendanceChart();
    loadPerformanceChart();
    loadSmartAlerts();
}, 30000);

console.log('✅ Dashboard JavaScript loaded successfully!');
