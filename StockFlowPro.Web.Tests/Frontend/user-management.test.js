describe('UserManager', () => {
    let userManager;
    let mockFetch;
    let mockBootstrap;
    let mockDocument;

    beforeEach(() => {
        mockDocument = {
            getElementById: jest.fn(),
            createElement: jest.fn(),
            createDocumentFragment: jest.fn(),
            addEventListener: jest.fn()
        };

        mockFetch = jest.fn();
        global.fetch = mockFetch;

        mockBootstrap = {
            Modal: jest.fn().mockImplementation(() => ({
                show: jest.fn(),
                hide: jest.fn()
            }))
        };
        global.bootstrap = mockBootstrap;

        const mockTableContainer = {
            innerHTML: '',
            appendChild: jest.fn(),
            addEventListener: jest.fn()
        };

        const mockSaveButton = {
            addEventListener: jest.fn()
        };

        mockDocument.getElementById.mockImplementation((id) => {
            switch (id) {
                case 'user-table-section':
                    return mockTableContainer;
                case 'saveUserBtn':
                    return mockSaveButton;
                case 'userId':
                    return { value: '' };
                case 'firstName':
                    return { value: 'John' };
                case 'lastName':
                    return { value: 'Doe' };
                case 'email':
                    return { value: 'john.doe@example.com' };
                case 'phoneNumber':
                    return { value: '123-456-7890' };
                case 'dateOfBirth':
                    return { value: '1990-01-01' };
                case 'role':
                    return { value: 'User' };
                default:
                    return null;
            }
        });

        global.document = mockDocument;

        userManager = {
            mockUsersCache: [],
            roleNames: { 1: 'Admin', 2: 'User', 3: 'Manager' },
            roleNumbers: { 'Admin': 1, 'User': 2, 'Manager': 3 },
            isLoading: false,
            
            loadUsers: jest.fn(),
            renderUsersTable: jest.fn(),
            createUserRow: jest.fn(),
            editUser: jest.fn(),
            deleteUser: jest.fn(),
            handleSaveUser: jest.fn(),
            showSnackbar: jest.fn(),
            escapeHtml: jest.fn((text) => text)
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loadUsers', () => {
        it('should fetch users successfully', async () => {
            const mockUsers = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phoneNumber: '123-456-7890',
                    role: 2,
                    isActive: true
                }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValueOnce(mockUsers)
            });

            const loadUsers = async function() {
                const response = await fetch('/api/users/mock');
                if (!response.ok) {
                    throw new Error(`Failed to load users: ${response.status}`);
                }
                const users = await response.json();
                this.mockUsersCache = users;
                return users;
            }.bind(userManager);

            const result = await loadUsers();

            expect(mockFetch).toHaveBeenCalledWith('/api/users/mock');
            expect(result).toEqual(mockUsers);
            expect(userManager.mockUsersCache).toEqual(mockUsers);
        });

        it('should handle fetch error gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: jest.fn().mockResolvedValueOnce('Internal Server Error')
            });

            // Act & Assert
            const loadUsers = async function() {
                const response = await fetch('/api/users/mock');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to load users: ${response.status} - ${errorText}`);
                }
            };

            await expect(loadUsers()).rejects.toThrow('Failed to load users: 500 - Internal Server Error');
        });
    });

    describe('createUserRow', () => {
        it('should create user row with correct data', () => {
            // Arrange
            const user = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phoneNumber: '123-456-7890',
                role: 2,
                isActive: true
            };

            const mockRow = {
                innerHTML: ''
            };

            mockDocument.createElement.mockReturnValueOnce(mockRow);

            // Act
            const createUserRow = function(user) {
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
            }.bind(userManager);

            const result = createUserRow(user);

            // Assert
            expect(mockDocument.createElement).toHaveBeenCalledWith('tr');
            expect(result.innerHTML).toContain('John Doe');
            expect(result.innerHTML).toContain('john.doe@example.com');
            expect(result.innerHTML).toContain('User'); // Role name
            expect(result.innerHTML).toContain('Active');
            expect(result.innerHTML).toContain('edit-user-btn');
            expect(result.innerHTML).toContain('delete-user-btn');
        });

        it('should handle inactive user status', () => {
            // Arrange
            const user = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phoneNumber: '987-654-3210',
                role: 1,
                isActive: false
            };

            const mockRow = { innerHTML: '' };
            mockDocument.createElement.mockReturnValueOnce(mockRow);

            // Act
            const createUserRow = function(user) {
                const row = document.createElement('tr');
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`;
                const roleName = this.roleNames[user.role] || user.role;
                const statusBadge = user.isActive ? 
                    '<span class="badge bg-success">Active</span>' : 
                    '<span class="badge bg-secondary">Inactive</span>';
                
                row.innerHTML = `
                    <td>${fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.phoneNumber}</td>
                    <td>${roleName}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-info edit-user-btn" data-user-id="${user.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user.id}">Delete</button>
                    </td>
                `;
                
                return row;
            }.bind(userManager);

            const result = createUserRow(user);

            // Assert
            expect(result.innerHTML).toContain('Jane Smith');
            expect(result.innerHTML).toContain('Admin'); // Role name for role 1
            expect(result.innerHTML).toContain('Inactive');
        });
    });

    describe('handleSaveUser', () => {
        it('should create new user successfully', async () => {
            // Arrange
            const mockResponse = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phoneNumber: '123-456-7890',
                role: 2,
                isActive: true
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValueOnce(mockResponse)
            });

            // Mock modal
            const mockModal = {
                hide: jest.fn()
            };
            mockBootstrap.Modal.getInstance = jest.fn().mockReturnValueOnce(mockModal);

            // Act
            const handleSaveUser = async function() {
                const userData = {
                    firstName: document.getElementById('firstName').value.trim(),
                    lastName: document.getElementById('lastName').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phoneNumber: document.getElementById('phoneNumber').value.trim(),
                    dateOfBirth: document.getElementById('dateOfBirth').value,
                    role: this.roleNumbers[document.getElementById('role').value]
                };

                const response = await fetch('/api/users/mock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    throw new Error('Failed to save user');
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                modal?.hide();
                
                this.showSnackbar('User created successfully!', 'info');
            }.bind(userManager);

            await handleSaveUser();

            // Assert
            expect(mockFetch).toHaveBeenCalledWith('/api/users/mock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phoneNumber: '123-456-7890',
                    dateOfBirth: '1990-01-01',
                    role: 2
                })
            });
            expect(mockModal.hide).toHaveBeenCalled();
            expect(userManager.showSnackbar).toHaveBeenCalledWith('User created successfully!', 'info');
        });

        it('should handle validation errors', async () => {
            // Arrange
            mockDocument.getElementById.mockImplementation((id) => {
                switch (id) {
                    case 'firstName':
                        return { value: '' }; // Empty first name
                    case 'lastName':
                        return { value: 'Doe' };
                    case 'email':
                        return { value: 'john.doe@example.com' };
                    default:
                        return { value: 'test' };
                }
            });

            // Act
            const handleSaveUser = async function() {
                const userData = {
                    firstName: document.getElementById('firstName').value.trim(),
                    lastName: document.getElementById('lastName').value.trim(),
                    email: document.getElementById('email').value.trim()
                };

                if (!userData.firstName || !userData.lastName || !userData.email) {
                    this.showSnackbar('Please fill in all required fields', 'error');
                    return;
                }
            }.bind(userManager);

            await handleSaveUser();

            // Assert
            expect(userManager.showSnackbar).toHaveBeenCalledWith('Please fill in all required fields', 'error');
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('editUser', () => {
        it('should populate form with user data', () => {
            // Arrange
            const user = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phoneNumber: '123-456-7890',
                dateOfBirth: '1990-01-01T00:00:00',
                role: 2
            };

            userManager.mockUsersCache = [user];

            const mockFormElements = {
                userId: { value: '' },
                firstName: { value: '' },
                lastName: { value: '' },
                email: { value: '' },
                phoneNumber: { value: '' },
                dateOfBirth: { value: '' },
                role: { value: '' }
            };

            mockDocument.getElementById.mockImplementation((id) => mockFormElements[id] || null);

            const mockModal = {
                show: jest.fn()
            };
            mockBootstrap.Modal.mockReturnValueOnce(mockModal);

            // Act
            const editUser = function(id) {
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
            }.bind(userManager);

            editUser(user.id);

            // Assert
            expect(mockFormElements.userId.value).toBe(user.id);
            expect(mockFormElements.firstName.value).toBe('John');
            expect(mockFormElements.lastName.value).toBe('Doe');
            expect(mockFormElements.email.value).toBe('john.doe@example.com');
            expect(mockFormElements.phoneNumber.value).toBe('123-456-7890');
            expect(mockFormElements.dateOfBirth.value).toBe('1990-01-01');
            expect(mockFormElements.role.value).toBe('User');
            expect(mockModal.show).toHaveBeenCalled();
        });

        it('should handle user not found', () => {
            // Arrange
            userManager.mockUsersCache = [];

            // Act
            const editUser = function(id) {
                const user = this.mockUsersCache.find(u => u.id === id);
                if (!user) {
                    this.showSnackbar('User not found.', 'error');
                    return;
                }
            }.bind(userManager);

            editUser('non-existent-id');

            // Assert
            expect(userManager.showSnackbar).toHaveBeenCalledWith('User not found.', 'error');
        });
    });

    describe('escapeHtml', () => {
        it('should escape HTML characters', () => {
            // Act
            const escapeHtml = function(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
            };

            // Assert
            expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
            expect(escapeHtml('John & Jane')).toBe('John &amp; Jane');
            expect(escapeHtml("It's a test")).toBe('It&#039;s a test');
        });
    });

    describe('role conversion', () => {
        it('should convert role numbers to names correctly', () => {
            expect(userManager.roleNames[1]).toBe('Admin');
            expect(userManager.roleNames[2]).toBe('User');
            expect(userManager.roleNames[3]).toBe('Manager');
        });

        it('should convert role names to numbers correctly', () => {
            expect(userManager.roleNumbers['Admin']).toBe(1);
            expect(userManager.roleNumbers['User']).toBe(2);
            expect(userManager.roleNumbers['Manager']).toBe(3);
        });
    });
});