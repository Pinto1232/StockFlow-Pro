// Secondary Adapter: SignalR Notifications
// Implements NotificationPort using SignalR and browser notifications

import { 
  HubConnection, 
  HubConnectionBuilder, 
  LogLevel,
  HttpTransportType
} from '@microsoft/signalr';
import { 
  NotificationPort, 
  NotificationMessage, 
  NotificationOptions, 
  RealTimeNotification 
} from '../../ports/secondary/NotificationPort';

export class SignalRNotificationAdapter implements NotificationPort {
  private connection: HubConnection | null = null;
  private notifications: NotificationMessage[] = [];
  private realTimeCallback: ((notification: RealTimeNotification) => void) | null = null;

  constructor(private hubUrl: string = '/stockflowhub') {
    // Ensure we're using the absolute path
    if (!this.hubUrl.startsWith('/')) {
      this.hubUrl = '/' + this.hubUrl;
    }
    // Add base URL if in development
    if (import.meta.env.DEV) {
      this.hubUrl = `${import.meta.env.VITE_API_URL || 'https://localhost:7046'}${this.hubUrl}`;
    }
    // Don't initialize connection immediately - wait for authentication
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          skipNegotiation: false,
          transport: HttpTransportType.WebSockets,
          logMessageContent: true,
          withCredentials: true, // Include cookies for authentication
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry intervals in milliseconds
        .configureLogging(LogLevel.Debug) // Set to Debug for more detailed logs
        .build();

      this.connection.on('ReceiveNotification', (notification: RealTimeNotification) => {
        if (this.realTimeCallback) {
          this.realTimeCallback(notification);
        }
        
        // Also show as local notification
        this.showNotification({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: this.mapNotificationType(notification.type),
          timestamp: new Date(notification.timestamp),
          isRead: false,
        });
      });

      this.connection.on('StockAlert', (alert: { productId: number; productName: string; alertType: string }) => {
        const notification: RealTimeNotification = {
          id: `stock-${alert.productId}-${Date.now()}`,
          userId: 0, // Will be set by server
          title: 'Stock Alert',
          message: `${alert.productName} is ${alert.alertType}`,
          type: 'stock_alert',
          data: alert,
          timestamp: new Date(),
        };

        if (this.realTimeCallback) {
          this.realTimeCallback(notification);
        }
      });

      await this.connection.start();
      console.log('SignalR connection established');
    } catch (error) {
      console.error('Failed to establish SignalR connection:', error);
    }
  }

  private mapNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' {
    switch (type) {
      case 'stock_alert':
        return 'warning';
      case 'user_action':
        return 'info';
      case 'system_update':
        return 'info';
      case 'invoice_created':
        return 'success';
      default:
        return 'info';
    }
  }

  showNotification(message: NotificationMessage, options?: NotificationOptions): void {
    // Add to internal storage
    this.notifications.unshift(message);

    // Show browser notification if permission granted
    if (this.hasPermission()) {
      const notification = new Notification(message.title, {
        body: message.message,
        icon: '/favicon.ico',
        tag: message.id,
      });

      if (options?.duration && options.duration > 0) {
        setTimeout(() => {
          notification.close();
        }, options.duration);
      }
    }

    // Emit custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('notification', {
      detail: { message, options }
    }));
  }

  hideNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    
    // Emit custom event for UI components
    window.dispatchEvent(new CustomEvent('hideNotification', {
      detail: { id }
    }));
  }

  clearAllNotifications(): void {
    this.notifications = [];
    
    // Emit custom event for UI components
    window.dispatchEvent(new CustomEvent('clearAllNotifications'));
  }

  subscribeToRealTimeNotifications(callback: (notification: RealTimeNotification) => void): void {
    this.realTimeCallback = callback;
  }

  unsubscribeFromRealTimeNotifications(): void {
    this.realTimeCallback = null;
  }

  async getNotifications(): Promise<NotificationMessage[]> {
    // Return local notifications (in a real app, this might fetch from server)
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    
    // In a real app, this would also update the server
    // await this.apiClient.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.isRead = true);
    
    // In a real app, this would also update the server
    // await this.apiClient.patch('/notifications/mark-all-read');
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    
    // In a real app, this would also delete from server
    // await this.apiClient.delete(`/notifications/${id}`);
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // SignalR specific methods
  async connect(): Promise<void> {
    if (!this.connection || this.connection.state === 'Disconnected') {
      await this.initializeConnection();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.initializeConnection();
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }
}