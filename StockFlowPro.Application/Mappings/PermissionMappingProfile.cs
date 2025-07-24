using AutoMapper;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

/// <summary>
/// AutoMapper profile for Permission entity mappings.
/// </summary>
public class PermissionMappingProfile : Profile
{
    public PermissionMappingProfile()
    {
        // Permission entity to DTO mappings
        CreateMap<Permission, PermissionDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        // DTO to Permission entity mappings
        CreateMap<CreatePermissionDto, Permission>()
            .ConstructUsing(src => new Permission(src.Name, src.DisplayName, src.Description, src.Category));

        CreateMap<UpdatePermissionDto, Permission>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Name, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
    }
}