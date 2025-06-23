using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetAllProductsHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Executing database query - ActiveOnly: {request.ActiveOnly}, InStockOnly: {request.InStockOnly}, LowStockOnly: {request.LowStockOnly}, LowStockThreshold: {request.LowStockThreshold}");

        var products = request switch
        {
            { LowStockOnly: true } => await _productRepository.GetLowStockProductsAsync(request.LowStockThreshold, cancellationToken),
            { InStockOnly: true } => await _productRepository.GetInStockProductsAsync(cancellationToken),
            { ActiveOnly: true } => await _productRepository.GetActiveProductsAsync(cancellationToken),
            _ => await _productRepository.GetAllAsync(cancellationToken)
        };

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Database query completed - Retrieved {products.Count()} products from database");

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}