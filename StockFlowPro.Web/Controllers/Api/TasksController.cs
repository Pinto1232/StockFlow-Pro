using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Features.Tasks;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Shared.Models;

namespace StockFlowPro.Web.Controllers.Api;

[Route("api/[controller]")]
public class TasksController : ApiBaseController
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationErrorResponse<TaskDto>();
        }

        try
        {
            var cmd = new CreateTaskCommand(request.Task, request.Description, request.DueDate, request.Priority, request.Progress, request.AssigneeIds ?? new List<Guid>(), request.EmployeeId);
            var created = await _mediator.Send(cmd);
            var resp = new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "Task created",
                Timestamp = DateTime.UtcNow,
                Data = created
            };
            return CreatedAtAction(nameof(GetById), new { id = created.GuidId }, resp);
        }
        catch (KeyNotFoundException knf)
        {
            return NotFoundResponse<TaskDto>(knf.Message);
        }
        catch (Exception ex)
        {
            return HandleException<TaskDto>(ex, "Failed to create task");
        }
    }

    [HttpPost("{parentId:guid}/subtasks")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateSubtask(Guid parentId, [FromBody] CreateSubtaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationErrorResponse<TaskDto>();
        }

        try
        {
            var cmd = new CreateSubtaskCommand(parentId, request.Task, request.Description, request.DueDate, request.Priority, request.Progress, request.AssigneeIds ?? new List<Guid>());
            var created = await _mediator.Send(cmd);
            // Use the GUID identifier when generating the location for the created resource
            var resp = new ApiResponse<TaskDto>
            {
                Success = true,
                Message = "Subtask created",
                Timestamp = DateTime.UtcNow,
                Data = created
            };
            return CreatedAtAction(nameof(GetById), new { id = created.GuidId }, resp);
        }
        catch (KeyNotFoundException knf)
        {
            return NotFoundResponse<TaskDto>(knf.Message);
        }
        catch (Exception ex)
        {
            return HandleException<TaskDto>(ex, "Failed to create subtask");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetById(Guid id)
    {
        var dto = await _mediator.Send(new GetTaskByIdQuery(id));
        return dto == null ? NotFoundResponse<TaskDto>() : SuccessResponse(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationErrorResponse<TaskDto>();
        }

        try
        {
            var cmd = new UpdateTaskCommand(id, request.Task, request.Description, request.DueDate, request.Priority, request.Progress, request.AssigneeIds ?? new List<Guid>());
            var updated = await _mediator.Send(cmd);
            return updated == null ? NotFoundResponse<TaskDto>() : SuccessResponse(updated);
        }
        catch (Exception ex)
        {
            return HandleException<TaskDto>(ex, "Failed to update task");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _mediator.Send(new DeleteTaskCommand(id));
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("by-task-id/{taskId:int}")]
    public async Task<IActionResult> DeleteByTaskId(int taskId)
    {
        var ok = await _mediator.Send(new DeleteTaskByTaskIdCommand(taskId));
        return ok ? NoContent() : NotFound();
    }
}
