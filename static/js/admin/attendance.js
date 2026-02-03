/* ============================================
   ATTENDANCE PAGE - JAVASCRIPT
   ============================================ */

// ==================== GLOBAL VARIABLES ====================
let allStudents = [];
let filteredStudents = [];
let attendanceChart = null;
let currentFilter = 'all'; // Track current filter status

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Attendance Page Initialized');
    
    initializeDate();
    initializeSidebar();
    loadClasses();
    loadAttendanceData();
    loadAttendanceTrendChart();
    setupEventListeners();
    initializeReportSection();
});

// ==================== DATE DISPLAY ====================
function initializeDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
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
    // Table-specific search input
    const tableSearchInput = document.getElementById('tableSearchInput');
    const clearTableSearch = document.getElementById('clearTableSearch');
    
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            // Show/hide clear button
            if (query.length > 0) {
                clearTableSearch.style.display = 'flex';
            } else {
                clearTableSearch.style.display = 'none';
            }
            
            // Perform search
            applyAllTableFilters();
        });
    }
    
    // Clear table search button
    if (clearTableSearch) {
        clearTableSearch.addEventListener('click', function() {
            tableSearchInput.value = '';
            clearTableSearch.style.display = 'none';
            applyAllTableFilters();
        });
    }
    
    // Show/Hide Table Toggle
    const toggleTableBtn = document.getElementById('toggleTableBtn');
    const tableWrapper = document.getElementById('attendanceTableWrapper');
    const tableControls = document.getElementById('tableControls');
    
    if (toggleTableBtn && tableWrapper) {
        toggleTableBtn.addEventListener('click', function() {
            if (tableWrapper.style.display === 'none') {
                // Show table and controls
                tableWrapper.style.display = 'block';
                tableControls.style.display = 'flex';
                toggleTableBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                toggleTableBtn.title = 'Hide Table';
                
                // Initialize date filter to today if not set
                const tableDateFilter = document.getElementById('tableDateFilter');
                if (tableDateFilter && !tableDateFilter.value) {
                    tableDateFilter.value = new Date().toISOString().split('T')[0];
                }
                
                // Update record count when showing table
                updateTableRecordCount(filteredStudents.length);
            } else {
                // Hide table and controls
                tableWrapper.style.display = 'none';
                tableControls.style.display = 'none';
                toggleTableBtn.innerHTML = '<i class="fas fa-eye"></i>';
                toggleTableBtn.title = 'Show Table';
            }
        });
    }
    
    // Table Class Filter
    const tableClassFilter = document.getElementById('tableClassFilter');
    if (tableClassFilter) {
        tableClassFilter.addEventListener('change', function(e) {
            const selectedClass = e.target.value;
            applyAllTableFilters();
        });
    }
    
    // Table Status Filter
    const tableStatusFilter = document.getElementById('tableStatusFilter');
    if (tableStatusFilter) {
        tableStatusFilter.addEventListener('change', function(e) {
            applyAllTableFilters();
        });
    }
    
    // Table Date Filter
    const tableDateFilter = document.getElementById('tableDateFilter');
    if (tableDateFilter) {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        tableDateFilter.value = today;
        
        tableDateFilter.addEventListener('change', function(e) {
            applyAllTableFilters();
        });
    }
    
    // Table Sort Filter
    const tableSortFilter = document.getElementById('tableSortFilter');
    if (tableSortFilter) {
        tableSortFilter.addEventListener('change', function(e) {
            applyAllTableFilters();
        });
    }
    
    // Clear All Filters Button
    const clearAllFilters = document.getElementById('clearAllFilters');
    if (clearAllFilters) {
        clearAllFilters.addEventListener('click', function() {
            // Reset all filters
            if (tableClassFilter) tableClassFilter.value = 'all';
            if (tableStatusFilter) tableStatusFilter.value = 'all';
            if (tableDateFilter) tableDateFilter.value = new Date().toISOString().split('T')[0];
            if (tableSortFilter) tableSortFilter.value = 'rollno';
            if (tableSearchInput) tableSearchInput.value = '';
            if (clearTableSearch) clearTableSearch.style.display = 'none';
            
            // Apply filters
            applyAllTableFilters();
        });
    }
    
    // Refresh Table Button
    const refreshTable = document.getElementById('refreshTable');
    if (refreshTable) {
        refreshTable.addEventListener('click', function() {
            this.querySelector('i').classList.add('fa-spin');
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
            }, 1000);
            
            // Reset table filters and reload
            const tableClassFilter = document.getElementById('tableClassFilter');
            const tableStatusFilter = document.getElementById('tableStatusFilter');
            const tableDateFilter = document.getElementById('tableDateFilter');
            const tableSortFilter = document.getElementById('tableSortFilter');
            const tableSearchInput = document.getElementById('tableSearchInput');
            const clearTableSearch = document.getElementById('clearTableSearch');
            
            if (tableClassFilter) tableClassFilter.value = 'all';
            if (tableStatusFilter) tableStatusFilter.value = 'all';
            if (tableDateFilter) tableDateFilter.value = new Date().toISOString().split('T')[0];
            if (tableSortFilter) tableSortFilter.value = 'rollno';
            if (tableSearchInput) tableSearchInput.value = '';
            if (clearTableSearch) clearTableSearch.style.display = 'none';
            
            // Re-render with current filtered students
            applyAllTableFilters();
        });
    }
    
    // Table Class Filter
    const applyChartFilters = document.getElementById('applyChartFilters');
    const resetChartFilters = document.getElementById('resetChartFilters');
    
    if (applyChartFilters) {
        applyChartFilters.addEventListener('click', function() {
            const classFilter = document.getElementById('chartClassFilter').value;
            const monthFilter = document.getElementById('chartMonthFilter').value;
            const yearFilter = document.getElementById('chartYearFilter').value;
            
            console.log('📊 Applying chart filters:', { classFilter, monthFilter, yearFilter });
            loadAttendanceTrendChart(classFilter, monthFilter, yearFilter);
        });
    }
    
    if (resetChartFilters) {
        resetChartFilters.addEventListener('click', function() {
            document.getElementById('chartClassFilter').value = 'all';
            document.getElementById('chartMonthFilter').value = 'current';
            document.getElementById('chartYearFilter').value = 'current';
            
            console.log('🔄 Resetting chart filters');
            loadAttendanceTrendChart('all', 'current', 'current');
        });
    }
}

