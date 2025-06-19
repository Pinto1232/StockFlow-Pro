namespace StockFlowPro.Domain.Events;

/// <summary>
/// Defines the contract for domain events in the StockFlow Pro system.
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// Gets the date and time when the domain event occurred.
    /// </summary>
    DateTime OccurredOn { get; }
}
