import React, { useState } from "react";
import { Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { useSignalR } from "../../hooks/useSignalR";
import { ConnectionState } from "../../services/signalrService";

interface ConnectionStatusProps {
    className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    className = "",
}) => {
    const { connectionState, connect } = useSignalR();
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetryConnection = async () => {
        if (connectionState === ConnectionState.Disconnected && !isRetrying) {
            setIsRetrying(true);
            try {
                await connect();
            } catch (error) {
                console.error('Failed to retry connection:', error);
            } finally {
                setIsRetrying(false);
            }
        }
    };

    const getStatusConfig = () => {
        switch (connectionState) {
            case ConnectionState.Connected:
                return {
                    icon: <Wifi className="h-4 w-4" />,
                    text: "Connected",
                    className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
                    dotClassName: "bg-green-500",
                    showRetry: false,
                };
            case ConnectionState.Connecting:
                return {
                    icon: <Loader2 className="h-4 w-4 animate-spin" />,
                    text: "Connecting...",
                    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
                    dotClassName: "bg-yellow-500 animate-pulse",
                    showRetry: false,
                };
            case ConnectionState.Reconnecting:
                return {
                    icon: <Loader2 className="h-4 w-4 animate-spin" />,
                    text: "Reconnecting...",
                    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
                    dotClassName: "bg-yellow-500 animate-pulse",
                    showRetry: false,
                };
            case ConnectionState.Disconnected:
            default:
                return {
                    icon: <WifiOff className="h-4 w-4" />,
                    text: "Disconnected",
                    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer",
                    dotClassName: "bg-red-500",
                    showRetry: true,
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm transition-colors ${config.className} ${className}`}
            onClick={config.showRetry ? handleRetryConnection : undefined}
            title={config.showRetry ? "Click to retry connection" : config.text}
        >
            <div className="flex items-center gap-2">
                {config.icon}
                <span className="text-sm font-medium">{config.text}</span>
            </div>
            
            {config.showRetry && (
                <RefreshCw 
                    className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} 
                />
            )}
            
            <div className={`w-2 h-2 rounded-full ${config.dotClassName}`} />
        </div>
    );
};

export default ConnectionStatus;
