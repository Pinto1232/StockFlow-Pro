using MediatR;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetProductPerformanceHandler : IRequestHandler<GetProductPerformanceQuery, IEnumerable<ProductPerformanceDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IInvoiceRepository _invoiceRepository;

    public GetProductPerformanceHandler(IProductRepository productRepository, IInvoiceRepository invoiceRepository)
    {
        _productRepository = productRepository;
        _invoiceRepository = invoiceRepository;
    }

    public async Task<IEnumerable<ProductPerformanceDto>> Handle(GetProductPerformanceQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - PRODUCT PERFORMANCE] Generating product performance report");

        var startDate = request.StartDate ?? DateTime.UtcNow.AddMonths(-12);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate, cancellationToken);
        var activeInvoices = invoices.Where(i => i.IsActive).ToList();

        var productPerformance = new List<ProductPerformanceDto>();

        foreach (var product in products)
        {
            var productItems = activeInvoices
                .SelectMany(i => i.Items)
                .Where(item => item.ProductId == product.Id)
                .ToList();

            var totalQuantitySold = productItems.Sum(item => item.Quantity);
            var totalRevenue = productItems.Sum(item => item.GetLineTotal());
            var timesOrdered = productItems.Count;
            var averageOrderQuantity = timesOrdered > 0 ? (decimal)totalQuantitySold / timesOrdered : 0;

            productPerformance.Add(new ProductPerformanceDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                TotalQuantitySold = totalQuantitySold,
                TotalRevenue = totalRevenue,
                TimesOrdered = timesOrdered,
                AverageOrderQuantity = averageOrderQuantity,
                CurrentStock = product.NumberInStock,
                CurrentValue = product.GetTotalValue()
            });
        }

        // Apply sorting
        var sortBy = request.SortBy?.ToLower() ?? "totalrevenue";
        productPerformance = sortBy switch
        {
            "totalquantitysold" => productPerformance.OrderByDescending(p => p.TotalQuantitySold).ToList(),
            "totalrevenue" => productPerformance.OrderByDescending(p => p.TotalRevenue).ToList(),
            "timesordered" => productPerformance.OrderByDescending(p => p.TimesOrdered).ToList(),
            "currentvalue" => productPerformance.OrderByDescending(p => p.CurrentValue).ToList(),
            _ => productPerformance.OrderByDescending(p => p.TotalRevenue).ToList()
        };

        // Apply limit if specified
        if (request.TopCount.HasValue && request.TopCount.Value > 0)
        {
            productPerformance = productPerformance.Take(request.TopCount.Value).ToList();
        }

        Console.WriteLine($"[REPORTS - PRODUCT PERFORMANCE] Report generated for {productPerformance.Count} products");

        return productPerformance;
    }
}