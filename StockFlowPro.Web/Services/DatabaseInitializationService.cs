using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Web.Services;

public class DatabaseInitializationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseInitializationService> _logger;

    public DatabaseInitializationService(IServiceProvider serviceProvider, ILogger<DatabaseInitializationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var seederLogger = scope.ServiceProvider.GetRequiredService<ILogger<DatabaseSeeder>>();
            var seeder = new DatabaseSeeder(context, seederLogger);
            
            _logger.LogInformation("Starting database initialization...");
            await seeder.SeedAsync();
            
            var mockDataService = scope.ServiceProvider.GetRequiredService<IMockDataStorageService>();
            await mockDataService.InitializeDefaultDataAsync();
            
            _logger.LogInformation("Database and mock data initialization completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize database and mock data");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}