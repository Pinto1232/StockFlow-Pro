import { useState } from "react";

interface SnackbarState {
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

interface UseSnackbarReturn {
    snackbar: SnackbarState;
    showSnackbar: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    hideSnackbar: () => void;
}

export const useSnackbar = (): UseSnackbarReturn => {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbar({
            isOpen: true,
            message,
            type,
        });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    return {
        snackbar,
        showSnackbar,
        hideSnackbar,
    };
};