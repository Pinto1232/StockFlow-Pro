using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.DTOs;

public record DepartmentDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public record CreateDepartmentDto
{
    public string Name { get; init; } = string.Empty;
}

public record UpdateDepartmentDto
{
    public string Name { get; init; } = string.Empty;
    public bool? IsActive { get; init; }
}
