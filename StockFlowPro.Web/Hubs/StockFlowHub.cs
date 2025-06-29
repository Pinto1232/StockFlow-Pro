using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using StockFlowPro.Application.Interfaces;
using System.Security.Claims;

namespace StockFlowPro.Web.Hubs;

[Authorize]
public class StockFlowHub : Hub
{
    private readonly IRealTimeService _realTimeService;
    private readonly ILogger<StockFlowHub> _logger;

    public StockFlowHub(IRealTimeService realTimeService, ILogger<StockFlowHub> logger)
    {
        _realTimeService = realTimeService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

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

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

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
            _logger.LogError(exception, "User {UserId} disconnected with error", userId);
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
}