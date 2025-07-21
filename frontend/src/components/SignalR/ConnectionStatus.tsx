import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ConnectionState = {
  Disconnected: 'Disconnected',
  Connecting: 'Connecting',
  Connected: 'Connected',
  Reconnecting: 'Reconnecting',
} as const;

export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Connecting);

  useEffect(() => {
    // Simulate connection logic - in a real app this would connect to SignalR
    const timer = setTimeout(() => {
      setConnectionState(ConnectionState.Connected);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusConfig = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: 'Connected',
          className: 'bg-green-50 text-green-700 border-green-200',
          dotClassName: 'bg-green-500',
        };
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: connectionState === ConnectionState.Connecting ? 'Connecting...' : 'Reconnecting...',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          dotClassName: 'bg-yellow-500 animate-pulse',
        };
      case ConnectionState.Disconnected:
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Disconnected',
          className: 'bg-red-50 text-red-700 border-red-200',
          dotClassName: 'bg-red-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm ${config.className} ${className}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="text-sm font-medium">{config.text}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${config.dotClassName}`} />
    </div>
  );
};

export default ConnectionStatus;