using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingHeroRepository : IRepository<LandingHero>
{
    System.Threading.Tasks.Task<LandingHero?> GetActiveHeroAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<LandingHero>> GetAllActiveAsync(CancellationToken cancellationToken = default);
}
