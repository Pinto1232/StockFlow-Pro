import React, { useState, useEffect } from "react";

// Permission interfaces for type safety
interface PermissionDto {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface PermissionCategory {
    category: string;
    permissions: string[];
}

interface RoleOption {
    id: string;
    name: string;
    displayName: string;
    description: string;
    iconClass: string;
    priority: number;
    keyPermissions: string[];
}

interface CreateRoleModalProps {
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onSuccess, onError }) => {
    // Role creation form data
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        priority: 25,
        permissions: [] as string[],
    });
    
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    // Transform permission data into categorized structure
    const transformPermissionsToCategories = (permissions: (PermissionDto | string)[]): PermissionCategory[] => {
        const categoryMap = new Map<string, string[]>();
        
        permissions.forEach((permission) => {
            // Handle both PermissionDto objects and simple strings
            let category: string;
            let permissionName: string;
            
            if (typeof permission === 'string') {
                // Handle simple string permissions like "Users.ViewAll"
                const parts = permission.split('.');
                category = parts.length > 1 ? parts[0] : 'Other';
                permissionName = permission;
            } else if (permission && typeof permission === 'object') {
                // Handle PermissionDto objects
                category = permission.category || 'Other';
                permissionName = permission.name || permission.displayName || '';
            } else {
                return; // Skip invalid entries
            }
            
            if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
            }
            
            if (permissionName) {
                categoryMap.get(category)!.push(permissionName);
            }
        });
        
        return Array.from(categoryMap.entries()).map(([category, perms]) => ({
            category,
            permissions: perms.sort()
        })).sort((a, b) => a.category.localeCompare(b.category));
    };

    // Fallback permissions when API is not available
    const getFallbackPermissions = (): PermissionCategory[] => {
        return [
            {
                category: "Users",
                permissions: ["Users.ViewAll", "Users.ViewTeam", "Users.Create", "Users.Update", "Users.Delete"]
            },
            {
                category: "Products", 
                permissions: ["Products.View", "Products.Create", "Products.Update", "Products.Delete", "Products.Manage"]
            },
            {
                category: "Inventory",
                permissions: ["Inventory.View", "Inventory.Update", "Inventory.Manage", "Inventory.Reports"]
            },
            {
                category: "Reports",
                permissions: ["Reports.ViewBasic", "Reports.ViewAdvanced", "Reports.ViewAll", "Reports.Create", "Reports.Export"]
            },
            {
                category: "System",
                permissions: ["System.ViewAdminPanel", "System.ManageSettings", "System.ViewLogs", "System.Backup"]
            },
            {
                category: "Profile",
                permissions: ["Profile.View", "Profile.Update", "Profile.ChangePassword"]
            }
        ];
    };

    // Fetch available permissions from existing roles
    useEffect(() => {
        const fetchPermissionsFromRoles = async () => {
            try {
                setIsLoadingPermissions(true);
                setPermissionsError(null);
                
                console.log('🔄 Fetching permissions from existing roles...');
                
                const response = await fetch("/api/role-management/roles/options", {
                    credentials: "include", // Include cookies for authentication
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                });
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const roles = await response.json();
                        console.log('🔄 Successfully loaded roles:', roles);
                        
                        // Extract all permissions from all roles
                        const allPermissions = new Set<string>();
                        roles.forEach((role: RoleOption) => {
                            if (role.keyPermissions && Array.isArray(role.keyPermissions)) {
                                role.keyPermissions.forEach((permission: string) => {
                                    allPermissions.add(permission);
                                });
                            }
                        });
                        
                        const permissionsArray = Array.from(allPermissions);
                        console.log('🔄 Extracted permissions:', permissionsArray);
                        
                        // Transform permissions into categorized structure
                        const categorizedPermissions = transformPermissionsToCategories(permissionsArray);
                        setPermissionCategories(categorizedPermissions);
                        
                        console.log('✅ Successfully categorized permissions:', categorizedPermissions);
                        
                    } else {
                        throw new Error('Invalid response format');
                    }
                } else if (response.status === 401) {
                    console.warn('User not authenticated for roles API');
                    setPermissionsError('Authentication required to load permissions. Please ensure you are logged in.');
                    setPermissionCategories(getFallbackPermissions());
                } else if (response.status === 403) {
                    console.warn('User not authorized for roles API');
                    setPermissionsError('Insufficient permissions to load role data. Using basic permissions.');
                    setPermissionCategories(getFallbackPermissions());
                } else if (response.status === 404) {
                    console.warn('Roles endpoint not found');
                    setPermissionsError('Roles endpoint not available. Using fallback permissions.');
                    setPermissionCategories(getFallbackPermissions());
                } else {
                    throw new Error(`API returned status ${response.status}`);
                }
                
            } catch (error) {
                console.error("Error fetching permissions from roles:", error);
                setPermissionsError('Failed to load permissions from roles. Using fallback permissions.');
                setPermissionCategories(getFallbackPermissions());
            } finally {
                setIsLoadingPermissions(false);
            }
        };

        fetchPermissionsFromRoles();
    }, []);

    const validateInput = (field: string, value: string | number) => {
        const errors = { ...validationErrors };
        
        switch (field) {
            case 'name':
                if (!value || (typeof value === 'string' && value.trim().length < 2)) {
                    errors.name = 'Role name must be at least 2 characters';
                } else {
                    delete errors.name;
                }
                break;
            case 'priority':
                if (typeof value === 'number' && (value < 0 || value > 100)) {
                    errors.priority = 'Priority must be between 0 and 100';
                } else {
                    delete errors.priority;
                }
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: string, value: string | number) => {
        setRoleFormData(prev => ({ ...prev, [field]: value }));
        validateInput(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const nameValid = validateInput('name', roleFormData.name);
        const priorityValid = validateInput('priority', roleFormData.priority);
        
        if (!nameValid || !priorityValid) {
            onError('Please fix the validation errors before submitting');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🔄 Creating role with data:', {
                name: roleFormData.name.trim(),
                displayName: roleFormData.displayName.trim() || roleFormData.name.trim(),
                description: roleFormData.description.trim(),
                priority: roleFormData.priority,
                permissions: roleFormData.permissions,
            });

            const response = await fetch('/api/role-management/roles', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: roleFormData.name.trim(),
                    displayName: roleFormData.displayName.trim() || roleFormData.name.trim(),
                    description: roleFormData.description.trim(),
                    priority: roleFormData.priority,
                    permissions: roleFormData.permissions,
                }),
            });

            console.log('🔄 Response status:', response.status);
            console.log('🔄 Response headers:', response.headers);

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const newRole = await response.json();
                    console.log('✅ Role created successfully:', newRole);
                    onSuccess(`Role "${newRole.displayName || newRole.name}" created successfully!`);
                } else {
                    console.warn('⚠️ Response is not JSON');
                    onSuccess('Role created successfully!');
                }
            } else if (response.status === 401) {
                onError('Authentication required. Please ensure you are logged in as an Admin.');
            } else if (response.status === 403) {
                onError('Insufficient permissions. Admin role required to create roles.');
            } else if (response.status === 404) {
                onError('Role creation endpoint not found. Please check if the backend service is running.');
            } else {
                // Try to get error message from response
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        onError(errorData.message || `Failed to create role (Status: ${response.status})`);
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Non-JSON error response:', errorText);
                        onError(`Failed to create role (Status: ${response.status})`);
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing error response:', parseError);
                    onError(`Failed to create role (Status: ${response.status})`);
                }
            }
        } catch (error) {
            console.error('❌ Error creating role:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                onError('Network error. Please check if the backend service is running.');
            } else {
                onError('Failed to create role. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionToggle = (permission: string) => {
        setRoleFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
            style={{ animation: 'fadeIn 0.3s ease' }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
                style={{ 
                    animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div 
                    className="relative p-8 pb-6 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
                    }}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H13V17H5V15H13V13H5V11H13V9H21ZM13 7H18L13 2V7ZM20 15V18H23V20H20V23H18V20H15V18H18V15H20Z"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">Create New Role</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            disabled={isLoading}
                            title="Close modal"
                        >
                            <span className="text-2xl font-light">×</span>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-10 max-h-[calc(90vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Name */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={roleFormData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-5 py-4 border-2 rounded-xl text-base transition-all duration-300 ${
                                    validationErrors.name 
                                        ? 'border-red-500 focus:ring-4 focus:ring-red-100 focus:border-red-500' 
                                        : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                } focus:outline-none`}
                                placeholder="Enter role name"
                                required
                                disabled={isLoading}
                            />
                            {validationErrors.name && (
                                <div className="text-sm text-red-600 mt-2">
                                    {validationErrors.name}
                                </div>
                            )}
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={roleFormData.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                placeholder="Enter display name"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Description
                            </label>
                            <textarea
                                value={roleFormData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                rows={3}
                                placeholder="Describe the role's purpose and responsibilities"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Priority Level */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Priority Level
                            </label>
                            <input
                                type="number"
                                value={roleFormData.priority}
                                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                                className={`w-full px-5 py-4 border-2 rounded-xl text-base transition-all duration-300 ${
                                    validationErrors.priority 
                                        ? 'border-red-500 focus:ring-4 focus:ring-red-100 focus:border-red-500' 
                                        : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                } focus:outline-none`}
                                min="0"
                                max="100"
                                placeholder="0"
                                disabled={isLoading}
                            />
                            {validationErrors.priority && (
                                <div className="text-sm text-red-600 mt-2">
                                    {validationErrors.priority}
                                </div>
                            )}
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
                                Permissions
                            </label>
                            {isLoadingPermissions ? (
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-gray-200 rounded-xl bg-gray-50">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <div className="text-base text-gray-600 font-medium">Loading permissions...</div>
                                </div>
                            ) : permissionsError ? (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="text-center text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <div className="font-medium mb-2">Permissions Loaded with Fallback</div>
                                        <div>{permissionsError}</div>
                                    </div>
                                </div>
                            ) : permissionCategories.length === 0 ? (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="text-center text-sm text-gray-500 p-4">
                                        No permissions available to assign.
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto bg-gray-50">
                                    <div className="space-y-6">
                                        {permissionCategories.map((category) => (
                                            <div key={category.category} className="mb-6">
                                                <h5 className="text-base font-semibold mb-3 pb-2 border-b border-blue-200 text-blue-600">
                                                    {category.category}
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {category.permissions.map((permission) => (
                                                        <label
                                                            key={permission}
                                                            className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={roleFormData.permissions.includes(permission)}
                                                                onChange={() => handlePermissionToggle(permission)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                disabled={isLoading}
                                                            />
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {permission.replace(/^[^.]+\./, '')}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-32"
                        style={{
                            background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
                            boxShadow: '0 2px 8px rgba(90, 92, 219, 0.3)'
                        }}
                        disabled={isLoading || isLoadingPermissions || Object.keys(validationErrors).length > 0}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                Create Role
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateRoleModal;