# Enhanced Notification System

## Overview

The Enhanced Notification System provides a comprehensive, scalable solution for managing notifications in the StockFlow Pro application. It supports multiple delivery channels, user preferences, templates, and real-time delivery through SignalR.

## Architecture

### Core Components

1. **Domain Entities**
   - `Notification`: Core notification entity with delivery tracking
   - `NotificationTemplate`: Reusable templates for consistent messaging
   - `NotificationPreference`: User-specific notification settings

2. **Enums**
   - `NotificationType`: Categories of notifications (Info, Warning, Error, etc.)
   - `NotificationStatus`: Delivery status tracking (Pending, Sent, Delivered, Read, Failed)
   - `NotificationPriority`: Priority levels (Low, Normal, High, Critical, Emergency)
   - `NotificationChannel`: Delivery channels (InApp, Email, SMS, Push, Browser, Webhook)

3. **Services**
   - `IEnhancedNotificationService`: Main service for sending and managing notifications
   - `INotificationTemplateService`: Template management
   - `INotificationPreferenceService`: User preference management

## Key Features

### 1. Multiple Delivery Channels
- **In-App**: Real-time notifications via SignalR
- **Email**: Email notifications (extensible)
- **SMS**: SMS notifications (extensible)
- **Push**: Mobile push notifications (extensible)
- **Browser**: Browser notifications (extensible)
- **Webhook**: External system integration (extensible)

### 2. Priority-Based Delivery
- **Emergency**: Bypasses all user preferences and quiet hours
- **Critical**: High priority, minimal filtering
- **High**: Important notifications
- **Normal**: Standard notifications
- **Low**: Can be batched or delayed

### 3. User Preferences
- Channel-specific settings per notification type
- Quiet hours configuration
- Minimum priority filtering
- Notification batching
- Complete enable/disable control

### 4. Template System
- Reusable notification templates
- Parameter substitution
- Default settings per template
- Template validation and preview

### 5. Delivery Tracking
- Status tracking throughout delivery lifecycle
- Retry mechanism for failed deliveries
- Delivery attempt counting
- Error logging

## Usage Examples

### Basic Direct Notification

```csharp
// Send a simple notification
var notification = await _enhancedNotificationService.SendDirectAsync(
    title: "Stock Alert",
    message: "Product XYZ is running low on stock",
    type: NotificationType.StockAlert,
    recipientId: userId,
    priority: NotificationPriority.High,
    channels: NotificationChannel.InApp | NotificationChannel.Email
);
```

### Template-Based Notification

```csharp
// Create a template first
await _templateService.CreateTemplateAsync(
    name: "LowStockAlert",
    description: "Alert for low stock levels",
    titleTemplate: "Low Stock Alert: {ProductName}",
    messageTemplate: "Product {ProductName} has only {CurrentStock} units remaining. Minimum required: {MinimumStock}",
    type: NotificationType.StockAlert,
    createdBy: adminUserId
);

// Send using template
var parameters = new Dictionary<string, object>
{
    ["ProductName"] = "Widget ABC",
    ["CurrentStock"] = 5,
    ["MinimumStock"] = 10
};

var notification = await _enhancedNotificationService.SendFromTemplateAsync(
    templateName: "LowStockAlert",
    parameters: parameters,
    recipientId: managerId
);
```

### Bulk Notifications

```csharp
// Send to multiple users
var userIds = new[] { user1Id, user2Id, user3Id };
var notifications = await _enhancedNotificationService.SendBulkDirectAsync(
    title: "System Maintenance",
    message: "Scheduled maintenance will begin at 2 AM UTC",
    type: NotificationType.System,
    recipientIds: userIds,
    priority: NotificationPriority.High
);
```

### Role-Based Notifications

```csharp
// Send to all admins and managers
var roles = new[] { UserRole.Admin, UserRole.Manager };
var notifications = await _enhancedNotificationService.SendToRolesAsync(
    title: "Critical System Alert",
    message: "Database connection issues detected",
    type: NotificationType.System,
    roles: roles,
    priority: NotificationPriority.Critical
);
```

### Emergency Notifications

