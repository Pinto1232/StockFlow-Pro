using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Defines the contract for product-specific repository operations.
/// </summary>
public interface IProductRepository : IRepository<Product>
{
    /// <summary>
    /// Retrieves a product by its name.
    /// </summary>
    /// <param name="name">The product name to search for.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>The product if found; otherwise, null.</returns>
    Task<Product?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Retrieves all active products from the repository.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of active products.</returns>
    Task<IEnumerable<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Retrieves products that are currently in stock.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of products with stock greater than zero.</returns>
    Task<IEnumerable<Product>> GetInStockProductsAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Retrieves products with low stock based on a threshold.
    /// </summary>
    /// <param name="threshold">The stock threshold to consider as low stock.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of products with stock at or below the threshold.</returns>
    Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Searches for products based on a search term matching the product name.
    /// </summary>
    /// <param name="searchTerm">The search term to filter products.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A collection of products matching the search criteria.</returns>
    Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Checks if a product name already exists in the system.
    /// </summary>
    /// <param name="name">The product name to check.</param>
    /// <param name="excludeProductId">Optional product ID to exclude from the check (useful for updates).</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>True if the product name exists; otherwise, false.</returns>
    Task<bool> ProductNameExistsAsync(string name, Guid? excludeProductId = null, CancellationToken cancellationToken = default);
}