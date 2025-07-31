import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

interface PermissionProps {
    children: React.ReactNode;
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

/**
 * Component for conditional rendering based on user permissions
 *
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @param fallback - Component to render if user doesn't have permission
 * @param children - Content to render if user has permission
 */
const Permission: React.FC<PermissionProps> = ({
    children,
    permission,
    permissions,
    requireAll = false,
    fallback = null,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } =
        usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default Permission;