```csharp
// Emergency notification bypasses all user preferences
var notifications = await _enhancedNotificationService.SendEmergencyNotificationAsync(
    title: "URGENT: Security Breach Detected",
    message: "Immediate action required. Please check your systems."
);
```

## User Preference Management

### Setting User Preferences

```csharp
// Enable email notifications for stock alerts
await _preferenceService.UpdatePreferenceAsync(
    userId: userId,
    type: NotificationType.StockAlert,
    enabledChannels: NotificationChannel.InApp | NotificationChannel.Email,
    isEnabled: true,
    minimumPriority: NotificationPriority.Normal
);

// Set quiet hours (10 PM to 6 AM)
await _preferenceService.SetQuietHoursAsync(
    userId: userId,
    startTime: new TimeSpan(22, 0, 0), // 10 PM
    endTime: new TimeSpan(6, 0, 0)     // 6 AM
);
```

### Default Preferences

When a new user is created, default preferences are automatically set:

```csharp
await _preferenceService.CreateDefaultPreferencesAsync(newUserId);
```

## Template Management

### Creating Templates

```csharp
var template = await _templateService.CreateTemplateAsync(
    name: "InvoiceGenerated",
    description: "Notification when an invoice is generated",
    titleTemplate: "Invoice #{InvoiceNumber} Generated",
    messageTemplate: "Invoice #{InvoiceNumber} for {CustomerName} has been generated. Amount: ${Amount}",
    type: NotificationType.Invoice,
    createdBy: adminUserId,
    defaultPriority: NotificationPriority.Normal,
    defaultChannels: NotificationChannel.InApp | NotificationChannel.Email
);
```

### Template Preview

```csharp
var parameters = new Dictionary<string, object>
{
    ["InvoiceNumber"] = "INV-001",
    ["CustomerName"] = "John Doe",
    ["Amount"] = "1,250.00"
};

var (title, message) = await _templateService.PreviewTemplateAsync(
    titleTemplate: "Invoice #{InvoiceNumber} Generated",
    messageTemplate: "Invoice #{InvoiceNumber} for {CustomerName} has been generated. Amount: ${Amount}",
    parameters: parameters
);
```

## Real-Time Integration

The system integrates with the existing SignalR infrastructure:

### Client-Side JavaScript

```javascript
// Listen for notifications
connection.on("UserNotification", function (data) {
    showNotification(data.Message, data.Type);
});

// Listen for specific notification types
connection.on("StockLevelAlert", function (data) {
    showStockAlert(data.ProductName, data.CurrentStock);
});

connection.on("InvoiceStatusUpdate", function (data) {
    updateInvoiceStatus(data.InvoiceId, data.Status);
});
```

## Background Processing

### Scheduled Tasks

The system includes background processing for:

1. **Pending Notification Processing**
   ```csharp
   await _enhancedNotificationService.ProcessPendingNotificationsAsync();
   ```

2. **Failed Notification Retry**
   ```csharp
   await _enhancedNotificationService.RetryFailedNotificationsAsync();
   ```

3. **Cleanup Old Notifications**
   ```csharp
   await _enhancedNotificationService.CleanupNotificationsAsync();
   ```

## Database Schema

### Notifications Table
- Id (Guid, Primary Key)
- Title (string)
- Message (string)
- Type (NotificationType enum)
- Priority (NotificationPriority enum)
- Status (NotificationStatus enum)
- Channels (NotificationChannel flags)
- RecipientId (Guid, nullable)
- SenderId (Guid, nullable)
- RelatedEntityId (Guid, nullable)
- RelatedEntityType (string, nullable)
- Metadata (JSON string, nullable)
- ActionUrl (string, nullable)
- TemplateId (string, nullable)
- CreatedAt (DateTime)
- SentAt (DateTime, nullable)
- DeliveredAt (DateTime, nullable)
- ReadAt (DateTime, nullable)
- ExpiresAt (DateTime, nullable)
- DeliveryAttempts (int)
- LastError (string, nullable)
- IsPersistent (bool)
- IsDismissible (bool)

