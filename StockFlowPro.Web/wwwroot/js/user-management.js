class UserManager {
    constructor() {
        this.mockUsersCache = [];
        this.userToDelete = null;
        this.roleNames = { 1: 'Admin', 2: 'User', 3: 'Manager' };
        this.roleNumbers = { 'Admin': 1, 'User': 2, 'Manager': 3 };
        this.tableContainer = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.tableContainer = document.getElementById('user-table-section');
        this.bindEvents();
        this.loadUsers();
    }

    bindEvents() {
        this.tableContainer?.addEventListener('click', this.handleTableClick.bind(this));
        
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        document.getElementById('saveUserBtn')?.addEventListener('click', this.handleSaveUser.bind(this));
    }

    handleTableClick(event) {
        const target = event.target;
        
        if (target.classList.contains('edit-user-btn')) {
            event.preventDefault();
            const userId = target.dataset.userId;
            this.editUser(userId);
        } else if (target.classList.contains('delete-user-btn')) {
            event.preventDefault();
            const userId = target.dataset.userId;
            this.deleteUser(userId);
        }
    }

    async loadUsers() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            console.log('Fetching users from /api/users/mock...');
            const response = await fetch('/api/users/mock');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to load users: ${response.status} - ${errorText}`);
            }
            
            const users = await response.json();
            console.log('Loaded users:', users);
            this.mockUsersCache = users;
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showErrorState(`Failed to load users: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    renderUsersTable(users) {
        const fragment = document.createDocumentFragment();
        
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        
        users.forEach(user => {
            const row = this.createUserRow(user);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        fragment.appendChild(table);
        
        this.tableContainer.innerHTML = '';
        this.tableContainer.appendChild(fragment);
    }

    createUserRow(user) {
        const row = document.createElement('tr');
        const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
        const roleName = this.roleNames[user.role] || user.role;
        const statusBadge = user.isActive ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-secondary">Inactive</span>';
        
        row.innerHTML = `
            <td>${this.escapeHtml(fullName)}</td>
            <td>${this.escapeHtml(user.email)}</td>
            <td>${this.escapeHtml(user.phoneNumber)}</td>
            <td>${this.escapeHtml(roleName)}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-info edit-user-btn" data-user-id="${user.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user.id}">Delete</button>
            </td>
        `;
        
        return row;
    }

    showLoadingState() {
        this.tableContainer.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading users...</p>
            </div>
        `;
    }

    showErrorState(message) {
        this.tableContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${this.escapeHtml(message)}
            </div>
        `;
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        if (!this.mockUsersCache) return;

        const filteredUsers = this.mockUsersCache.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            const phone = user.phoneNumber.toLowerCase();
            const role = this.roleNames[user.role]?.toLowerCase() || '';
            
            return fullName.includes(searchTerm) || 
                   email.includes(searchTerm) || 
                   phone.includes(searchTerm) || 
                   role.includes(searchTerm);
        });

        this.renderUsersTable(filteredUsers);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    async editUser(id) {
        const user = this.mockUsersCache.find(u => u.id === id);
        if (!user) {
            this.showSnackbar('User not found.', 'error');
            return;
        }

        document.getElementById('userId').value = user.id;
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phoneNumber').value = user.phoneNumber || '';
        document.getElementById('dateOfBirth').value = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '';
        
        const roleName = this.roleNames[user.role] || 'User';
        document.getElementById('role').value = roleName;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }

    async deleteUser(id) {
        const user = this.mockUsersCache.find(u => u.id === id);
        const userName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : 'this user';
        
        // Store the ID and show confirmation snackbar
        this.userToDelete = id;
        document.getElementById('confirmationText').textContent = `Are you sure you want to delete "${userName}"?`;
        
        if (typeof showConfirmationSnackbar === 'function') {
            showConfirmationSnackbar();
        }
    }

    async confirmDelete() {
        if (!this.userToDelete) return;

        try {
            const response = await fetch(`/api/users/mock/${this.userToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            await this.loadUsers();
            this.showSnackbar('User deleted successfully!', 'info');
            this.userToDelete = null;
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showSnackbar('Failed to delete user', 'error');
            this.userToDelete = null;
        }
    }

    async handleSaveUser() {
        const id = document.getElementById('userId').value;
        const userData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            dateOfBirth: document.getElementById('dateOfBirth').value,
            role: this.roleNumbers[document.getElementById('role').value]
        };

        // Basic validation
        if (!userData.firstName || !userData.lastName || !userData.email) {
            this.showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        try {
            const url = id ? `/api/users/mock/${id}` : '/api/users/mock';
            const method = id ? 'PUT' : 'POST';
            
            console.log('Saving user:', { url, method, userData });
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('Save response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Save error response:', errorText);
                throw new Error(errorText || 'Failed to save user');
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            modal?.hide();
            
            await this.loadUsers();
            
            this.showSnackbar(id ? 'User updated successfully!' : 'User created successfully!', 'info');
        } catch (error) {
            console.error('Error saving user:', error);
            this.showSnackbar(error.message || 'Failed to save user', 'error');
        }
    }

    showSnackbar(message, type = 'info') {
        if (typeof window.showSnackbar === 'function') {
            window.showSnackbar(message, type);
        } else {
            // Fallback to console if snackbar function is not available
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});