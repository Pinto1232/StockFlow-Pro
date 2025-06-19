namespace StockFlowPro.Domain.Interfaces;

/// <summary>
/// Defines the contract for domain entities with a unique identifier.
/// </summary>
public interface IEntity
{
    /// <summary>
    /// Gets the unique identifier for the entity.
    /// </summary>
    Guid Id { get; }
}
