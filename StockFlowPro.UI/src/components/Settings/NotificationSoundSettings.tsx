import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Settings } from 'lucide-react';
import notificationSoundService, { SoundType } from '../../utils/notificationSound';

interface NotificationSoundSettingsProps {
    className?: string;
}

const NotificationSoundSettings: React.FC<NotificationSoundSettingsProps> = ({ 
    className = '' 
}) => {
    const [isEnabled, setIsEnabled] = useState(notificationSoundService.isEnabledState());
    const [volume, setVolume] = useState(notificationSoundService.getVolume());
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Sync with the service state
        setIsEnabled(notificationSoundService.isEnabledState());
        setVolume(notificationSoundService.getVolume());
    }, []);

    const handleToggleEnabled = () => {
        const newEnabled = !isEnabled;
        setIsEnabled(newEnabled);
        notificationSoundService.setEnabled(newEnabled);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        notificationSoundService.setVolume(newVolume);
    };

    const handleTestSound = async (soundType: SoundType) => {
        try {
            await notificationSoundService.playSound(soundType);
        } catch (error) {
            console.error('Failed to play test sound:', error);
        }
    };

    const soundTypes = [
        { type: SoundType.CONNECTION, label: 'Connection', description: 'When SignalR connects' },
        { type: SoundType.NOTIFICATION, label: 'Notification', description: 'For incoming notifications' },
        { type: SoundType.SUCCESS, label: 'Success', description: 'For successful actions' },
        { type: SoundType.WARNING, label: 'Warning', description: 'For warning messages' },
        { type: SoundType.ERROR, label: 'Error', description: 'For error messages' }
    ];

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {isEnabled ? (
                            <Volume2 className="h-5 w-5 text-blue-600" />
                        ) : (
                            <VolumeX className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Notification Sounds
                            </h3>
                            <p className="text-sm text-gray-600">
                                Configure audio notifications for SignalR events
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Expand settings"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Basic Controls */}
            <div className="p-4 space-y-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Enable Notification Sounds
                        </label>
                        <p className="text-xs text-gray-500">
                            Play sounds for SignalR connections and notifications
                        </p>
                    </div>
                    <button
                        onClick={handleToggleEnabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {/* Volume Control */}
                {isEnabled && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Volume: {Math.round(volume * 100)}%
                        </label>
                        <div className="flex items-center space-x-3">
                            <VolumeX className="h-4 w-4 text-gray-400" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <Volume2 className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Settings */}
            {isExpanded && isEnabled && (
                <div className="border-t border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Test Sounds
                    </h4>
                    <div className="space-y-3">
                        {soundTypes.map(({ type, label, description }) => (
                            <div
                                key={type}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {label}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {description}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleTestSound(type)}
                                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Play className="h-3 w-3" />
                                    <span>Test</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleTestSound(SoundType.CONNECTION)}
                                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Test Connection Sound
                            </button>
                            <button
                                onClick={() => handleTestSound(SoundType.NOTIFICATION)}
                                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Test Notification Sound
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Indicator */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-600">
                        {isEnabled 
                            ? `Notification sounds enabled at ${Math.round(volume * 100)}% volume`
                            : 'Notification sounds disabled'
                        }
                    </span>
                </div>
            </div>

            {/* Custom CSS for slider */}
            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .slider::-moz-range-thumb {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
};

export default NotificationSoundSettings;