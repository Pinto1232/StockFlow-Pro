using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Exceptions;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Features.Employees;

// Commands & Queries
public record CreateEmployeeCommand(CreateEmployeeDto Dto) : IRequest<EmployeeDto>;
public record UpdateEmployeeCommand(Guid Id, UpdateEmployeeDto Dto) : IRequest<EmployeeDto>;
public record DeleteEmployeeCommand(Guid Id) : IRequest<bool>;
public record GetEmployeeByIdQuery(Guid Id) : IRequest<EmployeeDto?>;
public record GetEmployeesQuery(bool ActiveOnly = false, Guid? DepartmentId = null, string? Search = null) : IRequest<IEnumerable<EmployeeDto>>;
public record AddEmployeeDocumentCommand(Guid EmployeeId, string FileName, DocumentType Type, string StoragePath, long SizeBytes, string ContentType, DateTime? IssuedAt = null, DateTime? ExpiresAt = null) : IRequest<EmployeeDocumentDto>;
public record UpdateEmployeeImageCommand(Guid Id, string? ImageUrl) : IRequest<EmployeeDto>;
public record ArchiveEmployeeDocumentCommand(Guid EmployeeId, Guid DocumentId, string Reason) : IRequest<bool>;
public record DeleteEmployeeDocumentCommand(Guid EmployeeId, Guid DocumentId) : IRequest<bool>;
public record StartOnboardingCommand(Guid EmployeeId) : IRequest<EmployeeDto>;
public record CompleteOnboardingTaskCommand(Guid EmployeeId, string Code) : IRequest<EmployeeDto>;
public record InitiateOffboardingCommand(Guid EmployeeId, string Reason) : IRequest<EmployeeDto>;
public record CompleteOffboardingTaskCommand(Guid EmployeeId, string Code) : IRequest<EmployeeDto>;

// Handlers
public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public CreateEmployeeHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        if (await _repo.EmailExistsAsync(dto.Email, null, cancellationToken))
            {throw new DomainException("An employee with this email already exists.");}

        var entity = new Employee(
            dto.FirstName,
            dto.LastName,
            dto.Email,
            dto.PhoneNumber,
            dto.JobTitle,
            dto.DepartmentId,
            dto.DepartmentName,
            dto.ManagerId,
            dto.HireDate);
        if (dto.DateOfBirth.HasValue)
        {
            entity.UpdatePersonalInfo(entity.FirstName, entity.LastName, entity.PhoneNumber, dto.DateOfBirth);
        }

        await _repo.AddAsync(entity, cancellationToken);
        return _mapper.Map<EmployeeDto>(entity);
    }
}

public class UpdateEmployeeHandler : IRequestHandler<UpdateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public UpdateEmployeeHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetByIdAsync(request.Id, cancellationToken) ?? throw new KeyNotFoundException();
        var d = request.Dto;
        entity.UpdatePersonalInfo(d.FirstName ?? entity.FirstName, d.LastName ?? entity.LastName, d.PhoneNumber ?? entity.PhoneNumber, d.DateOfBirth ?? entity.DateOfBirth);
        if (!string.IsNullOrWhiteSpace(d.JobTitle) || d.DepartmentId.HasValue || d.ManagerId.HasValue || d.DepartmentName != null)
        {
            entity.UpdateJobDetails(d.JobTitle ?? entity.JobTitle, d.DepartmentId ?? entity.DepartmentId, d.DepartmentName ?? entity.DepartmentName, d.ManagerId ?? entity.ManagerId);
        }
        await _repo.UpdateAsync(entity, cancellationToken);
        return _mapper.Map<EmployeeDto>(entity);
    }
}

public class UpdateEmployeeImageHandler : IRequestHandler<UpdateEmployeeImageCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public UpdateEmployeeImageHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(UpdateEmployeeImageCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.Id, cancellationToken) ?? throw new KeyNotFoundException();
        e.UpdateImage(request.ImageUrl);
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDto>(e);
    }
}

