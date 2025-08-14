using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingStatRepository : IRepository<LandingStat>
{
    Task<IEnumerable<LandingStat>> GetActiveStatsByOrderAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LandingStat>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    Task<LandingStat?> GetByLabelAsync(string label, CancellationToken cancellationToken = default);
}