// ==================== LOAD CLASSES FOR FILTER ====================
async function loadClasses() {
    try {
        console.log('📚 Loading classes...');
        
        const response = await fetch('/api/classes');
        const data = await response.json();
        
        console.log('✅ Classes loaded:', data);
        
        const chartClassFilter = document.getElementById('chartClassFilter');
        const tableClassFilter = document.getElementById('tableClassFilter');
        
        // Add class options to chart filter
        if (chartClassFilter) {
            data.classes.forEach(className => {
                const chartOption = document.createElement('option');
                chartOption.value = className;
                chartOption.textContent = className;
                chartClassFilter.appendChild(chartOption);
            });
        }
        
        // Add class options to table filter
        if (tableClassFilter) {
            data.classes.forEach(className => {
                const tableOption = document.createElement('option');
                tableOption.value = className;
                tableOption.textContent = className;
                tableClassFilter.appendChild(tableOption);
            });
        }
        
    } catch (error) {
        console.error('❌ Error loading classes:', error);
    }
}

// ==================== LOAD ATTENDANCE DATA ====================
async function loadAttendanceData() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        
        // Store all students
        allStudents = data.students;
        filteredStudents = [...allStudents];
        
        const present = allStudents.filter(s => s.attendance_status === 'present').length;
        const absent = allStudents.filter(s => s.attendance_status === 'absent').length;
        const total = allStudents.length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
        
        document.getElementById('presentCount').textContent = present;
        document.getElementById('absentCount').textContent = absent;
        document.getElementById('attendanceRate').textContent = rate + '%';
        document.getElementById('showingCount').textContent = total;
        
        renderAttendanceTable(filteredStudents);
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        hideLoadingOverlay();
    }
}

