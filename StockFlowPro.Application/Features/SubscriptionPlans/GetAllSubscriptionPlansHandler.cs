using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.SubscriptionPlans;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.SubscriptionPlans;

public class GetAllSubscriptionPlansHandler : IRequestHandler<GetAllSubscriptionPlansQuery, IEnumerable<SubscriptionPlanDto>>
{
    private readonly ISubscriptionPlanRepository _subscriptionPlanRepository;
    private readonly IMapper _mapper;

    public GetAllSubscriptionPlansHandler(ISubscriptionPlanRepository subscriptionPlanRepository, IMapper mapper)
    {
        _subscriptionPlanRepository = subscriptionPlanRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> Handle(GetAllSubscriptionPlansQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var plans = request.PublicOnly 
            ? await _subscriptionPlanRepository.GetPublicAsync(cancellationToken)
            : request.ActiveOnly 
                ? await _subscriptionPlanRepository.GetActiveAsync(cancellationToken)
                : await _subscriptionPlanRepository.GetAllAsync(cancellationToken);

        return _mapper.Map<IEnumerable<SubscriptionPlanDto>>(plans);
    }
}