import { useState, useEffect, useCallback, useRef } from 'react';
import signalRService, { ConnectionState } from '../services/signalrService';
import { useCurrentUser } from './useAuth';
import { useSignalRSounds } from './useNotificationSound';

export interface UseSignalRReturn {
    connectionState: ConnectionState;
    isConnected: boolean;
    isConnecting: boolean;
    isDisconnected: boolean;
    isReconnecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendMessage: (methodName: string, ...args: unknown[]) => Promise<void>;
    joinGroup: (groupName: string) => Promise<void>;
    leaveGroup: (groupName: string) => Promise<void>;
}

export const useSignalR = (): UseSignalRReturn => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        signalRService.connectionState
    );
    const { data: currentUser } = useCurrentUser();
    const hasAttemptedConnection = useRef(false);
    const userIdRef = useRef<string | null>(null);
    useSignalRSounds();

    // Update connection state when it changes
    useEffect(() => {
        const handleStateChange = (state: ConnectionState) => {
            setConnectionState(state);
        };

        signalRService.onConnectionStateChanged(handleStateChange);

        return () => {
            signalRService.offConnectionStateChanged(handleStateChange);
        };
    }, []);

    // Auto-connect when user is authenticated
    useEffect(() => {
        const connectIfAuthenticated = async () => {
            if (currentUser && !hasAttemptedConnection.current) {
                hasAttemptedConnection.current = true;
                userIdRef.current = currentUser.id;
                
                try {
                    await signalRService.start();
                    
                    // Join user-specific group after connection
                    if (signalRService.connectionState === ConnectionState.Connected) {
                        await signalRService.joinGroup(`User_${currentUser.id}`);
                        console.log(`Joined user group: User_${currentUser.id}`);
                    }
                } catch (error) {
                    console.error('Failed to connect to SignalR:', error);
                    // Reset the flag so we can try again later
                    hasAttemptedConnection.current = false;
                }
            }
        };

        connectIfAuthenticated();
    }, [currentUser]);

    // Disconnect when user logs out
    useEffect(() => {
        if (!currentUser && hasAttemptedConnection.current) {
            const disconnect = async () => {
                try {
                    // Leave user group before disconnecting
                    if (userIdRef.current && signalRService.connectionState === ConnectionState.Connected) {
                        await signalRService.leaveGroup(`User_${userIdRef.current}`);
                    }
                    
                    await signalRService.stop();
                    hasAttemptedConnection.current = false;
                    userIdRef.current = null;
                } catch (error) {
                    console.error('Failed to disconnect from SignalR:', error);
                }
            };

            disconnect();
        }
    }, [currentUser]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hasAttemptedConnection.current) {
                signalRService.stop().catch(error => {
                    console.error('Failed to stop SignalR connection on cleanup:', error);
                });
            }
        };
    }, []);

    const connect = useCallback(async (): Promise<void> => {
        try {
            await signalRService.start();
            
            // Join user-specific group after connection
            if (currentUser && signalRService.connectionState === ConnectionState.Connected) {
                await signalRService.joinGroup(`User_${currentUser.id}`);
            }
        } catch (error) {
            console.error('Failed to connect to SignalR:', error);
            throw error;
        }
    }, [currentUser]);

    const disconnect = useCallback(async (): Promise<void> => {
        try {
            // Leave user group before disconnecting
            if (currentUser && signalRService.connectionState === ConnectionState.Connected) {
                await signalRService.leaveGroup(`User_${currentUser.id}`);
            }
            
            await signalRService.stop();
        } catch (error) {
            console.error('Failed to disconnect from SignalR:', error);
            throw error;
        }
    }, [currentUser]);

    const sendMessage = useCallback(async (methodName: string, ...args: unknown[]): Promise<void> => {
        try {
            await signalRService.sendMessage(methodName, ...args);
        } catch (error) {
            console.error(`Failed to send message ${methodName}:`, error);
            throw error;
        }
    }, []);

    const joinGroup = useCallback(async (groupName: string): Promise<void> => {
        try {
            await signalRService.joinGroup(groupName);
        } catch (error) {
            console.error(`Failed to join group ${groupName}:`, error);
            throw error;
        }
    }, []);

    const leaveGroup = useCallback(async (groupName: string): Promise<void> => {
        try {
            await signalRService.leaveGroup(groupName);
        } catch (error) {
            console.error(`Failed to leave group ${groupName}:`, error);
            throw error;
        }
    }, []);

    return {
        connectionState,
        isConnected: connectionState === ConnectionState.Connected,
        isConnecting: connectionState === ConnectionState.Connecting,
        isDisconnected: connectionState === ConnectionState.Disconnected,
        isReconnecting: connectionState === ConnectionState.Reconnecting,
        connect,
        disconnect,
        sendMessage,
        joinGroup,
        leaveGroup,
    };
};

export default useSignalR;