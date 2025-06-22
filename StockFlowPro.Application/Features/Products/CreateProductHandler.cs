using AutoMapper;
using MediatR;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Products;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public CreateProductHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        // Check if product name already exists
        if (await _productRepository.ProductNameExistsAsync(request.Name, cancellationToken: cancellationToken))
        {
            throw new InvalidOperationException($"A product with the name '{request.Name}' already exists.");
        }

        var product = new Product(request.Name, request.CostPerItem, request.NumberInStock);
        
        await _productRepository.AddAsync(product, cancellationToken);
        
        return _mapper.Map<ProductDto>(product);
    }
}