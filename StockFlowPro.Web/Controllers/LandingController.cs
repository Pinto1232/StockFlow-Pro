using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using StockFlowPro.Application.Queries.Landing;

namespace StockFlowPro.Web.Controllers
{
    [ApiController]
    [Route("api/legacy/landing")] // Avoids route conflict with Api/LandingController
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class LandingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LandingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("content")]
        public async Task<IActionResult> GetLandingContent()
        {
            var query = new GetLandingContentQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("features")]
        public async Task<IActionResult> GetFeatures()
        {
            var query = new GetLandingContentQuery();
            var result = await _mediator.Send(query);
            return Ok(result.Features);
        }

        [HttpGet("testimonials")]
        public async Task<IActionResult> GetTestimonials()
        {
            var query = new GetLandingContentQuery();
            var result = await _mediator.Send(query);
            return Ok(result.Testimonials);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var query = new GetLandingContentQuery();
            var result = await _mediator.Send(query);
            return Ok(result.Stats);
        }
    }
}
