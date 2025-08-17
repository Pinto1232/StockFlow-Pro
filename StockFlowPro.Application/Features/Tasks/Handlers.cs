using AutoMapper;
using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Repositories;
using System.Text.Json;

namespace StockFlowPro.Application.Features.Tasks;

public record CreateTaskCommand(string Task, string Description, string DueDate, string Priority, int Progress, List<Guid> AssigneeIds, Guid EmployeeId) : IRequest<TaskDto>;
public record CreateSubtaskCommand(Guid ParentTaskId, string Task, string Description, string DueDate, string Priority, int Progress, List<Guid> AssigneeIds) : IRequest<TaskDto>;
public record DeleteTaskCommand(Guid Id) : IRequest<bool>;
public record DeleteTaskByTaskIdCommand(int TaskId) : IRequest<bool>;
public record GetTaskByIdQuery(Guid Id) : IRequest<TaskDto?>;

public class CreateTaskHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public CreateTaskHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        // Find the employee who will own this task
        var employee = await _repo.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            throw new KeyNotFoundException("Employee not found");
        }

        // Determine next TaskId (UI compatibility)
        var allEmployees = await _repo.GetAllAsync(cancellationToken);
        var allTaskIds = allEmployees.SelectMany(e => e.Tasks).Select(t => t.TaskId).DefaultIfEmpty(0);
        var nextTaskId = allTaskIds.Max() + 1;

        // Parse priority
        TaskPriority priorityEnum;
        try
        {
            priorityEnum = Enum.Parse<TaskPriority>(request.Priority, ignoreCase: true);
        }
        catch
        {
            priorityEnum = TaskPriority.Normal;
        }

        var task = new ProjectTask(nextTaskId, employee.Id, request.Task, request.Description, request.DueDate, priorityEnum, request.Progress, type: "parent", parentTaskId: null);

        // Build assignee JSON from provided ids
        var assigneeObjs = new List<object>();
        foreach (var aid in request.AssigneeIds)
        {
            var emp = await _repo.GetByIdAsync(aid, cancellationToken);
            if (emp != null)
            {
                assigneeObjs.Add(new {
                    Initials = GetInitials(emp.GetFullName()),
                    Color = GetColorForGuid(emp.Id)
                });
            }
        }

        task.SetAssignees(JsonSerializer.Serialize(assigneeObjs));

        // Add task to employee
        employee.AddTask(task);

        await _repo.UpdateAsync(employee, cancellationToken);

        return _mapper.Map<TaskDto>(task);
    }

    private static string GetInitials(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return string.Empty;
        }

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1)
        {
            return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpperInvariant();
        }

        return (parts[0][0].ToString() + parts[^1][0].ToString()).ToUpperInvariant();
    }

    private static string GetColorForGuid(Guid id)
    {
        // Deterministic pick from a small palette
        var palette = new[] { "bg-sky-500", "bg-purple-500", "bg-rose-500", "bg-emerald-500", "bg-indigo-500", "bg-yellow-500" };
        var index = Math.Abs(id.GetHashCode()) % palette.Length;
        return palette[index];
    }
}

