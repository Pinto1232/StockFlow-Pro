import * as signalR from '@microsoft/signalr';
import notificationSoundService from '../utils/notificationSound';

export const ConnectionState = {
    Disconnected: 'Disconnected',
    Connecting: 'Connecting',
    Connected: 'Connected',
    Reconnecting: 'Reconnecting',
    Disconnecting: 'Disconnecting'
} as const;

export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];

export interface SignalRService {
    connection: signalR.HubConnection | null;
    connectionState: ConnectionState;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onConnectionStateChanged: (callback: (state: ConnectionState) => void) => void;
    offConnectionStateChanged: (callback: (state: ConnectionState) => void) => void;
}

class SignalRServiceImpl implements SignalRService {
    public connection: signalR.HubConnection | null = null;
    public connectionState: ConnectionState = ConnectionState.Disconnected;
    private stateChangeCallbacks: Set<(state: ConnectionState) => void> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 5000; // 5 seconds

    constructor() {
        // Add a small delay to avoid conflicts with browser extensions
        setTimeout(() => {
            this.initializeConnection();
        }, 100);
    }

    private async testConnectivity(baseUrl: string): Promise<boolean> {
        try {
            console.log('Testing backend connectivity...');
            const response = await fetch(`${baseUrl}/health`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
            console.log('Health check response:', response.status, response.statusText);
            return response.ok;
        } catch (error) {
            console.error('Backend connectivity test failed:', error);
            return false;
        }
    }

    private initializeConnection(): void {
        // Get the base URL from environment or default to localhost
        // Remove /api suffix if present since SignalR hub is at root level
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        // SignalR uses HTTP/HTTPS for negotiation, not WebSocket URLs directly
        const hubUrl = `${baseUrl}/stockflowhub`;

        console.log('Initializing SignalR connection to:', hubUrl);
        console.log('Base URL:', baseUrl);
        console.log('API Base URL:', apiBaseUrl);

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                withCredentials: true,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                // Skip negotiation for better performance if using WebSockets only
                skipNegotiation: false,
                // Add headers for debugging
                headers: {
                    'Access-Control-Allow-Credentials': 'true'
                }
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff with jitter
                    const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                    const jitter = Math.random() * 1000;
                    return delay + jitter;
                }
            })
            .configureLogging(signalR.LogLevel.Debug) // Increase logging level for debugging
            .build();

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.onclose((error) => {
            // Filter out browser extension errors
            if (error && error.message && error.message.includes('Receiving end does not exist')) {
                console.debug('Browser extension error (can be ignored):', error.message);
                return;
            }
            console.log('SignalR connection closed:', error);
            this.updateConnectionState(ConnectionState.Disconnected);
            this.reconnectAttempts = 0;
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting:', error);
            this.updateConnectionState(ConnectionState.Reconnecting);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected:', connectionId);
            this.updateConnectionState(ConnectionState.Connected);
            this.reconnectAttempts = 0;
            // Play connection sound when reconnected
            notificationSoundService.playConnectionSound().catch(error => {
                console.warn('Failed to play reconnection sound:', error);
            });
        });

        // Handle specific hub methods
        this.connection.on('UserNotification', (notification) => {
            console.log('Received user notification:', notification);
            
            // Play notification sound
            notificationSoundService.playNotificationSound().catch(error => {
                console.warn('Failed to play notification sound:', error);
            });
            
            // Dispatch custom event for notifications
            window.dispatchEvent(new CustomEvent('signalr-notification', { 
                detail: notification 
            }));
        });

        this.connection.on('BroadcastMessage', (message) => {
            console.log('Received broadcast message:', message);
            
            // Play notification sound for broadcast messages
            notificationSoundService.playNotificationSound().catch(error => {
                console.warn('Failed to play broadcast notification sound:', error);
            });
            
            // Dispatch custom event for broadcast messages
            window.dispatchEvent(new CustomEvent('signalr-broadcast', { 
                detail: message 
            }));
        });

        this.connection.on('DashboardUpdate', (data) => {
            console.log('Received dashboard update:', data);
            // Dispatch custom event for dashboard updates (no sound for data updates)
            window.dispatchEvent(new CustomEvent('signalr-dashboard-update', { 
                detail: data 
            }));
        });

        // Handle product-specific events
        this.connection.on('ProductCreated', (data) => {
            console.log('Received ProductCreated event:', data);
            window.dispatchEvent(new CustomEvent('signalr-product-event', {
                detail: {
                    type: 'ProductCreated',
                    entityId: data.id,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('ProductUpdated', (data) => {
            console.log('Received ProductUpdated event:', data);
            window.dispatchEvent(new CustomEvent('signalr-product-event', {
                detail: {
                    type: 'ProductUpdated',
                    entityId: data.id,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('ProductDeleted', (data) => {
            console.log('Received ProductDeleted event:', data);
            window.dispatchEvent(new CustomEvent('signalr-product-event', {
                detail: {
                    type: 'ProductDeleted',
                    entityId: data.id || data.productId,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('StockUpdated', (data) => {
            console.log('Received StockUpdated event:', data);
            window.dispatchEvent(new CustomEvent('signalr-product-event', {
                detail: {
                    type: 'StockUpdated',
                    entityId: data.id || data.productId,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('LowStockAlert', (data) => {
            console.log('Received LowStockAlert event:', data);
            window.dispatchEvent(new CustomEvent('signalr-product-event', {
                detail: {
                    type: 'LowStockAlert',
                    entityId: data.id || data.productId,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        // Handle invoice-specific events
        this.connection.on('InvoiceCreated', (data) => {
            console.log('Received InvoiceCreated event:', data);
            window.dispatchEvent(new CustomEvent('signalr-invoice-event', {
                detail: {
                    type: 'InvoiceCreated',
                    entityId: data.id,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('InvoiceUpdated', (data) => {
            console.log('Received InvoiceUpdated event:', data);
            window.dispatchEvent(new CustomEvent('signalr-invoice-event', {
                detail: {
                    type: 'InvoiceUpdated',
                    entityId: data.id,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        });

        this.connection.on('InvoiceDeleted', (data) => {
            console.log('Received InvoiceDeleted event:', data);
            window.dispatchEvent(new CustomEvent('signalr-invoice-event', {
                detail: {
                    type: 'InvoiceDeleted',
                    entityId: data.id || data.invoiceId,
                    timestamp: new Date().toISOString()
                }
            }));
        });
    }

    private updateConnectionState(state: ConnectionState): void {
        if (this.connectionState !== state) {
            this.connectionState = state;
            this.stateChangeCallbacks.forEach(callback => {
                try {
                    callback(state);
                } catch (error) {
                    console.error('Error in connection state callback:', error);
                }
            });
        }
    }

    private connectionPromise: Promise<void> | null = null;

    public async start(): Promise<void> {
        // If there's already a connection attempt in progress, wait for it
        if (this.connectionPromise) {
            console.log('Connection attempt already in progress, waiting for it to complete...');
            return this.connectionPromise;
        }

        if (!this.connection) {
            this.initializeConnection();
        }

        // Check current connection state
        const currentState = this.connection?.state;
        
        // If already connected, return immediately
        if (currentState === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return Promise.resolve();
        }

        // If currently connecting, wait for it to complete
        if (currentState === signalR.HubConnectionState.Connecting) {
            console.log('Connection already in progress, waiting...');
            // Create a promise that resolves when connection state changes
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout while waiting for existing connection'));
                }, 15000);

                const checkState = () => {
                    const state = this.connection?.state;
                    if (state === signalR.HubConnectionState.Connected) {
                        clearTimeout(timeout);
                        resolve();
                    } else if (state === signalR.HubConnectionState.Disconnected) {
                        clearTimeout(timeout);
                        reject(new Error('Connection failed while waiting'));
                    } else {
                        // Check again in 100ms
                        setTimeout(checkState, 100);
                    }
                };
                checkState();
            });
        }

        // If in reconnecting state, let the automatic reconnection handle it
        if (currentState === signalR.HubConnectionState.Reconnecting) {
            console.log('Connection is reconnecting, waiting...');
            return Promise.resolve();
        }

        // Only start if disconnected or disconnecting
        if (currentState !== signalR.HubConnectionState.Disconnected && 
            currentState !== signalR.HubConnectionState.Disconnecting) {
            console.warn(`Cannot start connection in state: ${currentState}`);
            return Promise.resolve();
        }

        // Create and store the connection promise
        this.connectionPromise = (async () => {
            try {
                console.log('Starting SignalR connection with cookie authentication...');
                this.updateConnectionState(ConnectionState.Connecting);
                
                // Test backend connectivity first
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';
                const baseUrl = apiBaseUrl.replace('/api', '');
                const isBackendReachable = await this.testConnectivity(baseUrl);
                
                if (!isBackendReachable) {
                    throw new Error('Backend is not reachable. Please ensure the backend server is running.');
                }
                
                // Add timeout to prevent hanging connections
                const connectionPromise = this.connection!.start();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Connection timeout')), 15000);
                });
                
                await Promise.race([connectionPromise, timeoutPromise]);
                
                this.updateConnectionState(ConnectionState.Connected);
                this.reconnectAttempts = 0;
                console.log('SignalR connection started successfully');
                
                // Play connection sound when initially connected
                notificationSoundService.playConnectionSound().catch(error => {
                    console.warn('Failed to play connection sound:', error);
                });
            } catch (error) {
                console.error('Error starting SignalR connection:', error);
                this.updateConnectionState(ConnectionState.Disconnected);
                
                // Log additional debug information
                if (error instanceof Error) {
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }
                
                // Attempt to reconnect if we haven't exceeded max attempts
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms...`);
                    
                    setTimeout(() => {
                        this.start().catch(err => {
                            console.error('Reconnection attempt failed:', err);
                        });
                    }, this.reconnectDelay);
                } else {
                    console.error('Max reconnection attempts reached. SignalR connection failed permanently.');
                }
                
                throw error;
            } finally {
                // Clear the connection promise when done
                this.connectionPromise = null;
            }
        })();

        return this.connectionPromise;
    }

    public async stop(): Promise<void> {
        if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
            try {
                this.updateConnectionState(ConnectionState.Disconnecting);
                await this.connection.stop();
                this.updateConnectionState(ConnectionState.Disconnected);
                console.log('SignalR connection stopped');
            } catch (error) {
                console.error('Error stopping SignalR connection:', error);
                this.updateConnectionState(ConnectionState.Disconnected);
                throw error;
            }
        }
    }

    public onConnectionStateChanged(callback: (state: ConnectionState) => void): void {
        this.stateChangeCallbacks.add(callback);
    }

    public offConnectionStateChanged(callback: (state: ConnectionState) => void): void {
        this.stateChangeCallbacks.delete(callback);
    }

    // Method to send messages to the hub
    public async sendMessage(methodName: string, ...args: unknown[]): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke(methodName, ...args);
            } catch (error) {
                console.error(`Error sending message ${methodName}:`, error);
                throw error;
            }
        } else {
            throw new Error('SignalR connection is not established');
        }
    }

    // Method to join a group
    public async joinGroup(groupName: string): Promise<void> {
        return this.sendMessage('JoinGroup', groupName);
    }

    // Method to leave a group
    public async leaveGroup(groupName: string): Promise<void> {
        return this.sendMessage('LeaveGroup', groupName);
    }
}

// Create a singleton instance
const signalRService = new SignalRServiceImpl();

export default signalRService;