using Microsoft.AspNetCore.SignalR;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Web.Hubs;

namespace StockFlowPro.Web.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<StockFlowHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IHubContext<StockFlowHub> hubContext, ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendStockLevelAlertAsync(Product product, int currentStock, int minimumStock)
    {
        var alertData = new
        {
            ProductId = product.Id,
            ProductName = product.Name,
            CurrentStock = currentStock,
            MinimumStock = minimumStock,
            Severity = currentStock == 0 ? "critical" : "warning",
            Timestamp = DateTime.UtcNow
        };

        // Send to Admin and Manager roles
        await _hubContext.Clients.Groups("Admin", "Manager")
            .SendAsync("StockLevelAlert", alertData);

        _logger.LogInformation("Stock level alert sent for product {ProductName} (ID: {ProductId})", 
            product.Name, product.Id);
    }

    public async Task SendInvoiceStatusUpdateAsync(string userId, int invoiceId, string status)
    {
        var updateData = new
        {
            InvoiceId = invoiceId,
            Status = status,
            Timestamp = DateTime.UtcNow
        };

        // Send to specific user
        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("InvoiceStatusUpdate", updateData);

        // Also send to Admin and Manager roles
        await _hubContext.Clients.Groups("Admin", "Manager")
            .SendAsync("InvoiceStatusUpdate", updateData);

        _logger.LogInformation("Invoice status update sent for invoice {InvoiceId} to user {UserId}", 
            invoiceId, userId);
    }

    public async Task SendUserNotificationAsync(string userId, string message, string type = "info")
    {
        var notificationData = new
        {
            Message = message,
            Type = type,
            Timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("UserNotification", notificationData);

        _logger.LogInformation("User notification sent to user {UserId}: {Message}", userId, message);
    }

    public async Task SendDashboardUpdateAsync(object data)
    {
        await _hubContext.Clients.All.SendAsync("DashboardUpdate", data);
        _logger.LogInformation("Dashboard update broadcasted to all connected clients");
    }

    public async Task SendToGroupAsync(string groupName, string method, object data)
    {
        await _hubContext.Clients.Group(groupName).SendAsync(method, data);
        _logger.LogInformation("Message sent to group {GroupName} via method {Method}", groupName, method);
    }

    public async Task SendToUserAsync(string userId, string method, object data)
    {
        await _hubContext.Clients.Group($"User_{userId}").SendAsync(method, data);
        _logger.LogInformation("Message sent to user {UserId} via method {Method}", userId, method);
    }

    public async Task SendToAllAsync(string method, object data)
    {
        await _hubContext.Clients.All.SendAsync(method, data);
        _logger.LogInformation("Message broadcasted to all clients via method {Method}", method);
    }
}