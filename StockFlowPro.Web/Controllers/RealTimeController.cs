using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.Services;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RealTimeController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IRealTimeService _realTimeService;
    private readonly ProductNotificationService _productNotificationService;
    private readonly IProductRepository _productRepository;
    private readonly ILogger<RealTimeController> _logger;

    public RealTimeController(
        INotificationService notificationService,
        IRealTimeService realTimeService,
        ProductNotificationService productNotificationService,
        IProductRepository productRepository,
        ILogger<RealTimeController> logger)
    {
        _notificationService = notificationService;
        _realTimeService = realTimeService;
        _productNotificationService = productNotificationService;
        _productRepository = productRepository;
        _logger = logger;
    }

    [HttpPost("test-notification")]
    public async Task<IActionResult> TestNotification([FromBody] TestNotificationRequest request)
    {
        try
        {
            await _notificationService.SendUserNotificationAsync(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "unknown",
                request.Message,
                request.Type ?? "info"
            );

            return Ok(new { success = true, message = "Notification sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test notification");
            return StatusCode(500, new { success = false, message = "Failed to send notification" });
        }
    }

    [HttpPost("broadcast-message")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> BroadcastMessage([FromBody] BroadcastMessageRequest request)
    {
        try
        {
            await _notificationService.SendToAllAsync("BroadcastMessage", new
            {
                Message = request.Message,
                Type = request.Type ?? "info",
                Sender = User.Identity?.Name ?? "System",
                Timestamp = DateTime.UtcNow
            });

            return Ok(new { success = true, message = "Message broadcasted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast message");
            return StatusCode(500, new { success = false, message = "Failed to broadcast message" });
        }
    }

    [HttpPost("update-stock/{productId:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateStock(Guid productId, [FromBody] UpdateStockRequest request)
    {
        try
        {
            await _productNotificationService.UpdateProductStockAsync(productId, request.NewQuantity);
            
            return Ok(new { 
                success = true, 
                message = $"Stock updated to {request.NewQuantity} and notifications sent" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update stock for product {ProductId}", productId);
            return StatusCode(500, new { success = false, message = "Failed to update stock" });
        }
    }

    [HttpPost("check-low-stock")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CheckLowStock([FromBody] CheckLowStockRequest? request = null)
    {
        try
        {
            var threshold = request?.Threshold ?? 10;
            await _productNotificationService.CheckLowStockProductsAsync(threshold);
            
            return Ok(new { 
                success = true, 
                message = $"Low stock check completed with threshold {threshold}" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check low stock");
            return StatusCode(500, new { success = false, message = "Failed to check low stock" });
        }
    }

    [HttpPost("send-dashboard-update")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendDashboardUpdate([FromBody] DashboardUpdateRequest request)
    {
        try
        {
            await _notificationService.SendDashboardUpdateAsync(request.Data);
            
            return Ok(new { success = true, message = "Dashboard update sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send dashboard update");
            return StatusCode(500, new { success = false, message = "Failed to send dashboard update" });
        }
    }

    [HttpGet("connection-status")]
    public IActionResult GetConnectionStatus()
    {
        return Ok(new
        {
            connected = true,
            userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            userName = User.Identity?.Name,
            role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
            timestamp = DateTime.UtcNow
        });
    }
}

// Request DTOs
public class TestNotificationRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Type { get; set; }
}

public class BroadcastMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Type { get; set; }
}

public class UpdateStockRequest
{
    public int NewQuantity { get; set; }
}

public class CheckLowStockRequest
{
    public int Threshold { get; set; } = 10;
}

public class DashboardUpdateRequest
{
    public Dictionary<string, object> Data { get; set; } = new();
}