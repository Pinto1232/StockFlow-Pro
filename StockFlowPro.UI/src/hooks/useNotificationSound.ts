import { useCallback, useEffect, useState } from 'react';
import notificationSoundService, { SoundType } from '../utils/notificationSound';
import type { NotificationSoundOptions } from '../utils/notificationSound';

/**
 * Hook for managing notification sounds
 */
export const useNotificationSound = () => {
    const [isEnabled, setIsEnabled] = useState(notificationSoundService.isEnabledState());
    const [volume, setVolume] = useState(notificationSoundService.getVolume());

    // Update local state when service state changes
    useEffect(() => {
        const updateState = () => {
            setIsEnabled(notificationSoundService.isEnabledState());
            setVolume(notificationSoundService.getVolume());
        };

        // Listen for storage changes (if settings are changed in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'notificationSoundsEnabled' || e.key === 'notificationSoundVolume') {
                updateState();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Play specific sound types
    const playConnectionSound = useCallback(async () => {
        try {
            await notificationSoundService.playConnectionSound();
        } catch (error) {
            console.warn('Failed to play connection sound:', error);
        }
    }, []);

    const playNotificationSound = useCallback(async () => {
        try {
            await notificationSoundService.playNotificationSound();
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }, []);

    const playSuccessSound = useCallback(async () => {
        try {
            await notificationSoundService.playSuccessSound();
        } catch (error) {
            console.warn('Failed to play success sound:', error);
        }
    }, []);

    const playErrorSound = useCallback(async () => {
        try {
            await notificationSoundService.playErrorSound();
        } catch (error) {
            console.warn('Failed to play error sound:', error);
        }
    }, []);

    const playWarningSound = useCallback(async () => {
        try {
            await notificationSoundService.playWarningSound();
        } catch (error) {
            console.warn('Failed to play warning sound:', error);
        }
    }, []);

    // Generic play sound method
    const playSound = useCallback(async (type: SoundType, options?: NotificationSoundOptions) => {
        try {
            await notificationSoundService.playSound(type, options);
        } catch (error) {
            console.warn(`Failed to play ${type} sound:`, error);
        }
    }, []);

    // Settings controls
    const toggleEnabled = useCallback(() => {
        const newEnabled = !isEnabled;
        notificationSoundService.setEnabled(newEnabled);
        setIsEnabled(newEnabled);
    }, [isEnabled]);

    const setVolumeLevel = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        notificationSoundService.setVolume(clampedVolume);
        setVolume(clampedVolume);
    }, []);

    // Load custom sound
    const loadCustomSound = useCallback(async (type: SoundType, url: string) => {
        try {
            await notificationSoundService.loadCustomSound(type, url);
        } catch (error) {
            console.error(`Failed to load custom sound for ${type}:`, error);
            throw error;
        }
    }, []);

    return {
        // State
        isEnabled,
        volume,
        
        // Sound playing methods
        playConnectionSound,
        playNotificationSound,
        playSuccessSound,
        playErrorSound,
        playWarningSound,
        playSound,
        
        // Settings controls
        toggleEnabled,
        setVolume: setVolumeLevel,
        loadCustomSound,
        
        // Direct service access for advanced usage
        service: notificationSoundService
    };
};

/**
 * Hook for listening to SignalR events and playing appropriate sounds
 */
export const useSignalRSounds = () => {
    const { playNotificationSound, playConnectionSound } = useNotificationSound();

    useEffect(() => {
        // Listen for SignalR notification events
        const handleNotification = () => {
            playNotificationSound();
        };

        const handleBroadcast = () => {
            playNotificationSound();
        };

        // Add event listeners
        window.addEventListener('signalr-notification', handleNotification);
        window.addEventListener('signalr-broadcast', handleBroadcast);

        return () => {
            window.removeEventListener('signalr-notification', handleNotification);
            window.removeEventListener('signalr-broadcast', handleBroadcast);
        };
    }, [playNotificationSound]);

    return {
        playNotificationSound,
        playConnectionSound
    };
};

export default useNotificationSound;