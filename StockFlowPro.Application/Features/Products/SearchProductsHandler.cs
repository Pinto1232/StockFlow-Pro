using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class SearchProductsHandler : IRequestHandler<SearchProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public SearchProductsHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(SearchProductsQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Executing database search query with term: '{request.SearchTerm}'");

        var products = await _productRepository.SearchProductsAsync(request.SearchTerm, cancellationToken);
        
        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Database search completed - Found {products.Count()} products matching '{request.SearchTerm}'");
        
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}