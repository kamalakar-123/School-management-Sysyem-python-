/* ============================================
   SETTINGS PAGE - JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('⚙️ Settings Page Initialized');
    
    initializeDate();
    initializeSidebar();
    hideLoadingOverlay();
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

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        }, 500);
    }
}
