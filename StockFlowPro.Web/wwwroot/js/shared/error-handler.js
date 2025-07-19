// Error Handler JavaScript - Centralized error handling and logging

// Global error handler object
window.wr = window.wr || {};

// Error logging function
window.wr.error = function(message, error, context) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
        timestamp: timestamp,
        message: message,
        error: error,
        context: context || 'Unknown',
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    // Log to console with emoji for visibility
    console.error('🔴', message, error);
    
    // Log detailed error info
    console.group('🔴 Error Details');
    console.log('Timestamp:', timestamp);
    console.log('Message:', message);
    console.log('Error:', error);
    console.log('Context:', context);
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    if (error && error.stack) {
        console.log('Stack Trace:', error.stack);
    }
    console.groupEnd();
    
    // Store error in session storage for debugging
    try {
        const storedErrors = JSON.parse(sessionStorage.getItem('stockflow_errors') || '[]');
        storedErrors.push(errorInfo);
        
        // Keep only last 50 errors to prevent storage overflow
        if (storedErrors.length > 50) {
            storedErrors.splice(0, storedErrors.length - 50);
        }
        
        sessionStorage.setItem('stockflow_errors', JSON.stringify(storedErrors));
    } catch (storageError) {
        console.warn('Could not store error in session storage:', storageError);
    }
    
    // Send error to server for logging (optional)
    if (window.wr.config && window.wr.config.sendErrorsToServer) {
        sendErrorToServer(errorInfo);
    }
    
    // Show user-friendly error message if configured
    if (window.wr.config && window.wr.config.showUserErrors) {
        showUserError(message, error);
    }
};

// Success logging function
window.wr.success = function(message, data, context) {
    const timestamp = new Date().toISOString();
    console.log('🟢', message, data);
    
    if (window.wr.config && window.wr.config.logSuccessEvents) {
        console.group('🟢 Success Event');
        console.log('Timestamp:', timestamp);
        console.log('Message:', message);
        console.log('Data:', data);
        console.log('Context:', context);
        console.groupEnd();
    }
};

// Warning logging function
window.wr.warn = function(message, data, context) {
    const timestamp = new Date().toISOString();
    console.warn('🟡', message, data);
    
    console.group('🟡 Warning');
    console.log('Timestamp:', timestamp);
    console.log('Message:', message);
    console.log('Data:', data);
    console.log('Context:', context);
    console.groupEnd();
};

// Info logging function
window.wr.info = function(message, data, context) {
    const timestamp = new Date().toISOString();
    console.info('🔵', message, data);
    
    if (window.wr.config && window.wr.config.logInfoEvents) {
        console.group('🔵 Info');
        console.log('Timestamp:', timestamp);
        console.log('Message:', message);
        console.log('Data:', data);
        console.log('Context:', context);
        console.groupEnd();
    }
};

// Debug logging function
window.wr.debug = function(message, data, context) {
    if (window.wr.config && window.wr.config.enableDebugLogging) {
        const timestamp = new Date().toISOString();
        console.debug('🔧', message, data);
        
        console.group('🔧 Debug');
        console.log('Timestamp:', timestamp);
        console.log('Message:', message);
        console.log('Data:', data);
        console.log('Context:', context);
        console.groupEnd();
    }
};

// Send error to server for logging
async function sendErrorToServer(errorInfo) {
    try {
        await fetch('/api/diagnostics/log-client-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorInfo)
        });
    } catch (serverError) {
        console.warn('Could not send error to server:', serverError);
    }
}

// Show user-friendly error message
function showUserError(message, error) {
    // Check if showAlert function exists (from invoices.js or other files)
    if (typeof showAlert === 'function') {
        showAlert('An error occurred: ' + message, 'danger');
    } else {
        // Fallback: create a simple alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <strong>Error:</strong> ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (text == null || text === undefined) {
        return '';
    }
    
    const textStr = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return textStr.replace(/[&<>"']/g, m => map[m]);
}

// Get stored errors for debugging
window.wr.getStoredErrors = function() {
    try {
        return JSON.parse(sessionStorage.getItem('stockflow_errors') || '[]');
    } catch (error) {
        console.warn('Could not retrieve stored errors:', error);
        return [];
    }
};

// Clear stored errors
window.wr.clearStoredErrors = function() {
    try {
        sessionStorage.removeItem('stockflow_errors');
        console.log('🔧 Stored errors cleared');
    } catch (error) {
        console.warn('Could not clear stored errors:', error);
    }
};

// Global error handler for uncaught errors
window.addEventListener('error', function(event) {
    window.wr.error('Uncaught JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    }, 'Global Error Handler');
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    window.wr.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
    }, 'Global Promise Handler');
});

// Configuration object with defaults
window.wr.config = {
    sendErrorsToServer: false, // Set to true to send errors to server
    showUserErrors: true,      // Set to false to hide user error messages
    logSuccessEvents: false,   // Set to true to log success events
    logInfoEvents: false,      // Set to true to log info events
    enableDebugLogging: false  // Set to true to enable debug logging
};

// Initialize error handler
console.log('🔧 Error Handler initialized');
console.log('🔧 Configuration:', window.wr.config);