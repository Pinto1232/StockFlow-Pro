namespace StockFlowPro.Web.Services;

public class DataInitializationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataInitializationService> _logger;

    public DataInitializationService(IServiceProvider serviceProvider, ILogger<DataInitializationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Run initialization in background to not block startup
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var mockDataStorage = scope.ServiceProvider.GetRequiredService<IMockDataStorageService>();
                
                // This will initialize default data if the file doesn't exist
                await mockDataStorage.GetUsersAsync();
                _logger.LogInformation("Mock data storage initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize mock data storage");
            }
        }, cancellationToken);
        
        // Return immediately to not block startup
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}