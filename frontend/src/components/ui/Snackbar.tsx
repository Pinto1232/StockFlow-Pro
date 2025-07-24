import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface SnackbarProps {
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const Snackbar: React.FC<SnackbarProps> = ({
    isOpen,
    message,
    type = 'info',
    duration = 5000,
    onClose,
    action,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for animation to complete
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setProgress(100);
            
            if (duration > 0) {
                // Animate progress bar
                const progressInterval = setInterval(() => {
                    setProgress(prev => {
                        const newProgress = prev - (100 / (duration / 50));
                        if (newProgress <= 0) {
                            clearInterval(progressInterval);
                            handleClose();
                            return 0;
                        }
                        return newProgress;
                    });
                }, 50);

                return () => clearInterval(progressInterval);
            }
        }
    }, [isOpen, duration, handleClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'info':
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/25';
            case 'error':
                return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/25';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-yellow-500/25';
            case 'info':
            default:
                return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25';
        }
    };

    const getProgressColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-400';
            case 'error':
                return 'bg-red-400';
            case 'warning':
                return 'bg-yellow-400';
            case 'info':
            default:
                return 'bg-blue-400';
        }
    };

    const getIconAnimation = () => {
        switch (type) {
            case 'success':
                return 'animate-bounce';
            case 'error':
                return 'animate-pulse';
            case 'warning':
                return 'animate-pulse';
            case 'info':
            default:
                return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className={`
                    relative overflow-hidden flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[320px] max-w-[500px]
                    transition-all duration-500 ease-out backdrop-blur-sm
                    ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
                    ${getStyles()}
                `}
                style={{
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Progress bar */}
                {duration > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                        <div 
                            className={`h-full ${getProgressColor()} transition-all duration-75 ease-linear`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Icon with animation */}
                <div className={`flex-shrink-0 ${getIconAnimation()}`}>
                    {getIcon()}
                </div>
                
                {/* Message */}
                <span className="flex-1 text-sm font-medium leading-relaxed">{message}</span>
                
                {/* Action button */}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="text-sm font-semibold underline hover:no-underline transition-all duration-200 hover:scale-105 active:scale-95 px-2 py-1 rounded"
                    >
                        {action.label}
                    </button>
                )}
                
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
            </div>
        </div>
    );
};

export default Snackbar;