import { useContext } from 'react';
import { ToastContext } from '../components/ui/ToastProvider';
import { ToastProps } from '../components/ui/Toast';

// Custom hook to use toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { showToast, hideToast, hideAllToasts, updateToast } = context;

  // Convenience methods for different toast types
  const toast = {
    success: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'success', ...options }),
    
    error: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'error', ...options }),
    
    warning: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'warning', ...options }),
    
    info: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'info', ...options }),
    
    notification: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'notification', ...options }),
    
    loading: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message' | 'onClose'>>) =>
      showToast({ message, type: 'loading', persistent: true, ...options }),
    
    custom: (toast: Omit<ToastProps, 'id' | 'onClose'>) =>
      showToast(toast),
  };

  return {
    toast,
    showToast,
    hideToast,
    hideAllToasts,
    updateToast,
  };
};
