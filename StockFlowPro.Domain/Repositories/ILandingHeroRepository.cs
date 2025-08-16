using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingHeroRepository : IRepository<LandingHero>
{
    Task<LandingHero?> GetActiveHeroAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LandingHero>> GetAllActiveAsync(CancellationToken cancellationToken = default);
}
