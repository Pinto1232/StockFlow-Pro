using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Queries.Landing;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Landing page content should be publicly accessible
public class LandingController : ControllerBase
{
    private readonly IMediator _mediator;

    public LandingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all landing page content (features, testimonials, and stats)
    /// </summary>
    /// <param name="activeOnly">Whether to return only active content (default: true)</param>
    /// <returns>Complete landing page content</returns>
    [HttpGet("content")]
    public async Task<ActionResult<LandingContentDto>> GetLandingContent([FromQuery] bool activeOnly = true)
    {
        try
        {
            var query = new GetLandingContentQuery { ActiveOnly = activeOnly };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving landing content", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets landing page features
    /// </summary>
    /// <param name="activeOnly">Whether to return only active features (default: true)</param>
    /// <returns>List of landing page features</returns>
    [HttpGet("features")]
    public async Task<ActionResult<IEnumerable<LandingFeatureDto>>> GetFeatures([FromQuery] bool activeOnly = true)
    {
        try
        {
            var query = new GetLandingFeaturesQuery { ActiveOnly = activeOnly };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving features", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets landing page testimonials
    /// </summary>
    /// <param name="activeOnly">Whether to return only active testimonials (default: true)</param>
    /// <returns>List of landing page testimonials</returns>
    [HttpGet("testimonials")]
    public async Task<ActionResult<IEnumerable<LandingTestimonialDto>>> GetTestimonials([FromQuery] bool activeOnly = true)
    {
        try
        {
            var query = new GetLandingTestimonialsQuery { ActiveOnly = activeOnly };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving testimonials", error = ex.Message });
        }
    }

    /// <summary>
    /// Gets landing page statistics
    /// </summary>
    /// <param name="activeOnly">Whether to return only active stats (default: true)</param>
    /// <returns>List of landing page statistics</returns>
    [HttpGet("stats")]
    public async Task<ActionResult<IEnumerable<LandingStatDto>>> GetStats([FromQuery] bool activeOnly = true)
    {
        try
        {
            var query = new GetLandingStatsQuery { ActiveOnly = activeOnly };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving stats", error = ex.Message });
        }
    }
}
