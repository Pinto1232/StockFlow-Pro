using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Shared.Models;
using StockFlowPro.Web.Services;
using System.Security.Claims;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager,Admin")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IDualDataService _dualDataService;
    private readonly IUserSynchronizationService _userSyncService;
    private readonly IInvoiceExportService _exportService;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(
        IInvoiceService invoiceService, 
        IDualDataService dualDataService,
        IUserSynchronizationService userSyncService,
        IInvoiceExportService exportService,
        ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _dualDataService = dualDataService;
        _userSyncService = userSyncService;
        _exportService = exportService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<InvoiceDto>>> GetInvoices(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? customerId = null,
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null)
    {
        try
        {
            _logger.LogInformation("Getting invoices with pagination - Page: {PageNumber}, Size: {PageSize}, Search: '{Search}', Status: '{Status}'", 
                pageNumber, pageSize, search, status);

            // Validate pagination parameters
            if (pageNumber < 1) {pageNumber = 1;}
            if (pageSize < 1 || pageSize > 100) {pageSize = 10;}

            // Get all invoices first (in a real application, this should be done at the database level)
            var allInvoices = await _invoiceService.GetAllAsync();
            
            // Apply filters
            var filteredInvoices = allInvoices.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                filteredInvoices = filteredInvoices.Where(i => 
                    i.InvoiceNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    i.CustomerName.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(status))
            {
                filteredInvoices = filteredInvoices.Where(i => 
                    i.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(customerId) && Guid.TryParse(customerId, out var customerGuid))
            {
                filteredInvoices = filteredInvoices.Where(i => i.CustomerId == customerGuid);
            }

            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                filteredInvoices = filteredInvoices.Where(i => i.IssueDate >= fromDate);
            }

            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                filteredInvoices = filteredInvoices.Where(i => i.IssueDate <= toDate);
            }

            // Get total count after filtering
            var totalCount = filteredInvoices.Count();

            // Apply pagination
            var paginatedInvoices = filteredInvoices
                .OrderByDescending(i => i.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var response = new PaginatedResponse<InvoiceDto>(
                paginatedInvoices,
                totalCount,
                pageNumber,
                pageSize);

            _logger.LogInformation("Successfully retrieved {Count} invoices out of {Total} total", 
                paginatedInvoices.Count, totalCount);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting paginated invoices");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAllInvoices()
    {
        try
        {
            var invoices = await _invoiceService.GetAllAsync();
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoiceById(Guid id)
    {
        try
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound($"Invoice with ID {id} not found");
            }

            return Ok(invoice);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByUserId(Guid userId)
    {
        try
        {
            var invoices = await _invoiceService.GetByUserIdAsync(userId);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("my-invoices")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetMyInvoices()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user ID");
            }

            var invoices = await _invoiceService.GetByUserIdAsync(userId);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("date-range")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be greater than end date");
            }

            var invoices = await _invoiceService.GetByDateRangeAsync(startDate, endDate);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] CreateInvoiceDto createInvoiceDto)
    {
        try
        {
            // Get current authenticated user
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _logger.LogWarning("Invoice creation attempted without authentication");
                return BadRequest("User authentication required. Please log in.");
            }
            
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Invoice creation attempted with invalid user ID: {UserIdClaim}", userIdClaim);
                return BadRequest("Invalid user authentication data.");
            }
            
            // Always use current authenticated user for security
            createInvoiceDto.CreatedByUserId = userId;

            // Check user existence status
            var userExistence = await _userSyncService.CheckUserExistenceAsync(userId);
            
            if (!userExistence.ExistsInMockData)
            {
                _logger.LogWarning("Invoice creation attempted by non-existent user: {UserId}", userId);
                return BadRequest("User not found in the system. Please contact an administrator.");
            }

            // If user exists in mock data but not in database, require explicit sync
            if (userExistence.RequiresSync)
            {
                _logger.LogWarning("Invoice creation attempted by user {UserId} who requires database synchronization", userId);
                return BadRequest(new
                {
                    error = "User account requires synchronization",
                    message = "Your account needs to be synchronized with the database before you can create invoices. Please contact an administrator or use the account synchronization feature.",
                    requiresSync = true,
                    userId = userId
                });
            }

            // Try to create the invoice
            var invoice = await _invoiceService.CreateAsync(createInvoiceDto);
            
            _logger.LogInformation("Invoice {InvoiceId} created successfully by user {UserId}", invoice.Id, userId);
            
            return CreatedAtAction(
                nameof(GetInvoiceById),
                new { id = invoice.Id },
                invoice);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Invoice creation failed with argument error: {Error}", ex.Message);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Internal error during invoice creation for user {UserId}", 
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoice(Guid id, [FromBody] UpdateInvoiceDto updateInvoiceDto)
    {
        try
        {
            updateInvoiceDto.Id = id;
            var invoice = await _invoiceService.UpdateAsync(updateInvoiceDto);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> DeleteInvoice(Guid id)
    {
        try
        {
            await _invoiceService.DeleteAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<InvoiceDto>> AddItemToInvoice(Guid id, [FromBody] AddInvoiceItemDto addItemDto)
    {
        try
        {
            addItemDto.InvoiceId = id;
            var invoice = await _invoiceService.AddItemAsync(addItemDto);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id:guid}/items/{productId:guid}")]
    public async Task<ActionResult<InvoiceDto>> UpdateInvoiceItem(
        Guid id, 
        Guid productId, 
        [FromBody] UpdateInvoiceItemDto updateItemDto)
    {
        try
        {
            updateItemDto.InvoiceId = id;
            updateItemDto.ProductId = productId;
            var invoice = await _invoiceService.UpdateItemQuantityAsync(updateItemDto);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id:guid}/items/{productId:guid}")]
    public async Task<ActionResult<InvoiceDto>> RemoveItemFromInvoice(Guid id, Guid productId)
    {
        try
        {
            var invoice = await _invoiceService.RemoveItemAsync(id, productId);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id:guid}/download/{format}")]
    public async Task<IActionResult> DownloadInvoice(Guid id, string format)
    {
        try
        {
            // Validate format
            var validFormats = new[] { "pdf", "excel", "csv", "json" };
            if (!validFormats.Contains(format.ToLower()))
            {
                return BadRequest($"Invalid format. Supported formats: {string.Join(", ", validFormats)}");
            }

            // Get invoice
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound($"Invoice with ID {id} not found");
            }

            // Generate file based on format
            byte[] fileBytes;
            switch (format.ToLower())
            {
                case "pdf":
                    fileBytes = await _exportService.ExportToPdfAsync(invoice);
                    break;
                case "excel":
                    fileBytes = await _exportService.ExportToExcelAsync(invoice);
                    break;
                case "csv":
                    fileBytes = await _exportService.ExportToCsvAsync(invoice);
                    break;
                case "json":
                    fileBytes = await _exportService.ExportToJsonAsync(invoice);
                    break;
                default:
                    return BadRequest("Invalid format");
            }

            var contentType = _exportService.GetContentType(format);
            var fileName = _exportService.GetFileName(invoice, format);

            return File(fileBytes, contentType, fileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading invoice {InvoiceId} in format {Format}", id, format);
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("download/bulk/{format}")]
    public async Task<IActionResult> DownloadAllInvoices(
        string format,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? customerId = null,
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null)
    {
        try
        {
            // Validate format
            var validFormats = new[] { "pdf", "excel", "csv", "json" };
            if (!validFormats.Contains(format.ToLower()))
            {
                return BadRequest($"Invalid format for bulk export. Supported formats: {string.Join(", ", validFormats)}");
            }

            _logger.LogInformation("Bulk download requested for format: {Format}, Search: '{Search}', Status: '{Status}'", 
                format, search, status);

            // Get all invoices first
            var allInvoices = await _invoiceService.GetAllAsync();
            
            // Apply the same filters as the main GetInvoices endpoint
            var filteredInvoices = allInvoices.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                filteredInvoices = filteredInvoices.Where(i => 
                    i.InvoiceNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    i.CustomerName.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(status))
            {
                filteredInvoices = filteredInvoices.Where(i => 
                    i.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(customerId) && Guid.TryParse(customerId, out var customerGuid))
            {
                filteredInvoices = filteredInvoices.Where(i => i.CustomerId == customerGuid);
            }

            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                filteredInvoices = filteredInvoices.Where(i => i.IssueDate >= fromDate);
            }

            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                filteredInvoices = filteredInvoices.Where(i => i.IssueDate <= toDate);
            }

            var invoicesToExport = filteredInvoices
                .OrderByDescending(i => i.CreatedAt)
                .ToList();

            if (!invoicesToExport.Any())
            {
                return BadRequest("No invoices found matching the specified criteria.");
            }

            _logger.LogInformation("Exporting {Count} invoices in {Format} format", invoicesToExport.Count, format);

            // Generate file based on format
            byte[] fileBytes;
            switch (format.ToLower())
            {
                case "pdf":
                    fileBytes = await _exportService.ExportBulkToPdfAsync(invoicesToExport);
                    break;
                case "excel":
                    fileBytes = await _exportService.ExportBulkToExcelAsync(invoicesToExport);
                    break;
                case "csv":
                    fileBytes = await _exportService.ExportBulkToCsvAsync(invoicesToExport);
                    break;
                case "json":
                    fileBytes = await _exportService.ExportBulkToJsonAsync(invoicesToExport);
                    break;
                default:
                    return BadRequest("Invalid format");
            }

            var contentType = _exportService.GetContentType(format);
            var fileName = _exportService.GetBulkFileName(format);

            _logger.LogInformation("Successfully generated bulk export file: {FileName} ({Size} bytes)", 
                fileName, fileBytes.Length);

            return File(fileBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk download in format {Format}", format);
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}