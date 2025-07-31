using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Shared.Models;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Web.Models.Documentation;
using StockFlowPro.Web.Services;
using System.Text;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// Controller for API documentation management and generation
/// </summary>
[ApiController]
[Route("api/api-documentation")]
[ApiDocumentation("API Documentation", "Endpoints for managing and accessing API documentation", Category = "Documentation")]
public class DocumentationController : ApiBaseController
{
    private readonly IApiDocumentationService _documentationService;
    private readonly ILogger<DocumentationController> _logger;

    public DocumentationController(
        IApiDocumentationService documentationService,
        ILogger<DocumentationController> logger)
    {
        _documentationService = documentationService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all API endpoint documentation
    /// </summary>
    /// <returns>Collection of API endpoint documentation</returns>
    [HttpGet]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get All API Documentation",
        "Retrieves comprehensive documentation for all API endpoints",
        Category = "Documentation"
    )]
    [ApiExample(ExampleType.Response, "Success Response", @"{
        ""success"": true,
        ""data"": [
            {
                ""id"": ""UsersController.GetAllUsers"",
                ""method"": ""GET"",
                ""path"": ""/api/users"",
                ""summary"": ""Get all users"",
                ""description"": ""Retrieves a paginated list of all users"",
                ""version"": ""v1"",
                ""category"": ""User Management"",
                ""requiresAuthentication"": true,
                ""requiredRoles"": [""Admin"", ""Manager""],
                ""parameters"": [
                    {
                        ""name"": ""page"",
                        ""type"": ""query"",
                        ""dataType"": ""integer"",
                        ""required"": false,
                        ""description"": ""Page number for pagination""
                    }
                ]
            }
        ],
        ""message"": ""Documentation retrieved successfully"",
        ""timestamp"": ""2024-01-01T00:00:00Z""
    }")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ApiEndpointDocumentation>>>> GetAllDocumentation()
    {
        try
        {
            var documentation = await _documentationService.GenerateDocumentationAsync();
            return SuccessResponse(documentation, "Documentation retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving API documentation");
            return HandleException<IEnumerable<ApiEndpointDocumentation>>(ex, "Failed to retrieve documentation");
        }
    }

    /// <summary>
    /// Gets API documentation grouped by category
    /// </summary>
    /// <returns>Documentation grouped by category</returns>
    [HttpGet("by-category")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get Documentation by Category",
        "Retrieves API documentation organized by functional categories",
        Category = "Documentation"
    )]
    public async Task<ActionResult<ApiResponse<Dictionary<string, IEnumerable<ApiEndpointDocumentation>>>>> GetDocumentationByCategory()
    {
        try
        {
            var documentation = await _documentationService.GetDocumentationByCategoryAsync();
            return SuccessResponse(documentation, "Categorized documentation retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categorized API documentation");
            return HandleException<Dictionary<string, IEnumerable<ApiEndpointDocumentation>>>(ex, "Failed to retrieve categorized documentation");
        }
    }

    /// <summary>
    /// Gets API documentation for a specific version
    /// </summary>
    /// <param name="version">API version (e.g., v1, v2)</param>
    /// <returns>Documentation for the specified version</returns>
    [HttpGet("version/{version}")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get Documentation by Version",
        "Retrieves API documentation for a specific API version",
        Category = "Documentation"
    )]
    public async Task<ActionResult<ApiResponse<IEnumerable<ApiEndpointDocumentation>>>> GetDocumentationByVersion(string version)
    {
        try
        {
            var documentation = await _documentationService.GetDocumentationByVersionAsync(version);
            return SuccessResponse(documentation, $"Documentation for version {version} retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving API documentation for version {Version}", version);
            return HandleException<IEnumerable<ApiEndpointDocumentation>>(ex, $"Failed to retrieve documentation for version {version}");
        }
    }

    /// <summary>
    /// Gets documentation for a specific endpoint
    /// </summary>
    /// <param name="method">HTTP method</param>
    /// <param name="path">Endpoint path (URL encoded)</param>
    /// <returns>Endpoint documentation</returns>
    [HttpGet("endpoint")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get Specific Endpoint Documentation",
        "Retrieves detailed documentation for a specific API endpoint",
        Category = "Documentation"
    )]
    public async Task<ActionResult<ApiResponse<ApiEndpointDocumentation>>> GetEndpointDocumentation(
        [FromQuery] string method, 
        [FromQuery] string path)
    {
        try
        {
            var decodedPath = Uri.UnescapeDataString(path);
            var documentation = await _documentationService.GetEndpointDocumentationAsync(method, decodedPath);
            
            if (documentation == null)
            {
                return NotFoundResponse<ApiEndpointDocumentation>($"Documentation not found for {method} {decodedPath}");
            }
            
            return SuccessResponse(documentation, "Endpoint documentation retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving endpoint documentation for {Method} {Path}", method, path);
            return HandleException<ApiEndpointDocumentation>(ex, "Failed to retrieve endpoint documentation");
        }
    }

    /// <summary>
    /// Generates OpenAPI specification
    /// </summary>
    /// <param name="version">API version (default: v1)</param>
    /// <returns>OpenAPI specification in JSON format</returns>
    [HttpGet("openapi")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Generate OpenAPI Specification",
        "Generates OpenAPI 3.0 specification for the API",
        Category = "Documentation"
    )]
    public async Task<IActionResult> GetOpenApiSpecification([FromQuery] string version = "v1")
    {
        try
        {
            var openApiSpec = await _documentationService.GenerateOpenApiSpecificationAsync(version);
            return Content(openApiSpec, "application/json", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating OpenAPI specification for version {Version}", version);
            return StatusCode(500, new { error = "Failed to generate OpenAPI specification" });
        }
    }

    /// <summary>
    /// Generates Postman collection
    /// </summary>
    /// <param name="version">API version (default: v1)</param>
    /// <returns>Postman collection in JSON format</returns>
    [HttpGet("postman")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Generate Postman Collection",
        "Generates a Postman collection for API testing",
        Category = "Documentation"
    )]
    public async Task<IActionResult> GetPostmanCollection([FromQuery] string version = "v1")
    {
        try
        {
            var postmanCollection = await _documentationService.GeneratePostmanCollectionAsync(version);
            
            Response.Headers["Content-Disposition"] = $"attachment; filename=StockFlowPro-API-{version}.postman_collection.json";
            return Content(postmanCollection, "application/json", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Postman collection for version {Version}", version);
            return StatusCode(500, new { error = "Failed to generate Postman collection" });
        }
    }

    /// <summary>
    /// Generates markdown documentation
    /// </summary>
    /// <param name="version">API version (default: v1)</param>
    /// <returns>Markdown documentation</returns>
    [HttpGet("markdown")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Generate Markdown Documentation",
        "Generates comprehensive API documentation in Markdown format",
        Category = "Documentation"
    )]
    public async Task<IActionResult> GetMarkdownDocumentation([FromQuery] string version = "v1")
    {
        try
        {
            var markdownDoc = await _documentationService.GenerateMarkdownDocumentationAsync(version);
            
            Response.Headers["Content-Disposition"] = $"attachment; filename=StockFlowPro-API-{version}.md";
            return Content(markdownDoc, "text/markdown", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Markdown documentation for version {Version}", version);
            return StatusCode(500, new { error = "Failed to generate Markdown documentation" });
        }
    }

    /// <summary>
    /// Gets API statistics and metrics
    /// </summary>
    /// <returns>API statistics</returns>
    [HttpGet("statistics")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get API Statistics",
        "Retrieves comprehensive statistics about the API endpoints",
        Category = "Documentation"
    )]
    [ApiExample(ExampleType.Response, "Statistics Response", @"{
        ""success"": true,
        ""data"": {
            ""totalEndpoints"": 45,
            ""endpointsByMethod"": {
                ""GET"": 25,
                ""POST"": 10,
                ""PUT"": 7,
                ""DELETE"": 3
            },
            ""endpointsByCategory"": {
                ""User Management"": 15,
                ""Product Management"": 12,
                ""Invoice Management"": 8,
                ""Reports"": 5,
                ""Documentation"": 5
            },
            ""authenticatedEndpoints"": 40,
            ""deprecatedEndpoints"": 2,
            ""experimentalEndpoints"": 3,
            ""lastUpdated"": ""2024-01-01T00:00:00Z""
        },
        ""message"": ""API statistics retrieved successfully"",
        ""timestamp"": ""2024-01-01T00:00:00Z""
    }")]
    public async Task<ActionResult<ApiResponse<ApiStatistics>>> GetApiStatistics()
    {
        try
        {
            var statistics = await _documentationService.GetApiStatisticsAsync();
            return SuccessResponse(statistics, "API statistics retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving API statistics");
            return HandleException<ApiStatistics>(ex, "Failed to retrieve API statistics");
        }
    }

    /// <summary>
    /// Refreshes the documentation cache
    /// </summary>
    /// <returns>Success confirmation</returns>
    [HttpPost("refresh")]
    [Authorize(Roles = "Admin")]
    [ApiDocumentation(
        "Refresh Documentation Cache",
        "Forces a refresh of the cached API documentation",
        Category = "Documentation",
        RequiredRoles = new[] { "Admin" }
    )]
    public async Task<ActionResult<ApiResponse<object>>> RefreshDocumentation()
    {
        try
        {
            await _documentationService.RefreshDocumentationAsync();
            return SuccessResponse<object>(new { refreshed = true }, "Documentation cache refreshed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing documentation cache");
            return HandleException<object>(ex, "Failed to refresh documentation cache");
        }
    }

    /// <summary>
    /// Gets the API documentation dashboard
    /// </summary>
    /// <returns>HTML dashboard for API documentation</returns>
    [HttpGet("dashboard")]
    [AllowAnonymous]
    [ApiDocumentation(
        "Get Documentation Dashboard",
        "Returns an interactive HTML dashboard for browsing API documentation",
        Category = "Documentation"
    )]
    public async Task<IActionResult> GetDocumentationDashboard()
    {
        try
        {
            var statistics = await _documentationService.GetApiStatisticsAsync();
            var categorizedDocs = await _documentationService.GetDocumentationByCategoryAsync();
            
            var html = GenerateDocumentationDashboardHtml(statistics, categorizedDocs);
            return Content(html, "text/html", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating documentation dashboard");
            return StatusCode(500, "Failed to generate documentation dashboard");
        }
    }

    private static string GenerateDocumentationDashboardHtml(
        ApiStatistics statistics, 
        Dictionary<string, IEnumerable<ApiEndpointDocumentation>> categorizedDocs)
    {
        var html = new StringBuilder();
        
        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html lang=\"en\">");
        html.AppendLine("<head>");
        html.AppendLine("    <meta charset=\"UTF-8\">");
        html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.AppendLine("    <title>StockFlow Pro - API Documentation Dashboard</title>");
        html.AppendLine("    <style>");
        html.AppendLine("        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.AppendLine("        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.AppendLine("        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }");
        html.AppendLine("        .header h1 { margin: 0; font-size: 2.5em; }");
        html.AppendLine("        .header p { margin: 10px 0 0 0; opacity: 0.9; }");
        html.AppendLine("        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }");
        html.AppendLine("        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; border-left: 4px solid #667eea; }");
        html.AppendLine("        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }");
        html.AppendLine("        .stat-label { color: #666; margin-top: 5px; }");
        html.AppendLine("        .categories { padding: 0 30px 30px; }");
        html.AppendLine("        .category { margin-bottom: 30px; }");
        html.AppendLine("        .category h3 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }");
        html.AppendLine("        .endpoint { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }");
        html.AppendLine("        .endpoint.post { border-left-color: #ffc107; }");
        html.AppendLine("        .endpoint.put { border-left-color: #17a2b8; }");
        html.AppendLine("        .endpoint.delete { border-left-color: #dc3545; }");
        html.AppendLine("        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8em; margin-right: 10px; }");
        html.AppendLine("        .method.get { background: #28a745; color: white; }");
        html.AppendLine("        .method.post { background: #ffc107; color: black; }");
        html.AppendLine("        .method.put { background: #17a2b8; color: white; }");
        html.AppendLine("        .method.delete { background: #dc3545; color: white; }");
        html.AppendLine("        .path { font-family: monospace; color: #666; }");
        html.AppendLine("        .description { margin-top: 8px; color: #666; font-size: 0.9em; }");
        html.AppendLine("        .auth-required { background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 10px; }");
        html.AppendLine("        .experimental { background: #d1ecf1; color: #0c5460; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px; }");
        html.AppendLine("        .deprecated { background: #f8d7da; color: #721c24; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px; }");
        html.AppendLine("        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }");
        html.AppendLine("        .links { padding: 20px 30px; background: #f8f9fa; }");
        html.AppendLine("        .links a { display: inline-block; margin: 5px 10px 5px 0; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; }");
        html.AppendLine("        .links a:hover { background: #5a6fd8; }");
        html.AppendLine("    </style>");
        html.AppendLine("</head>");
        html.AppendLine("<body>");
        html.AppendLine("    <div class=\"container\">");
        
        // Header
        html.AppendLine("        <div class=\"header\">");
        html.AppendLine("            <h1>🚀 StockFlow Pro API</h1>");
        html.AppendLine("            <p>Comprehensive Inventory Management API Documentation</p>");
        html.AppendLine("        </div>");
        
        // Statistics
        html.AppendLine("        <div class=\"stats\">");
        html.AppendLine($"            <div class=\"stat-card\">");
        html.AppendLine($"                <div class=\"stat-number\">{statistics.TotalEndpoints}</div>");
        html.AppendLine($"                <div class=\"stat-label\">Total Endpoints</div>");
        html.AppendLine($"            </div>");
        html.AppendLine($"            <div class=\"stat-card\">");
        html.AppendLine($"                <div class=\"stat-number\">{statistics.AuthenticatedEndpoints}</div>");
        html.AppendLine($"                <div class=\"stat-label\">Authenticated</div>");
        html.AppendLine($"            </div>");
        html.AppendLine($"            <div class=\"stat-card\">");
        html.AppendLine($"                <div class=\"stat-number\">{statistics.EndpointsByCategory.Count}</div>");
        html.AppendLine($"                <div class=\"stat-label\">Categories</div>");
        html.AppendLine($"            </div>");
        html.AppendLine($"            <div class=\"stat-card\">");
        html.AppendLine($"                <div class=\"stat-number\">{statistics.ExperimentalEndpoints}</div>");
        html.AppendLine($"                <div class=\"stat-label\">Experimental</div>");
        html.AppendLine($"            </div>");
        html.AppendLine("        </div>");
        
        // Quick Links
        html.AppendLine("        <div class=\"links\">");
        html.AppendLine("            <h3>📋 Quick Access</h3>");
        html.AppendLine("            <a href=\"/swagger\">Swagger UI</a>");
        html.AppendLine("            <a href=\"/api/api-documentation/openapi\">OpenAPI Spec</a>");
        html.AppendLine("            <a href=\"/api/api-documentation/postman\">Postman Collection</a>");
        html.AppendLine("            <a href=\"/api/api-documentation/markdown\">Markdown Docs</a>");
        html.AppendLine("            <a href=\"/api/api-documentation/statistics\">API Statistics</a>");
        html.AppendLine("        </div>");
        
        // Categories
        html.AppendLine("        <div class=\"categories\">");
        html.AppendLine("            <h2>📚 API Endpoints by Category</h2>");
        
        foreach (var category in categorizedDocs.OrderBy(c => c.Key))
        {
            html.AppendLine($"            <div class=\"category\">");
            html.AppendLine($"                <h3>{category.Key} ({category.Value.Count()} endpoints)</h3>");
            
            foreach (var endpoint in category.Value.OrderBy(e => e.Path))
            {
                var methodClass = endpoint.Method.ToLowerInvariant();
                html.AppendLine($"                <div class=\"endpoint {methodClass}\">");
                html.AppendLine($"                    <span class=\"method {methodClass}\">{endpoint.Method}</span>");
                html.AppendLine($"                    <span class=\"path\">{endpoint.Path}</span>");
                
                if (endpoint.RequiresAuthentication)
                {
                    html.AppendLine($"                    <span class=\"auth-required\">🔒 Auth Required</span>");
                }
                
                if (endpoint.IsExperimental)
                {
                    html.AppendLine($"                    <span class=\"experimental\">🧪 Experimental</span>");
                }
                
                if (!string.IsNullOrEmpty(endpoint.DeprecationMessage))
                {
                    html.AppendLine($"                    <span class=\"deprecated\">⚠️ Deprecated</span>");
                }
                
                html.AppendLine($"                    <div class=\"description\">{endpoint.Summary}</div>");
                html.AppendLine($"                </div>");
            }
            
            html.AppendLine($"            </div>");
        }
        
        html.AppendLine("        </div>");
        
        // Footer
        html.AppendLine("        <div class=\"footer\">");
        html.AppendLine($"            <p>Last updated: {statistics.LastUpdated:yyyy-MM-dd HH:mm:ss} UTC</p>");
        html.AppendLine("            <p>Generated by StockFlow Pro API Documentation System</p>");
        html.AppendLine("        </div>");
        
        html.AppendLine("    </div>");
        html.AppendLine("</body>");
        html.AppendLine("</html>");
        
        return html.ToString();
    }
}