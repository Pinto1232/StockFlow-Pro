using AutoMapper;
using StockFlowPro.Application.Commands.Products;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.TotalValue, opt => opt.MapFrom(src => src.GetTotalValue()))
            .ForMember(dest => dest.IsInStock, opt => opt.MapFrom(src => src.IsInStock()))
            .ForMember(dest => dest.IsLowStock, opt => opt.MapFrom(src => src.IsLowStock(10)));

        CreateMap<CreateProductCommand, Product>()
            .ConstructUsing(src => new Product(src.Name, src.CostPerItem, src.NumberInStock));
        
        CreateMap<CreateProductDto, CreateProductCommand>();
        
        CreateMap<UpdateProductDto, UpdateProductCommand>();
        
        CreateMap<UpdateProductStockDto, UpdateProductStockCommand>();
    }
}