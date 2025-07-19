using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using StockFlowPro.Application.Interfaces;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace StockFlowPro.Web.Hubs;

[Authorize]
public class StockFlowHub : Hub
{
    private readonly IRealTimeService _realTimeService;
    private readonly ILogger<StockFlowHub> _logger;
    private static readonly ConcurrentDictionary<string, DateTime> _connectionHeartbeats = new();

    public StockFlowHub(IRealTimeService realTimeService, ILogger<StockFlowHub> logger)
    {
        _realTimeService = realTimeService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        // Initialize heartbeat tracking
        _connectionHeartbeats[Context.ConnectionId] = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(userId))
        {
            await _realTimeService.JoinUserGroupAsync(Context.ConnectionId, userId);
            _logger.LogInformation("User {UserId} connected with connection {ConnectionId}", userId, Context.ConnectionId);
        }

        if (!string.IsNullOrEmpty(userRole))
        {
            await _realTimeService.JoinRoleGroupAsync(Context.ConnectionId, userRole);
            _logger.LogInformation("User {UserId} joined role group {Role}", userId, userRole);
        }

        // Send initial connection confirmation
        await Clients.Caller.SendAsync("ConnectionEstablished", Context.ConnectionId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        // Remove heartbeat tracking
        _connectionHeartbeats.TryRemove(Context.ConnectionId, out _);

        if (!string.IsNullOrEmpty(userId))
        {
            await _realTimeService.LeaveUserGroupAsync(Context.ConnectionId, userId);
            _logger.LogInformation("User {UserId} disconnected from connection {ConnectionId}", userId, Context.ConnectionId);
        }

        if (!string.IsNullOrEmpty(userRole))
        {
            await _realTimeService.LeaveRoleGroupAsync(Context.ConnectionId, userRole);
        }

        if (exception != null)
        {
            _logger.LogError(exception, "User {UserId} disconnected with error: {ErrorMessage}", userId, exception.Message);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Connection {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }

    public async Task SendMessageToGroup(string groupName, string message)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Clients.Group(groupName).SendAsync("ReceiveMessage", userId, message);
    }

    /// <summary>
    /// Client heartbeat method to keep connection alive
    /// </summary>
    public async Task Ping()
    {
        _connectionHeartbeats[Context.ConnectionId] = DateTime.UtcNow;
        await Clients.Caller.SendAsync("Pong", DateTime.UtcNow);
    }

    /// <summary>
    /// Get connection status and statistics
    /// </summary>
    public async Task GetConnectionStatus()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var connectionTime = _connectionHeartbeats.GetValueOrDefault(Context.ConnectionId, DateTime.UtcNow);
        var uptime = DateTime.UtcNow - connectionTime;

        await Clients.Caller.SendAsync("ConnectionStatus", new
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            ConnectedAt = connectionTime,
            Uptime = uptime.ToString(@"hh\:mm\:ss"),
            LastHeartbeat = _connectionHeartbeats.GetValueOrDefault(Context.ConnectionId)
        });
    }

    /// <summary>
    /// Force reconnection for troubleshooting
    /// </summary>
    public async Task ForceReconnect()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("Force reconnect requested by user {UserId} on connection {ConnectionId}", userId, Context.ConnectionId);
        
        await Clients.Caller.SendAsync("ForceReconnect", "Reconnection requested");
        Context.Abort();
    }

    /// <summary>
    /// Send real-time notification to specific user
    /// </summary>
    public async Task SendNotificationToUser(string targetUserId, string title, string message, string type = "info")
    {
        var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        await Clients.Group($"user_{targetUserId}").SendAsync("ReceiveNotification", new
        {
            Title = title,
            Message = message,
            Type = type,
            SenderId = senderId,
            Timestamp = DateTime.UtcNow
        });

        _logger.LogInformation("Notification sent from {SenderId} to {TargetUserId}: {Title}", senderId, targetUserId, title);
    }
}