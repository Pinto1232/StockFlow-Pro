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
        this.initializeConnection();
    }

    private initializeConnection(): void {
        // Get the base URL from environment or default to localhost
        // Remove /api suffix if present since SignalR hub is at root level
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        const hubUrl = `${baseUrl}/stockflowhub`;

        console.log('Initializing SignalR connection to:', hubUrl);

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                withCredentials: true,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                // Skip negotiation for better performance if using WebSockets only
                skipNegotiation: false
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
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

    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.onclose((error) => {
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

    public async start(): Promise<void> {
        if (!this.connection) {
            this.initializeConnection();
        }

        // Check current connection state
        const currentState = this.connection?.state;
        
        // If already connected, return immediately
        if (currentState === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        // If currently connecting, wait for it to complete
        if (currentState === signalR.HubConnectionState.Connecting) {
            console.log('Connection already in progress, waiting...');
            return;
        }

        // If in reconnecting state, let the automatic reconnection handle it
        if (currentState === signalR.HubConnectionState.Reconnecting) {
            console.log('Connection is reconnecting, waiting...');
            return;
        }

        // Only start if disconnected or disconnecting
        if (currentState !== signalR.HubConnectionState.Disconnected && 
            currentState !== signalR.HubConnectionState.Disconnecting) {
            console.warn(`Cannot start connection in state: ${currentState}`);
            return;
        }

        try {
            console.log('Starting SignalR connection with cookie authentication...');
            this.updateConnectionState(ConnectionState.Connecting);
            
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
        }
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