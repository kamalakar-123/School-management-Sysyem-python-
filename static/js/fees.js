/* ============================================
   FEES PAGE - JAVASCRIPT
   ============================================ */

// ==================== GLOBAL VARIABLES ====================
let allFees = [];
let filteredFees = [];
let allStudents = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Fees Page Initialized');
    
    initializeDate();
    initializeSidebar();
    loadClasses();
    loadFeesData();
    setupEventListeners();
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
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshData');
    refreshBtn.addEventListener('click', function() {
        this.querySelector('i').classList.add('fa-spin');
        setTimeout(() => {
            this.querySelector('i').classList.remove('fa-spin');
        }, 1000);
        
        loadFeesData();
    });
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

// ==================== LOAD FEES DATA ====================
async function loadFeesData() {
    try {
        const response = await fetch('/api/fees');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to load fees data');
        }
        
        allFees = data.fees.map(fee => ({
            ...fee,
            dueDateFormatted: new Date(fee.due_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            })
        }));
        
        filteredFees = [...allFees];
        
        // Calculate statistics
        const totalCollected = allFees.reduce((sum, fee) => sum + fee.paid_amount, 0);
        const pendingAmount = allFees.reduce((sum, fee) => sum + fee.pending_amount, 0);
        const overdueCount = allFees.filter(fee => fee.status === 'overdue' || 
            (fee.status === 'pending' && new Date(fee.due_date) < new Date())).length;
        
        document.getElementById('totalCollected').textContent = '$' + totalCollected.toLocaleString();
        document.getElementById('pendingAmount').textContent = '$' + pendingAmount.toLocaleString();
        document.getElementById('overdueCount').textContent = overdueCount;
        document.getElementById('showingCount').textContent = allFees.length;
        
        renderFeesTable(filteredFees);
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading fees:', error);
        hideLoadingOverlay();
    }
}

// ==================== RENDER FEES TABLE ====================
function renderFeesTable(fees) {
    const tbody = document.getElementById('feesTableBody');
    tbody.innerHTML = '';
    
    if (fees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p style="font-size: 16px;">No fee records found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    fees.forEach(fee => {
        const row = document.createElement('tr');
        
        // Determine status badge
        let statusClass = 'badge-success';
        let statusText = 'PAID';
        if (fee.status === 'pending') {
            statusClass = 'badge-warning';
            statusText = 'PENDING';
        } else if (fee.status === 'overdue') {
            statusClass = 'badge-danger';
            statusText = 'OVERDUE';
        }
        
        // Check if overdue even if status is pending
        const dueDate = new Date(fee.due_date);
        const today = new Date();
        if (fee.pending_amount > 0 && dueDate < today) {
            statusClass = 'badge-danger';
            statusText = 'OVERDUE';
        }
        
        row.innerHTML = `
            <td style="font-weight: 600;">${fee.name}</td>
            <td>${fee.class}</td>
            <td>$${fee.total_amount.toLocaleString()}</td>
            <td style="color: #48bb78; font-weight: 600;">$${fee.paid_amount.toLocaleString()}</td>
            <td style="color: #f56565; font-weight: 600;">$${fee.pending_amount.toLocaleString()}</td>
            <td>${fee.dueDateFormatted}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <button 
                    class="action-btn-small" 
                    title="Record Payment"
                    onclick="openPaymentModal(${fee.fee_id}, '${fee.name}', '${fee.class}', ${fee.total_amount}, ${fee.paid_amount}, ${fee.pending_amount})"
                    ${fee.pending_amount === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                    <i class="fas fa-money-bill-wave"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ==================== OPEN PAYMENT MODAL ====================
function openPaymentModal(feeId, studentName, studentClass, totalAmount, paidAmount, pendingAmount) {
    if (pendingAmount === 0) {
        alert('This student has already paid the full amount.');
        return;
    }
    
    // Set payment date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('paymentDate').value = today;
    
    // Fill in student information
    document.getElementById('paymentFeeId').value = feeId;
    document.getElementById('paymentStudentName').textContent = studentName;
    document.getElementById('paymentStudentClass').textContent = studentClass;
    document.getElementById('paymentTotalAmount').textContent = '$' + totalAmount.toLocaleString();
    document.getElementById('paymentAlreadyPaid').textContent = '$' + paidAmount.toLocaleString();
    document.getElementById('paymentPending').textContent = '$' + pendingAmount.toLocaleString();
    
    // Set max payment amount to pending amount
    const paymentInput = document.getElementById('paymentAmount');
    paymentInput.max = pendingAmount;
    paymentInput.value = '';
    
    // Clear any errors
    document.getElementById('paymentError').style.display = 'none';
    
    // Show modal
    document.getElementById('paymentModal').style.display = 'block';
}

// ==================== CLOSE PAYMENT MODAL ====================
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentForm').reset();
}

// ==================== HANDLE PAYMENT SUBMISSION ====================
async function handlePaymentSubmission(event) {
    event.preventDefault();
    
    const feeId = document.getElementById('paymentFeeId').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const pendingAmount = parseFloat(document.getElementById('paymentPending').textContent.replace('$', '').replace(',', ''));
    
    // Validate payment amount
    if (paymentAmount <= 0) {
        showPaymentError('Payment amount must be greater than 0');
        return;
    }
    
    if (paymentAmount > pendingAmount) {
        showPaymentError(`Payment amount cannot exceed pending amount ($${pendingAmount.toLocaleString()})`);
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Send payment to API
        const response = await fetch(`/api/fees/${feeId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_amount: paymentAmount
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to process payment');
        }
        
        // Success! Close modal and reload data
        alert(`✅ Payment of $${paymentAmount} recorded successfully!`);
        closePaymentModal();
        await loadFeesData();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error processing payment:', error);
        showPaymentError(error.message);
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Record Payment';
    }
}

function showPaymentError(message) {
    const errorDiv = document.getElementById('paymentError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// ==================== SETUP PAYMENT MODAL LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Payment modal listeners
    const paymentModal = document.getElementById('paymentModal');
    const closeModalBtn = document.getElementById('closePaymentModal');
    const cancelBtn = document.getElementById('cancelPaymentBtn');
    const paymentForm = document.getElementById('paymentForm');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePaymentModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePaymentModal);
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            closePaymentModal();
        }
    });
});

