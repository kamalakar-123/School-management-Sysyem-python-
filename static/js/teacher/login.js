// Teacher Login Page JavaScript

// Handle form submission
function handleLogin(event) {
    event.preventDefault();
    
    const teacherName = document.getElementById('teacherName').value.trim();
    const teacherId = document.getElementById('teacherId').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const loginBtn = event.target.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // For demo purposes, accept any name and ID
        // In production, this should validate against database
        
        if (teacherName.length > 0 && teacherId.length > 0) {
            // Success
            showAlert('Login successful! Redirecting...', 'success');
            
            // Store credentials if remember me is checked
            if (rememberMe) {
                localStorage.setItem('teacherName', teacherName);
                localStorage.setItem('teacherId', teacherId);
            }
            
            // Redirect to teacher dashboard
            setTimeout(() => {
                window.location.href = '/teacher/dashboard';
            }, 1500);
        } else {
            // Error
            showAlert('Invalid credentials. Please try again.', 'error');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }, 1500);
}

// Show alert message
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    alertBox.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Load saved credentials if remember me was checked
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('teacherName');
    const savedId = localStorage.getItem('teacherId');
    
    if (savedName && savedId) {
        document.getElementById('teacherName').value = savedName;
        document.getElementById('teacherId').value = savedId;
        document.getElementById('rememberMe').checked = true;
    }
});

// Add enter key support
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        });
    });
});
