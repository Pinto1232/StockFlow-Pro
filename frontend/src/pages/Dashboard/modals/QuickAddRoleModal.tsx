import React, { useState, useEffect } from "react";
import { UserPlus, Users, FileText, Settings, Package } from "lucide-react";

// Permission interfaces for type safety
interface RoleOption {
    id: string;
    name: string;
    displayName: string;
    description: string;
    iconClass: string;
    priority: number;
    keyPermissions: string[];
}

interface QuickAddRoleModalProps {
    onClose: () => void;
    onCreateNewRole: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const QuickAddRoleModal: React.FC<QuickAddRoleModalProps> = ({ 
    onClose, 
    onCreateNewRole, 
    onSuccess, 
    onError 
}) => {
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Fetch available roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setIsLoading(true);
                console.log('🔄 Fetching roles for Quick Add Role modal...');
                
                const response = await fetch('/api/role-management/roles/options', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const rolesData = await response.json();
                    console.log('✅ Successfully loaded roles:', rolesData);
                    setRoles(rolesData);
                } else {
                    console.warn('Failed to load roles, using fallback');
                    // Fallback roles
                    setRoles([
                        {
                            id: '1',
                            name: 'Admin',
                            displayName: 'Administrator',
                            description: 'Full system access with all permissions',
                            iconClass: 'fas fa-crown',
                            priority: 100,
                            keyPermissions: ['System.ViewAdminPanel', 'Users.ViewAll', 'Products.Manage']
                        },
                        {
                            id: '2',
                            name: 'Manager',
                            displayName: 'Manager',
                            description: 'Manage products and view reports',
                            iconClass: 'fas fa-user-tie',
                            priority: 75,
                            keyPermissions: ['Products.Manage', 'Reports.ViewBasic', 'Users.ViewTeam']
                        },
                        {
                            id: '3',
                            name: 'Employee',
                            displayName: 'Employee',
                            description: 'Basic access to view products and update profile',
                            iconClass: 'fas fa-user',
                            priority: 25,
                            keyPermissions: ['Products.View', 'Profile.Update']
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
                onError('Failed to load roles. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
    }, [onError]);

    const handleRoleSelect = (role: RoleOption) => {
        setSelectedRole(role);
    };

    const handleCreateUser = async () => {
        if (!userName.trim() || !userEmail.trim() || !selectedRole) {
            onError('Please fill in all fields and select a role.');
            return;
        }

        try {
            setIsCreatingUser(true);
            // Simulate user creation - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onSuccess(`User "${userName}" created successfully with ${selectedRole.displayName} role!`);
        } catch {
            onError('Failed to create user. Please try again.');
        } finally {
            setIsCreatingUser(false);
        }
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
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
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
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">Quick Add Role</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            disabled={isCreatingUser}
                            title="Close modal"
                        >
                            <span className="text-2xl font-light">×</span>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="text-lg text-gray-600 font-medium">Loading roles...</div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* User Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                        <Users className="w-4 h-4" />
                                        User Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                        placeholder="Enter full name"
                                        disabled={isCreatingUser}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                        <FileText className="w-4 h-4" />
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                        placeholder="user@company.com"
                                        disabled={isCreatingUser}
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
                                    <Settings className="w-4 h-4" />
                                    Select Role <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                                                selectedRole?.id === role.id
                                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                                            }`}
                                            onClick={() => handleRoleSelect(role)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                    <Settings className="w-5 h-5 text-white" />
                                                </div>
                                                {selectedRole?.id === role.id && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">{role.displayName}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {role.keyPermissions.slice(0, 3).map((permission, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                                    >
                                                        {permission.replace(/^[^.]+\./, '')}
                                                    </span>
                                                ))}
                                                {role.keyPermissions.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{role.keyPermissions.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Create New Role Button */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <div className="mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Need a different role?</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Create a custom role with specific permissions for your organization.
                                    </p>
                                </div>
                                <button
                                    onClick={onCreateNewRole}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium mx-auto"
                                    disabled={isCreatingUser}
                                >
                                    <Package className="w-4 h-4" />
                                    <span>Create New Role</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                        disabled={isCreatingUser}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-32"
                        style={{
                            background: isCreatingUser ? '#9ca3af' : 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
                            boxShadow: '0 2px 8px rgba(90, 92, 219, 0.3)'
                        }}
                        disabled={isCreatingUser || !userName.trim() || !userEmail.trim() || !selectedRole}
                    >
                        {isCreatingUser ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Create User
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

export default QuickAddRoleModal;