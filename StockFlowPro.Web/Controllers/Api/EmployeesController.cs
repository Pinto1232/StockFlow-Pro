using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Features.Employees;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Attributes;

namespace StockFlowPro.Web.Controllers.Api;

[Route("api/[controller]")]
[ApiDocumentation("Employee Management", "Manage employees, documents, and lifecycle workflows", Category = "Employee Management")]
public class EmployeesController : ApiBaseController
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;

    public EmployeesController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    [HttpGet]
    [Permission(Permissions.Users.ViewAll)]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees([FromQuery] bool activeOnly = false, [FromQuery] Guid? departmentId = null, [FromQuery] string? search = null)
    {
        var items = await _mediator.Send(new GetEmployeesQuery(activeOnly, departmentId, search));
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [Permission(Permissions.Users.ViewAll)]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id)
    {
        var item = await _mediator.Send(new GetEmployeeByIdQuery(id));
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Permission(Permissions.Users.Create)]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeDto dto)
    {
        var item = await _mediator.Send(new CreateEmployeeCommand(dto));
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, [FromBody] UpdateEmployeeDto dto)
    {
        var item = await _mediator.Send(new UpdateEmployeeCommand(id, dto));
        return Ok(item);
    }

    [HttpDelete("{id:guid}")]
    [Permission(Permissions.Users.Delete)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _mediator.Send(new DeleteEmployeeCommand(id));
        return ok ? NoContent() : NotFound();
    }

    // Image upload
    [HttpPost("{id:guid}/image")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB
    [Consumes("multipart/form-data")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult> UploadImage(Guid id, [FromForm] UploadEmployeeImageRequest request)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "employees");
        Directory.CreateDirectory(uploadsDir);

        var safeFileName = $"{id}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Path.GetFileName(request.File.FileName)}";
        var filePath = Path.Combine(uploadsDir, safeFileName);
        await using (var stream = System.IO.File.Create(filePath))
        {
            await request.File.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/employees/{safeFileName}";

        // Persist image URL via dedicated command
        var item = await _mediator.Send(new UpdateEmployeeImageCommand(id, relativeUrl));
        return Ok(new { imageUrl = item.ImageUrl });
    }

    // Documents
    [HttpPost("{id:guid}/documents")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDocumentDto>> AddDocument(Guid id, [FromBody] AddEmployeeDocumentRequest request)
    {
        var doc = await _mediator.Send(new AddEmployeeDocumentCommand(id, request.FileName, request.Type, request.StoragePath, request.SizeBytes, request.ContentType, request.IssuedAt, request.ExpiresAt));
        return Ok(doc);
    }

    [HttpPost("{id:guid}/documents/{documentId:guid}/archive")]
    [Permission(Permissions.Users.Edit)]
    public async Task<IActionResult> ArchiveDocument(Guid id, Guid documentId, [FromBody] ArchiveDocumentRequest request)
    {
        var ok = await _mediator.Send(new ArchiveEmployeeDocumentCommand(id, documentId, request.Reason));
        return ok ? NoContent() : NotFound();
    }

    // Onboarding/Offboarding
    [HttpPost("{id:guid}/onboarding/start")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDto>> StartOnboarding(Guid id)
    {
        var item = await _mediator.Send(new StartOnboardingCommand(id));
        return Ok(item);
    }

    [HttpPost("{id:guid}/onboarding/complete")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDto>> CompleteOnboardingTask(Guid id, [FromBody] CompleteTaskRequest request)
    {
        var item = await _mediator.Send(new CompleteOnboardingTaskCommand(id, request.Code));
        return Ok(item);
    }

    [HttpPost("{id:guid}/offboarding/initiate")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDto>> InitiateOffboarding(Guid id, [FromBody] InitiateOffboardingRequest request)
    {
        var item = await _mediator.Send(new InitiateOffboardingCommand(id, request.Reason));
        return Ok(item);
    }

    [HttpPost("{id:guid}/offboarding/complete")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDto>> CompleteOffboardingTask(Guid id, [FromBody] CompleteTaskRequest request)
    {
        var item = await _mediator.Send(new CompleteOffboardingTaskCommand(id, request.Code));
        return Ok(item);
    }
}

[ApiExplorerSettings(IgnoreApi = false)]
public class UploadEmployeeImageRequest
{
    public IFormFile? File { get; set; }
}

public record AddEmployeeDocumentRequest(string FileName, DocumentType Type, string StoragePath, long SizeBytes, string ContentType, DateTime? IssuedAt, DateTime? ExpiresAt);
public record ArchiveDocumentRequest(string Reason);
public record CompleteTaskRequest(string Code);
public record InitiateOffboardingRequest(string Reason);
