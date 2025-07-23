/**
 * SignalR Debug Utilities
 * Helper functions to debug SignalR connection issues
 */

export const testSignalRConnection = async (): Promise<void> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    const hubUrl = `${baseUrl}/stockflowhub`;
    
    console.log('=== SignalR Connection Debug ===');
    console.log('API Base URL:', apiBaseUrl);
    console.log('Base URL:', baseUrl);
    console.log('Hub URL:', hubUrl);
    console.log('Auth Token Available:', !!localStorage.getItem('authToken'));
    
    // Test if the hub endpoint is reachable
    try {
        const negotiateUrl = `${hubUrl}/negotiate`;
        console.log('Testing negotiate endpoint:', negotiateUrl);
        
        const response = await fetch(negotiateUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            }
        });
        
        console.log('Negotiate response status:', response.status);
        console.log('Negotiate response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Negotiate response data:', data);
        } else {
            const errorText = await response.text();
            console.error('Negotiate error response:', errorText);
        }
    } catch (error) {
        console.error('Failed to reach negotiate endpoint:', error);
    }
    
    console.log('=== End SignalR Debug ===');
};

export const checkBackendHealth = async (): Promise<boolean> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';
    
    try {
        console.log('Checking backend health at:', apiBaseUrl);
        const response = await fetch(`${apiBaseUrl}/health`, {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Backend health check status:', response.status);
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};