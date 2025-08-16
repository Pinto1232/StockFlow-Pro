using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingFeatureRepository : IRepository<LandingFeature>
{
    System.Threading.Tasks.Task<IEnumerable<LandingFeature>> GetActiveFeaturesByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<LandingFeature>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<LandingFeature?> GetByTitleAsync(string title, CancellationToken cancellationToken = default);
}