public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeCommand, bool>
{
    private readonly IEmployeeRepository _repo;

    public DeleteEmployeeHandler(IEmployeeRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) {return false;}
        await _repo.DeleteAsync(entity, cancellationToken);
        return true;
    }
}

public class GetEmployeeByIdHandler : IRequestHandler<GetEmployeeByIdQuery, EmployeeDto?>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public GetEmployeeByIdHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto?> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetByIdAsync(request.Id, cancellationToken);
        return entity == null ? null : _mapper.Map<EmployeeDto>(entity);
    }
}

public class GetEmployeesHandler : IRequestHandler<GetEmployeesQuery, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public GetEmployeesHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Employee> result;
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            result = await _repo.SearchAsync(request.Search!, cancellationToken);
        }
        else if (request.DepartmentId.HasValue)
        {
            result = await _repo.GetByDepartmentAsync(request.DepartmentId.Value, cancellationToken);
        }
        else
        {
            result = await _repo.GetAllAsync(cancellationToken);
        }

        if (request.ActiveOnly)
        {
            result = result.Where(e => e.IsActive);
        }
        return result.Select(_mapper.Map<EmployeeDto>);
    }
}

public class AddEmployeeDocumentHandler : IRequestHandler<AddEmployeeDocumentCommand, EmployeeDocumentDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public AddEmployeeDocumentHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDocumentDto> Handle(AddEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken) ?? throw new KeyNotFoundException();
        var doc = e.AddDocument(request.FileName, request.Type, request.StoragePath, request.SizeBytes, request.ContentType, request.IssuedAt, request.ExpiresAt);
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDocumentDto>(doc);
    }
}

public class ArchiveEmployeeDocumentHandler : IRequestHandler<ArchiveEmployeeDocumentCommand, bool>
{
    private readonly IEmployeeRepository _repo;

    public ArchiveEmployeeDocumentHandler(IEmployeeRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(ArchiveEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (e == null) {return false;}
        e.ArchiveDocument(request.DocumentId, request.Reason);
        await _repo.UpdateAsync(e, cancellationToken);
        return true;
    }
}

public class DeleteEmployeeDocumentHandler : IRequestHandler<DeleteEmployeeDocumentCommand, bool>
{
    private readonly IEmployeeRepository _repo;

    public DeleteEmployeeDocumentHandler(IEmployeeRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteEmployeeDocumentCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (e == null) {return false;}
        e.DeleteDocument(request.DocumentId);
        await _repo.UpdateAsync(e, cancellationToken);
        return true;
    }
}

public class StartOnboardingHandler : IRequestHandler<StartOnboardingCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public StartOnboardingHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(StartOnboardingCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken) ?? throw new KeyNotFoundException();
        e.StartOnboarding();
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDto>(e);
    }
}

public class CompleteOnboardingTaskHandler : IRequestHandler<CompleteOnboardingTaskCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public CompleteOnboardingTaskHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(CompleteOnboardingTaskCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken) ?? throw new KeyNotFoundException();
        e.CompleteOnboardingTask(request.Code);
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDto>(e);
    }
}

public class InitiateOffboardingHandler : IRequestHandler<InitiateOffboardingCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public InitiateOffboardingHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(InitiateOffboardingCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken) ?? throw new KeyNotFoundException();
        e.InitiateOffboarding(request.Reason);
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDto>(e);
    }
}

public class CompleteOffboardingTaskHandler : IRequestHandler<CompleteOffboardingTaskCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public CompleteOffboardingTaskHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(CompleteOffboardingTaskCommand request, CancellationToken cancellationToken)
    {
        var e = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken) ?? throw new KeyNotFoundException();
        e.CompleteOffboardingTask(request.Code);
        await _repo.UpdateAsync(e, cancellationToken);
        return _mapper.Map<EmployeeDto>(e);
    }
}
