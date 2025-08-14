using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class LandingFeatureRepository : ILandingFeatureRepository
{
    private readonly ApplicationDbContext _context;

    public LandingFeatureRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LandingFeature?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LandingFeatures.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<LandingFeature>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingFeatures.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(LandingFeature entity, CancellationToken cancellationToken = default)
    {
        await _context.LandingFeatures.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(LandingFeature entity, CancellationToken cancellationToken = default)
    {
        _context.LandingFeatures.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(LandingFeature entity, CancellationToken cancellationToken = default)
    {
        _context.LandingFeatures.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingFeature>> GetActiveFeaturesByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingFeatures
            .Where(f => f.IsActive)
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingFeature>> GetAllByOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingFeatures
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<LandingFeature?> GetByTitleAsync(string title, CancellationToken cancellationToken = default)
    {
        return await _context.LandingFeatures
            .FirstOrDefaultAsync(f => f.Title == title, cancellationToken);
    }
}
