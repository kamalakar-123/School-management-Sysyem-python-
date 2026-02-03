// Tab switching and modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const composeModal = document.getElementById('composeMessageModal');
    const viewModal = document.getElementById('viewMessageModal');
    const composeBtn = document.getElementById('composeMessageBtn');
    const closeButtons = document.querySelectorAll('.close');
    const cancelBtn = document.getElementById('cancelComposeBtn');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const composeForm = document.getElementById('composeMessageForm');
    const recipientTypeSelect = document.getElementById('messageRecipientType');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Load data for the active tab
            if (tabName === 'inbox') {
                loadInboxMessages();
            } else if (tabName === 'sent') {
                loadSentMessages();
            } else if (tabName === 'drafts') {
                loadDrafts();
            }
        });
    });

    // Compose modal controls
    composeBtn.addEventListener('click', function() {
        composeModal.classList.add('show');
        loadClassesAndStudents();
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            composeModal.classList.remove('show');
            viewModal.classList.remove('show');
            composeForm.reset();
            hideRecipientGroups();
        });
    });

    cancelBtn.addEventListener('click', function() {
        composeModal.classList.remove('show');
        composeForm.reset();
        hideRecipientGroups();
    });

    closeViewBtn.addEventListener('click', function() {
        viewModal.classList.remove('show');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === composeModal) {
            composeModal.classList.remove('show');
            composeForm.reset();
            hideRecipientGroups();
        }
        if (e.target === viewModal) {
            viewModal.classList.remove('show');
        }
    });

    // Recipient type change
    recipientTypeSelect.addEventListener('change', function() {
        showRecipientGroup(this.value);
    });

    // Form submission
    composeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    // Save as draft button
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);

    // Reply button
    document.getElementById('replyMessageBtn').addEventListener('click', replyToMessage);

    // Filter changes
    document.getElementById('inboxSearchInput').addEventListener('input', filterInboxMessages);
    document.getElementById('inboxFilterType').addEventListener('change', filterInboxMessages);
    document.getElementById('sentSearchInput').addEventListener('input', filterSentMessages);
    document.getElementById('sentFilterType').addEventListener('change', filterSentMessages);
    document.getElementById('draftsSearchInput').addEventListener('input', filterDrafts);

    // Initial load
    loadInboxMessages();
    updateInboxBadge();
});

// Show/hide recipient groups based on type
function showRecipientGroup(type) {
    const studentGroup = document.getElementById('studentSelectGroup');
    const classGroup = document.getElementById('classSelectGroup');
    
    hideRecipientGroups();
    
    if (type === 'student' || type === 'parent') {
        studentGroup.style.display = 'block';
    } else if (type === 'class') {
        classGroup.style.display = 'block';
    }
}

function hideRecipientGroups() {
    document.getElementById('studentSelectGroup').style.display = 'none';
    document.getElementById('classSelectGroup').style.display = 'none';
}

// Load classes and students for modal
function loadClassesAndStudents() {
    fetch('/api/teacher/classes')
        .then(response => response.json())
        .then(data => {
            const classSelect = document.getElementById('messageClass');
            
            // Clear existing options
            while (classSelect.options.length > 1) {
                classSelect.remove(1);
            }

            if (data.classes && data.classes.length > 0) {
                data.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.class_id;
                    option.textContent = `Class ${cls.grade} - ${cls.section}`;
                    classSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading classes:', error));

    // Load students (sample data)
    const students = [
        { id: 1, name: 'John Doe', rollNo: '101' },
        { id: 2, name: 'Jane Smith', rollNo: '102' },
        { id: 3, name: 'Mike Johnson', rollNo: '103' }
    ];

    const studentSelect = document.getElementById('messageStudent');
    while (studentSelect.options.length > 1) {
        studentSelect.remove(1);
    }

    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.rollNo})`;
        studentSelect.appendChild(option);
    });
}

// Load inbox messages
function loadInboxMessages() {
    const messagesList = document.getElementById('inboxMessagesList');
    
    // Sample data
    const messages = [
        {
            id: 1,
            sender: 'Sarah Williams (Parent)',
            subject: 'Regarding homework',
            preview: 'I wanted to discuss my child\'s recent performance in mathematics...',
            time: '2 hours ago',
            unread: true,
            type: 'parent',
            priority: 'normal'
        },
        {
            id: 2,
            sender: 'Tom Brown',
            subject: 'Assignment submission',
            preview: 'I have submitted my assignment but it shows as pending...',
            time: '1 day ago',
            unread: false,
            type: 'student',
            priority: 'normal'
        }
    ];
    
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No messages in inbox</p></div>';
        return;
    }
    
    messages.forEach(message => {
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${message.unread ? 'unread' : ''}`;
        messageItem.innerHTML = `
            <div class="message-avatar">
                ${getInitials(message.sender)}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${message.sender}</span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-subject">${message.subject}</div>
                <div class="message-preview">${message.preview}</div>
                <div class="message-footer">
                    <span class="message-tag ${message.type}">${message.type}</span>
                    ${message.priority === 'high' ? '<span class="message-tag priority-high">High Priority</span>' : ''}
                </div>
            </div>
        `;
        
        messageItem.addEventListener('click', function() {
            viewMessage(message);
        });
        
        messagesList.appendChild(messageItem);
    });
}

