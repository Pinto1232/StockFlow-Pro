using MediatR;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Queries.SubscriptionPlans;

public class GetSubscriptionPlanByIdQuery : IRequest<SubscriptionPlanDto?>
{
    public Guid Id { get; set; }
}