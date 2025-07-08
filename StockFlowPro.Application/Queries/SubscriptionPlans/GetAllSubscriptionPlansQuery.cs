using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.SubscriptionPlans;

public class GetAllSubscriptionPlansQuery : IRequest<IEnumerable<SubscriptionPlanDto>>
{
    public bool ActiveOnly { get; set; } = false;
    public bool PublicOnly { get; set; } = false;
}