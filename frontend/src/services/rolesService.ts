/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    RoleDto,
    CreateRoleDto,
    UpdateRoleDto,
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
        throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
        );
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

export const rolesService = {
    // Get all roles
    getRoles: async (): Promise<RoleDto[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data; // Handle both wrapped and unwrapped responses
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    },

    // Get role by ID
    getRole: async (id: string): Promise<RoleDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error fetching role:", error);
            throw error;
        }
    },

    // Create new role
    createRole: async (role: CreateRoleDto): Promise<RoleDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(role),
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    },

    // Update role
    updateRole: async (id: string, role: UpdateRoleDto): Promise<RoleDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                credentials: "include",
                body: JSON.stringify(role),
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error updating role:", error);
            throw error;
        }
    },

    // Delete role
    deleteRole: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            await handleApiResponse(response);
        } catch (error) {
            console.error("Error deleting role:", error);
            throw error;
        }
    },

    // Activate role
    activateRole: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}/activate`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            await handleApiResponse(response);
        } catch (error) {
            console.error("Error activating role:", error);
            throw error;
        }
    },

    // Deactivate role
    deactivateRole: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}/deactivate`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            await handleApiResponse(response);
        } catch (error) {
            console.error("Error deactivating role:", error);
            throw error;
        }
    },

    // Get role with permissions
    getRoleWithPermissions: async (id: string): Promise<RoleDto> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}/permissions`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error fetching role with permissions:", error);
            throw error;
        }
    },

    // Get available roles for assignment (non-system roles or based on user permissions)
    getAvailableRoles: async (): Promise<RoleDto[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/available`, {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include",
            });

            const data = await handleApiResponse(response);
            return data.data || data;
        } catch (error) {
            console.error("Error fetching available roles:", error);
            // Fallback to all roles if endpoint doesn't exist
            return rolesService.getRoles();
        }
    },
};