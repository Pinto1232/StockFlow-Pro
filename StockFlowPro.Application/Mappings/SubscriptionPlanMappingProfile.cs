using AutoMapper;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class SubscriptionPlanMappingProfile : Profile
{
    public SubscriptionPlanMappingProfile()
    {
        CreateMap<SubscriptionPlan, SubscriptionPlanDto>();
        CreateMap<SubscriptionPlanDto, SubscriptionPlan>();
    }
}