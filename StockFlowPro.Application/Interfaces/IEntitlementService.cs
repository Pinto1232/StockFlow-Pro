using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IEntitlementService
{
    Task<EntitlementsDto> GetEntitlementsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
