// Enhanced Admin Panel JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    updateSystemStats();
    setInterval(updateSystemStats, 30000);
});

function refreshDashboard() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const icon = refreshBtn.querySelector('i');
    refreshBtn.disabled = true;
    icon.classList.add('fa-spin');
    setTimeout(() => {
        updateSystemStats();
        refreshBtn.disabled = false;
        icon.classList.remove('fa-spin');
        showNotification('Dashboard refreshed successfully!', 'success');
    }, 1500);
}

function openSettings() {
    showNotification('System settings panel coming soon!', 'info');
}

function createUser() {
    showNotification('Redirecting to user creation...', 'info');
    setTimeout(() => {
        window.location.href = '/ManageUsers';
    }, 1000);
}

function backupSystem() {
    const confirmed = confirm('Are you sure you want to start a system backup?');
    if (confirmed) {
        showNotification('System backup initiated...', 'success');
        setTimeout(() => {
            showNotification('Backup completed successfully!', 'success');
            updateSystemStats();
        }, 3000);
    }
}

function viewLogs() {
    showNotification('Opening system logs...', 'info');
    setTimeout(() => {
        alert('System Logs:\n\n[INFO] System started successfully\n[INFO] User authentication enabled\n[INFO] Database connection established\n[INFO] All services running normally');
    }, 500);
}

function systemHealth() {
    showNotification('Running system health check...', 'info');
    setTimeout(() => {
        const healthReport = {
            cpu: Math.floor(Math.random() * 30) + 10,
            memory: Math.floor(Math.random() * 40) + 30,
            disk: Math.floor(Math.random() * 20) + 15,
            network: 'Optimal'
        };
        alert(`System Health Report:\n\nCPU Usage: ${healthReport.cpu}%\nMemory Usage: ${healthReport.memory}%\nDisk Usage: ${healthReport.disk}%\nNetwork Status: ${healthReport.network}\n\nAll systems operating normally.`);
    }, 2000);
}

function quickAddUser() {
    // Create a custom modal for better user experience
    createUserRoleModal();
}

