using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingFeatureRepository : IRepository<LandingFeature>
{
    Task<IEnumerable<LandingFeature>> GetActiveFeaturesByOrderAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LandingFeature>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    Task<LandingFeature?> GetByTitleAsync(string title, CancellationToken cancellationToken = default);
}
