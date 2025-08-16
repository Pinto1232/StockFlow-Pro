using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Departments;

// Queries
public record GetDepartmentsQuery(bool ActiveOnly = false) : IRequest<IEnumerable<DepartmentDto>>;
public record GetDepartmentByIdQuery(Guid Id) : IRequest<DepartmentDto?>;

// Commands
public record CreateDepartmentCommand(CreateDepartmentDto Dto) : IRequest<DepartmentDto>;
public record UpdateDepartmentCommand(Guid Id, UpdateDepartmentDto Dto) : IRequest<DepartmentDto?>;
public record DeleteDepartmentCommand(Guid Id) : IRequest<bool>;

public class DepartmentHandlers :
    IRequestHandler<GetDepartmentsQuery, IEnumerable<DepartmentDto>>,
    IRequestHandler<GetDepartmentByIdQuery, DepartmentDto?>,
    IRequestHandler<CreateDepartmentCommand, DepartmentDto>,
    IRequestHandler<UpdateDepartmentCommand, DepartmentDto?>,
    IRequestHandler<DeleteDepartmentCommand, bool>
{
    private readonly IDepartmentRepository _repo;

    public DepartmentHandlers(IDepartmentRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<DepartmentDto>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        var filtered = request.ActiveOnly ? all.Where(d => d.IsActive) : all;
        return filtered.Select(Map);
    }

    public async Task<DepartmentDto?> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var dep = await _repo.GetByIdAsync(request.Id, cancellationToken);
        return dep is null ? null : Map(dep);
    }

    public async Task<DepartmentDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
    var name = (request.Dto.Name ?? string.Empty).Trim();
    var existing = await _repo.GetByNameAsync(name, cancellationToken);
        if (existing != null)
        {
            // idempotent - return existing
            return Map(existing);
        }
    var entity = new Department(name);
        await _repo.AddAsync(entity, cancellationToken);
        return Map(entity);
    }

    public async Task<DepartmentDto?> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var newName = (request.Dto.Name ?? string.Empty).Trim();
        if (!string.IsNullOrWhiteSpace(newName) && !string.Equals(entity.Name, newName, StringComparison.Ordinal))
        {
            entity.Rename(newName);
        }
        if (request.Dto.IsActive.HasValue)
        {
            if (request.Dto.IsActive.Value)
            {
                entity.Activate();
            }
            else
            {
                entity.Deactivate();
            }
        }
        await _repo.UpdateAsync(entity, cancellationToken);
        return Map(entity);
    }

    public async Task<bool> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (entity is null)
        {
            return false;
        }
        await _repo.DeleteAsync(entity, cancellationToken);
        return true;
    }

    private static DepartmentDto Map(Department d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        IsActive = d.IsActive
    };
}
