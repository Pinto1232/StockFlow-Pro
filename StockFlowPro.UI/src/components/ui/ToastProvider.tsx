import React, { createContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastProps, ToastPosition, ToastAnimation } from './Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
  updateToast: (id: string, updates: Partial<Omit<ToastProps, 'id'>>) => void;
}

interface ToastItem extends ToastProps {
  id: string;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultPosition?: ToastPosition;
  defaultAnimation?: ToastAnimation;
  gutter?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultPosition = 'bottom-right',
  defaultAnimation = 'slide-in',
  gutter = 12,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = generateId();
    const newToast: ToastItem = {
      ...toast,
      id,
      position: toast.position || defaultPosition,
      animation: toast.animation || defaultAnimation,
    };

    setToasts((prevToasts) => {
      const updatedToasts = [...prevToasts, newToast];
      // Remove oldest toasts if exceeding maxToasts
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      return updatedToasts;
    });

    return id;
  }, [generateId, defaultPosition, defaultAnimation, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<ToastProps, 'id'>>) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const getPositionStyles = (position: ToastPosition) => {
    const baseStyles = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  const groupToastsByPosition = () => {
    const groups: Record<ToastPosition, ToastItem[]> = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': [],
    };

    toasts.forEach((toast) => {
      const position = toast.position || defaultPosition;
      groups[position].push(toast);
    });

    return groups;
  };

  const toastGroups = groupToastsByPosition();

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts, updateToast }}>
      {children}
      
      {/* Render toast containers for each position */}
      {Object.entries(toastGroups).map(([position, positionToasts]) => {
        if (positionToasts.length === 0) return null;

        const isBottomPosition = position.includes('bottom');
        const displayToasts = isBottomPosition 
          ? [...positionToasts].reverse() 
          : positionToasts;

        return (
          <div
            key={position}
            className={getPositionStyles(position as ToastPosition)}
          >
            <div 
              className="flex flex-col pointer-events-auto"
              style={{ gap: `${gutter}px` }}
            >
              {displayToasts.map((toast) => (
                <Toast
                  key={toast.id}
                  {...toast}
                  onClose={() => hideToast(toast.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </ToastContext.Provider>
  );
};

export { ToastContext };
export default ToastProvider;
