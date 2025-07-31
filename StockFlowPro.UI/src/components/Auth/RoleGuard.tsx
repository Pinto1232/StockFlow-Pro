import React from "react";
import { useCurrentUser } from "../../hooks/useAuth";
import { UserRole } from "../../types/index";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallback?: React.ReactNode;
    requireExact?: boolean;
}

/**
 * Component for role-based access control
 *
 * @param allowedRoles - Array of roles that can access the content
 * @param fallback - Component to render if user doesn't have required role
 * @param requireExact - If true, user role must match exactly. If false, allows role hierarchy
 * @param children - Content to render if user has required role
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback = null,
    requireExact = false,
}) => {
    const { data: currentUser } = useCurrentUser();

    if (!currentUser) {
        return <>{fallback}</>;
    }

    let hasAccess = false;

    if (requireExact) {
        hasAccess = allowedRoles.includes(currentUser.role);
    } else {
        // Role hierarchy: Admin > Supervisor > Manager > User
        const roleHierarchy = {
            [UserRole.Admin]: 4,
            [UserRole.Supervisor]: 3,
            [UserRole.Manager]: 2,
            [UserRole.User]: 1,
        };

        const userRoleLevel = roleHierarchy[currentUser.role];
        const minRequiredLevel = Math.min(
            ...allowedRoles.map((role) => roleHierarchy[role]),
        );

        hasAccess = userRoleLevel >= minRequiredLevel;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
