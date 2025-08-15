using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Features.Employees;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Exceptions;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Attributes;

namespace StockFlowPro.Web.Controllers.Api;

[Route("api/[controller]")]
[ApiDocumentation("Employee Management", "Manage employees, documents, and lifecycle workflows", Category = "Employee Management")]
public class EmployeesController : ApiBaseController
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;
    private readonly IRealTimeService _realTime;

    public EmployeesController(IMediator mediator, IWebHostEnvironment env, IRealTimeService realTime)
    {
        _mediator = mediator;
        _env = env;
        _realTime = realTime;
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

    // Documents - accept multipart/form-data file uploads
    [HttpPost("{id:guid}/documents")]
    [RequestSizeLimit(100 * 1024 * 1024)] // 100MB
    [Consumes("multipart/form-data")]
    [Permission(Permissions.Users.Edit)]
    public async Task<ActionResult<EmployeeDocumentDto>> AddDocument(Guid id, [FromForm] IFormFile? file, [FromForm] DocumentType? type, [FromForm] DateTime? issuedAt, [FromForm] DateTime? expiresAt)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "employees");
            Directory.CreateDirectory(uploadsDir);

            var safeFileName = $"{id}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, safeFileName);
            await using (var stream = System.IO.File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/employees/{safeFileName}";

            // Use provided type or default to Other if missing
            var docType = type ?? DocumentType.Other;

            var doc = await _mediator.Send(new AddEmployeeDocumentCommand(id, file.FileName, docType, relativeUrl, file.Length, file.ContentType ?? "application/octet-stream", issuedAt, expiresAt));

            // Broadcast real-time update so UI can refresh automatically
            await _realTime.BroadcastEmployeeDocumentAddedAsync(id, doc);

            return Ok(doc);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, param = ex.ParamName });
        }
        catch (DomainException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            // Surface EF constraint issues as 400 with detail
            var msg = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message = "Unable to save document", detail = msg });
        }
        catch (Exception ex)
        {
            // As a last resort, return a Problem with minimal details to aid debugging
            return Problem(title: "Unexpected error while adding document", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost("{id:guid}/documents/{documentId:guid}/archive")]
    [Permission(Permissions.Users.Edit)]
    public async Task<IActionResult> ArchiveDocument(Guid id, Guid documentId, [FromBody] ArchiveDocumentRequest request)
    {
        var ok = await _mediator.Send(new ArchiveEmployeeDocumentCommand(id, documentId, request.Reason));
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/documents/{documentId:guid}/unarchive")]
    [Permission(Permissions.Users.Edit)]
    public async Task<IActionResult> UnarchiveDocument(Guid id, Guid documentId)
    {
        var ok = await _mediator.Send(new UnarchiveEmployeeDocumentCommand(id, documentId));
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}/documents/{documentId:guid}")]
    [Permission(Permissions.Users.Edit)]
    public async Task<IActionResult> DeleteDocument(Guid id, Guid documentId)
    {
        try
        {
            var ok = await _mediator.Send(new DeleteEmployeeDocumentCommand(id, documentId));
            return ok ? NoContent() : NotFound();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (DomainException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return Problem(title: "Unexpected error while deleting document", detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
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
