using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Repositories;

public interface ILandingTestimonialRepository : IRepository<LandingTestimonial>
{
    Task<IEnumerable<LandingTestimonial>> GetActiveTestimonialsByOrderAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LandingTestimonial>> GetAllByOrderAsync(CancellationToken cancellationToken = default);
    Task<LandingTestimonial?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
