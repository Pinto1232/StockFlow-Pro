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

        var products = request switch
        {
            { LowStockOnly: true } => await _productRepository.GetLowStockProductsAsync(request.LowStockThreshold, cancellationToken),
            { InStockOnly: true } => await _productRepository.GetInStockProductsAsync(cancellationToken),
            { ActiveOnly: true } => await _productRepository.GetActiveProductsAsync(cancellationToken),
            _ => await _productRepository.GetAllAsync(cancellationToken)
        };

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}