import React from "react";
import {
    Permission,
    RoleGuard,
    PermissionButton,
    UserRoleBadge,
    PermissionTable,
} from "../../components/Auth";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../utils/permissions";
import { UserRole } from "../../types/index";
import {
    ShieldCheckIcon,
    UserGroupIcon,
    CogIcon,
    DocumentTextIcon,
    CubeIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

/**
 * Demo page showcasing all role and permission features
 */
const PermissionsDemo: React.FC = () => {
    const { user, userRole, isAdmin, isManager, isUser, getUserPermissions } =
        usePermissions();

    const userPermissions = Array.from(getUserPermissions());

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Permissions & Roles Demo
                </h1>
                <p className="mt-2 text-gray-600">
                    This page demonstrates the role-based access control system
                    in action.
                </p>
            </div>

            {/* Current User Info */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Current User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{user?.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <div className="mt-1">
                            {userRole && <UserRoleBadge role={userRole} />}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Role Checks</p>
                        <div className="mt-1 space-x-2">
                            <span
                                className={`px-2 py-1 text-xs rounded ${isAdmin() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                            >
                                Admin: {isAdmin() ? "Yes" : "No"}
                            </span>
                            <span
                                className={`px-2 py-1 text-xs rounded ${isManager() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                            >
                                Manager: {isManager() ? "Yes" : "No"}
                            </span>
                            <span
                                className={`px-2 py-1 text-xs rounded ${isUser() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                            >
                                User: {isUser() ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permission-based Conditional Rendering */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Permission-based Conditional Rendering
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Permission permission={Permissions.Users.ViewAll}>
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                            <UserGroupIcon className="h-8 w-8 text-green-600 mb-2" />
                            <h3 className="font-medium text-green-900">
                                User Management
                            </h3>
                            <p className="text-sm text-green-700">
                                You can view and manage users.
                            </p>
                        </div>
                    </Permission>

                    <Permission permission={Permissions.System.ViewAdminPanel}>
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                            <ShieldCheckIcon className="h-8 w-8 text-blue-600 mb-2" />
                            <h3 className="font-medium text-blue-900">
                                Admin Panel
                            </h3>
                            <p className="text-sm text-blue-700">
                                You have admin panel access.
                            </p>
                        </div>
                    </Permission>

                    <Permission permission={Permissions.System.ManageSettings}>
                        <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                            <CogIcon className="h-8 w-8 text-purple-600 mb-2" />
                            <h3 className="font-medium text-purple-900">
                                System Settings
                            </h3>
                            <p className="text-sm text-purple-700">
                                You can manage system settings.
                            </p>
                        </div>
                    </Permission>

                    <Permission permission={Permissions.Invoice.ViewInvoices}>
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                            <DocumentTextIcon className="h-8 w-8 text-yellow-600 mb-2" />
                            <h3 className="font-medium text-yellow-900">
                                Invoices
                            </h3>
                            <p className="text-sm text-yellow-700">
                                You can view invoices.
                            </p>
                        </div>
                    </Permission>

                    <Permission permission={Permissions.Product.CreateProducts}>
                        <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
                            <CubeIcon className="h-8 w-8 text-indigo-600 mb-2" />
                            <h3 className="font-medium text-indigo-900">
                                Product Creation
                            </h3>
                            <p className="text-sm text-indigo-700">
                                You can create products.
                            </p>
                        </div>
                    </Permission>

                    <Permission permission={Permissions.Reports.ViewAdvanced}>
                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <ChartBarIcon className="h-8 w-8 text-red-600 mb-2" />
                            <h3 className="font-medium text-red-900">
                                Advanced Reports
                            </h3>
                            <p className="text-sm text-red-700">
                                You can view advanced reports.
                            </p>
                        </div>
                    </Permission>
                </div>
            </div>

            {/* Role-based Guards */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Role-based Guards
                </h2>

                <div className="space-y-4">
                    <RoleGuard allowedRoles={[UserRole.Admin]}>
                        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <h3 className="font-medium text-red-900">
                                Admin Only Content
                            </h3>
                            <p className="text-sm text-red-700">
                                This content is only visible to administrators.
                            </p>
                        </div>
                    </RoleGuard>

                    <RoleGuard
                        allowedRoles={[UserRole.Manager, UserRole.Admin]}
                    >
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900">
                                Manager & Admin Content
                            </h3>
                            <p className="text-sm text-blue-700">
                                This content is visible to managers and
                                administrators.
                            </p>
                        </div>
                    </RoleGuard>

                    <RoleGuard
                        allowedRoles={[
                            UserRole.User,
                            UserRole.Manager,
                            UserRole.Admin,
                        ]}
                    >
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                            <h3 className="font-medium text-green-900">
                                All Users Content
                            </h3>
                            <p className="text-sm text-green-700">
                                This content is visible to all authenticated
                                users.
                            </p>
                        </div>
                    </RoleGuard>
                </div>
            </div>

            {/* Permission Buttons */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Permission-based Buttons
                </h2>
                <div className="flex flex-wrap gap-4">
                    <PermissionButton
                        permission={Permissions.Users.Create}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create User
                    </PermissionButton>

                    <PermissionButton
                        permission={Permissions.Product.DeleteProducts}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete Product
                    </PermissionButton>

                    <PermissionButton
                        permission={Permissions.System.ViewLogs}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        View System Logs
                    </PermissionButton>

                    <PermissionButton
                        permission={Permissions.Data.Backup}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Backup Data
                    </PermissionButton>

                    <PermissionButton
                        permissions={[
                            Permissions.Reports.ViewAdvanced,
                            Permissions.Reports.Generate,
                        ]}
                        requireAll={true}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Generate Advanced Report
                    </PermissionButton>
                </div>
            </div>

            {/* User Permissions List */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Permissions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {userPermissions.map((permission) => (
                        <div
                            key={permission}
                            className="px-3 py-2 bg-gray-100 rounded-md text-sm font-mono"
                        >
                            {permission}
                        </div>
                    ))}
                </div>
                {userPermissions.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        No permissions assigned.
                    </p>
                )}
            </div>

            {/* Permission Matrix */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Complete Permissions Matrix
                </h2>
                <PermissionTable />
            </div>
        </div>
    );
};

export default PermissionsDemo;
