using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

public class ProductNotificationService
{
    private readonly IProductRepository _productRepository;
    private readonly INotificationService _notificationService;
    private readonly IRealTimeService _realTimeService;
    private readonly ILogger<ProductNotificationService> _logger;

    public ProductNotificationService(
        IProductRepository productRepository,
        INotificationService notificationService,
        IRealTimeService realTimeService,
        ILogger<ProductNotificationService> logger)
    {
        _productRepository = productRepository;
        _notificationService = notificationService;
        _realTimeService = realTimeService;
        _logger = logger;
    }

    public async Task UpdateProductStockAsync(Guid productId, int newQuantity, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(productId, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("Product with ID {ProductId} not found", productId);
            return;
        }

        var oldQuantity = product.NumberInStock;
        product.UpdateStock(newQuantity);

        await _productRepository.UpdateAsync(product, cancellationToken);

        // Broadcast real-time stock update
        await _realTimeService.BroadcastStockUpdateAsync(Convert.ToInt32(productId.ToString().GetHashCode()), newQuantity);

        // Check for low stock alerts
        await CheckAndSendStockAlerts(product);

        _logger.LogInformation("Product {ProductName} stock updated from {OldQuantity} to {NewQuantity}", 
            product.Name, oldQuantity, newQuantity);
    }

    public async Task CheckLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default)
    {
        var lowStockProducts = await _productRepository.GetLowStockProductsAsync(threshold, cancellationToken);
        
        foreach (var product in lowStockProducts)
        {
            await CheckAndSendStockAlerts(product);
        }

        _logger.LogInformation("Checked {ProductCount} products for low stock alerts", lowStockProducts.Count());
    }

    private async Task CheckAndSendStockAlerts(Product product)
    {
        const int criticalThreshold = 0;
        const int lowThreshold = 10;

        if (product.NumberInStock <= criticalThreshold)
        {
            await _notificationService.SendStockLevelAlertAsync(product, product.NumberInStock, lowThreshold);
            _logger.LogWarning("Critical stock alert sent for product {ProductName}: {CurrentStock} units remaining", 
                product.Name, product.NumberInStock);
        }
        else if (product.NumberInStock <= lowThreshold)
        {
            await _notificationService.SendStockLevelAlertAsync(product, product.NumberInStock, lowThreshold);
            _logger.LogInformation("Low stock alert sent for product {ProductName}: {CurrentStock} units remaining", 
                product.Name, product.NumberInStock);
        }
    }

    public async Task NotifyProductCreatedAsync(Product product)
    {
        await _notificationService.SendToGroupAsync("Admin", "ProductCreated", new
        {
            ProductId = product.Id,
            ProductName = product.Name,
            InitialStock = product.NumberInStock,
            Timestamp = DateTime.UtcNow
        });

        _logger.LogInformation("Product creation notification sent for {ProductName}", product.Name);
    }

    public async Task NotifyProductUpdatedAsync(Product product)
    {
        await _notificationService.SendToGroupAsync("Admin", "ProductUpdated", new
        {
            ProductId = product.Id,
            ProductName = product.Name,
            CurrentStock = product.NumberInStock,
            Timestamp = DateTime.UtcNow
        });

        _logger.LogInformation("Product update notification sent for {ProductName}", product.Name);
    }

    public async Task NotifyProductDeletedAsync(Product product)
    {
        await _notificationService.SendToGroupAsync("Admin", "ProductDeleted", new
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Timestamp = DateTime.UtcNow
        });

        _logger.LogInformation("Product deletion notification sent for {ProductName}", product.Name);
    }
}