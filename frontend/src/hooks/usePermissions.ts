import { useCurrentUser } from "./useAuth";
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
} from "../utils/permissions";
import { UserRole } from "../types/index";

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
    const { data: currentUser } = useCurrentUser();

    const checkPermission = (permission: string): boolean => {
        if (!currentUser) return false;
        return hasPermission(currentUser.role, permission);
    };

    const checkAnyPermission = (permissions: string[]): boolean => {
        if (!currentUser) return false;
        return hasAnyPermission(currentUser.role, permissions);
    };

    const checkAllPermissions = (permissions: string[]): boolean => {
        if (!currentUser) return false;
        return hasAllPermissions(currentUser.role, permissions);
    };

    const checkRole = (role: UserRole): boolean => {
        if (!currentUser) return false;
        return currentUser.role === role;
    };

    const checkAnyRole = (roles: UserRole[]): boolean => {
        if (!currentUser) return false;
        return roles.includes(currentUser.role);
    };

    const getUserPermissions = (): Set<string> => {
        if (!currentUser) return new Set();
        return getPermissions(currentUser.role);
    };

    const isAdmin = (): boolean => {
        return checkRole(UserRole.Admin);
    };

    const isManager = (): boolean => {
        return checkRole(UserRole.Manager);
    };

    const isUser = (): boolean => {
        return checkRole(UserRole.User);
    };

    const canManageUsers = (): boolean => {
        return checkAnyRole([UserRole.Admin, UserRole.Manager]);
    };

    const canAccessAdminPanel = (): boolean => {
        return isAdmin();
    };

    return {
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        hasRole: checkRole,
        hasAnyRole: checkAnyRole,
        getUserPermissions,
        userRole: currentUser?.role,
        user: currentUser,
        isAdmin,
        isManager,
        isUser,
        canManageUsers,
        canAccessAdminPanel,
    };
};
