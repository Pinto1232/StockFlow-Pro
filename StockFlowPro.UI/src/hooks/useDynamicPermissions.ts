import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./useAuth";
import { permissionsService } from "../services/permissionsService";
import { rolesService } from "../services/rolesService";
import type { PermissionDto, RoleDto } from "../types/index";

/**
 * Hook for managing dynamic permissions from the backend
 */
export const useDynamicPermissions = () => {
    const { data: currentUser } = useCurrentUser();
    const [permissions, setPermissions] = useState<PermissionDto[]>([]);
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load permissions from backend
    const loadPermissions = useCallback(async () => {
        try {
            const [permissionsData, rolesData] = await Promise.all([
                permissionsService.getPermissions(),
                rolesService.getRoles(),
            ]);
            
            setPermissions(permissionsData);
            setRoles(rolesData);
        } catch (err) {
            console.error("Error loading permissions:", err);
            setError(err instanceof Error ? err.message : "Failed to load permissions");
        }
    }, []);

    // Load user permissions
    const loadUserPermissions = useCallback(async () => {
        if (!currentUser) {
            setUserPermissions([]);
            return;
        }

        try {
            const userPerms = await permissionsService.getCurrentUserPermissions();
            setUserPermissions(userPerms);
        } catch (err) {
            console.error("Error loading user permissions:", err);
            setUserPermissions([]);
        }
    }, [currentUser]);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                await Promise.all([
                    loadPermissions(),
                    loadUserPermissions(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loadPermissions, loadUserPermissions]);

    // Permission checking functions
    const hasPermission = useCallback((permission: string): boolean => {
        return userPermissions.includes(permission);
    }, [userPermissions]);

    const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
        return permissionList.some(permission => userPermissions.includes(permission));
    }, [userPermissions]);

    const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
        return permissionList.every(permission => userPermissions.includes(permission));
    }, [userPermissions]);

    // Role checking functions
    const hasRole = useCallback((roleName: string): boolean => {
        if (!currentUser) return false;
        
        // Find the role by name and check if user has it
        const role = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (!role) return false;
        
        // For now, we'll use the user's role from the user object
        // In a more complex system, you might need to check role assignments
        return currentUser.role.toString() === role.name || 
               (currentUser.role === 1 && role.name === "Admin") ||
               (currentUser.role === 2 && role.name === "User") ||
               (currentUser.role === 3 && role.name === "Manager");
    }, [currentUser, roles]);

    const hasAnyRole = useCallback((roleNames: string[]): boolean => {
        return roleNames.some(roleName => hasRole(roleName));
    }, [hasRole]);

    // Convenience functions
    const isAdmin = useCallback((): boolean => {
        return hasRole("Admin");
    }, [hasRole]);

    const isManager = useCallback((): boolean => {
        return hasRole("Manager");
    }, [hasRole]);

    const isUser = useCallback((): boolean => {
        return hasRole("User");
    }, [hasRole]);

    const canManageUsers = useCallback((): boolean => {
        return hasAnyPermission([
            "users.create",
            "users.edit",
            "users.delete",
            "users.manage_roles"
        ]);
    }, [hasAnyPermission]);

    const canAccessAdminPanel = useCallback((): boolean => {
        return hasPermission("system.view_admin_panel");
    }, [hasPermission]);

    // Get permissions by category
    const getPermissionsByCategory = useCallback(() => {
        const categoryMap = new Map<string, PermissionDto[]>();
        
        permissions.forEach(permission => {
            if (!categoryMap.has(permission.category)) {
                categoryMap.set(permission.category, []);
            }
            categoryMap.get(permission.category)!.push(permission);
        });

        return Array.from(categoryMap.entries()).map(([category, perms]) => ({
            category,
            permissions: perms.sort((a, b) => a.displayName.localeCompare(b.displayName))
        })).sort((a, b) => a.category.localeCompare(b.category));
    }, [permissions]);

    // Refresh permissions
    const refreshPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Clear cache first
            permissionsService.clearPermissionsCache();
            
            await Promise.all([
                loadPermissions(),
                loadUserPermissions(),
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh permissions");
        } finally {
            setLoading(false);
        }
    }, [loadPermissions, loadUserPermissions]);

    return {
        // Data
        permissions,
        roles,
        userPermissions,
        loading,
        error,
        
        // Permission checking
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        
        // Role checking
        hasRole,
        hasAnyRole,
        
        // Convenience functions
        isAdmin,
        isManager,
        isUser,
        canManageUsers,
        canAccessAdminPanel,
        
        // Utilities
        getPermissionsByCategory,
        refreshPermissions,
        
        // User info
        user: currentUser,
        userRole: currentUser?.role,
    };
};