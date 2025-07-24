import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2, AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    type = 'danger',
    onConfirm,
    onCancel,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const getConfirmButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95';
            case 'info':
            default:
                return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95';
        }
    };

    const getIconStyles = () => {
        switch (type) {
            case 'danger':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 className="h-7 w-7" />;
            case 'warning':
                return <AlertTriangle className="h-7 w-7" />;
            case 'info':
            default:
                return <AlertCircle className="h-7 w-7" />;
        }
    };

    const getHeaderGradient = () => {
        switch (type) {
            case 'danger':
                return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 'info':
            default:
                return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
        }
    };

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
                isAnimating ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-0'
            }`}
            style={{ backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)' }}
        >
            <div 
                className={`bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
                    isAnimating 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Animated Header */}
                <div className={`${getHeaderGradient()} border-b rounded-t-3xl p-6`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div 
                                className={`p-3 rounded-2xl border-2 ${getIconStyles()} transform transition-all duration-500 hover:scale-110`}
                                style={{
                                    animation: isAnimating ? 'pulse 2s infinite' : 'none'
                                }}
                            >
                                {getIcon()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
                                <div className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full w-16 opacity-60"></div>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Content */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-4 border-l-4 border-red-400">
                        <p className="text-gray-800 leading-relaxed font-medium">{message}</p>
                    </div>
                    
                    {type === 'danger' && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">This action cannot be undone!</span>
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-3xl border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${getConfirmButtonStyles()}`}
                    >
                        <span className="flex items-center gap-2">
                            {type === 'danger' && <Trash2 className="h-4 w-4" />}
                            {confirmLabel}
                        </span>
                    </button>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
};

export default ConfirmDialog;