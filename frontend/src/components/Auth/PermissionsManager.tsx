import React, { useState, useEffect } from "react";
import { useDynamicPermissions } from "../../hooks/useDynamicPermissions";
import { permissionsService } from "../../services/permissionsService";
import { rolesService } from "../../services/rolesService";
import type { RoleDto, PermissionCategory } from "../../types/index";

interface PermissionsManagerProps {
    roleId?: string;
    onPermissionsChange?: (permissions: string[]) => void;
    readOnly?: boolean;
}

/**
 * Component for managing role permissions
 */
const PermissionsManager: React.FC<PermissionsManagerProps> = ({
    roleId,
    onPermissionsChange,
    readOnly = false,
}) => {
    const { refreshPermissions } = useDynamicPermissions();
    const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<RoleDto[]>([]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [rolesData, categoriesData] = await Promise.all([
                    rolesService.getRoles(),
                    permissionsService.getPermissionsByCategory(),
                ]);

                setRoles(rolesData);
                setPermissionCategories(categoriesData);

                // Load specific role if provided
                if (roleId) {
                    const role = rolesData.find(r => r.id === roleId);
                    if (role) {
                        setSelectedRole(role);
                        setSelectedPermissions(new Set(role.permissions));
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [roleId]);

    // Handle role selection
    const handleRoleChange = async (newRoleId: string) => {
        if (newRoleId === selectedRole?.id) return;

        setLoading(true);
        try {
            const role = await rolesService.getRoleWithPermissions(newRoleId);
            setSelectedRole(role);
            setSelectedPermissions(new Set(role.permissions));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load role");
        } finally {
            setLoading(false);
        }
    };

    // Handle permission toggle
    const handlePermissionToggle = (permissionName: string) => {
        if (readOnly) return;

        const newPermissions = new Set(selectedPermissions);
        if (newPermissions.has(permissionName)) {
            newPermissions.delete(permissionName);
        } else {
            newPermissions.add(permissionName);
        }

        setSelectedPermissions(newPermissions);
        onPermissionsChange?.(Array.from(newPermissions));
    };

    // Handle select all for category
    const handleCategorySelectAll = (category: PermissionCategory, selectAll: boolean) => {
        if (readOnly) return;

        const newPermissions = new Set(selectedPermissions);
        category.permissions.forEach(permission => {
            if (selectAll) {
                newPermissions.add(permission.name);
            } else {
                newPermissions.delete(permission.name);
            }
        });

        setSelectedPermissions(newPermissions);
        onPermissionsChange?.(Array.from(newPermissions));
    };

    // Save permissions
    const handleSavePermissions = async () => {
        if (!selectedRole || readOnly) return;

        setLoading(true);
        try {
            await permissionsService.updateRolePermissions(
                selectedRole.id,
                Array.from(selectedPermissions)
            );
            
            await refreshPermissions();
            // Show success message or handle success
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save permissions");
        } finally {
            setLoading(false);
        }
    };

    // Check if category is fully selected
    const isCategoryFullySelected = (category: PermissionCategory): boolean => {
        return category.permissions.every(permission => selectedPermissions.has(permission.name));
    };

    // Check if category is partially selected
    const isCategoryPartiallySelected = (category: PermissionCategory): boolean => {
        return category.permissions.some(permission => selectedPermissions.has(permission.name)) &&
               !isCategoryFullySelected(category);
    };

    if (loading && !permissionCategories.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading permissions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Role Selection */}
            {!roleId && (
                <div>
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Role
                    </label>
                    <select
                        id="role-select"
                        value={selectedRole?.id || ""}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                    >
                        <option value="">Select a role...</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.displayName} ({role.name})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Role Info */}
            {selectedRole && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedRole.displayName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedRole.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {selectedRole.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {selectedRole.isSystemRole && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                System Role
                            </span>
                        )}
                        <span className="text-xs text-gray-500">
                            Priority: {selectedRole.priority}
                        </span>
                    </div>
                </div>
            )}

            {/* Permissions */}
            {selectedRole && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Permissions</h4>
                        {!readOnly && (
                            <button
                                onClick={handleSavePermissions}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Permissions'
                                )}
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {permissionCategories.map(category => (
                            <div key={category.category} className="border border-gray-200 rounded-lg">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-medium text-gray-900">
                                            {category.category}
                                        </h5>
                                        {!readOnly && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleCategorySelectAll(category, true)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                    disabled={loading}
                                                >
                                                    Select All
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleCategorySelectAll(category, false)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                    disabled={loading}
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Category selection indicator */}
                                    <div className="mt-2">
                                        <div className={`h-1 rounded-full ${
                                            isCategoryFullySelected(category) 
                                                ? 'bg-green-500' 
                                                : isCategoryPartiallySelected(category)
                                                ? 'bg-yellow-500'
                                                : 'bg-gray-300'
                                        }`} />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {category.permissions.map(permission => (
                                            <label
                                                key={permission.id}
                                                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    selectedPermissions.has(permission.name)
                                                        ? 'border-blue-200 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                } ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.has(permission.name)}
                                                    onChange={() => handlePermissionToggle(permission.name)}
                                                    disabled={readOnly || loading}
                                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {permission.displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {permission.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1 font-mono">
                                                        {permission.name}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Summary</h5>
                        <p className="text-sm text-gray-600">
                            {selectedPermissions.size} of {permissionCategories.reduce((total, cat) => total + cat.permissions.length, 0)} permissions selected
                        </p>
                        {selectedPermissions.size > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Selected permissions:</p>
                                <div className="flex flex-wrap gap-1">
                                    {Array.from(selectedPermissions).slice(0, 10).map(permission => (
                                        <span
                                            key={permission}
                                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {permission}
                                        </span>
                                    ))}
                                    {selectedPermissions.size > 10 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            +{selectedPermissions.size - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionsManager;