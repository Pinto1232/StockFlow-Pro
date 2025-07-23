import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell,
    Check,
    CheckCheck,
    Settings,
    X,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Package,
    FileText,
    CreditCard,
    User,
    Shield,
    BarChart3,
    Clock,
    ExternalLink,
} from 'lucide-react';
import { useNotificationManager } from '../../hooks/useNotifications';
import {
    NotificationType,
    NotificationPriority,
    NotificationStatus,
    getNotificationTypeLabel,
    getNotificationTypeColor,
} from '../../types/notification';
import type { NotificationDto } from '../../types/notification';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        isLoading,
        handleMarkAsRead,
        handleMarkAllAsRead,
        isMarkingAsRead,
        isMarkingAllAsRead,
    } = useNotificationManager();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Get icon for notification type
    const getNotificationIcon = (type: NotificationType) => {
        const iconMap = {
            [NotificationType.Info]: Info,
            [NotificationType.Success]: CheckCircle,
            [NotificationType.Warning]: AlertTriangle,
            [NotificationType.Error]: XCircle,
            [NotificationType.StockAlert]: Package,
            [NotificationType.Invoice]: FileText,
            [NotificationType.Payment]: CreditCard,
            [NotificationType.Account]: User,
            [NotificationType.System]: Settings,
            [NotificationType.Security]: Shield,
            [NotificationType.Subscription]: CreditCard,
            [NotificationType.Product]: Package,
            [NotificationType.Report]: BarChart3,
        };
        return iconMap[type] || Info;
    };

    // Get priority indicator
    const getPriorityIndicator = (priority: NotificationPriority) => {
        if (priority >= NotificationPriority.Critical) {
            return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
        }
        if (priority === NotificationPriority.High) {
            return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
        }
        return null;
    };

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    // Handle notification click
    const handleNotificationClick = async (notification: NotificationDto) => {
        if (notification.status !== NotificationStatus.Read) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to action URL if available
        if (notification.actionUrl) {
            window.open(notification.actionUrl, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-4 w-4" />
                            </button>
                        )}
                        <Link
                            to="/notifications"
                            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                            onClick={onClose}
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                        <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.slice(0, 10).map((notification) => {
                            const Icon = getNotificationIcon(notification.type);
                            const isUnread = notification.status !== NotificationStatus.Read;
                            const typeColor = getNotificationTypeColor(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeColor}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-sm mt-1 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                    
                                                    {/* Metadata */}
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                                                            {getNotificationTypeLabel(notification.type)}
                                                        </span>
                                                        
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {formatRelativeTime(notification.createdAt)}
                                                            </span>
                                                        </div>

                                                        {getPriorityIndicator(notification.priority)}

                                                        {notification.actionUrl && (
                                                            <ExternalLink className="h-3 w-3 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-1 ml-2">
                                                    {isUnread && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                            disabled={isMarkingAsRead}
                                                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;