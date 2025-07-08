using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.SubscriptionPlans;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.SubscriptionPlans;

public class GetSubscriptionPlanByIdHandler : IRequestHandler<GetSubscriptionPlanByIdQuery, SubscriptionPlanDto?>
{
    private readonly ISubscriptionPlanRepository _subscriptionPlanRepository;
    private readonly IMapper _mapper;

    public GetSubscriptionPlanByIdHandler(ISubscriptionPlanRepository subscriptionPlanRepository, IMapper mapper)
    {
        _subscriptionPlanRepository = subscriptionPlanRepository;
        _mapper = mapper;
    }

    public async Task<SubscriptionPlanDto?> Handle(GetSubscriptionPlanByIdQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var plan = await _subscriptionPlanRepository.GetByIdAsync(request.Id, cancellationToken);
        
        return plan != null ? _mapper.Map<SubscriptionPlanDto>(plan) : null;
    }
}