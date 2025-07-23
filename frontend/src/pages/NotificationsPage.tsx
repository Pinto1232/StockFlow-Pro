import React, { useState } from 'react';
import { 
    Bell, 
    Settings, 
    Filter, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    RefreshCw,
} from 'lucide-react';
import { useNotificationManager } from '../hooks/useNotifications';
import {
    NotificationType,
    NotificationStatus,
    getNotificationTypeLabel,
    getNotificationPriorityLabel,
    getNotificationStatusLabel,
    getNotificationTypeColor,
    getNotificationPriorityColor,
} from '../types/notification';

const NotificationsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const {
        notifications,
        unreadCount,
        isLoading,
        handleMarkAsRead,
        handleMarkMultipleAsRead,
        handleMarkAllAsRead,
        filters,
        updateFilters,
        clearFilters,
        refetch,
    } = useNotificationManager();

    // Filter notifications based on search query
    const filteredNotifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle notification selection
    const handleSelectNotification = (notificationId: string) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    // Handle bulk actions
    const handleBulkMarkAsRead = async () => {
        if (selectedNotifications.length > 0) {
            await handleMarkMultipleAsRead(selectedNotifications);
            setSelectedNotifications([]);
        }
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

    // Get notification icon
    const getNotificationIcon = (type: NotificationType) => {
        const iconMap = {
            [NotificationType.Info]: AlertCircle,
            [NotificationType.Success]: CheckCircle,
            [NotificationType.Warning]: AlertCircle,
            [NotificationType.Error]: AlertCircle,
            [NotificationType.StockAlert]: AlertCircle,
            [NotificationType.Invoice]: AlertCircle,
            [NotificationType.Payment]: CheckCircle,
            [NotificationType.Account]: AlertCircle,
            [NotificationType.System]: Settings,
            [NotificationType.Security]: AlertCircle,
            [NotificationType.Subscription]: AlertCircle,
            [NotificationType.Product]: AlertCircle,
            [NotificationType.Report]: AlertCircle,
        };
        return iconMap[type] || AlertCircle;
    };

    // Handle refresh button click
    const handleRefresh = () => {
        refetch();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Bell className="h-8 w-8 mr-3 text-blue-600" />
                                Notifications
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage your notifications and preferences
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </button>
                            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                <Settings className="h-4 w-4 mr-2" />
                                Preferences
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Bell className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Notifications</p>
                                <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Unread</p>
                                <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Read</p>
                                <p className="text-2xl font-semibold text-gray-900">{notifications.length - unreadCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </button>

                                {selectedNotifications.length > 0 && (
                                    <>
                                        <button
                                            onClick={handleBulkMarkAsRead}
                                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Mark Read ({selectedNotifications.length})
                                        </button>
                                    </>
                                )}

                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        Mark All Read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => updateFilters({ 
                                                status: e.target.value ? Number(e.target.value) as NotificationStatus : undefined 
                                            })}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value={NotificationStatus.Pending}>Pending</option>
                                            <option value={NotificationStatus.Sent}>Sent</option>
                                            <option value={NotificationStatus.Delivered}>Delivered</option>
                                            <option value={NotificationStatus.Read}>Read</option>
                                            <option value={NotificationStatus.Failed}>Failed</option>
                                        </select>
                                    </div>

                                    {/* Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type
                                        </label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) => updateFilters({ 
                                                type: e.target.value ? Number(e.target.value) as NotificationType : undefined 
                                            })}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Types</option>
                                            <option value={NotificationType.Info}>Info</option>
                                            <option value={NotificationType.Success}>Success</option>
                                            <option value={NotificationType.Warning}>Warning</option>
                                            <option value={NotificationType.Error}>Error</option>
                                            <option value={NotificationType.StockAlert}>Stock Alert</option>
                                            <option value={NotificationType.Invoice}>Invoice</option>
                                            <option value={NotificationType.Payment}>Payment</option>
                                            <option value={NotificationType.Account}>Account</option>
                                            <option value={NotificationType.System}>System</option>
                                            <option value={NotificationType.Security}>Security</option>
                                        </select>
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow">
                    {/* List Header */}
                    {filteredNotifications.length > 0 && (
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.length === filteredNotifications.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    {selectedNotifications.length > 0 
                                        ? `${selectedNotifications.length} selected`
                                        : 'Select all'
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="divide-y divide-gray-200">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No notifications found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchQuery ? 'Try adjusting your search or filters' : 'You\'re all caught up!'}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => {
                                const Icon = getNotificationIcon(notification.type);
                                const isUnread = notification.status !== NotificationStatus.Read;
                                const typeColor = getNotificationTypeColor(notification.type);
                                const isSelected = selectedNotifications.includes(notification.id);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-6 hover:bg-gray-50 transition-colors ${
                                            isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        } ${isSelected ? 'bg-blue-100' : ''}`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectNotification(notification.id)}
                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />

                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeColor}`}>
                                                <Icon className="h-5 w-5" />
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
                                                        <div className="flex items-center space-x-4 mt-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                                                                {getNotificationTypeLabel(notification.type)}
                                                            </span>
                                                            
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    {formatRelativeTime(notification.createdAt)}
                                                                </span>
                                                            </div>

                                                            <span className={`text-xs font-medium ${getNotificationPriorityColor(notification.priority)}`}>
                                                                {getNotificationPriorityLabel(notification.priority)}
                                                            </span>

                                                            <span className="text-xs text-gray-500">
                                                                {getNotificationStatusLabel(notification.status)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {isUnread && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;