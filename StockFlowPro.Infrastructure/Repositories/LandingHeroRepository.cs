using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class LandingHeroRepository : ILandingHeroRepository
{
    private readonly ApplicationDbContext _context;

    public LandingHeroRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LandingHero?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LandingHeroes.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<LandingHero>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingHeroes.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(LandingHero entity, CancellationToken cancellationToken = default)
    {
        await _context.LandingHeroes.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(LandingHero entity, CancellationToken cancellationToken = default)
    {
        _context.LandingHeroes.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(LandingHero entity, CancellationToken cancellationToken = default)
    {
        _context.LandingHeroes.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<LandingHero?> GetActiveHeroAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingHeroes
            .Where(h => h.IsActive)
            .OrderBy(h => h.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<LandingHero>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.LandingHeroes
            .Where(h => h.IsActive)
            .OrderBy(h => h.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
