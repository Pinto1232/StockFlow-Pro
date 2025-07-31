// Notification Enums
export const NotificationType = {
    Info: 0,
    Success: 1,
    Warning: 2,
    Error: 3,
    StockAlert: 4,
    Invoice: 5,
    Payment: 6,
    Account: 7,
    System: 8,
    Security: 9,
    Subscription: 10,
    Product: 11,
    Report: 12,
} as const;

export const NotificationPriority = {
    Low: 0,
    Normal: 1,
    High: 2,
    Critical: 3,
    Emergency: 4,
} as const;

export const NotificationStatus = {
    Pending: 0,
    Sent: 1,
    Delivered: 2,
    Read: 3,
    Failed: 4,
    Cancelled: 5,
    Expired: 6,
} as const;

export const NotificationChannel = {
    None: 0,
    InApp: 1,
    Email: 2,
    SMS: 4,
    Push: 8,
    All: 15, // InApp | Email | SMS | Push
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

// Notification DTOs
export interface NotificationDto {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    status: NotificationStatus;
    channels: NotificationChannel;
    recipientId?: string;
    recipientName?: string;
    senderId?: string;
    senderName?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    actionUrl?: string;
    templateId?: string;
    createdAt: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    expiresAt?: string;
    deliveryAttempts: number;
    lastError?: string;
    isPersistent: boolean;
    isDismissible: boolean;
    isExpired: boolean;
    canRetry: boolean;
}

export interface NotificationStatsDto {
    totalNotifications: number;
    unreadNotifications: number;
    readNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByPriority: Record<string, number>;
    notificationsByStatus: Record<string, number>;
    lastNotificationDate?: string;
    lastReadDate?: string;
}

export interface CreateNotificationDto {
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    channels?: NotificationChannel;
    recipientId?: string;
    senderId?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    actionUrl?: string;
    isPersistent?: boolean;
    isDismissible?: boolean;
    expiresAt?: string;
}

// Notification Preference DTOs
export interface NotificationPreferenceDto {
    id: string;
    userId: string;
    notificationType: NotificationType;
    notificationTypeName: string;
    enabledChannels: NotificationChannel;
    enabledChannelNames: string[];
    isEnabled: boolean;
    minimumPriority: NotificationPriority;
    minimumPriorityName: string;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    respectQuietHours: boolean;
    batchingIntervalMinutes?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateNotificationPreferenceDto {
    notificationType: NotificationType;
    enabledChannels: NotificationChannel;
    isEnabled: boolean;
    minimumPriority: NotificationPriority;
}

// Notification Filters
export interface NotificationFilters {
    status?: NotificationStatus;
    type?: NotificationType;
    priority?: NotificationPriority;
    page?: number;
    pageSize?: number;
}

// Helper functions for notification types
export const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
        [NotificationType.Info]: 'Info',
        [NotificationType.Success]: 'Success',
        [NotificationType.Warning]: 'Warning',
        [NotificationType.Error]: 'Error',
        [NotificationType.StockAlert]: 'Stock Alert',
        [NotificationType.Invoice]: 'Invoice',
        [NotificationType.Payment]: 'Payment',
        [NotificationType.Account]: 'Account',
        [NotificationType.System]: 'System',
        [NotificationType.Security]: 'Security',
        [NotificationType.Subscription]: 'Subscription',
        [NotificationType.Product]: 'Product',
        [NotificationType.Report]: 'Report',
    };
    return labels[type] || 'Unknown';
};

export const getNotificationPriorityLabel = (priority: NotificationPriority): string => {
    const labels: Record<NotificationPriority, string> = {
        [NotificationPriority.Low]: 'Low',
        [NotificationPriority.Normal]: 'Normal',
        [NotificationPriority.High]: 'High',
        [NotificationPriority.Critical]: 'Critical',
        [NotificationPriority.Emergency]: 'Emergency',
    };
    return labels[priority] || 'Unknown';
};

export const getNotificationStatusLabel = (status: NotificationStatus): string => {
    const labels: Record<NotificationStatus, string> = {
        [NotificationStatus.Pending]: 'Pending',
        [NotificationStatus.Sent]: 'Sent',
        [NotificationStatus.Delivered]: 'Delivered',
        [NotificationStatus.Read]: 'Read',
        [NotificationStatus.Failed]: 'Failed',
        [NotificationStatus.Cancelled]: 'Cancelled',
        [NotificationStatus.Expired]: 'Expired',
    };
    return labels[status] || 'Unknown';
};

export const getNotificationTypeColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
        [NotificationType.Info]: 'text-blue-600 bg-blue-50',
        [NotificationType.Success]: 'text-green-600 bg-green-50',
        [NotificationType.Warning]: 'text-yellow-600 bg-yellow-50',
        [NotificationType.Error]: 'text-red-600 bg-red-50',
        [NotificationType.StockAlert]: 'text-orange-600 bg-orange-50',
        [NotificationType.Invoice]: 'text-purple-600 bg-purple-50',
        [NotificationType.Payment]: 'text-emerald-600 bg-emerald-50',
        [NotificationType.Account]: 'text-indigo-600 bg-indigo-50',
        [NotificationType.System]: 'text-gray-600 bg-gray-50',
        [NotificationType.Security]: 'text-red-600 bg-red-50',
        [NotificationType.Subscription]: 'text-cyan-600 bg-cyan-50',
        [NotificationType.Product]: 'text-violet-600 bg-violet-50',
        [NotificationType.Report]: 'text-teal-600 bg-teal-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
};

export const getNotificationPriorityColor = (priority: NotificationPriority): string => {
    const colors: Record<NotificationPriority, string> = {
        [NotificationPriority.Low]: 'text-gray-500',
        [NotificationPriority.Normal]: 'text-blue-500',
        [NotificationPriority.High]: 'text-yellow-500',
        [NotificationPriority.Critical]: 'text-orange-500',
        [NotificationPriority.Emergency]: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
};