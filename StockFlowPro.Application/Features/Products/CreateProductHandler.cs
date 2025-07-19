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

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Checking if product name exists in database: '{request.Name}'");

        // Check if product name already exists
        if (await _productRepository.ProductNameExistsAsync(request.Name, cancellationToken: cancellationToken))
        {
            Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Product name '{request.Name}' already exists in database");
            throw new InvalidOperationException($"A product with the name '{request.Name}' already exists.");
        }

        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Creating new product in database: '{request.Name}' - Cost: {request.CostPerItem}, Stock: {request.NumberInStock}");

        var product = new Product(request.Name, request.CostPerItem, request.NumberInStock);
        
        if (!string.IsNullOrEmpty(request.ImageUrl))
        {
            product.UpdateImage(request.ImageUrl);
        }
        
        await _productRepository.AddAsync(product, cancellationToken);
        
        Console.WriteLine($"[PRODUCT MANAGEMENT - DATABASE] Successfully created product in database: '{product.Name}' (ID: {product.Id})");
        
        return _mapper.Map<ProductDto>(product);
    }
}