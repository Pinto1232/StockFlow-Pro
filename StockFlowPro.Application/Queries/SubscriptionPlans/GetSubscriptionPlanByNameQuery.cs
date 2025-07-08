using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.SubscriptionPlans;

public class GetSubscriptionPlanByNameQuery : IRequest<SubscriptionPlanDto?>
{
    public string Name { get; set; } = string.Empty;
}