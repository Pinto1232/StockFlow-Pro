using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Features.Tasks;
using StockFlowPro.Application.DTOs;

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
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskRequest request)
    {
        var cmd = new CreateTaskCommand(request.Task, request.Description, request.DueDate, request.Priority, request.Progress, request.AssigneeIds ?? new List<Guid>(), request.EmployeeId);
        var created = await _mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id = created.GuidId }, created);
    }

    [HttpPost("{parentId:guid}/subtasks")]
    public async Task<ActionResult<TaskDto>> CreateSubtask(Guid parentId, [FromBody] CreateSubtaskRequest request)
    {
        var cmd = new CreateSubtaskCommand(parentId, request.Task, request.Description, request.DueDate, request.Priority, request.Progress, request.AssigneeIds ?? new List<Guid>());
        var created = await _mediator.Send(cmd);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> GetById(Guid id)
    {
        var dto = await _mediator.Send(new GetTaskByIdQuery(id));
        return dto == null ? NotFound() : Ok(dto);
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