async function createUserRoleModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('quick-add-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Show loading state while fetching roles
    const loadingModalHTML = `
        <div id="quick-add-modal" class="quick-add-modal" onclick="closeQuickAddModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Quick Add User</h3>
                    <button class="modal-close" onclick="closeQuickAddModal()" title="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">Loading roles...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loadingModalHTML);

    try {
        // Fetch available roles from the API
        const response = await fetch('/api/role-management/roles/options');
        if (!response.ok) {
            throw new Error('Failed to load roles');
        }

        const roles = await response.json();
        
        // Create the full modal with dynamic roles
        const modalHTML = `
            <div id="quick-add-modal" class="quick-add-modal" onclick="closeQuickAddModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Quick Add User</h3>
                        <button class="modal-close" onclick="closeQuickAddModal()" title="Close modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="quick-user-name">
                                <i class="fas fa-user"></i> User Name <span style="color: #e74c3c;">*</span>
                            </label>
                            <input type="text" id="quick-user-name" placeholder="Enter full name" class="form-input" required>
                            <div class="input-hint">This will be displayed as the user's display name</div>
                        </div>
                        <div class="form-group">
                            <label for="quick-user-email">
                                <i class="fas fa-envelope"></i> Email Address <span style="color: #e74c3c;">*</span>
                            </label>
                            <input type="email" id="quick-user-email" placeholder="user@company.com" class="form-input" required>
                            <div class="input-hint">Used for login and system notifications</div>
                        </div>
                        <div class="form-group">
                            <label>
                                <i class="fas fa-shield-alt"></i> Select Role <span style="color: #e74c3c;">*</span>
                            </label>
                            <div class="role-options">
                                ${roles.map(role => `
                                    <div class="role-option" data-role-id="${role.id}" data-role-name="${role.name}">
                                        <div class="role-icon"><i class="${role.iconClass}"></i></div>
                                        <div class="role-info">
                                            <h4>${role.displayName}</h4>
                                            <p>${role.description}</p>
                                            <div class="role-permissions">
                                                ${role.keyPermissions.map(permission => 
                                                    `<span class="permission-tag">${permission.replace(/^[^.]+\./, '')}</span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <button class="btn btn-outline btn-sm" onclick="showCreateRoleModal()" style="width: 100%; margin-top: 1rem;">
                                <i class="fas fa-plus"></i> Create New Role
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeQuickAddModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="submitQuickAddUser()">
                            <i class="fas fa-plus"></i> Create User
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Replace the loading modal with the full modal
        document.getElementById('quick-add-modal').remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners for role selection
        const roleOptions = document.querySelectorAll('.role-option');
        roleOptions.forEach(option => {
            option.addEventListener('click', function() {
                roleOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                // Add subtle animation feedback
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        // Add input validation and real-time feedback
        const nameInput = document.getElementById('quick-user-name');
        const emailInput = document.getElementById('quick-user-email');

        nameInput.addEventListener('input', function() {
            validateInput(this, this.value.trim().length >= 2, 'Name must be at least 2 characters');
        });

        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            validateInput(this, emailRegex.test(this.value), 'Please enter a valid email address');
        });

        // Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeQuickAddModal();
            }
            if (e.key === 'Enter' && (e.target.id === 'quick-user-name' || e.target.id === 'quick-user-email')) {
                e.preventDefault();
                if (e.target.id === 'quick-user-name') {
                    emailInput.focus();
                } else {
                    submitQuickAddUser();
                }
            }
        });

        // Focus on the first input with a slight delay for better UX
        setTimeout(() => {
            nameInput.focus();
            nameInput.select();
        }, 300);

    } catch (error) {
        console.error('Error loading roles:', error);
        
        // Show error state
        const errorModalHTML = `
            <div id="quick-add-modal" class="quick-add-modal" onclick="closeQuickAddModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Quick Add User</h3>
                        <button class="modal-close" onclick="closeQuickAddModal()" title="Close modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Failed to load roles. Please try again or contact support.
                        </div>
                        <button class="btn btn-primary" onclick="createUserRoleModal()">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('quick-add-modal').remove();
        document.body.insertAdjacentHTML('beforeend', errorModalHTML);
    }
}

function validateInput(input, isValid, errorMessage) {
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }

    if (!isValid && input.value.trim() !== '') {
        input.style.borderColor = '#e74c3c';
        input.style.boxShadow = '0 0 0 4px rgba(231, 76, 60, 0.1)';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        input.parentNode.appendChild(errorDiv);
    } else if (isValid) {
        input.style.borderColor = '#28a745';
        input.style.boxShadow = '0 0 0 4px rgba(40, 167, 69, 0.1)';
    } else {
        input.style.borderColor = '#e5e7ef';
        input.style.boxShadow = '';
    }
}

function closeQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function submitQuickAddUser() {
    const nameInput = document.getElementById('quick-user-name');
    const emailInput = document.getElementById('quick-user-email');
    const userName = nameInput.value.trim();
    const userEmail = emailInput.value.trim();
    const selectedRole = document.querySelector('.role-option.selected');
    const submitBtn = document.querySelector('.modal-footer .btn-primary');

    // Clear any existing errors
    document.querySelectorAll('.input-error').forEach(error => error.remove());

    let hasErrors = false;

    // Validate name
    if (!userName || userName.length < 2) {
        validateInput(nameInput, false, 'Name must be at least 2 characters');
        hasErrors = true;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail || !emailRegex.test(userEmail)) {
        validateInput(emailInput, false, 'Please enter a valid email address');
        hasErrors = true;
    }

    // Validate role selection
    if (!selectedRole) {
        showNotification('Please select a role for the user.', 'error');
        hasErrors = true;
    }

    if (hasErrors) {
        // Shake animation for the modal
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            modalContent.style.animation = '';
        }, 500);
        return;
    }

    const roleId = selectedRole.getAttribute('data-role-id');
    const roleName = selectedRole.getAttribute('data-role-name');

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitBtn.style.opacity = '0.7';

    // Simulate API call to create user with selected role
    setTimeout(() => {
        closeQuickAddModal();
        showNotification(`Creating user: ${userName} with ${roleName} role...`, 'info');

        setTimeout(() => {
            showNotification(`User ${userName} created successfully with ${roleName} role!`, 'success');
            // Update the active users count
            updateSystemStats();
            
            // Trigger refresh of user management page if it's open
            if (typeof userManagement !== 'undefined' && userManagement) {
                userManagement.loadUsers();
            }
        }, 1000);
    }, 1500);
}

// Function to show Create Role modal
async function showCreateRoleModal() {
    // Close the Quick Add User modal temporarily
    const quickAddModal = document.getElementById('quick-add-modal');
    if (quickAddModal) {
        quickAddModal.style.display = 'none';
    }

    try {
        // Fetch available permissions
        const response = await fetch('/api/role-management/permissions');
        if (!response.ok) {
            throw new Error('Failed to load permissions');
        }

        const permissionCategories = await response.json();

        const createRoleModalHTML = `
            <div id="create-role-modal" class="quick-add-modal" onclick="closeCreateRoleModal()">
                <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-shield-alt"></i> Create New Role</h3>
                        <button class="modal-close" onclick="closeCreateRoleModal()" title="Close modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="role-name">
                                <i class="fas fa-tag"></i> Role Name <span style="color: #e74c3c;">*</span>
                            </label>
                            <input type="text" id="role-name" placeholder="Enter role name" class="form-input" required>
                            <div class="input-hint">Internal name for the role (e.g., "Supervisor")</div>
                        </div>
                        <div class="form-group">
                            <label for="role-display-name">
                                <i class="fas fa-eye"></i> Display Name
                            </label>
                            <input type="text" id="role-display-name" placeholder="Enter display name" class="form-input">
                            <div class="input-hint">Name shown to users (defaults to role name if empty)</div>
                        </div>
                        <div class="form-group">
                            <label for="role-description">
                                <i class="fas fa-info-circle"></i> Description
                            </label>
                            <textarea id="role-description" placeholder="Describe the role's purpose and responsibilities" class="form-input" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="role-priority">
                                <i class="fas fa-sort-numeric-up"></i> Priority Level
                            </label>
                            <input type="number" id="role-priority" placeholder="0" class="form-input" min="0" max="100" value="25">
                            <div class="input-hint">Higher numbers = higher priority (0-100)</div>
                        </div>
                        <div class="form-group">
                            <label>
                                <i class="fas fa-key"></i> Permissions
                            </label>
                            <div class="permissions-container">
                                ${permissionCategories.map(category => `
                                    <div class="permission-category">
                                        <h5 class="permission-category-title">
                                            <i class="fas fa-folder"></i> ${category.category}
                                        </h5>
                                        <div class="permission-options">
                                            ${category.permissions.map(permission => `
                                                <label class="permission-checkbox">
                                                    <input type="checkbox" value="${permission}" name="permissions">
                                                    <span class="checkmark"></span>
                                                    <span class="permission-label">${permission.replace(/^[^.]+\./, '')}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeCreateRoleModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="submitCreateRole()">
                            <i class="fas fa-plus"></i> Create Role
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', createRoleModalHTML);

        // Focus on the role name input
        setTimeout(() => {
            document.getElementById('role-name').focus();
        }, 300);

    } catch (error) {
        console.error('Error loading permissions:', error);
        showNotification('Failed to load permissions for role creation.', 'error');
        
        // Show the Quick Add User modal again
        if (quickAddModal) {
            quickAddModal.style.display = 'flex';
        }
    }
}

function closeCreateRoleModal() {
    const createRoleModal = document.getElementById('create-role-modal');
    if (createRoleModal) {
        createRoleModal.remove();
    }

    // Show the Quick Add User modal again
    const quickAddModal = document.getElementById('quick-add-modal');
    if (quickAddModal) {
        quickAddModal.style.display = 'flex';
    }
}

async function submitCreateRole() {
    const roleName = document.getElementById('role-name').value.trim();
    const displayName = document.getElementById('role-display-name').value.trim();
    const description = document.getElementById('role-description').value.trim();
    const priority = parseInt(document.getElementById('role-priority').value) || 0;
    const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
                                    .map(cb => cb.value);

    if (!roleName) {
        showNotification('Role name is required.', 'error');
        return;
    }

    const submitBtn = document.querySelector('#create-role-modal .btn-primary');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        const response = await fetch('/api/role-management/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: roleName,
                displayName: displayName || roleName,
                description: description,
                priority: priority,
                permissions: selectedPermissions
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create role');
        }

        const newRole = await response.json();
        
        closeCreateRoleModal();
        showNotification(`Role "${newRole.displayName}" created successfully!`, 'success');
        
        // Refresh roles in the user management page if it's open
        console.log('Attempting to refresh roles in User Management...');
        if (typeof window.refreshUserManagementRoles === 'function') {
            console.log('Calling refreshUserManagementRoles function...');
            window.refreshUserManagementRoles();
        } else {
            console.log('refreshUserManagementRoles function not found');
        }
        
        // Refresh the Quick Add User modal to show the new role
        setTimeout(() => {
            createUserRoleModal();
        }, 1000);

    } catch (error) {
        console.error('Error creating role:', error);
        showNotification(`Failed to create role: ${error.message}`, 'error');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Create Role';
    }
}

function quickAddProduct() {
    showNotification('Redirecting to product management...', 'info');
    setTimeout(() => {
        window.location.href = '/Products';
    }, 1000);
}

function generateReport() {
    showNotification('Generating custom report...', 'info');
    setTimeout(() => {
        const reportData = {
            totalSales: '$' + (Math.floor(Math.random() * 50000) + 10000).toLocaleString(),
            activeUsers: Math.floor(Math.random() * 50) + 20,
            products: Math.floor(Math.random() * 500) + 1000,
            orders: Math.floor(Math.random() * 200) + 100
        };
        alert(`Generated Report:\n\nTotal Sales: ${reportData.totalSales}\nActive Users: ${reportData.activeUsers}\nTotal Products: ${reportData.products}\nOrders This Month: ${reportData.orders}`);
    }, 2000);
}

function openSystemSettings() {
    showNotification('Opening system configuration...', 'info');
}

function securitySettings() {
    showNotification('Opening security settings...', 'info');
}

function viewMonitoring() {
    showNotification('Loading monitoring dashboard...', 'info');
}

function downloadLogs() {
    showNotification('Preparing log files for download...', 'info');
    setTimeout(() => {
        showNotification('Log files ready for download!', 'success');
    }, 2000);
}

function performBackup() {
    const confirmed = confirm('This will create a full system backup. Continue?');
    if (confirmed) {
        showNotification('Starting full system backup...', 'info');
        setTimeout(() => {
            showNotification('Backup completed successfully!', 'success');
            updateSystemStats();
        }, 4000);
    }
}

function maintenanceMode() {
    const confirmed = confirm('This will put the system in maintenance mode. Continue?');
    if (confirmed) {
        showNotification('Entering maintenance mode...', 'warning');
    }
}

function updateSystemStats() {
    const stats = {
        uptime: (99.8 + Math.random() * 0.2).toFixed(1) + '%',
        activeUsers: Math.floor(Math.random() * 10) + 20,
        lastBackup: Math.floor(Math.random() * 5) + 1 + 'h ago'
    };
    const uptimeElement = document.querySelector('.stat-value');
    const activeUsersElement = document.querySelectorAll('.stat-value')[1];
    const backupElement = document.querySelectorAll('.stat-value')[2];
    if (uptimeElement) uptimeElement.textContent = stats.uptime;
    if (activeUsersElement) activeUsersElement.textContent = stats.activeUsers;
    if (backupElement) backupElement.textContent = stats.lastBackup;

    // Update Product Management card with real data from API
    updateProductStats();
}

async function updateProductStats() {
    try {
        const response = await fetch('/api/admin/product-stats');
        if (response.ok) {
            const data = await response.json();
            const productCount = document.getElementById('product-count');
            const inStock = document.getElementById('in-stock');
            
            if (productCount) {
                productCount.textContent = data.totalProducts.toLocaleString();
                console.log('Updated product count to:', data.totalProducts);
            }
            if (inStock) {
                inStock.textContent = data.inStockPercentage.toFixed(1) + '%';
                console.log('Updated in-stock to:', data.inStockPercentage.toFixed(1) + '%');
            }
        }
    } catch (error) {
        console.error('Failed to update product stats:', error);
    }
}

function initializeAnimations() {
    const cards = document.querySelectorAll('.admin-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.05)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
        case 'warning': return 'linear-gradient(135deg, #ffc107, #fd7e14)';
        case 'error': return 'linear-gradient(135deg, #dc3545, #c82333)';
        default: return 'linear-gradient(135deg, #5a5cdb, #7f53ac)';
    }
}

// Add notification animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes modalSlideIn {
        from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(5px); }
    }
    .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    .notification-close:hover {
        background: rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(style);