// Load sent messages
function loadSentMessages() {
    const messagesList = document.getElementById('sentMessagesList');
    
    // Sample data
    const messages = [
        {
            id: 1,
            recipient: 'Class 10 - A',
            subject: 'Assignment due tomorrow',
            preview: 'Dear students, this is a reminder that your mathematics assignment...',
            time: '3 hours ago',
            type: 'class'
        }
    ];
    
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="empty-state"><i class="fas fa-paper-plane"></i><p>No sent messages</p></div>';
        return;
    }
    
    messages.forEach(message => {
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        messageItem.innerHTML = `
            <div class="message-avatar">
                ${getInitials(message.recipient)}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">To: ${message.recipient}</span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-subject">${message.subject}</div>
                <div class="message-preview">${message.preview}</div>
                <div class="message-footer">
                    <span class="message-tag ${message.type}">${message.type}</span>
                </div>
            </div>
        `;
        
        messagesList.appendChild(messageItem);
    });
}

// Load drafts
function loadDrafts() {
    const messagesList = document.getElementById('draftsMessagesList');
    
    messagesList.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><p>No drafts saved</p></div>';
}

// View message details
function viewMessage(message) {
    const modal = document.getElementById('viewMessageModal');
    
    document.getElementById('viewMessageFrom').textContent = message.sender;
    document.getElementById('viewMessageTo').textContent = 'You';
    document.getElementById('viewMessageDate').textContent = message.time;
    document.getElementById('viewMessageSubject').textContent = message.subject;
    document.getElementById('viewMessageBody').textContent = message.preview + ' (Full message content would be loaded here)';
    
    modal.classList.add('show');
}

// Send message
function sendMessage() {
    const recipientType = document.getElementById('messageRecipientType').value;
    const subject = document.getElementById('messageSubject').value;
    const body = document.getElementById('messageBody').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    
    let recipient = '';
    if (recipientType === 'student' || recipientType === 'parent') {
        recipient = document.getElementById('messageStudent').value;
    } else if (recipientType === 'class') {
        recipient = document.getElementById('messageClass').value;
    }
    
    if (!recipientType || !recipient || !subject || !body) {
        alert('Please fill in all required fields');
        return;
    }
    
    const data = {
        recipient_type: recipientType,
        recipient: recipient,
        subject: subject,
        body: body,
        priority: priority
    };
    
    console.log('Sending message:', data);
    alert('✅ Message sent successfully!');
    
    // Close modal and reset
    document.getElementById('composeMessageModal').classList.remove('show');
    document.getElementById('composeMessageForm').reset();
    hideRecipientGroups();
}

// Save as draft
function saveDraft() {
    console.log('Saving draft...');
    alert('Draft saved successfully!');
    document.getElementById('composeMessageModal').classList.remove('show');
}

// Reply to message
function replyToMessage() {
    document.getElementById('viewMessageModal').classList.remove('show');
    document.getElementById('composeMessageModal').classList.add('show');
}

// Filter functions
function filterInboxMessages() {
    console.log('Filtering inbox messages...');
}

function filterSentMessages() {
    console.log('Filtering sent messages...');
}

function filterDrafts() {
    console.log('Filtering drafts...');
}

// Update inbox badge
function updateInboxBadge() {
    // Sample unread count
    const unreadCount = 5;
    document.getElementById('inboxBadge').textContent = unreadCount;
}

// Utility function to get initials from name
function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0][0] + parts[1][0];
    }
    return name[0];
}
