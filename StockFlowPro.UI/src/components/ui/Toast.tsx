import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bell,
  Clock
} from 'lucide-react';

export type ToastType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'notification'
  | 'loading'
  | 'custom';

export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export type ToastAnimation = 
  | 'slide-in' 
  | 'fade-in' 
  | 'bounce-in' 
  | 'zoom-in'
  | 'slide-up'
  | 'slide-down';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  animation?: ToastAnimation;
  showProgress?: boolean;
  showIcon?: boolean;
  closable?: boolean;
  persistent?: boolean;
  actions?: ToastAction[];
  customIcon?: React.ReactNode;
  customColor?: {
    background: string;
    text: string;
    accent: string;
  };
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  type = 'info',
  duration = 5000,
  animation = 'slide-in',
  showProgress = true,
  showIcon = true,
  closable = true,
  persistent = false,
  actions = [],
  customIcon,
  customColor,
  onClose,
  onClick,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-close timer
    if (!persistent && duration > 0) {
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 50));
          if (newProgress <= 0) {
            clearInterval(progressTimer);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 50);

      return () => {
        clearTimeout(showTimer);
        clearInterval(progressTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [duration, persistent, handleClose]);

  const getIcon = () => {
    if (customIcon) return customIcon;
    if (!showIcon) return null;

    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'notification':
        return <Bell className="h-5 w-5" />;
      case 'loading':
        return <Clock className="h-5 w-5 animate-spin" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeStyles = (): React.CSSProperties | string => {
    if (customColor) {
      return {
        background: customColor.background,
        color: customColor.text,
        borderColor: customColor.accent,
      };
    }

    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25';
      case 'error':
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white border-red-400 shadow-lg shadow-red-500/25';
      case 'warning':
        return 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white border-orange-400 shadow-lg shadow-orange-500/25';
      case 'notification':
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/25';
      case 'loading':
        return 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 text-white border-blue-400 shadow-lg shadow-blue-500/25';
      case 'info':
      default:
        return 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white border-sky-400 shadow-lg shadow-sky-500/25';
    }
  };

  const getProgressColor = () => {
    if (customColor) return customColor.accent;

    switch (type) {
      case 'success':
        return 'bg-emerald-200';
      case 'error':
        return 'bg-red-200';
      case 'warning':
        return 'bg-orange-200';
      case 'notification':
        return 'bg-purple-200';
      case 'loading':
        return 'bg-blue-200';
      case 'info':
      default:
        return 'bg-sky-200';
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    if (isLeaving) {
      switch (animation) {
        case 'slide-in':
          return `${baseClasses} translate-x-full opacity-0`;
        case 'fade-in':
          return `${baseClasses} opacity-0`;
        case 'bounce-in':
          return `${baseClasses} scale-0 opacity-0`;
        case 'zoom-in':
          return `${baseClasses} scale-0 opacity-0`;
        case 'slide-up':
          return `${baseClasses} -translate-y-full opacity-0`;
        case 'slide-down':
          return `${baseClasses} translate-y-full opacity-0`;
        default:
          return `${baseClasses} translate-x-full opacity-0`;
      }
    }

    if (!isVisible) {
      switch (animation) {
        case 'slide-in':
          return `${baseClasses} translate-x-full opacity-0`;
        case 'fade-in':
          return `${baseClasses} opacity-0`;
        case 'bounce-in':
          return `${baseClasses} scale-0 opacity-0`;
        case 'zoom-in':
          return `${baseClasses} scale-75 opacity-0`;
        case 'slide-up':
          return `${baseClasses} translate-y-full opacity-0`;
        case 'slide-down':
          return `${baseClasses} -translate-y-full opacity-0`;
        default:
          return `${baseClasses} translate-x-full opacity-0`;
      }
    }

    return `${baseClasses} translate-x-0 translate-y-0 opacity-100 scale-100`;
  };

  const getActionButtonStyles = (variant: ToastAction['variant'] = 'primary') => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'primary':
      default:
        return 'bg-white/20 hover:bg-white/30 text-white';
    }
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
        border-l-4 min-w-[320px] max-w-[500px] cursor-pointer
        ${customColor ? '' : getTypeStyles()}
        ${getAnimationClasses()}
        ${className}
      `}
      style={customColor ? (getTypeStyles() as React.CSSProperties) : {}}
      onClick={onClick}
    >
      {/* Progress bar */}
      {showProgress && !persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full rounded-b-xl overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1 leading-tight">
            {title}
          </h4>
        )}
        <p className="text-sm leading-relaxed opacity-95">
          {message}
        </p>
        
        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${getActionButtonStyles(action.variant)}
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Close button */}
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg 
                   transition-all duration-200 hover:scale-110 active:scale-95 ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white/5 rounded-full"></div>
    </div>
  );
};

export default Toast;
