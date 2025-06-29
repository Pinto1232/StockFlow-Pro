using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Users;
using StockFlowPro.Web.Extensions;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    public ProfileController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProfileDto>> GetProfile()
    {
        try
        {
            // Check if user is authenticated
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { message = "Authentication required", requiresLogin = true });
            }

            var userId = User.GetUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "User ID not found in token", requiresLogin = true });
            }

            var query = new GetUserByIdQuery { Id = userId.Value };
            var user = await _mediator.Send(query);
            
            if (user == null)
            {
                return NotFound(new { message = "User profile not found" });
            }

            var profile = new ProfileDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Age = user.Age,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                Role = user.Role.ToString(),
                ProfilePhotoUrl = user.ProfilePhotoUrl ?? "/images/default-avatar.svg"
            };
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Debug endpoint to test authentication
    /// </summary>
    [HttpGet("debug")]
    public ActionResult GetDebugInfo()
    {
        try
        {
            var userId = User.GetUserId();
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            
            return Ok(new 
            { 
                IsAuthenticated = isAuthenticated,
                UserId = userId,
                Claims = claims
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Debug error: {ex.Message}");
        }
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] EditProfileDto editProfileDto)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var command = _mapper.Map<EditProfileCommand>(editProfileDto);
        command.UserId = userId.Value;
        
        try
        {
            var updatedProfile = await _mediator.Send(command);
            return Ok(updatedProfile);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("User profile not found");
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to update profile: {ex.Message}");
        }
    }

    /// <summary>
    /// Change current user's password
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
        {
            return BadRequest("New password and confirmation password do not match");
        }

        var command = new ChangePasswordCommand
        {
            UserId = userId.Value,
            CurrentPassword = changePasswordDto.CurrentPassword,
            NewPassword = changePasswordDto.NewPassword
        };
        
        try
        {
            var result = await _mediator.Send(command);
            if (result)
            {
                return Ok(new { message = "Password changed successfully" });
            }
            else
            {
                return BadRequest("Failed to change password");
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("User not found");
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to change password: {ex.Message}");
        }
    }

    /// <summary>
    /// Get profile by user ID (for admins/managers)
    /// </summary>
    [HttpGet("{userId:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ProfileDto>> GetProfileById(Guid userId)
    {
        var query = new GetUserByIdQuery { Id = userId };
        var user = await _mediator.Send(query);
        
        if (user == null)
        {
            return NotFound($"User profile with ID {userId} not found");
        }

        var profile = new ProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
            Age = user.Age,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Role = user.Role.ToString(),
            ProfilePhotoUrl = user.ProfilePhotoUrl ?? "/images/default-avatar.svg"
        };
        return Ok(profile);
    }

    /// <summary>
    /// Upload profile photo
    /// </summary>
    [HttpPost("upload-photo")]
    public async Task<ActionResult> UploadPhoto(IFormFile photo)
    {
        // Check if user is authenticated
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { message = "Authentication required", requiresLogin = true });
        }

        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(new { message = "User ID not found in token", requiresLogin = true });
        }

        if (photo == null || photo.Length == 0)
        {
            return BadRequest(new { message = "No photo file provided" });
        }

        // Validate file
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
        if (!allowedTypes.Contains(photo.ContentType.ToLower()))
        {
            return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and GIF files are allowed" });
        }

        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        if (photo.Length > maxFileSize)
        {
            return BadRequest(new { message = "File size exceeds 5MB limit" });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(photo.FileName);
            var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            // Update user profile with photo URL
            var photoUrl = $"/uploads/profiles/{fileName}";
            var command = new UpdateProfilePhotoCommand
            {
                UserId = userId.Value,
                ProfilePhotoUrl = photoUrl
            };

            await _mediator.Send(command);

            return Ok(new { photoUrl, message = "Photo uploaded successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to upload photo: {ex.Message}" });
        }
    }

    /// <summary>
    /// Remove profile photo
    /// </summary>
    [HttpDelete("remove-photo")]
    public async Task<ActionResult> RemovePhoto()
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        try
        {
            // Get current user to find existing photo
            var query = new GetUserByIdQuery { Id = userId.Value };
            var user = await _mediator.Send(query);
            
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Delete existing photo file if it exists
            if (!string.IsNullOrEmpty(user.ProfilePhotoUrl) && 
                user.ProfilePhotoUrl != "/images/default-avatar.svg")
            {
                var fileName = Path.GetFileName(user.ProfilePhotoUrl);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles", fileName);
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // Update user profile to remove photo URL
            var command = new UpdateProfilePhotoCommand
            {
                UserId = userId.Value,
                ProfilePhotoUrl = null
            };

            await _mediator.Send(command);

            return Ok(new { message = "Profile photo removed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to remove photo: {ex.Message}");
        }
    }
}