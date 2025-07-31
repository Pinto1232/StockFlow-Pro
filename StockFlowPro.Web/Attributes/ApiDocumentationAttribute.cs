using System;

namespace StockFlowPro.Web.Attributes;

/// <summary>
/// Attribute to provide comprehensive API documentation metadata
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class ApiDocumentationAttribute : Attribute
{
    /// <summary>
    /// Gets or sets the API endpoint summary
    /// </summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the detailed description of the API endpoint
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API version this endpoint belongs to
    /// </summary>
    public string Version { get; set; } = "v1";

    /// <summary>
    /// Gets or sets the category/group for organizing endpoints
    /// </summary>
    public string Category { get; set; } = "General";

    /// <summary>
    /// Gets or sets example request body (JSON string)
    /// </summary>
    public string? ExampleRequest { get; set; }

    /// <summary>
    /// Gets or sets example response body (JSON string)
    /// </summary>
    public string? ExampleResponse { get; set; }

    /// <summary>
    /// Gets or sets the required permissions for this endpoint
    /// </summary>
    public string[]? RequiredPermissions { get; set; }

    /// <summary>
    /// Gets or sets the required roles for this endpoint
    /// </summary>
    public string[]? RequiredRoles { get; set; }

    /// <summary>
    /// Gets or sets whether this endpoint requires authentication
    /// </summary>
    public bool RequiresAuthentication { get; set; } = true;

    /// <summary>
    /// Gets or sets additional notes or warnings
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the deprecation status and message
    /// </summary>
    public string? DeprecationMessage { get; set; }

    /// <summary>
    /// Gets or sets whether this endpoint is experimental
    /// </summary>
    public bool IsExperimental { get; set; } = false;

    /// <summary>
    /// Gets or sets rate limiting information
    /// </summary>
    public string? RateLimit { get; set; }

    /// <summary>
    /// Gets or sets caching information
    /// </summary>
    public string? CacheInfo { get; set; }

    /// <summary>
    /// Initializes a new instance of the ApiDocumentationAttribute class
    /// </summary>
    /// <param name="summary">The API endpoint summary</param>
    /// <param name="description">The detailed description</param>
    public ApiDocumentationAttribute(string summary, string description = "")
    {
        Summary = summary;
        Description = description;
    }
}