import React from 'react';
import { useSignalR } from '../../hooks/useSignalR';

interface SignalRProviderProps {
    children: React.ReactNode;
}

const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
    // Initialize SignalR connection
    useSignalR();

    return <>{children}</>;
};

export default SignalRProvider;