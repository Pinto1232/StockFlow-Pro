// Architecture-based Auth Provider
// Bridges the old AuthContext interface with the new hexagonal architecture

import React, { useEffect, useState } from "react";
import type { UserDto, UserRole } from "../types/index";
import { useAuth as useArchitectureAuth } from "../architecture/adapters/primary/hooks";
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
} from "../utils/permissions";
import { AuthContext, type AuthContextType } from "../hooks/useAuthContext";

interface ArchitectureAuthProviderProps {
    children: React.ReactNode;
}

export const ArchitectureAuthProvider: React.FC<ArchitectureAuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use the new architecture auth hook
    const {
        currentUser,
        isLoggedIn,
        isLoadingCurrentUser,
        isLoggingIn,
        isLoggingOut,
        login: architectureLogin,
        logout: architectureLogout,
        // loginError, // TODO: Handle login errors in the UI
        refreshCurrentUser,
    } = useArchitectureAuth();

    // Sync the architecture user with the legacy user state
    useEffect(() => {
        if (currentUser) {
            // Transform architecture user to legacy UserDto format
            const legacyUser: UserDto = {
                id: currentUser.id.toString(),
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                fullName: currentUser.fullName,
                email: currentUser.email,
                phoneNumber: '', // Not available in architecture user, set default
                dateOfBirth: '', // Not available in architecture user, set default
                age: 0, // Not available in architecture user, set default
                isActive: currentUser.isActive,
                createdAt: currentUser.createdAt.toISOString(),
                updatedAt: currentUser.lastLoginAt?.toISOString(),
                role: currentUser.role.id as unknown as UserRole, // Map role ID to legacy role
            };
            setUser(legacyUser);
        } else {
            setUser(null);
        }
    }, [currentUser]);

    // Sync loading states
    useEffect(() => {
        setIsLoading(isLoadingCurrentUser || isLoggingIn || isLoggingOut);
    }, [isLoadingCurrentUser, isLoggingIn, isLoggingOut]);

    const login = async (email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            architectureLogin(
                { username: email, password },
                {
                    onSuccess: () => {
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    },
                }
            );
        });
    };

    const logout = async () => {
        return new Promise<void>((resolve) => {
            architectureLogout(undefined, {
                onSuccess: () => {
                    resolve();
                },
                onError: () => {
                    // Even if logout fails, clear local state
                    resolve();
                },
            });
        });
    };

    const refreshUser = async () => {
        try {
            await refreshCurrentUser();
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
        isAuthenticated: isLoggedIn(),
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