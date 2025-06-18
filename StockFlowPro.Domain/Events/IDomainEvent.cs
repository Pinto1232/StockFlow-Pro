namespace StockFlowPro.Domain.Events;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
