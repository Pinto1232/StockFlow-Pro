using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
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

    public InvoicesController(IInvoiceService invoiceService, IDualDataService dualDataService)
    {
        _invoiceService = invoiceService;
        _dualDataService = dualDataService;
    }

    [HttpGet]
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
                return BadRequest("User authentication required. Please log in.");
            }
            
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user authentication data.");
            }
            
            // Always use current authenticated user for security
            createInvoiceDto.CreatedByUserId = userId;

            // Ensure the user exists in the system before creating the invoice
            var user = await _dualDataService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return BadRequest("User not found in the system. Please contact an administrator.");
            }

            // Try to create the invoice
            try
            {
                var invoice = await _invoiceService.CreateAsync(createInvoiceDto);
                return CreatedAtAction(
                    nameof(GetInvoiceById),
                    new { id = invoice.Id },
                    invoice);
            }
            catch (ArgumentException ex) when (ex.Message.Contains("not found in database"))
            {
                // User exists in mock data but not in database - sync them
                try
                {
                    var createUserDto = new CreateUserDto
                    {
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber,
                        DateOfBirth = user.DateOfBirth,
                        Role = user.Role,
                        PasswordHash = user.PasswordHash
                    };

                    await _dualDataService.CreateUserAsync(createUserDto);
                    
                    // Now try creating the invoice again
                    var invoice = await _invoiceService.CreateAsync(createInvoiceDto);
                    return CreatedAtAction(
                        nameof(GetInvoiceById),
                        new { id = invoice.Id },
                        invoice);
                }
                catch (Exception syncEx)
                {
                    return BadRequest($"Unable to create invoice. Failed to sync user to database: {syncEx.Message}");
                }
            }
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
}