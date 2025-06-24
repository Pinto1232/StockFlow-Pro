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
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized("User ID not found in token");
        }

        var query = new GetUserByIdQuery { Id = userId.Value };
        var user = await _mediator.Send(query);
        
        if (user == null)
        {
            return NotFound("User profile not found");
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
            Role = user.Role.ToString()
        };
        return Ok(profile);
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
            Role = user.Role.ToString()
        };
        return Ok(profile);
    }
}