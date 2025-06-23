using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Products;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetProductByIdHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Executing database query to get product by ID: {request.Id}");

        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (product == null)
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Product with ID {request.Id} not found in database");
        }
        else
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Product found in database: {product.Name} (ID: {product.Id})");
        }
        
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }
}