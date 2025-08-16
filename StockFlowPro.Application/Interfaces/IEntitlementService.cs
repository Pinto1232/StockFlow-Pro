using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IEntitlementService
{
        System.Threading.Tasks.Task<EntitlementsDto> GetEntitlementsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    void InvalidateEntitlementsForUser(Guid userId);
}
