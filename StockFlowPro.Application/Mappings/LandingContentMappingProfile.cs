using AutoMapper;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class LandingContentMappingProfile : Profile
{
    public LandingContentMappingProfile()
    {
        CreateMap<LandingHero, LandingHeroDto>();
        CreateMap<LandingHeroDto, LandingHero>()
            .ConstructUsing(dto => new LandingHero(dto.Title, dto.Subtitle, dto.Description, 
                dto.PrimaryButtonText, dto.PrimaryButtonUrl, dto.SecondaryButtonText, dto.SecondaryButtonUrl));

        CreateMap<LandingFeature, LandingFeatureDto>();
        CreateMap<LandingFeatureDto, LandingFeature>()
            .ConstructUsing(dto => new LandingFeature(dto.Title, dto.Description, dto.IconName, dto.ColorClass, dto.SortOrder));

        CreateMap<LandingTestimonial, LandingTestimonialDto>();
        CreateMap<LandingTestimonialDto, LandingTestimonial>()
            .ConstructUsing(dto => new LandingTestimonial(dto.Name, dto.Role, dto.Company, dto.ImageUrl, dto.Quote, dto.SortOrder));

        CreateMap<LandingStat, LandingStatDto>();
        CreateMap<LandingStatDto, LandingStat>()
            .ConstructUsing(dto => new LandingStat(dto.Number, dto.Label, dto.IconName, dto.SortOrder));
    }
}
