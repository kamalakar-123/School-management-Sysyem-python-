/* ============================================
   EXAMS PAGE - JAVASCRIPT
   ============================================ */

let currentExamId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Exams Page Initialized');
    
    initializeDate();
    initializeSidebar();
    loadExamsData();
    setupEventListeners();
});

function initializeDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

function setupEventListeners() {
    // Add Exam button
    const addBtn = document.getElementById('addExamBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddExamModal);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportExamsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportExamsToCSV);
    }
    
    // Modal close buttons
    const closeExamModal = document.getElementById('closeExamModal');
    if (closeExamModal) {
        closeExamModal.addEventListener('click', closeExamModalFunc);
    }
    
    const cancelBtn = document.getElementById('cancelExamBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeExamModalFunc);
    }
    
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    if (closeDetailsModal) {
        closeDetailsModal.addEventListener('click', closeDetailsModalFunc);
    }
    
    // Form submit
    const examForm = document.getElementById('examForm');
    if (examForm) {
        examForm.addEventListener('submit', handleExamSubmit);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.id === 'examModal') {
            closeExamModalFunc();
        }
        if (event.target.id === 'detailsModal') {
            closeDetailsModalFunc();
        }
    });
}

async function loadExamsData() {
    try {
        const response = await fetch('/api/exams');
        if (!response.ok) {
            throw new Error('Failed to fetch exams');
        }
        
        const result = await response.json();
        const exams = result.exams || [];
        
        updateStats(exams);
        renderExamsTable(exams);
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('Error loading exams:', error);
        showError('Failed to load exams data');
        hideLoadingOverlay();
    }
}

function updateStats(exams) {
    const upcoming = exams.filter(e => e.status === 'upcoming').length;
    const completed = exams.filter(e => e.status === 'completed').length;
    const totalMarks = exams.reduce((sum, e) => sum + e.max_marks, 0);
    const avgMarks = exams.length > 0 ? Math.round(totalMarks / exams.length) : 0;
    
    document.getElementById('upcomingExams').textContent = upcoming;
    document.getElementById('completedExams').textContent = completed;
    
    // Update average marks or score
    const avgElement = document.getElementById('averageMarks') || document.getElementById('averageScore');
    if (avgElement) {
        avgElement.textContent = avgMarks;
    }
}

function renderExamsTable(exams) {
    const tbody = document.getElementById('examsTableBody');
    
    if (exams.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-inbox"></i><br>
                    No exams scheduled yet
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = exams.map(exam => `
        <tr>
            <td>${exam.exam_name}</td>
            <td>${exam.class}</td>
            <td>${exam.subject}</td>
            <td>${formatDate(exam.exam_date)}</td>
            <td>${exam.max_marks}</td>
            <td>
                <span class="status-badge ${exam.status}">
                    ${exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                    <button class="action-btn" onclick="viewExamDetails(${exam.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editExam(${exam.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteExam(${exam.id}, '${exam.exam_name.replace(/'/g, "\\'")}' )" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showError(message) {
    const tbody = document.getElementById('examsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </td>
        </tr>
    `;
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        }, 500);
    }
}

// Modal Functions
function openAddExamModal() {
    currentExamId = null;
    document.getElementById('examModalTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Exam';
    document.getElementById('examForm').reset();
    document.getElementById('examId').value = '';
    document.getElementById('examStatus').value = 'upcoming';
    document.getElementById('examModal').style.display = 'block';
}

function openEditExamModal(exam) {
    currentExamId = exam.id;
    document.getElementById('examModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Exam';
    document.getElementById('examId').value = exam.id;
    document.getElementById('examName').value = exam.exam_name;
    document.getElementById('examClass').value = exam.class;
    document.getElementById('examSubject').value = exam.subject;
    document.getElementById('examDate').value = exam.exam_date;
    document.getElementById('examMaxMarks').value = exam.max_marks;
    document.getElementById('examStatus').value = exam.status;
    document.getElementById('examModal').style.display = 'block';
}

function closeExamModalFunc() {
    document.getElementById('examModal').style.display = 'none';
    document.getElementById('examForm').reset();
    currentExamId = null;
}

function closeDetailsModalFunc() {
    document.getElementById('detailsModal').style.display = 'none';
}

// API Functions
async function editExam(examId) {
    try {
        const response = await fetch('/api/exams');
        const result = await response.json();
        const exam = result.exams.find(e => e.id === examId);
        
        if (exam) {
            openEditExamModal(exam);
        } else {
            alert('Exam not found');
        }
    } catch (error) {
        console.error('Error fetching exam:', error);
        alert('Failed to load exam details');
    }
}

async function viewExamDetails(examId) {
    try {
        const response = await fetch('/api/exams');
        const result = await response.json();
        const exam = result.exams.find(e => e.id === examId);
        
        if (!exam) {
            alert('Exam not found');
            return;
        }
        
        const detailsContent = document.getElementById('examDetailsContent');
        detailsContent.innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">EXAM NAME</div>
                    <div style="color: #2d3748; font-weight: 600; font-size: 16px;">${exam.exam_name}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                        <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">CLASS</div>
                        <div style="color: #2d3748; font-weight: 600;">${exam.class}</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                        <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">SUBJECT</div>
                        <div style="color: #2d3748; font-weight: 600;">${exam.subject}</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                        <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">EXAM DATE</div>
                        <div style="color: #2d3748; font-weight: 600;">${formatDate(exam.exam_date)}</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                        <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">MAX MARKS</div>
                        <div style="color: #2d3748; font-weight: 600;">${exam.max_marks}</div>
                    </div>
                </div>
                
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                    <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">STATUS</div>
                    <span class="status-badge ${exam.status}" style="display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error fetching exam details:', error);
        alert('Failed to load exam details');
    }
}

async function deleteExam(examId, examName) {
    if (!confirm(`Are you sure you want to delete "${examName}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/exams/${examId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Exam deleted successfully!');
            loadExamsData();
        } else {
            alert(result.error || 'Failed to delete exam');
        }
    } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam');
    }
}

async function handleExamSubmit(e) {
    e.preventDefault();
    
    const examData = {
        exam_name: document.getElementById('examName').value,
        class: document.getElementById('examClass').value,
        subject: document.getElementById('examSubject').value,
        exam_date: document.getElementById('examDate').value,
        max_marks: parseInt(document.getElementById('examMaxMarks').value),
        status: document.getElementById('examStatus').value
    };
    
    const examId = document.getElementById('examId').value;
    const method = examId ? 'PUT' : 'POST';
    const url = examId ? `/api/exams/${examId}` : '/api/exams';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(examData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(examId ? 'Exam updated successfully!' : 'Exam added successfully!');
            closeExamModalFunc();
            loadExamsData();
        } else {
            alert(result.error || 'Failed to save exam');
        }
    } catch (error) {
        console.error('Error saving exam:', error);
        alert('Failed to save exam');
    }
}

async function exportExamsToCSV() {
    try {
        const response = await fetch('/api/exams');
        const result = await response.json();
        const exams = result.exams || [];
        
        if (exams.length === 0) {
            alert('No exams to export');
            return;
        }
        
        // CSV headers
        let csv = 'Exam Name,Class,Subject,Exam Date,Max Marks,Status\n';
        
        // Add data rows
        exams.forEach(exam => {
            csv += `"${exam.exam_name}","${exam.class}","${exam.subject}","${exam.exam_date}",${exam.max_marks},"${exam.status}"\n`;
        });
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exams_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Exams exported successfully!');
        
    } catch (error) {
        console.error('Error exporting exams:', error);
        alert('Failed to export exams');
    }
}
