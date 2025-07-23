using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Background service for processing notifications and maintenance tasks.
/// </summary>
public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationBackgroundService> _logger;
    private readonly TimeSpan _processingInterval = TimeSpan.FromMinutes(1); // Process every minute
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(24); // Cleanup daily
    private DateTime _lastCleanup = DateTime.MinValue;

    public NotificationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<NotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<IEnhancedNotificationService>();

                // Process pending notifications
                await ProcessPendingNotifications(notificationService, stoppingToken);

                // Retry failed notifications
                await RetryFailedNotifications(notificationService, stoppingToken);

                // Perform cleanup if needed
                await PerformCleanupIfNeeded(notificationService, stoppingToken);

                _logger.LogDebug("Notification processing cycle completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during notification processing");
            }

            // Wait for the next processing interval
            await Task.Delay(_processingInterval, stoppingToken);
        }

        _logger.LogInformation("Notification Background Service stopped");
    }

    private async Task ProcessPendingNotifications(IEnhancedNotificationService notificationService, CancellationToken cancellationToken)
    {
        try
        {
            await notificationService.ProcessPendingNotificationsAsync(cancellationToken);
            _logger.LogDebug("Processed pending notifications");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing pending notifications");
        }
    }

    private async Task RetryFailedNotifications(IEnhancedNotificationService notificationService, CancellationToken cancellationToken)
    {
        try
        {
            await notificationService.RetryFailedNotificationsAsync(cancellationToken);
            _logger.LogDebug("Retried failed notifications");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying failed notifications");
        }
    }

    private async Task PerformCleanupIfNeeded(IEnhancedNotificationService notificationService, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        if (now - _lastCleanup >= _cleanupInterval)
        {
            try
            {
                await notificationService.CleanupNotificationsAsync(cancellationToken);
                _lastCleanup = now;
                _logger.LogInformation("Notification cleanup completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification cleanup");
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Notification Background Service is stopping");
        await base.StopAsync(cancellationToken);
    }
}