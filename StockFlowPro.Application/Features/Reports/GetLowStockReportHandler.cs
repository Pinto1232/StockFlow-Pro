using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetLowStockReportHandler : IRequestHandler<GetLowStockReportQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetLowStockReportHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetLowStockReportQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[REPORTS - LOW STOCK] Generating low stock report with threshold: {request.Threshold}");

        var lowStockProducts = await _productRepository.GetLowStockProductsAsync(request.Threshold, cancellationToken);

        Console.WriteLine($"[REPORTS - LOW STOCK] Found {lowStockProducts.Count()} products with low stock");

        return _mapper.Map<IEnumerable<ProductDto>>(lowStockProducts);
    }
}