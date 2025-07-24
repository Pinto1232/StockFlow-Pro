import React, { useState } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { useDynamicPermissions } from "../../hooks/useDynamicPermissions";
import { Permissions } from "../../utils/permissions";
import Permission from "../../components/Auth/Permission";
import PermissionButton from "../../components/Auth/PermissionButton";
import RoleGuard from "../../components/Auth/RoleGuard";
import UserRoleBadge from "../../components/Auth/UserRoleBadge";
import PermissionsManager from "../../components/Auth/PermissionsManager";
import { UserRole } from "../../types/index";

/**
 * Demo page showcasing the permissions system
 */
const PermissionsDemo: React.FC = () => {
    const permissions = usePermissions();
    const dynamicPermissions = useDynamicPermissions();
    const [selectedTab, setSelectedTab] = useState<'overview' | 'manager' | 'matrix'>('overview');

    const isDynamicMode = import.meta.env.VITE_USE_DYNAMIC_PERMISSIONS === "true";

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Permissions System Demo</h1>
                    <p className="mt-2 text-gray-600">
                        Comprehensive demonstration of the role-based access control system
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isDynamicMode ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                            {isDynamicMode ? 'Dynamic Permissions (Backend)' : 'Static Permissions (Hardcoded)'}
                        </span>
                        {permissions.loading && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-2"></div>
                                Loading...
                            </span>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {permissions.error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Permissions Error</h3>
                                <p className="text-sm text-red-700 mt-1">{permissions.error}</p>
                                {permissions.refreshPermissions && (
                                    <button
                                        onClick={permissions.refreshPermissions}
                                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {[
                            { id: 'overview', name: 'Overview & Testing' },
                            { id: 'manager', name: 'Permissions Manager' },
                            { id: 'matrix', name: 'Permissions Matrix' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'overview' | 'manager' | 'matrix')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                    selectedTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Current User Info */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Current User Information</h2>
                            {permissions.user ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="text-sm font-medium text-gray-900">{permissions.user.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{permissions.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Role</p>
                                        <div className="mt-1">
                                            <UserRoleBadge role={permissions.user.role} size="sm" showIcon={true} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Role Checks</p>
                                        <div className="mt-1 space-x-2">
                                            {permissions.isAdmin() && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    Admin
                                                </span>
                                            )}
                                            {permissions.isManager() && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Manager
                                                </span>
                                            )}
                                            {permissions.isUser() && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    User
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Permissions Count</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {permissions.getUserPermissions().size} permissions
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Can Manage Users</p>
                                        <p className={`text-sm font-medium ${
                                            permissions.canManageUsers() ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {permissions.canManageUsers() ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No user logged in</p>
                            )}
                        </div>

                        {/* Permission-based Components */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Permission-based Components</h2>
                            <div className="space-y-6">
                                {/* Basic Permission Component */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-2">Basic Permission Checks</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <Permission permission={Permissions.Users.Create}>
                                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                                <p className="text-sm text-green-800">✓ Can create users</p>
                                            </div>
                                        </Permission>
                                        <Permission 
                                            permission={Permissions.Users.Create}
                                            fallback={
                                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-800">✗ Cannot create users</p>
                                                </div>
                                            }
                                        >
                                            <></>
                                        </Permission>
                                        <Permission permission={Permissions.System.ViewAdminPanel}>
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-sm text-blue-800">✓ Can access admin panel</p>
                                            </div>
                                        </Permission>
                                        <Permission 
                                            permission={Permissions.System.ViewAdminPanel}
                                            fallback={
                                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-800">✗ Cannot access admin panel</p>
                                                </div>
                                            }
                                        >
                                            <></>
                                        </Permission>
                                    </div>
                                </div>

                                {/* Multiple Permissions */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-2">Multiple Permission Checks</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Permission 
                                            permissions={[Permissions.Reports.ViewAdvanced, Permissions.Reports.Generate]}
                                            requireAll={true}
                                        >
                                            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                                <p className="text-sm text-purple-800">✓ Can view AND generate advanced reports</p>
                                            </div>
                                        </Permission>
                                        <Permission 
                                            permissions={[Permissions.Reports.ViewAdvanced, Permissions.Reports.Generate]}
                                            requireAll={true}
                                            fallback={
                                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-800">✗ Cannot view AND generate advanced reports</p>
                                                </div>
                                            }
                                        >
                                            <></>
                                        </Permission>
                                        <Permission 
                                            permissions={[Permissions.Users.Edit, Permissions.Users.Delete]}
                                            requireAll={false}
                                        >
                                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                                <p className="text-sm text-orange-800">✓ Can edit OR delete users</p>
                                            </div>
                                        </Permission>
                                        <Permission 
                                            permissions={[Permissions.Users.Edit, Permissions.Users.Delete]}
                                            requireAll={false}
                                            fallback={
                                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-800">✗ Cannot edit OR delete users</p>
                                                </div>
                                            }
                                        >
                                            <></>
                                        </Permission>
                                    </div>
                                </div>

                                {/* Permission Buttons */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-2">Permission Buttons</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <PermissionButton
                                            permission={Permissions.Users.Create}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            Create User
                                        </PermissionButton>
                                        <PermissionButton
                                            permission={Permissions.Product.DeleteProducts}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                            disabledMessage="You don't have permission to delete products"
                                        >
                                            Delete Product
                                        </PermissionButton>
                                        <PermissionButton
                                            permission={Permissions.Data.Export}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            Export Data
                                        </PermissionButton>
                                    </div>
                                </div>

                                {/* Role Guards */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-2">Role-based Guards</h3>
                                    <div className="space-y-3">
                                        <RoleGuard allowedRoles={[UserRole.Admin]}>
                                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                <p className="text-sm text-red-800">🔒 Admin-only content</p>
                                            </div>
                                        </RoleGuard>
                                        <RoleGuard allowedRoles={[UserRole.Manager, UserRole.Admin]}>
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-sm text-blue-800">👥 Manager and Admin content</p>
                                            </div>
                                        </RoleGuard>
                                        <RoleGuard allowedRoles={[UserRole.User, UserRole.Manager, UserRole.Admin]}>
                                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                                <p className="text-sm text-green-800">👤 All users content</p>
                                            </div>
                                        </RoleGuard>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Permissions List */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Current User Permissions</h2>
                            {permissions.getUserPermissions().size > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {Array.from(permissions.getUserPermissions()).sort().map(permission => (
                                        <span
                                            key={permission}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                        >
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No permissions available</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedTab === 'manager' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Permissions Manager</h2>
                        <Permission permission={Permissions.Users.ManageRoles}>
                            <PermissionsManager />
                        </Permission>
                        <Permission 
                            permission={Permissions.Users.ManageRoles}
                            fallback={
                                <div className="text-center py-8">
                                    <div className="mx-auto h-12 w-12 text-gray-400">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        You don't have permission to manage role permissions.
                                    </p>
                                </div>
                            }
                        >
                            <></>
                        </Permission>
                    </div>
                )}

                {selectedTab === 'matrix' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Permissions Matrix</h2>
                        {isDynamicMode && dynamicPermissions.getPermissionsByCategory ? (
                            <div className="space-y-6">
                                {dynamicPermissions.getPermissionsByCategory().map(category => (
                                    <div key={category.category}>
                                        <h3 className="text-md font-medium text-gray-800 mb-3">{category.category}</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Permission
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Description
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            You Have Access
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {category.permissions.map(permission => (
                                                        <tr key={permission.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {permission.displayName}
                                                                <div className="text-xs text-gray-500 font-mono">
                                                                    {permission.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {permission.description}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    permissions.hasPermission(permission.name)
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {permissions.hasPermission(permission.name) ? 'Yes' : 'No'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    Permissions matrix is only available in dynamic permissions mode.
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Set VITE_USE_DYNAMIC_PERMISSIONS=true in your environment variables.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionsDemo;