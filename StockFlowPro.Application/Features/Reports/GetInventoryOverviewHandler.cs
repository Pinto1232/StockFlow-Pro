using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetInventoryOverviewHandler : IRequestHandler<GetInventoryOverviewQuery, InventoryOverviewDto>
{
    private readonly IProductRepository _productRepository;

    public GetInventoryOverviewHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<InventoryOverviewDto> Handle(GetInventoryOverviewQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - INVENTORY OVERVIEW] Generating inventory overview report");

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var totalProducts = allProducts.Count();
        var activeProducts = allProducts.Count(p => p.IsActive);
        var inactiveProducts = totalProducts - activeProducts;
        var inStockProducts = allProducts.Count(p => p.IsActive && p.IsInStock());
        var outOfStockProducts = allProducts.Count(p => !p.IsActive || !p.IsInStock());
        var lowStockProducts = allProducts.Count(p => p.IsActive && p.IsInStock() && p.IsLowStock());
        var totalInventoryValue = allProducts.Sum(p => p.GetTotalValue());
        var averageProductValue = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

        Console.WriteLine($"[REPORTS - INVENTORY OVERVIEW] Report generated - Total Products: {totalProducts}, Total Value: {totalInventoryValue:C}");

        return new InventoryOverviewDto
        {
            TotalProducts = totalProducts,
            ActiveProducts = activeProducts,
            InactiveProducts = inactiveProducts,
            InStockProducts = inStockProducts,
            OutOfStockProducts = outOfStockProducts,
            LowStockProducts = lowStockProducts,
            TotalInventoryValue = totalInventoryValue,
            AverageProductValue = averageProductValue
        };
    }
}