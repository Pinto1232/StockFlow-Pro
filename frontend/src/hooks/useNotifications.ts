import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type {
    NotificationFilters,
    UpdateNotificationPreferenceDto,
} from '../types/notification';

// Query keys for React Query
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
    unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
    stats: (fromDate?: string) => [...notificationKeys.all, 'stats', fromDate] as const,
    preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// Hook for fetching notifications
export const useNotifications = (filters?: NotificationFilters) => {
    return useQuery({
        queryKey: notificationKeys.list(filters || {}),
        queryFn: () => notificationService.getNotifications(filters),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });
};

// Hook for unread notification count
export const useUnreadCount = () => {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: notificationService.getUnreadCount,
        staleTime: 10000, // 10 seconds
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

// Hook for notification statistics
export const useNotificationStats = (fromDate?: string) => {
    return useQuery({
        queryKey: notificationKeys.stats(fromDate),
        queryFn: () => notificationService.getNotificationStats(fromDate),
        staleTime: 60000, // 1 minute
    });
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
    return useQuery({
        queryKey: notificationKeys.preferences(),
        queryFn: notificationService.getPreferences,
        staleTime: 300000, // 5 minutes
    });
};

// Hook for marking notifications as read
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            // Invalidate and refetch notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

// Hook for marking multiple notifications as read
export const useMarkMultipleAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationService.markMultipleAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

// Hook for marking all notifications as read
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

// Hook for updating notification preferences
export const useUpdatePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationService.updatePreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
        },
    });
};

// Hook for comprehensive notification management
export const useNotificationManager = () => {
    const [filters, setFilters] = useState<NotificationFilters>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data: notifications, isLoading, error, refetch } = useNotifications(filters);
    const { data: unreadCount } = useUnreadCount();
    const { data: stats } = useNotificationStats();
    const { data: preferences } = useNotificationPreferences();

    const markAsReadMutation = useMarkAsRead();
    const markMultipleAsReadMutation = useMarkMultipleAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();
    const updatePreferencesMutation = useUpdatePreferences();

    // Handle marking a single notification as read
    const handleMarkAsRead = useCallback(async (notificationId: string) => {
        try {
            await markAsReadMutation.mutateAsync(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [markAsReadMutation]);

    // Handle marking multiple notifications as read
    const handleMarkMultipleAsRead = useCallback(async (notificationIds: string[]) => {
        try {
            await markMultipleAsReadMutation.mutateAsync(notificationIds);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    }, [markMultipleAsReadMutation]);

    // Handle marking all notifications as read
    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsReadMutation.mutateAsync();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, [markAllAsReadMutation]);

    // Handle updating preferences
    const handleUpdatePreferences = useCallback(async (newPreferences: UpdateNotificationPreferenceDto[]) => {
        try {
            await updatePreferencesMutation.mutateAsync(newPreferences);
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    }, [updatePreferencesMutation]);

    // Toggle dropdown
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
    }, []);

    // Close dropdown
    const closeDropdown = useCallback(() => {
        setIsDropdownOpen(false);
    }, []);

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    return {
        // Data
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
        stats,
        preferences: preferences || [],
        
        // Loading states
        isLoading,
        isMarkingAsRead: markAsReadMutation.isPending,
        isMarkingMultipleAsRead: markMultipleAsReadMutation.isPending,
        isMarkingAllAsRead: markAllAsReadMutation.isPending,
        isUpdatingPreferences: updatePreferencesMutation.isPending,
        
        // Error states
        error,
        markAsReadError: markAsReadMutation.error,
        markMultipleAsReadError: markMultipleAsReadMutation.error,
        markAllAsReadError: markAllAsReadMutation.error,
        updatePreferencesError: updatePreferencesMutation.error,
        
        // Actions
        handleMarkAsRead,
        handleMarkMultipleAsRead,
        handleMarkAllAsRead,
        handleUpdatePreferences,
        refetch,
        
        // UI state
        isDropdownOpen,
        toggleDropdown,
        closeDropdown,
        
        // Filters
        filters,
        updateFilters,
        clearFilters,
    };
};