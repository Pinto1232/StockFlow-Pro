using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Reports;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Reports;

public class GetOutOfStockReportHandler : IRequestHandler<GetOutOfStockReportQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetOutOfStockReportHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetOutOfStockReportQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine("[REPORTS - OUT OF STOCK] Generating out of stock report");

        var allProducts = await _productRepository.GetAllAsync(cancellationToken);
        var outOfStockProducts = allProducts.Where(p => !p.IsInStock()).ToList();

        Console.WriteLine($"[REPORTS - OUT OF STOCK] Found {outOfStockProducts.Count} products out of stock");

        return _mapper.Map<IEnumerable<ProductDto>>(outOfStockProducts);
    }
}