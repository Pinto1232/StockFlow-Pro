/**
 * SignalR Connection Manager with Heartbeat and Reconnection Logic
 * Handles timeout issues and maintains stable connections
 */
class SignalRConnectionManager {
    constructor(hubUrl = '/stockflowhub') {
        this.hubUrl = hubUrl;
        this.connection = null;
        this.heartbeatInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatIntervalMs = 25000; // 25 seconds (less than 30s keep-alive)
        this.reconnectDelayMs = 5000; // 5 seconds
        this.isConnecting = false;
        this.isManualDisconnect = false;
        
        // Event handlers
        this.onConnected = null;
        this.onDisconnected = null;
        this.onReconnecting = null;
        this.onReconnected = null;
        this.onError = null;
        
        this.initializeConnection();
    }

    initializeConnection() {
        // Create connection with enhanced configuration
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
                skipNegotiation: false
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    // Exponential backoff with jitter
                    const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                    const jitter = Math.random() * 1000;
                    return delay + jitter;
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Connection established
        this.connection.onclose(async (error) => {
            console.log('SignalR connection closed', error);
            this.stopHeartbeat();
            
            if (this.onDisconnected) {
                this.onDisconnected(error);
            }

            // Attempt reconnection if not manually disconnected
            if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                await this.attemptReconnection();
            }
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting...', error);
            this.stopHeartbeat();
            
            if (this.onReconnecting) {
                this.onReconnecting(error);
            }
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected with connection ID:', connectionId);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            
            if (this.onReconnected) {
                this.onReconnected(connectionId);
            }
        });

        // Server-side event handlers
        this.connection.on('ConnectionEstablished', (connectionId) => {
            console.log('Connection established:', connectionId);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            
            if (this.onConnected) {
                this.onConnected(connectionId);
            }
        });

        this.connection.on('Pong', (timestamp) => {
            console.log('Received pong at:', timestamp);
        });

        this.connection.on('ConnectionStatus', (status) => {
            console.log('Connection status:', status);
        });

        this.connection.on('ForceReconnect', async (message) => {
            console.log('Force reconnect requested:', message);
            await this.reconnect();
        });

        this.connection.on('ReceiveNotification', (notification) => {
            console.log('Received notification:', notification);
            this.displayNotification(notification);
        });

        this.connection.on('ReceiveMessage', (userId, message) => {
            console.log('Received message from', userId, ':', message);
        });
    }

    async start() {
        if (this.isConnecting || this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.isConnecting = true;
        this.isManualDisconnect = false;

        try {
            await this.connection.start();
            console.log('SignalR connection started successfully');
        } catch (error) {
            console.error('Error starting SignalR connection:', error);
            
            if (this.onError) {
                this.onError(error);
            }

            // Retry connection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                await this.attemptReconnection();
            }
        } finally {
            this.isConnecting = false;
        }
    }

    async stop() {
        this.isManualDisconnect = true;
        this.stopHeartbeat();
        
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.stop();
        }
    }

    async reconnect() {
        await this.stop();
        await this.start();
    }

    async attemptReconnection() {
        this.reconnectAttempts++;
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelayMs));
        await this.start();
    }

    startHeartbeat() {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(async () => {
            if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
                try {
                    await this.connection.invoke('Ping');
                } catch (error) {
                    console.error('Heartbeat failed:', error);
                }
            }
        }, this.heartbeatIntervalMs);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Hub method wrappers
    async joinGroup(groupName) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke('JoinGroup', groupName);
        }
    }

    async leaveGroup(groupName) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke('LeaveGroup', groupName);
        }
    }

    async sendMessageToGroup(groupName, message) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke('SendMessageToGroup', groupName, message);
        }
    }

    async getConnectionStatus() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke('GetConnectionStatus');
        }
    }

    async sendNotificationToUser(targetUserId, title, message, type = 'info') {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke('SendNotificationToUser', targetUserId, title, message, type);
        }
    }

    // Utility methods
    displayNotification(notification) {
        // Create a simple notification display
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.Type}`;
        notificationElement.innerHTML = `
            <div class="notification-header">
                <strong>${notification.Title}</strong>
                <span class="notification-time">${new Date(notification.Timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="notification-body">${notification.Message}</div>
        `;

        // Add to notification container or create one
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(container);
        }

        container.appendChild(notificationElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 5000);
    }

    // Connection state helpers
    get isConnected() {
        return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
    }

    get connectionState() {
        return this.connection ? this.connection.state : 'Disconnected';
    }

    get connectionId() {
        return this.connection ? this.connection.connectionId : null;
    }
}

// CSS for notifications
const notificationStyles = `
    .notification {
        background: white;
        border-left: 4px solid #007bff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 10px;
        padding: 12px;
        border-radius: 4px;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification-info { border-left-color: #007bff; }
    .notification-success { border-left-color: #28a745; }
    .notification-warning { border-left-color: #ffc107; }
    .notification-error { border-left-color: #dc3545; }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    
    .notification-time {
        font-size: 0.8em;
        color: #666;
    }
    
    .notification-body {
        font-size: 0.9em;
        color: #333;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export for use
window.SignalRConnectionManager = SignalRConnectionManager;