/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    PermissionDto,
    CreatePermissionDto,
    UpdatePermissionDto,
    RolePermissionDto,
    CreateRolePermissionDto,
    PermissionCategory,
    UserPermissionsDto,
    ApiResponse,
    PaginatedResponse,
} from "../types/index";

// API base URL - this should be configured based on environment
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5131/api";

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ message: "An error occurred" }));
        const err = new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
        ) as Error & { status?: number };
        err.status = response.status;
        throw err;
    }
    return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

type ErrorWithStatus = Error & { status?: number };

export const permissionsService = {
    // Get all permissions
    getPermissions: async (): Promise<PermissionDto[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/permissions`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data; // Handle both wrapped and unwrapped responses
        } catch (error) {
            const status = (error as ErrorWithStatus)?.status;
            if (status === 401 || status === 403) {
                // Not authenticated/authorized; return empty to avoid noisy errors pre-login
                return [];
            }
            console.error("Error fetching permissions:", error);
            throw error;
        }
    },

    // Get permissions grouped by category
    getPermissionsByCategory: async (): Promise<PermissionCategory[]> => {
        try {
            const permissions = await permissionsService.getPermissions();
            
            // Group permissions by category
            const categoryMap = new Map<string, PermissionDto[]>();
            
            permissions.forEach(permission => {
                if (!categoryMap.has(permission.category)) {
                    categoryMap.set(permission.category, []);
                }
                categoryMap.get(permission.category)!.push(permission);
            });

            // Convert to array and sort
            return Array.from(categoryMap.entries())
                .map(([category, permissions]) => ({
                    category,
                    permissions: permissions.sort((a, b) => a.displayName.localeCompare(b.displayName))
                }))
                .sort((a, b) => a.category.localeCompare(b.category));
        } catch (error) {
            console.error("Error fetching permissions by category:", error);
            throw error;
        }
    },

    // Get permission by ID
    getPermission: async (id: string): Promise<PermissionDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            const status = (error as ErrorWithStatus)?.status;
            if (status === 401 || status === 403) {
                throw new Error("Not authorized to view permission");
            }
            console.error("Error fetching permission:", error);
            throw error;
        }
    },

    // Create new permission
    createPermission: async (permission: CreatePermissionDto): Promise<PermissionDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/permissions`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(permission),
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error creating permission:", error);
            throw error;
        }
    },

    // Update permission
    updatePermission: async (id: string, permission: UpdatePermissionDto): Promise<PermissionDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(permission),
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error updating permission:", error);
            throw error;
        }
    },

    // Delete permission
    deletePermission: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            await handleApiResponse(response);
        } catch (error) {
            console.error("Error deleting permission:", error);
            throw error;
        }
    },

    // Get role permissions
    getRolePermissions: async (roleId?: string): Promise<RolePermissionDto[]> => {
        try {
            const url = roleId 
                ? `${API_BASE_URL}/role-permissions?roleId=${roleId}`
                : `${API_BASE_URL}/role-permissions`;
                
            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            const status = (error as ErrorWithStatus)?.status;
            if (status === 401 || status === 403) {
                return [];
            }
            console.error("Error fetching role permissions:", error);
            throw error;
        }
    },

    // Grant permission to role
    grantPermissionToRole: async (rolePermission: CreateRolePermissionDto): Promise<RolePermissionDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/role-permissions`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(rolePermission),
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error granting permission to role:", error);
            throw error;
        }
    },

    // Revoke permission from role
    revokePermissionFromRole: async (roleId: string, permissionId: string): Promise<void> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/role-permissions/${roleId}/${permissionId}`, 
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                    credentials: "include",
                }
            );

            await handleApiResponse(response);
        } catch (error) {
            console.error("Error revoking permission from role:", error);
            throw error;
        }
    },

    // Get user permissions
    getUserPermissions: async (userId?: string): Promise<UserPermissionsDto> => {
        try {
            const url = userId 
                ? `${API_BASE_URL}/users/${userId}/permissions`
                : `${API_BASE_URL}/users/me/permissions`;
                
            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            const status = (error as ErrorWithStatus)?.status;
            if (status === 401 || status === 403) {
                // If not logged in, treat as no permissions
                return { userId: userId || "me", permissions: [] } as UserPermissionsDto;
            }
            console.error("Error fetching user permissions:", error);
            throw error;
        }
    },

    // Check if user has specific permission
    checkUserPermission: async (permission: string, userId?: string): Promise<boolean> => {
        try {
            const userPermissions = await permissionsService.getUserPermissions(userId);
            return userPermissions.permissions.includes(permission);
        } catch (error) {
            console.error("Error checking user permission:", error);
            return false;
        }
    },

    // Get permissions for current user (cached)
    getCurrentUserPermissions: async (): Promise<string[]> => {
        try {
            // Check if we have cached permissions
            const cachedPermissions = localStorage.getItem("userPermissions");
            const cacheTimestamp = localStorage.getItem("userPermissionsTimestamp");
            
            // Cache for 5 minutes
            const cacheExpiry = 5 * 60 * 1000;
            const now = Date.now();
            
            if (cachedPermissions && cacheTimestamp && 
                (now - parseInt(cacheTimestamp)) < cacheExpiry) {
                return JSON.parse(cachedPermissions);
            }

            // Fetch fresh permissions
            const userPermissions = await permissionsService.getUserPermissions();
            
            // Cache the permissions
            localStorage.setItem("userPermissions", JSON.stringify(userPermissions.permissions));
            localStorage.setItem("userPermissionsTimestamp", now.toString());
            
            return userPermissions.permissions;
        } catch (error) {
            console.error("Error getting current user permissions:", error);
            // Return empty array as fallback
            return [];
        }
    },

    // Clear permissions cache
    clearPermissionsCache: (): void => {
        localStorage.removeItem("userPermissions");
        localStorage.removeItem("userPermissionsTimestamp");
    },

    // Bulk update role permissions
    updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify({ permissionIds }),
            });

            await handleApiResponse(response);
            
            // Clear cache since permissions might have changed
            permissionsService.clearPermissionsCache();
        } catch (error) {
            console.error("Error updating role permissions:", error);
            throw error;
        }
    },
};