using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers;

/// <summary>
/// Controller for managing notifications and user preferences.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IEnhancedNotificationService _notificationService;
    private readonly INotificationPreferenceService _preferenceService;
    private readonly INotificationTemplateService _templateService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        IEnhancedNotificationService notificationService,
        INotificationPreferenceService preferenceService,
        INotificationTemplateService templateService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _preferenceService = preferenceService;
        _templateService = templateService;
        _logger = logger;
    }

    #region User Notifications

    /// <summary>
    /// Gets notifications for the current user.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] NotificationStatus? status = null,
        [FromQuery] NotificationType? type = null)
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationService.GetUserNotificationsAsync(
            userId, page, pageSize, status, type);

        var notificationDtos = notifications.Select(MapToDto);
        return Ok(notificationDtos);
    }

    /// <summary>
    /// Gets the count of unread notifications for the current user.
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(count);
    }

    /// <summary>
    /// Gets notification statistics for the current user.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<NotificationStatsDto>> GetNotificationStats([FromQuery] DateTime? fromDate = null)
    {
        var userId = GetCurrentUserId();
        var stats = await _notificationService.GetNotificationStatsAsync(userId, fromDate);
        
        var statsDto = new NotificationStatsDto
        {
            NotificationsByType = stats,
            // Additional stats would be calculated here
        };

        return Ok(statsDto);
    }

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Marks multiple notifications as read.
    /// </summary>
    [HttpPut("mark-read")]
    public async Task<IActionResult> MarkMultipleAsRead([FromBody] IEnumerable<Guid> notificationIds)
    {
        await _notificationService.MarkAsReadAsync(notificationIds);
        return NoContent();
    }

    /// <summary>
    /// Marks all notifications as read for the current user.
    /// </summary>
    [HttpPut("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAllAsReadAsync(userId);
        return NoContent();
    }

    #endregion

    #region User Preferences

    /// <summary>
    /// Gets notification preferences for the current user.
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<IEnumerable<NotificationPreferenceDto>>> GetPreferences()
    {
        var userId = GetCurrentUserId();
        var preferences = await _preferenceService.GetUserPreferencesAsync(userId);
        var preferenceDtos = preferences.Select(MapPreferenceToDto);
        return Ok(preferenceDtos);
    }

    /// <summary>
    /// Updates notification preferences for the current user.
    /// </summary>
    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] IEnumerable<UpdateNotificationPreferenceDto> preferences)
    {
        var userId = GetCurrentUserId();

        foreach (var preference in preferences)
        {
            await _preferenceService.UpdatePreferenceAsync(
                userId,
                preference.NotificationType,
                preference.EnabledChannels,
                preference.IsEnabled,
                preference.MinimumPriority);
        }

        return NoContent();
    }

    /// <summary>
    /// Sets quiet hours for the current user.
    /// </summary>
    [HttpPut("preferences/quiet-hours")]
    public async Task<IActionResult> SetQuietHours([FromBody] QuietHoursDto quietHours)
    {
        var userId = GetCurrentUserId();
        await _preferenceService.SetQuietHoursAsync(userId, quietHours.StartTime, quietHours.EndTime);
        return NoContent();
    }

    /// <summary>
    /// Disables quiet hours for the current user.
    /// </summary>
    [HttpDelete("preferences/quiet-hours")]
    public async Task<IActionResult> DisableQuietHours()
    {
        var userId = GetCurrentUserId();
        await _preferenceService.DisableQuietHoursAsync(userId);
        return NoContent();
    }

    /// <summary>
    /// Resets preferences to default values.
    /// </summary>
    [HttpPost("preferences/reset")]
    public async Task<IActionResult> ResetPreferences()
    {
        var userId = GetCurrentUserId();
        await _preferenceService.ResetToDefaultsAsync(userId);
        return NoContent();
    }

    #endregion

    #region Admin Operations

    /// <summary>
    /// Sends a direct notification (Admin only).
    /// </summary>
    [HttpPost("send")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<NotificationDto>> SendNotification([FromBody] CreateNotificationDto notificationDto)
    {
        var senderId = GetCurrentUserId();
        var notification = await _notificationService.SendDirectAsync(
            notificationDto.Title,
            notificationDto.Message,
            notificationDto.Type,
            notificationDto.RecipientId,
            senderId,
            notificationDto.Priority,
            notificationDto.Channels,
            notificationDto.IsPersistent);

        return Ok(MapToDto(notification));
    }

    /// <summary>
    /// Sends a bulk notification (Admin only).
    /// </summary>
    [HttpPost("send-bulk")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> SendBulkNotification([FromBody] BulkNotificationDto notificationDto)
    {
        var senderId = GetCurrentUserId();
        var notifications = await _notificationService.SendBulkDirectAsync(
            notificationDto.Title,
            notificationDto.Message,
            notificationDto.Type,
            notificationDto.RecipientIds,
            senderId,
            notificationDto.Priority,
            notificationDto.Channels,
            notificationDto.IsPersistent);

        var notificationDtos = notifications.Select(MapToDto);
        return Ok(notificationDtos);
    }

    /// <summary>
    /// Sends a role-based notification (Admin only).
    /// </summary>
    [HttpPost("send-to-roles")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> SendToRoles([FromBody] RoleNotificationDto notificationDto)
    {
        var senderId = GetCurrentUserId();
        var notifications = await _notificationService.SendToRolesAsync(
            notificationDto.Title,
            notificationDto.Message,
            notificationDto.Type,
            notificationDto.Roles,
            senderId,
            notificationDto.Priority,
            notificationDto.Channels);

        var notificationDtos = notifications.Select(MapToDto);
        return Ok(notificationDtos);
    }

    /// <summary>
    /// Sends a system-wide notification (Admin only).
    /// </summary>
    [HttpPost("send-system")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> SendSystemNotification([FromBody] SystemNotificationDto notificationDto)
    {
        var notifications = await _notificationService.SendSystemNotificationAsync(
            notificationDto.Title,
            notificationDto.Message,
            notificationDto.Priority,
            notificationDto.Channels);

        var notificationDtos = notifications.Select(MapToDto);
        return Ok(notificationDtos);
    }

    /// <summary>
    /// Sends an emergency notification (Admin only).
    /// </summary>
    [HttpPost("send-emergency")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> SendEmergencyNotification([FromBody] EmergencyNotificationDto notificationDto)
    {
        var notifications = await _notificationService.SendEmergencyNotificationAsync(
            notificationDto.Title,
            notificationDto.Message,
            notificationDto.SpecificUsers);

        var notificationDtos = notifications.Select(MapToDto);
        return Ok(notificationDtos);
    }

    /// <summary>
    /// Sends a template-based notification (Admin only).
    /// </summary>
    [HttpPost("send-template")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<NotificationDto>> SendFromTemplate([FromBody] CreateTemplateNotificationDto notificationDto)
    {
        var senderId = GetCurrentUserId();
        var notification = await _notificationService.SendFromTemplateAsync(
            notificationDto.TemplateName,
            notificationDto.Parameters,
            notificationDto.RecipientId,
            senderId,
            notificationDto.Priority,
            notificationDto.Channels);

        return Ok(MapToDto(notification));
    }

    /// <summary>
    /// Retries failed notifications (Admin only).
    /// </summary>
    [HttpPost("retry-failed")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RetryFailedNotifications()
    {
        await _notificationService.RetryFailedNotificationsAsync();
        return NoContent();
    }

    #endregion

    #region Template Management

    /// <summary>
    /// Gets all notification templates (Admin only).
    /// </summary>
    [HttpGet("templates")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<NotificationTemplateDto>>> GetTemplates()
    {
        var templates = await _templateService.GetActiveTemplatesAsync();
        var templateDtos = templates.Select(MapTemplateToDto);
        return Ok(templateDtos);
    }

    /// <summary>
    /// Creates a new notification template (Admin only).
    /// </summary>
    [HttpPost("templates")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NotificationTemplateDto>> CreateTemplate([FromBody] CreateNotificationTemplateDto templateDto)
    {
        var createdBy = GetCurrentUserId();
        var template = await _templateService.CreateTemplateAsync(
            templateDto.Name,
            templateDto.Description,
            templateDto.TitleTemplate,
            templateDto.MessageTemplate,
            templateDto.Type,
            createdBy,
            templateDto.DefaultPriority,
            templateDto.DefaultChannels,
            templateDto.IsPersistent,
            templateDto.IsDismissible);

        return Ok(MapTemplateToDto(template));
    }

    /// <summary>
    /// Previews a notification template.
    /// </summary>
    [HttpPost("templates/preview")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<TemplatePreviewResultDto>> PreviewTemplate([FromBody] TemplatePreviewDto previewDto)
    {
        try
        {
            var (title, message) = await _templateService.PreviewTemplateAsync(
                previewDto.TitleTemplate,
                previewDto.MessageTemplate,
                previewDto.Parameters);

            return Ok(new TemplatePreviewResultDto
            {
                Title = title,
                Message = message,
                IsValid = true
            });
        }
        catch (Exception ex)
        {
            return Ok(new TemplatePreviewResultDto
            {
                IsValid = false,
                Errors = new[] { ex.Message }
            });
        }
    }

    #endregion

    #region Helper Methods

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in claims.");
        }
        return userId;
    }

    private static NotificationDto MapToDto(Domain.Entities.Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            Priority = notification.Priority,
            Status = notification.Status,
            Channels = notification.Channels,
            RecipientId = notification.RecipientId,
            SenderId = notification.SenderId,
            RelatedEntityId = notification.RelatedEntityId,
            RelatedEntityType = notification.RelatedEntityType,
            ActionUrl = notification.ActionUrl,
            TemplateId = notification.TemplateId,
            CreatedAt = notification.CreatedAt,
            SentAt = notification.SentAt,
            DeliveredAt = notification.DeliveredAt,
            ReadAt = notification.ReadAt,
            ExpiresAt = notification.ExpiresAt,
            DeliveryAttempts = notification.DeliveryAttempts,
            LastError = notification.LastError,
            IsPersistent = notification.IsPersistent,
            IsDismissible = notification.IsDismissible,
            IsExpired = notification.IsExpired(),
            CanRetry = notification.CanRetryDelivery()
        };
    }

    private static NotificationPreferenceDto MapPreferenceToDto(Domain.Entities.NotificationPreference preference)
    {
        return new NotificationPreferenceDto
        {
            Id = preference.Id,
            UserId = preference.UserId,
            NotificationType = preference.NotificationType,
            NotificationTypeName = preference.NotificationType.ToString(),
            EnabledChannels = preference.EnabledChannels,
            EnabledChannelNames = GetChannelNames(preference.EnabledChannels),
            IsEnabled = preference.IsEnabled,
            MinimumPriority = preference.MinimumPriority,
            MinimumPriorityName = preference.MinimumPriority.ToString(),
            QuietHoursStart = preference.QuietHoursStart,
            QuietHoursEnd = preference.QuietHoursEnd,
            RespectQuietHours = preference.RespectQuietHours,
            BatchingIntervalMinutes = preference.BatchingIntervalMinutes,
            CreatedAt = preference.CreatedAt,
            UpdatedAt = preference.UpdatedAt
        };
    }

    private static NotificationTemplateDto MapTemplateToDto(Domain.Entities.NotificationTemplate template)
    {
        return new NotificationTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            TitleTemplate = template.TitleTemplate,
            MessageTemplate = template.MessageTemplate,
            Type = template.Type,
            DefaultPriority = template.DefaultPriority,
            DefaultChannels = template.DefaultChannels,
            IsActive = template.IsActive,
            IsPersistent = template.IsPersistent,
            IsDismissible = template.IsDismissible,
            DefaultActionUrl = template.DefaultActionUrl,
            ExpirationHours = template.ExpirationHours,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
            CreatedBy = template.CreatedBy
        };
    }

    private static IEnumerable<string> GetChannelNames(NotificationChannel channels)
    {
        var names = new List<string>();
        foreach (NotificationChannel channel in Enum.GetValues<NotificationChannel>())
        {
            if (channel != NotificationChannel.None && channel != NotificationChannel.All && 
                (channels & channel) == channel)
            {
                names.Add(channel.ToString());
            }
        }
        return names;
    }

    #endregion
}

#region DTOs for Controller

public class QuietHoursDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

public class SystemNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public NotificationChannel Channels { get; set; } = NotificationChannel.InApp;
}

public class EmergencyNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public IEnumerable<Guid>? SpecificUsers { get; set; }
}

#endregion