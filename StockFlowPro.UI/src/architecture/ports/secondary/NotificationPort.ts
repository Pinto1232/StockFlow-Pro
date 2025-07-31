// Secondary Port: Notifications
// Defines the interface for notification operations

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationOptions {
  duration?: number; // in milliseconds, 0 for persistent
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showCloseButton?: boolean;
  autoClose?: boolean;
}

export interface RealTimeNotification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'stock_alert' | 'user_action' | 'system_update' | 'invoice_created';
  data?: Record<string, unknown>;
  timestamp: Date;
}

export interface NotificationPort {
  // Local notifications (toast/banner)
  showNotification(message: NotificationMessage, options?: NotificationOptions): void;
  hideNotification(id: string): void;
  clearAllNotifications(): void;
  
  // Real-time notifications
  subscribeToRealTimeNotifications(callback: (notification: RealTimeNotification) => void): void;
  unsubscribeFromRealTimeNotifications(): void;
  
  // Notification management
  getNotifications(): Promise<NotificationMessage[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  
  // Permission management
  requestPermission(): Promise<boolean>;
  hasPermission(): boolean;
  
  // Connection management (for real-time services)
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
  getConnectionState?(): string;
}