// ==================== LOAD ATTENDANCE TREND CHART ====================
async function loadAttendanceTrendChart(classFilter = 'all', monthFilter = 'current', yearFilter = 'current') {
    try {
        const response = await fetch('/api/attendance-data');
        const data = await response.json();
        
        // Apply filters to data
        let filteredData = applyChartFilters(data, classFilter, monthFilter, yearFilter);
        
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.attendanceChart instanceof Chart) {
            window.attendanceChart.destroy();
        }
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(66, 153, 225, 0.6)');
        gradient.addColorStop(1, 'rgba(66, 153, 225, 0.05)');
        
        window.attendanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredData.labels,
                datasets: [{
                    label: 'Attendance Percentage',
                    data: filteredData.data,
                    backgroundColor: gradient,
                    borderColor: '#4299e1',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4299e1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 3,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            family: "'Inter', sans-serif"
                        },
                        bodyFont: {
                            size: 13,
                            family: "'Inter', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
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
                                size: 11,
                                family: "'Inter', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11,
                                family: "'Inter', sans-serif"
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('📊 Chart loaded with filters:', { classFilter, monthFilter, yearFilter });
        
    } catch (error) {
        console.error('❌ Error loading attendance chart:', error);
    }
}

// ==================== APPLY CHART FILTERS ====================
function applyChartFilters(data, classFilter, monthFilter, yearFilter) {
    // For demo purposes, generate filtered data
    // In production, this would be handled by a backend API
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    let labels = [];
    let chartData = [];
    
    // Determine date range based on filters
    if (monthFilter === 'current' && yearFilter === 'current') {
        // Last 7 days (default)
        labels = data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        chartData = data.data || [85, 88, 82, 90, 87, 75, 80];
    } else if (monthFilter !== 'current' && yearFilter !== 'current') {
        // Specific month and year - show monthly data (30 days)
        const month = parseInt(monthFilter);
        const year = parseInt(yearFilter);
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Generate daily labels for the month
        for (let day = 1; day <= Math.min(daysInMonth, 30); day++) {
            labels.push(day.toString());
            // Generate random attendance data between 75-95%
            chartData.push(Math.floor(Math.random() * 20) + 75);
        }
    } else if (monthFilter !== 'current') {
        // Specific month, current year - show monthly data
        const month = parseInt(monthFilter);
        const daysInMonth = new Date(currentYear, month, 0).getDate();
        
        for (let day = 1; day <= Math.min(daysInMonth, 30); day++) {
            labels.push(day.toString());
            chartData.push(Math.floor(Math.random() * 20) + 75);
        }
    } else if (yearFilter !== 'current') {
        // Specific year, current month - show monthly data
        const year = parseInt(yearFilter);
        
        for (let month = 1; month <= 12; month++) {
            labels.push(new Date(year, month - 1).toLocaleString('default', { month: 'short' }));
            chartData.push(Math.floor(Math.random() * 20) + 75);
        }
    }
    
    // If class filter is applied, adjust data slightly
    if (classFilter !== 'all') {
        chartData = chartData.map(val => Math.min(100, val + Math.floor(Math.random() * 10) - 5));
    }
    
    return {
        labels: labels,
        data: chartData
    };
}

// ==================== RENDER ATTENDANCE TABLE ====================
function renderAttendanceTable(students) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p style="font-size: 16px;">No students found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        const statusClass = student.attendance_status === 'present' ? 'badge-success' : 'badge-danger';
        const statusText = student.attendance_status.charAt(0).toUpperCase() + student.attendance_status.slice(1);
        
        row.innerHTML = `
            <td>${student.roll_no}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// ==================== APPLY ALL TABLE FILTERS ====================
function applyAllTableFilters() {
    let results = [...filteredStudents];
    
    // Get all filter values
    const searchQuery = document.getElementById('tableSearchInput')?.value.trim().toLowerCase() || '';
    const classFilter = document.getElementById('tableClassFilter')?.value || 'all';
    const statusFilter = document.getElementById('tableStatusFilter')?.value || 'all';
    const sortBy = document.getElementById('tableSortFilter')?.value || 'rollno';
    
    // Apply search filter
    if (searchQuery) {
        results = results.filter(student => {
            return student.name.toLowerCase().includes(searchQuery) ||
                   student.roll_no.toLowerCase().includes(searchQuery) ||
                   student.class.toLowerCase().includes(searchQuery);
        });
    }
    
    // Apply class filter
    if (classFilter !== 'all') {
        results = results.filter(s => s.class === classFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        results = results.filter(s => s.attendance_status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'class':
                return a.class.localeCompare(b.class);
            case 'status':
                return a.attendance_status.localeCompare(b.attendance_status);
            case 'rollno':
            default:
                return a.roll_no.localeCompare(b.roll_no);
        }
    });
    
    // Update table record count
    updateTableRecordCount(results.length);
    
    // Render table
    renderAttendanceTable(results);
    
    console.log(`🔍 Filters Applied - Found ${results.length} record(s)`);
}

// ==================== PERFORM TABLE SEARCH ====================
function performTableSearch(query) {
    let searchResults = [];
    
    if (!query) {
        // Reset to current filtered students
        searchResults = [...filteredStudents];
    } else {
        // Search in name, roll number, and class
        const searchLower = query.toLowerCase();
        searchResults = filteredStudents.filter(student => {
            return student.name.toLowerCase().includes(searchLower) ||
                   student.roll_no.toLowerCase().includes(searchLower) ||
                   student.class.toLowerCase().includes(searchLower) ||
                   student.attendance_status.toLowerCase().includes(searchLower);
        });
    }
    
    // Update table record count
    updateTableRecordCount(searchResults.length);
    
    // Re-render table with search results
    renderAttendanceTable(searchResults);
    
    console.log(`🔍 Table Search: "${query}" - Found ${searchResults.length} record(s)`);
}

// ==================== FILTER TABLE BY CLASS ====================
function filterTableByClass(className) {
    let classFiltered = [];
    
    if (className === 'all') {
        classFiltered = [...filteredStudents];
    } else {
        classFiltered = filteredStudents.filter(s => s.class === className);
    }
    
    // Clear table search
    const tableSearchInput = document.getElementById('tableSearchInput');
    const clearTableSearch = document.getElementById('clearTableSearch');
    if (tableSearchInput) {
        tableSearchInput.value = '';
    }
    if (clearTableSearch) {
        clearTableSearch.style.display = 'none';
    }
    
    // Update table record count
    updateTableRecordCount(classFiltered.length);
    
    // Re-render table with class filtered results
    renderAttendanceTable(classFiltered);
    
    console.log(`🔍 Table Class Filter: ${className} - Found ${classFiltered.length} record(s)`);
}

// ==================== UPDATE TABLE RECORD COUNT ====================
function updateTableRecordCount(count) {
    const tableRecordCount = document.getElementById('tableRecordCount');
    if (tableRecordCount) {
        tableRecordCount.textContent = count;
    }
}

// ==================== FILTER BY STATUS (PRESENT/ABSENT/ALL) ====================
function filterByStatus(status) {
    currentFilter = status;
    
    // Remove active class from all cards
    document.getElementById('presentCard').style.transform = 'scale(1)';
    document.getElementById('absentCard').style.transform = 'scale(1)';
    document.getElementById('rateCard').style.transform = 'scale(1)';
    
    document.getElementById('presentCard').style.boxShadow = '';
    document.getElementById('absentCard').style.boxShadow = '';
    document.getElementById('rateCard').style.boxShadow = '';
    
    // Apply filter
    if (status === 'all') {
        filteredStudents = [...allStudents];
        document.getElementById('rateCard').style.transform = 'scale(1.05)';
        document.getElementById('rateCard').style.boxShadow = '0 8px 24px rgba(66, 153, 225, 0.3)';
    } else if (status === 'present') {
        filteredStudents = allStudents.filter(s => s.attendance_status === 'present');
        document.getElementById('presentCard').style.transform = 'scale(1.05)';
        document.getElementById('presentCard').style.boxShadow = '0 8px 24px rgba(72, 187, 120, 0.3)';
    } else if (status === 'absent') {
        filteredStudents = allStudents.filter(s => s.attendance_status === 'absent');
        document.getElementById('absentCard').style.transform = 'scale(1.05)';
        document.getElementById('absentCard').style.boxShadow = '0 8px 24px rgba(245, 101, 101, 0.3)';
    }
    
    // Update showing count and table record count
    updateTableRecordCount(filteredStudents.length);
    
    // Re-render table with animation
    const tbody = document.getElementById('attendanceTableBody');
    tbody.style.opacity = '0.5';
    
    setTimeout(() => {
        renderAttendanceTable(filteredStudents);
        tbody.style.opacity = '1';
    }, 150);
    
    // Update table title
    const tableTitle = document.querySelector('.table-title span');
    if (status === 'present') {
        tableTitle.textContent = 'Present Students Today';
    } else if (status === 'absent') {
        tableTitle.textContent = 'Absent Students Today';
    } else {
        tableTitle.textContent = "Today's Attendance Records";
    }
    
    console.log(`👆 Clicked: ${status} - Showing ${filteredStudents.length} student(s)`);
}

// ==================== HIDE LOADING OVERLAY ====================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        }, 500);
    }
}

// ==================== INITIALIZE REPORT SECTION ====================
function initializeReportSection() {
    // Set default month to current month
    const reportMonth = document.getElementById('reportMonth');
    if (reportMonth) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        reportMonth.value = `${year}-${month}`;
    }
    
    // Toggle report visibility
    const toggleReportBtn = document.getElementById('toggleReportBtn');
    const reportFilters = document.getElementById('reportFilters');
    const reportStats = document.getElementById('reportStats');
    
    if (toggleReportBtn) {
        toggleReportBtn.addEventListener('click', function() {
            const isVisible = reportFilters.style.display !== 'none';
            
            if (isVisible) {
                reportFilters.style.display = 'none';
                reportStats.style.display = 'none';
                toggleReportBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                toggleReportBtn.title = 'Show Report';
            } else {
                reportFilters.style.display = 'flex';
                if (reportStats.querySelector('tbody').children.length > 0) {
                    reportStats.style.display = 'block';
                }
                toggleReportBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                toggleReportBtn.title = 'Hide Report';
            }
        });
    }
    
    // Generate Report button
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateAttendanceReport);
    }
    
    // Load classes for report filter
    loadReportClasses();
}

// ==================== LOAD CLASSES FOR REPORT ====================
async function loadReportClasses() {
    try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        
        const reportClassFilter = document.getElementById('reportClassFilter');
        
        if (reportClassFilter) {
            data.classes.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                reportClassFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Error loading report classes:', error);
    }
}

// ==================== GENERATE ATTENDANCE REPORT ====================
function generateAttendanceReport() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = document.getElementById('reportMonth').value;
    const reportClass = document.getElementById('reportClassFilter').value;
    
    console.log('📊 Generating report:', { reportType, reportMonth, reportClass });
    
    // Filter students by class if needed
    let reportData = reportClass === 'all' ? [...allStudents] : allStudents.filter(s => s.class === reportClass);
    
    // Calculate mock statistics (in production, this would come from backend)
    const totalDays = 28; // Mock days in month
    const totalPresent = Math.floor(reportData.length * totalDays * 0.85); // 85% avg attendance
    const totalAbsent = (reportData.length * totalDays) - totalPresent;
    const avgAttendance = ((totalPresent / (reportData.length * totalDays)) * 100).toFixed(2);
    
    // Update statistics
    document.getElementById('reportPresentCount').textContent = totalPresent;
    document.getElementById('reportAbsentCount').textContent = totalAbsent;
    document.getElementById('reportTotalDays').textContent = totalDays;
    document.getElementById('reportAvgAttendance').textContent = avgAttendance + '%';
    
    // Update report period
    const [year, month] = reportMonth.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const periodText = `${monthNames[parseInt(month) - 1]} ${year}`;
    document.getElementById('reportPeriod').textContent = periodText;
    document.getElementById('reportDaysCount').textContent = totalDays;
    
    // Generate table data
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    reportData.forEach(student => {
        const presentDays = Math.floor(totalDays * (0.70 + Math.random() * 0.30)); // Random 70-100%
        const absentDays = totalDays - presentDays;
        const attendance = ((presentDays / totalDays) * 100).toFixed(2);
        
        // Determine color based on attendance percentage
        let attendanceColor, attendanceBg, attendanceIcon;
        if (attendance >= 85) {
            attendanceColor = '#10b981'; // Green
            attendanceBg = '#d1fae5';
            attendanceIcon = 'fa-check-circle';
        } else if (attendance >= 75) {
            attendanceColor = '#f59e0b'; // Yellow/Orange
            attendanceBg = '#fef3c7';
            attendanceIcon = 'fa-exclamation-circle';
        } else if (attendance >= 60) {
            attendanceColor = '#f97316'; // Orange
            attendanceBg = '#ffedd5';
            attendanceIcon = 'fa-exclamation-triangle';
        } else {
            attendanceColor = '#ef4444'; // Red
            attendanceBg = '#fee2e2';
            attendanceIcon = 'fa-times-circle';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.roll_no}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td><span class="badge badge-success">${presentDays}</span></td>
            <td><span class="badge badge-danger">${absentDays}</span></td>
            <td>
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${attendanceBg}; color: ${attendanceColor}; border-radius: 6px; font-weight: 700; font-size: 14px;">
                    <i class="fas ${attendanceIcon}"></i>
                    ${attendance}%
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Show report stats
    document.getElementById('reportStats').style.display = 'block';
    
    console.log('✅ Report generated successfully');
}
