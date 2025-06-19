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
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var mockDataStorage = scope.ServiceProvider.GetRequiredService<IMockDataStorageService>();
                
                await mockDataStorage.GetUsersAsync();
                _logger.LogInformation("Mock data storage initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize mock data storage");
            }
        }, cancellationToken);
        
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
