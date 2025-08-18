using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using Microsoft.Extensions.Logging;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EmployeeRepository> _logger;

    public EmployeeRepository(ApplicationDbContext context, ILogger<EmployeeRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        await _context.Set<Employee>().AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Set<Employee>().Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Set<Employee>().Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await _context.Set<Employee>().FirstOrDefaultAsync(e => e.Email == normalized, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetByDepartmentAsync(Guid departmentId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .Where(e => e.DepartmentId == departmentId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Employee>> SearchAsync(string search, CancellationToken cancellationToken = default)
    {
        search = (search ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(search))
        {
            return await GetAllAsync(cancellationToken);
        }

        return await _context.Set<Employee>()
            .Include(e => e.Tasks)
            .Where(e => (e.FirstName ?? string.Empty).ToLower().Contains(search) ||
                        (e.LastName ?? string.Empty).ToLower().Contains(search) ||
                        (e.Email ?? string.Empty).ToLower().Contains(search) ||
                        (e.JobTitle ?? string.Empty).ToLower().Contains(search) ||
                        ((e.DepartmentName ?? string.Empty).ToLower().Contains(search)))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var query = _context.Set<Employee>().Where(e => e.Email == normalized);
        if (excludeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    // Adds a ProjectTask directly to the Tasks DbSet and saves changes. This avoids calling Update on the Employee aggregate
    // which can produce full-aggregate UPDATE statements that sometimes lead to optimistic concurrency exceptions.
    public async Task AddTaskAsync(ProjectTask task, CancellationToken cancellationToken = default)
    {
        // Use the Tasks DbSet if available on the context; otherwise fall back to adding to the set for ProjectTask
        var set = _context.Set<ProjectTask>();
        await set.AddAsync(task, cancellationToken);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            try
            {
                // Log the full exception and EF change tracker state to help diagnose concurrency issues
                _logger?.LogError(ex, "AddTaskAsync failed for ProjectTask Id={TaskIdGuid} TaskId={TaskId} ParentTaskId={ParentTaskId} EmployeeId={EmployeeId}. ChangeTracker entries: {EntriesCount}",
                    task.Id, task.TaskId, task.ParentTaskId, task.EmployeeId, _context.ChangeTracker.Entries().Count());

                foreach (var entry in _context.ChangeTracker.Entries())
                {
                    try
                    {
                        var pk = entry.Metadata?.FindPrimaryKey();
                        var pkCount = pk?.Properties?.Count ?? 0;
                        _logger?.LogError("Entry Entity={EntityType} State={State} PrimaryKeyPropCount={PkCount}", entry.Entity?.GetType().FullName, entry.State, pkCount);
                    }
                    catch { /* swallow per-entry logging errors */ }
                }
            }
            catch { /* swallow logging errors to avoid masking original exception */ }

            // rethrow to preserve original behavior and allow upper layers to wrap/return proper API errors
            throw;
        }
    }
}
