import React from "react";
import { UserRole } from "../../types/index";
import { Permissions, getPermissions } from "../../utils/permissions";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import UserRoleBadge from "./UserRoleBadge";

interface PermissionTableProps {
    className?: string;
}

/**
 * Component to display a comprehensive permissions matrix
 */
const PermissionTable: React.FC<PermissionTableProps> = ({
    className = "",
}) => {
    const roles = [UserRole.User, UserRole.Manager, UserRole.Admin];

    // Organize permissions by category
    const permissionCategories = [
        {
            name: "User Management",
            permissions: Object.values(Permissions.Users),
        },
        {
            name: "Product Management",
            permissions: Object.values(Permissions.Product),
        },
        {
            name: "Invoice Management",
            permissions: Object.values(Permissions.Invoice),
        },
        {
            name: "System Administration",
            permissions: Object.values(Permissions.System),
        },
        {
            name: "Data Management",
            permissions: Object.values(Permissions.Data),
        },
        {
            name: "Reports",
            permissions: Object.values(Permissions.Reports),
        },
    ];

    const hasPermission = (role: UserRole, permission: string): boolean => {
        const rolePermissions = getPermissions(role);
        return rolePermissions.has(permission);
    };

    const formatPermissionName = (permission: string): string => {
        // Convert 'users.view_all' to 'View All'
        const parts = permission.split(".");
        if (parts.length > 1) {
            return parts[1]
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
        return permission;
    };

    return (
        <div
            className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}
        >
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permission
                        </th>
                        {roles.map((role) => (
                            <th
                                key={role}
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                <UserRoleBadge role={role} size="sm" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {permissionCategories.map((category) => (
                        <React.Fragment key={category.name}>
                            {/* Category Header */}
                            <tr className="bg-gray-100">
                                <td
                                    colSpan={roles.length + 1}
                                    className="px-6 py-3 text-sm font-semibold text-gray-900"
                                >
                                    {category.name}
                                </td>
                            </tr>

                            {/* Category Permissions */}
                            {category.permissions.map((permission) => (
                                <tr
                                    key={permission}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">
                                                {formatPermissionName(
                                                    permission,
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                {permission}
                                            </div>
                                        </div>
                                    </td>
                                    {roles.map((role) => (
                                        <td
                                            key={`${role}-${permission}`}
                                            className="px-6 py-4 whitespace-nowrap text-center"
                                        >
                                            {hasPermission(role, permission) ? (
                                                <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionTable;
