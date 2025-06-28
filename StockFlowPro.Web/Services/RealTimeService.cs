using Microsoft.AspNetCore.SignalR;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Web.Hubs;

namespace StockFlowPro.Web.Services;

public class RealTimeService : IRealTimeService
{
    private readonly IHubContext<StockFlowHub> _hubContext;
    private readonly ILogger<RealTimeService> _logger;

    public RealTimeService(IHubContext<StockFlowHub> hubContext, ILogger<RealTimeService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastStockUpdateAsync(int productId, int newQuantity)
    {
        var updateData = new
        {
            ProductId = productId,
            NewQuantity = newQuantity,
            Timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients.All.SendAsync("StockUpdate", updateData);
        _logger.LogInformation("Stock update broadcasted for product {ProductId}: {NewQuantity}", 
            productId, newQuantity);
    }

    public async Task BroadcastInvoiceUpdateAsync(int invoiceId, string status, string userId)
    {
        var updateData = new
        {
            InvoiceId = invoiceId,
            Status = status,
            UserId = userId,
            Timestamp = DateTime.UtcNow
        };

        // Send to all users with appropriate roles
        await _hubContext.Clients.Groups("Admin", "Manager")
            .SendAsync("InvoiceUpdate", updateData);

        // Send to specific user
        await _hubContext.Clients.Group($"User_{userId}")
            .SendAsync("InvoiceUpdate", updateData);

        _logger.LogInformation("Invoice update broadcasted for invoice {InvoiceId}: {Status}", 
            invoiceId, status);
    }

    public async Task BroadcastUserActivityAsync(string userId, string activity)
    {
        var activityData = new
        {
            UserId = userId,
            Activity = activity,
            Timestamp = DateTime.UtcNow
        };

        // Send to Admin role only for user activity monitoring
        await _hubContext.Clients.Group("Admin")
            .SendAsync("UserActivity", activityData);

        _logger.LogInformation("User activity broadcasted for user {UserId}: {Activity}", 
            userId, activity);
    }

    public async Task BroadcastSystemMetricsAsync(Dictionary<string, object> metrics)
    {
        var metricsData = new
        {
            Metrics = metrics,
            Timestamp = DateTime.UtcNow
        };

        // Send to Admin and Manager roles
        await _hubContext.Clients.Groups("Admin", "Manager")
            .SendAsync("SystemMetrics", metricsData);

        _logger.LogInformation("System metrics broadcasted with {MetricCount} metrics", metrics.Count);
    }

    public async Task JoinUserGroupAsync(string connectionId, string userId)
    {
        await _hubContext.Groups.AddToGroupAsync(connectionId, $"User_{userId}");
        _logger.LogDebug("Connection {ConnectionId} joined user group for user {UserId}", 
            connectionId, userId);
    }

    public async Task LeaveUserGroupAsync(string connectionId, string userId)
    {
        await _hubContext.Groups.RemoveFromGroupAsync(connectionId, $"User_{userId}");
        _logger.LogDebug("Connection {ConnectionId} left user group for user {UserId}", 
            connectionId, userId);
    }

    public async Task JoinRoleGroupAsync(string connectionId, string role)
    {
        await _hubContext.Groups.AddToGroupAsync(connectionId, role);
        _logger.LogDebug("Connection {ConnectionId} joined role group {Role}", 
            connectionId, role);
    }

    public async Task LeaveRoleGroupAsync(string connectionId, string role)
    {
        await _hubContext.Groups.RemoveFromGroupAsync(connectionId, role);
        _logger.LogDebug("Connection {ConnectionId} left role group {Role}", 
            connectionId, role);
    }
}