import { useCurrentUser } from "./useAuth";
import { useDynamicPermissions } from "./useDynamicPermissions";
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
} from "../utils/permissions";
import { UserRole } from "../types/index";

/**
 * Configuration for permissions mode
 */
const USE_DYNAMIC_PERMISSIONS = import.meta.env.VITE_USE_DYNAMIC_PERMISSIONS === "true";

/**
 * Hook for checking user permissions
 * Supports both static (hardcoded) and dynamic (backend-driven) permissions
 */
export const usePermissions = () => {
    // Access full query to leverage loading/error states for initial page load.
    const currentUserQuery = useCurrentUser();
    interface CurrentUserQueryShape<T> {
        data: T | undefined;
        isLoading: boolean;
        error: unknown;
    }
    const { data: currentUser, isLoading: currentUserLoading, error: currentUserError } = currentUserQuery as unknown as CurrentUserQueryShape<typeof currentUser>;
    const dynamicPermissions = useDynamicPermissions();

    // Use dynamic permissions if enabled, otherwise fall back to static
    if (USE_DYNAMIC_PERMISSIONS) {
        return {
            hasPermission: dynamicPermissions.hasPermission,
            hasAnyPermission: dynamicPermissions.hasAnyPermission,
            hasAllPermissions: dynamicPermissions.hasAllPermissions,
            hasRole: dynamicPermissions.hasRole,
            hasAnyRole: dynamicPermissions.hasAnyRole,
            getUserPermissions: () => new Set(dynamicPermissions.userPermissions),
            userRole: dynamicPermissions.userRole,
            user: dynamicPermissions.user,
            isAdmin: dynamicPermissions.isAdmin,
            isManager: dynamicPermissions.isManager,
            isUser: dynamicPermissions.isUser,
            canManageUsers: dynamicPermissions.canManageUsers,
            canAccessAdminPanel: dynamicPermissions.canAccessAdminPanel,
            loading: dynamicPermissions.loading,
            error: dynamicPermissions.error,
            refreshPermissions: dynamicPermissions.refreshPermissions,
        };
    }

    // Static permissions (original implementation)
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
        // Expose real loading/error so PermissionRoute can defer redirect until resolved
        loading: !!currentUserLoading,
        error: currentUserError ?? null,
        refreshPermissions: () => Promise.resolve(),
    };
};
