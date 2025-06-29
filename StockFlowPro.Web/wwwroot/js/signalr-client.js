// SignalR Client for StockFlow Pro
class StockFlowSignalRClient {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.isInitializing = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 seconds
    }

    async initialize() {
        // Prevent multiple initialization attempts
        if (this.isInitializing || this.isConnected) {
            console.log("SignalR already initializing or connected");
            return;
        }

        this.isInitializing = true;
        
        try {
            // Create connection
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/stockflowhub")
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start connection
            await this.connection.start();
            this.isConnected = true;
            this.isInitializing = false;
            this.reconnectAttempts = 0;
            
            console.log("SignalR Connected successfully");
            this.showConnectionStatus("Connected", "connected");
            
        } catch (error) {
            this.isInitializing = false;
            console.error("SignalR Connection failed:", error);
            this.showConnectionStatus("Connection Failed", "error");
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        // Connection events
        this.connection.onclose(async () => {
            this.isConnected = false;
            console.log("SignalR Connection closed");
            this.showConnectionStatus("Disconnected", "warning");
            this.scheduleReconnect();
        });

        this.connection.onreconnecting(() => {
            console.log("SignalR Reconnecting...");
            this.showConnectionStatus("Reconnecting...", "info");
        });

        this.connection.onreconnected(() => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log("SignalR Reconnected successfully");
            this.showConnectionStatus("Connected", "connected");
        });

        // Business event handlers
        this.connection.on("StockLevelAlert", (data) => {
            this.handleStockLevelAlert(data);
        });

        this.connection.on("InvoiceStatusUpdate", (data) => {
            this.handleInvoiceStatusUpdate(data);
        });

        this.connection.on("UserNotification", (data) => {
            this.handleUserNotification(data);
        });

        this.connection.on("DashboardUpdate", (data) => {
            this.handleDashboardUpdate(data);
        });

        this.connection.on("StockUpdate", (data) => {
            this.handleStockUpdate(data);
        });

        this.connection.on("InvoiceUpdate", (data) => {
            this.handleInvoiceUpdate(data);
        });

        this.connection.on("UserActivity", (data) => {
            this.handleUserActivity(data);
        });

        this.connection.on("SystemMetrics", (data) => {
            this.handleSystemMetrics(data);
        });

        this.connection.on("ReceiveMessage", (userId, message) => {
            this.handleReceiveMessage(userId, message);
        });
    }

    // Event Handlers
    handleStockLevelAlert(data) {
        console.log("Stock Level Alert:", data);
        
        const alertClass = data.Severity === 'critical' ? 'alert-danger' : 'alert-warning';
        const alertMessage = `
            <strong>Stock Alert!</strong> 
            ${data.ProductName} is ${data.Severity === 'critical' ? 'out of stock' : 'running low'}.
            Current: ${data.CurrentStock}, Minimum: ${data.MinimumStock}
        `;
        
        this.showAlert(alertMessage, alertClass);
        this.updateStockDisplay(data.ProductId, data.CurrentStock);
        this.playNotificationSound();
    }

    handleInvoiceStatusUpdate(data) {
        console.log("Invoice Status Update:", data);
        
        const message = `Invoice #${data.InvoiceId} status updated to: ${data.Status}`;
        this.showNotification(message, "info");
        this.updateInvoiceStatus(data.InvoiceId, data.Status);
    }

    handleUserNotification(data) {
        console.log("User Notification:", data);
        this.showNotification(data.Message, data.Type);
    }

    handleDashboardUpdate(data) {
        console.log("Dashboard Update:", data);
        this.updateDashboardMetrics(data);
    }

    handleStockUpdate(data) {
        console.log("Stock Update:", data);
        this.updateStockDisplay(data.ProductId, data.NewQuantity);
    }

    handleInvoiceUpdate(data) {
        console.log("Invoice Update:", data);
        this.updateInvoiceStatus(data.InvoiceId, data.Status);
    }

    handleUserActivity(data) {
        console.log("User Activity:", data);
        // Only show for admin users
        if (this.isAdmin()) {
            this.updateUserActivityLog(data);
        }
    }

    handleSystemMetrics(data) {
        console.log("System Metrics:", data);
        this.updateSystemMetricsDisplay(data.Metrics);
    }

    handleReceiveMessage(userId, message) {
        console.log("Message received from:", userId, message);
        this.showChatMessage(userId, message);
    }

    // UI Update Methods
    showConnectionStatus(status, type) {
        const statusElement = document.getElementById('signalr-status');
        const loadingElement = document.getElementById('signalr-loading');
        
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `signalr-status ${type}`;
        }
        
        if (loadingElement) {
            if (type === 'connected') {
                // Hide loading spinner and show tick icon
                loadingElement.style.display = 'none';
                this.showConnectedIcon();
            } else if (type === 'info' || status.includes('Connecting') || status.includes('Reconnecting')) {
                // Show loading spinner
                loadingElement.style.display = 'inline-block';
                this.hideConnectedIcon();
            } else {
                // Hide loading spinner for error/warning states
                loadingElement.style.display = 'none';
                this.hideConnectedIcon();
            }
        }
    }
    
    showConnectedIcon() {
        let iconElement = document.getElementById('signalr-connected-icon');
        if (!iconElement) {
            iconElement = document.createElement('i');
            iconElement.id = 'signalr-connected-icon';
            iconElement.className = 'fas fa-check-circle signalr-connected-icon';
            
            // Insert after the status text
            const statusElement = document.getElementById('signalr-status');
            if (statusElement && statusElement.parentNode) {
                statusElement.parentNode.appendChild(iconElement);
            }
        }
        
        iconElement.style.display = 'inline-block';
        // Add animation effect
        iconElement.classList.add('icon-appear');
        setTimeout(() => iconElement.classList.remove('icon-appear'), 600);
    }
    
    hideConnectedIcon() {
        const iconElement = document.getElementById('signalr-connected-icon');
        if (iconElement) {
            iconElement.style.display = 'none';
        }
    }

    showAlert(message, alertClass) {
        const alertContainer = document.getElementById('alert-container') || document.body;
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alertDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 10000);
    }

    showNotification(message, type) {
        // Create toast notification
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${this.getBootstrapColor(type)} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove from DOM after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    updateStockDisplay(productId, newQuantity) {
        const stockElement = document.querySelector(`[data-product-id="${productId}"] .stock-quantity`);
        if (stockElement) {
            stockElement.textContent = newQuantity;
            stockElement.classList.add('updated');
            setTimeout(() => stockElement.classList.remove('updated'), 2000);
        }
    }

    updateInvoiceStatus(invoiceId, status) {
        const statusElement = document.querySelector(`[data-invoice-id="${invoiceId}"] .invoice-status`);
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `invoice-status status-${status.toLowerCase()}`;
        }
    }

    updateDashboardMetrics(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(`metric-${key}`);
            if (element) {
                element.textContent = data[key];
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 1000);
            }
        });
    }

    updateUserActivityLog(data) {
        const activityLog = document.getElementById('user-activity-log');
        if (activityLog) {
            const logEntry = document.createElement('div');
            logEntry.className = 'activity-entry';
            logEntry.innerHTML = `
                <span class="timestamp">${new Date(data.Timestamp).toLocaleTimeString()}</span>
                <span class="user">User ${data.UserId}</span>
                <span class="activity">${data.Activity}</span>
            `;
            activityLog.prepend(logEntry);

            // Keep only last 50 entries
            while (activityLog.children.length > 50) {
                activityLog.removeChild(activityLog.lastChild);
            }
        }
    }

    updateSystemMetricsDisplay(metrics) {
        Object.keys(metrics).forEach(key => {
            const element = document.getElementById(`system-${key}`);
            if (element) {
                element.textContent = metrics[key];
            }
        });
    }

    // Utility Methods
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
        return container;
    }

    getBootstrapColor(type) {
        const colorMap = {
            'info': 'primary',
            'success': 'success',
            'warning': 'warning',
            'error': 'danger',
            'danger': 'danger'
        };
        return colorMap[type] || 'primary';
    }

    isAdmin() {
        // Check if current user has admin role
        const userRole = document.body.getAttribute('data-user-role');
        return userRole === 'Admin';
    }

    playNotificationSound() {
        // Play notification sound if enabled
        if (this.soundEnabled) {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
        }
    }

    async scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isInitializing) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(async () => {
                try {
                    // Reset connection state before reconnecting
                    this.isConnected = false;
                    this.connection = null;
                    await this.initialize();
                } catch (error) {
                    console.error("Reconnection failed:", error);
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error("Max reconnection attempts reached");
            this.showConnectionStatus("Connection Lost", "error");
        }
    }

    // Safe method to start connection if not already started
    async safeStart() {
        if (!this.connection) {
            console.log("No connection exists, initializing...");
            await this.initialize();
            return;
        }

        const connectionState = this.connection.state;
        console.log("Current connection state:", connectionState);

        if (connectionState === signalR.HubConnectionState.Disconnected) {
            try {
                await this.connection.start();
                this.isConnected = true;
                console.log("SignalR Connection started successfully");
                this.showConnectionStatus("Connected", "connected");
            } catch (error) {
                console.error("Failed to start SignalR connection:", error);
                this.showConnectionStatus("Connection Failed", "error");
            }
        } else if (connectionState === signalR.HubConnectionState.Connected) {
            console.log("SignalR already connected");
            this.isConnected = true;
            this.showConnectionStatus("Connected", "connected");
        } else {
            console.log("SignalR connection is in state:", connectionState);
        }
    }

    // Public Methods
    async joinGroup(groupName) {
        if (this.isConnected) {
            try {
                await this.connection.invoke("JoinGroup", groupName);
                console.log(`Joined group: ${groupName}`);
            } catch (error) {
                console.error(`Failed to join group ${groupName}:`, error);
            }
        }
    }

    async leaveGroup(groupName) {
        if (this.isConnected) {
            try {
                await this.connection.invoke("LeaveGroup", groupName);
                console.log(`Left group: ${groupName}`);
            } catch (error) {
                console.error(`Failed to leave group ${groupName}:`, error);
            }
        }
    }

    async sendMessageToGroup(groupName, message) {
        if (this.isConnected) {
            try {
                await this.connection.invoke("SendMessageToGroup", groupName, message);
            } catch (error) {
                console.error(`Failed to send message to group ${groupName}:`, error);
            }
        }
    }
}

// Global instance
window.stockFlowSignalR = new StockFlowSignalRClient();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.stockFlowSignalR.initialize();
    } catch (error) {
        console.error('Failed to initialize SignalR:', error);
    }
});