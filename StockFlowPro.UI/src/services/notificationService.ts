import { apiService } from './api';
import type {
    NotificationDto,
    NotificationStatsDto,
    NotificationFilters,
    CreateNotificationDto,
    NotificationPreferenceDto,
    UpdateNotificationPreferenceDto,
} from '../types/notification';

export const notificationService = {
    // Get user notifications with optional filters
    getNotifications: async (filters?: NotificationFilters): Promise<NotificationDto[]> => {
        const params: Record<string, unknown> = {};
        
        if (filters?.page) params.page = filters.page;
        if (filters?.pageSize) params.pageSize = filters.pageSize;
        if (filters?.status !== undefined) params.status = filters.status;
        if (filters?.type !== undefined) params.type = filters.type;
        
        return apiService.get<NotificationDto[]>('/notifications', params);
    },

    // Get unread notification count
    getUnreadCount: async (): Promise<number> => {
        return apiService.get<number>('/notifications/unread-count');
    },

    // Get notification statistics
    getNotificationStats: async (fromDate?: string): Promise<NotificationStatsDto> => {
        const params: Record<string, unknown> = {};
        if (fromDate) params.fromDate = fromDate;
        
        return apiService.get<NotificationStatsDto>('/notifications/stats', params);
    },

    // Mark a single notification as read
    markAsRead: async (notificationId: string): Promise<void> => {
        return apiService.put<void>(`/notifications/${notificationId}/read`);
    },

    // Mark multiple notifications as read
    markMultipleAsRead: async (notificationIds: string[]): Promise<void> => {
        return apiService.put<void>('/notifications/mark-read', notificationIds);
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        return apiService.put<void>('/notifications/mark-all-read');
    },

    // Get notification preferences
    getPreferences: async (): Promise<NotificationPreferenceDto[]> => {
        return apiService.get<NotificationPreferenceDto[]>('/notifications/preferences');
    },

    // Update notification preferences
    updatePreferences: async (preferences: UpdateNotificationPreferenceDto[]): Promise<void> => {
        return apiService.put<void>('/notifications/preferences', preferences);
    },

    // Set quiet hours
    setQuietHours: async (startTime: string, endTime: string): Promise<void> => {
        return apiService.put<void>('/notifications/preferences/quiet-hours', {
            startTime,
            endTime,
        });
    },

    // Disable quiet hours
    disableQuietHours: async (): Promise<void> => {
        return apiService.delete<void>('/notifications/preferences/quiet-hours');
    },

    // Reset preferences to defaults
    resetPreferences: async (): Promise<void> => {
        return apiService.post<void>('/notifications/preferences/reset');
    },

    // Admin functions (if user has permissions)
    sendNotification: async (notification: CreateNotificationDto): Promise<NotificationDto> => {
        return apiService.post<NotificationDto>('/notifications/send', notification);
    },

    // Send bulk notification
    sendBulkNotification: async (notification: CreateNotificationDto & { recipientIds: string[] }): Promise<NotificationDto[]> => {
        return apiService.post<NotificationDto[]>('/notifications/send-bulk', notification);
    },

    // Send system notification
    sendSystemNotification: async (title: string, message: string, priority?: number): Promise<NotificationDto[]> => {
        return apiService.post<NotificationDto[]>('/notifications/send-system', {
            title,
            message,
            priority: priority || 1, // Normal priority
        });
    },

    // Retry failed notifications
    retryFailedNotifications: async (): Promise<void> => {
        return apiService.post<void>('/notifications/retry-failed');
    },
};

export default notificationService;