// ==================== PERFORM SEARCH ====================
function performSearch(query) {
    if (!query) {
        // Reset to filtered or all fees based on class filter
        const classFilter = document.getElementById('classFilter');
        const selectedClass = classFilter.value;
        
        if (selectedClass === 'all') {
            filteredFees = [...allFees];
        } else {
            filteredFees = allFees.filter(f => f.class === selectedClass);
        }
    } else {
        // Search in student name
        const searchLower = query.toLowerCase();
        filteredFees = allFees.filter(fee => {
            return fee.name.toLowerCase().includes(searchLower);
        });
    }
    
    // Update showing count
    document.getElementById('showingCount').textContent = filteredFees.length;
    
    // Re-render table
    renderFeesTable(filteredFees);
    
    console.log(`🔍 Search: "${query}" - Found ${filteredFees.length} record(s)`);
}

// ==================== FILTER BY CLASS ====================
function filterByClass(className) {
    if (className === 'all') {
        filteredFees = [...allFees];
    } else {
        filteredFees = allFees.filter(f => f.class === className);
    }
    
    // Clear search
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Update showing count
    document.getElementById('showingCount').textContent = filteredFees.length;
    
    // Re-render table
    renderFeesTable(filteredFees);
    
    console.log(`🔍 Filter: ${className} - Found ${filteredFees.length} record(s)`);
}

// ==================== FILTER BY STATUS (PAID/PENDING/ALL) ====================
function filterByStatus(status) {
    // Remove active styling from all cards
    document.getElementById('collectedCard').style.transform = 'scale(1)';
    document.getElementById('pendingCard').style.transform = 'scale(1)';
    document.getElementById('overdueCard').style.transform = 'scale(1)';
    
    document.getElementById('collectedCard').style.boxShadow = '';
    document.getElementById('pendingCard').style.boxShadow = '';
    document.getElementById('overdueCard').style.boxShadow = '';
    
    // Apply filter
    if (status === 'all') {
        filteredFees = [...allFees];
        document.getElementById('overdueCard').style.transform = 'scale(1.05)';
        document.getElementById('overdueCard').style.boxShadow = '0 8px 24px rgba(237, 137, 54, 0.3)';
    } else if (status === 'paid') {
        filteredFees = allFees.filter(f => f.status === 'paid');
        document.getElementById('collectedCard').style.transform = 'scale(1.05)';
        document.getElementById('collectedCard').style.boxShadow = '0 8px 24px rgba(72, 187, 120, 0.3)';
    } else if (status === 'pending') {
        filteredFees = allFees.filter(f => f.status === 'pending');
        document.getElementById('pendingCard').style.transform = 'scale(1.05)';
        document.getElementById('pendingCard').style.boxShadow = '0 8px 24px rgba(245, 101, 101, 0.3)';
    }
    
    // Reset class filter
    document.getElementById('classFilter').value = 'all';
    
    // Clear search
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Update showing count
    document.getElementById('showingCount').textContent = filteredFees.length;
    
    // Re-render table with animation
    const tbody = document.getElementById('feesTableBody');
    tbody.style.opacity = '0.5';
    
    setTimeout(() => {
        renderFeesTable(filteredFees);
        tbody.style.opacity = '1';
    }, 150);
    
    // Update table title
    const tableTitle = document.querySelector('.table-title span');
    if (status === 'paid') {
        tableTitle.textContent = 'Fully Paid Students';
    } else if (status === 'pending') {
        tableTitle.textContent = 'Students with Pending Fees';
    } else {
        tableTitle.textContent = 'Fee Records';
    }
    
    console.log(`👆 Clicked: ${status} - Showing ${filteredFees.length} record(s)`);
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
