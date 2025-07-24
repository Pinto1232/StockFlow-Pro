import React, { useEffect, useState } from "react";
import type { UserDto, UserRole } from "../types/index";
import { authService } from "../services/authService";
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
} from "../utils/permissions";
import { AuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { ArchitectureAuthProvider } from "./ArchitectureAuthProvider";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Use new architecture-based authentication
    return <ArchitectureAuthProvider>{children}</ArchitectureAuthProvider>;
};

// Legacy Auth Provider (original implementation) - kept for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LegacyAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated on app start
        const initializeAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const currentUser = authService.getCurrentUser();
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error);
                // Clear invalid auth data
                await authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            if (authService.isAuthenticated()) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
            await logout();
        }
    };

    const checkPermission = (permission: string): boolean => {
        if (!user) return false;
        return hasPermission(user.role, permission);
    };

    const checkAnyPermission = (permissions: string[]): boolean => {
        if (!user) return false;
        return hasAnyPermission(user.role, permissions);
    };

    const checkAllPermissions = (permissions: string[]): boolean => {
        if (!user) return false;
        return hasAllPermissions(user.role, permissions);
    };

    const checkRole = (role: UserRole): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    const checkAnyRole = (roles: UserRole[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        hasRole: checkRole,
        hasAnyRole: checkAnyRole,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};