### NotificationTemplates Table
- Id (Guid, Primary Key)
- Name (string, unique)
- Description (string)
- TitleTemplate (string)
- MessageTemplate (string)
- Type (NotificationType enum)
- DefaultPriority (NotificationPriority enum)
- DefaultChannels (NotificationChannel flags)
- IsActive (bool)
- IsPersistent (bool)
- IsDismissible (bool)
- DefaultActionUrl (string, nullable)
- ExpirationHours (int, nullable)
- CreatedAt (DateTime)
- UpdatedAt (DateTime, nullable)
- CreatedBy (Guid)

### NotificationPreferences Table
- Id (Guid, Primary Key)
- UserId (Guid)
- NotificationType (NotificationType enum)
- EnabledChannels (NotificationChannel flags)
- IsEnabled (bool)
- MinimumPriority (NotificationPriority enum)
- QuietHoursStart (TimeSpan, nullable)
- QuietHoursEnd (TimeSpan, nullable)
- RespectQuietHours (bool)
- BatchingIntervalMinutes (int, nullable)
- CreatedAt (DateTime)
- UpdatedAt (DateTime, nullable)

## Configuration

### Dependency Injection Setup

```csharp
// In Program.cs or Startup.cs
services.AddScoped<IEnhancedNotificationService, EnhancedNotificationService>();
services.AddScoped<INotificationTemplateService, NotificationTemplateService>();
services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();
services.AddScoped<INotificationRepository, NotificationRepository>();
services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
```

### Background Service Registration

```csharp
services.AddHostedService<NotificationBackgroundService>();
```

## Best Practices

### 1. Use Templates for Consistency
- Create templates for recurring notification types
- Use parameter substitution for dynamic content
- Maintain template versioning for changes

### 2. Respect User Preferences
- Always check user preferences before sending
- Provide granular control over notification types
- Honor quiet hours except for emergencies

### 3. Handle Failures Gracefully
- Implement retry logic for failed deliveries
- Log errors for debugging
- Provide fallback delivery methods

### 4. Performance Considerations
- Use bulk operations for multiple recipients
- Implement batching for low-priority notifications
- Clean up old notifications regularly

### 5. Security
- Validate notification content
- Sanitize user inputs in templates
- Implement proper authorization for template management

## Monitoring and Analytics

### Key Metrics to Track
- Notification delivery rates by channel
- User engagement (read rates)
- Failed delivery reasons
- Template usage statistics
- User preference trends

### Logging
The system provides comprehensive logging at different levels:
- Debug: Detailed delivery tracking
- Information: Successful operations
- Warning: Preference-blocked notifications
- Error: Delivery failures and exceptions

## Future Enhancements

### Planned Features
1. **Advanced Batching**: Smart batching based on user behavior
2. **A/B Testing**: Template effectiveness testing
3. **Rich Content**: HTML email templates, rich media support
4. **Delivery Scheduling**: Time-based delivery scheduling
5. **Analytics Dashboard**: Real-time notification metrics
6. **External Integrations**: Slack, Microsoft Teams, etc.
7. **Mobile App Integration**: Native push notifications
8. **Internationalization**: Multi-language template support

## Troubleshooting

### Common Issues

1. **Notifications Not Delivered**
   - Check user preferences
   - Verify template exists and is active
   - Check SignalR connection status
   - Review error logs

2. **Template Errors**
   - Validate template syntax
   - Ensure all parameters are provided
   - Check template activation status

3. **Performance Issues**
   - Monitor bulk notification sizes
   - Check database query performance
   - Review background processing logs

### Debug Commands

```csharp
// Check notification status
var notification = await _notificationRepository.GetByIdAsync(notificationId);
Console.WriteLine($"Status: {notification.Status}, Attempts: {notification.DeliveryAttempts}");

// Get user preferences
var preferences = await _preferenceService.GetUserPreferencesAsync(userId);
foreach (var pref in preferences)
{
    Console.WriteLine($"{pref.NotificationType}: {pref.IsEnabled} ({pref.EnabledChannels})");
}

// Test template
var preview = await _templateService.PreviewTemplateAsync(titleTemplate, messageTemplate, parameters);
Console.WriteLine($"Title: {preview.title}\nMessage: {preview.message}");
```

This enhanced notification system provides a robust foundation for all notification needs in the StockFlow Pro application, with room for future expansion and customization.