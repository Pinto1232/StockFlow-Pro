using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a system notification that can be sent to users through various channels.
/// </summary>
public class Notification : IEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public NotificationType Type { get; private set; }
    public NotificationPriority Priority { get; private set; }
    public NotificationStatus Status { get; private set; }
    public NotificationChannel Channels { get; private set; }
    
    /// <summary>
    /// The user who will receive this notification
    /// </summary>
    public Guid? RecipientId { get; private set; }
    
    /// <summary>
    /// The user who triggered this notification (optional)
    /// </summary>
    public Guid? SenderId { get; private set; }
    
    /// <summary>
    /// Related entity ID (e.g., ProductId for stock alerts, InvoiceId for invoice notifications)
    /// </summary>
    public Guid? RelatedEntityId { get; private set; }
    
    /// <summary>
    /// Type of the related entity (e.g., "Product", "Invoice", "User")
    /// </summary>
    public string? RelatedEntityType { get; private set; }
    
    /// <summary>
    /// Additional metadata as JSON
    /// </summary>
    public string? Metadata { get; private set; }
    
    /// <summary>
    /// URL to navigate to when notification is clicked
    /// </summary>
    public string? ActionUrl { get; private set; }
    
    /// <summary>
    /// Template used to generate this notification
    /// </summary>
    public string? TemplateId { get; private set; }
    
    /// <summary>
    /// When the notification was created
    /// </summary>
    public DateTime CreatedAt { get; private set; }
    
    /// <summary>
    /// When the notification was sent
    /// </summary>
    public DateTime? SentAt { get; private set; }
    
    /// <summary>
    /// When the notification was delivered
    /// </summary>
    public DateTime? DeliveredAt { get; private set; }
    
    /// <summary>
    /// When the notification was read
    /// </summary>
    public DateTime? ReadAt { get; private set; }
    
    /// <summary>
    /// When the notification expires (optional)
    /// </summary>
    public DateTime? ExpiresAt { get; private set; }
    
    /// <summary>
    /// Number of delivery attempts
    /// </summary>
    public int DeliveryAttempts { get; private set; }
    
    /// <summary>
    /// Last error message if delivery failed
    /// </summary>
    public string? LastError { get; private set; }
    
    /// <summary>
    /// Whether this notification should be persisted in the database
    /// </summary>
    public bool IsPersistent { get; private set; }
    
    /// <summary>
    /// Whether this notification can be dismissed by the user
    /// </summary>
    public bool IsDismissible { get; private set; }

    // Navigation properties
    public virtual User? Recipient { get; private set; }
    public virtual User? Sender { get; private set; }

    private Notification() { }

    public Notification(
        string title,
        string message,
        NotificationType type,
        Guid? recipientId = null,
        Guid? senderId = null,
        NotificationPriority priority = NotificationPriority.Normal,
        NotificationChannel channels = NotificationChannel.InApp,
        bool isPersistent = true,
        bool isDismissible = true)
    {
        Id = Guid.NewGuid();
        Title = title;
        Message = message;
        Type = type;
        Priority = priority;
        Status = NotificationStatus.Pending;
        Channels = channels;
        RecipientId = recipientId;
        SenderId = senderId;
        CreatedAt = DateTime.UtcNow;
        IsPersistent = isPersistent;
        IsDismissible = isDismissible;
        DeliveryAttempts = 0;
    }

    public void SetRelatedEntity(Guid entityId, string entityType)
    {
        RelatedEntityId = entityId;
        RelatedEntityType = entityType;
    }

    public void SetMetadata(string metadata)
    {
        Metadata = metadata;
    }

    public void SetActionUrl(string actionUrl)
    {
        ActionUrl = actionUrl;
    }

    public void SetTemplate(string templateId)
    {
        TemplateId = templateId;
    }

    public void SetExpiration(DateTime expiresAt)
    {
        ExpiresAt = expiresAt;
    }

    public void MarkAsSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    public void MarkAsDelivered()
    {
        Status = NotificationStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void MarkAsRead()
    {
        Status = NotificationStatus.Read;
        ReadAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string error)
    {
        Status = NotificationStatus.Failed;
        LastError = error;
        DeliveryAttempts++;
    }

    public void MarkAsCancelled()
    {
        Status = NotificationStatus.Cancelled;
    }

    public void MarkAsExpired()
    {
        Status = NotificationStatus.Expired;
    }

    public void IncrementDeliveryAttempts()
    {
        DeliveryAttempts++;
    }

    public bool IsExpired()
    {
        return ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value;
    }

    public bool CanRetryDelivery()
    {
        return Status == NotificationStatus.Failed && DeliveryAttempts < 3 && !IsExpired();
    }

    public void UpdateContent(string title, string message)
    {
        Title = title;
        Message = message;
    }

    public void AddChannel(NotificationChannel channel)
    {
        Channels |= channel;
    }

    public void RemoveChannel(NotificationChannel channel)
    {
        Channels &= ~channel;
    }

    public bool HasChannel(NotificationChannel channel)
    {
        return (Channels & channel) == channel;
    }

    public void UpdateChannels(NotificationChannel channels)
    {
        Channels = channels;
    }
}