public class CreateSubtaskHandler : IRequestHandler<CreateSubtaskCommand, TaskDto>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public CreateSubtaskHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<TaskDto> Handle(CreateSubtaskCommand request, CancellationToken cancellationToken)
    {
        // Find the employee who owns the parent task
        var allEmployees = await _repo.GetAllAsync(cancellationToken);
        var parentEmployee = allEmployees.FirstOrDefault(e => e.Tasks.Any(t => t.Id == request.ParentTaskId));
        if (parentEmployee == null)
        {
            throw new KeyNotFoundException("Parent task not found");
        }

        var parentTask = parentEmployee.Tasks.First(t => t.Id == request.ParentTaskId);

        // Determine next TaskId (UI compatibility)
        var allTaskIds = allEmployees.SelectMany(e => e.Tasks).Select(t => t.TaskId).DefaultIfEmpty(0);
        var nextTaskId = allTaskIds.Max() + 1;

        // Parse priority
        TaskPriority priorityEnum;
        try
        {
            priorityEnum = Enum.Parse<TaskPriority>(request.Priority, ignoreCase: true);
        }
        catch
        {
            priorityEnum = TaskPriority.Normal;
        }

        var subtask = new ProjectTask(nextTaskId, parentEmployee.Id, request.Task, request.Description, request.DueDate, priorityEnum, request.Progress, type: null, parentTaskId: parentTask.Id);

        // Build assignee JSON from provided ids
        var assigneeObjs = new List<object>();
        foreach (var aid in request.AssigneeIds)
        {
            var emp = await _repo.GetByIdAsync(aid, cancellationToken);
            if (emp != null)
            {
                assigneeObjs.Add(new {
                    Initials = GetInitials(emp.GetFullName()),
                    Color = GetColorForGuid(emp.Id)
                });
            }
        }

        subtask.SetAssignees(JsonSerializer.Serialize(assigneeObjs));

        // Attach subtask to aggregate
        parentTask.AddSubtask(subtask);
        parentEmployee.AddTask(subtask);

        await _repo.UpdateAsync(parentEmployee, cancellationToken);

        return _mapper.Map<TaskDto>(subtask);
    }

    private static string GetInitials(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return string.Empty;
        }

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1)
        {
            return parts[0].Substring(0, Math.Min(2, parts[0].Length)).ToUpperInvariant();
        }

        return (parts[0][0].ToString() + parts[^1][0].ToString()).ToUpperInvariant();
    }

    private static string GetColorForGuid(Guid id)
    {
        // Deterministic pick from a small palette
        var palette = new[] { "bg-sky-500", "bg-purple-500", "bg-rose-500", "bg-emerald-500", "bg-indigo-500", "bg-yellow-500" };
        var index = Math.Abs(id.GetHashCode()) % palette.Length;
        return palette[index];
    }
}

public class DeleteTaskHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly IEmployeeRepository _repo;

    public DeleteTaskHandler(IEmployeeRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        var owner = all.FirstOrDefault(e => e.Tasks.Any(t => t.Id == request.Id));
        if (owner == null)
        {
            return false;
        }

        var task = owner.Tasks.First(t => t.Id == request.Id);

        // If parent, delete children first
        if (task.ParentTaskId == null)
        {
            var childIds = task.Subtasks.Select(s => s.Id).ToList();
            foreach (var cid in childIds)
            {
                owner.RemoveTask(cid);
            }
        }

        owner.RemoveTask(request.Id);
        await _repo.UpdateAsync(owner, cancellationToken);
        return true;
    }
}

public class DeleteTaskByTaskIdHandler : IRequestHandler<DeleteTaskByTaskIdCommand, bool>
{
    private readonly IEmployeeRepository _repo;

    public DeleteTaskByTaskIdHandler(IEmployeeRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteTaskByTaskIdCommand request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        var owner = all.FirstOrDefault(e => e.Tasks.Any(t => t.TaskId == request.TaskId));
        if (owner == null)
        {
            return false;
        }

        var task = owner.Tasks.First(t => t.TaskId == request.TaskId);

        // If parent, delete children first
        if (task.ParentTaskId == null)
        {
            var childIds = task.Subtasks.Select(s => s.Id).ToList();
            foreach (var cid in childIds)
            {
                owner.RemoveTask(cid);
            }
        }

        owner.RemoveTask(task.Id); // Use the Guid Id for removal
        await _repo.UpdateAsync(owner, cancellationToken);
        return true;
    }
}

public class GetTaskByIdHandler : IRequestHandler<GetTaskByIdQuery, TaskDto?>
{
    private readonly IEmployeeRepository _repo;
    private readonly IMapper _mapper;

    public GetTaskByIdHandler(IEmployeeRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<TaskDto?> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        var owner = all.FirstOrDefault(e => e.Tasks.Any(t => t.Id == request.Id));
        if (owner == null)
        {
            return null;
        }

        var task = owner.Tasks.First(t => t.Id == request.Id);
        return _mapper.Map<TaskDto>(task);
    }
}
