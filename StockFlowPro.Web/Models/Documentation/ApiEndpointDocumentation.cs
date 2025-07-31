using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Models.Documentation;

/// <summary>
/// Represents comprehensive documentation for an API endpoint
/// </summary>
public class ApiEndpointDocumentation
{
    /// <summary>
    /// Gets or sets the unique identifier for this endpoint documentation
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTTP method (GET, POST, PUT, DELETE, etc.)
    /// </summary>
    [Required]
    public string Method { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the endpoint path/route
    /// </summary>
    [Required]
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the endpoint summary
    /// </summary>
    [Required]
    public string Summary { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the detailed description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API version
    /// </summary>
    public string Version { get; set; } = "v1";

    /// <summary>
    /// Gets or sets the category/group
    /// </summary>
    public string Category { get; set; } = "General";

    /// <summary>
    /// Gets or sets the controller name
    /// </summary>
    public string ControllerName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the action name
    /// </summary>
    public string ActionName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether authentication is required
    /// </summary>
    public bool RequiresAuthentication { get; set; } = true;

    /// <summary>
    /// Gets or sets the required roles
    /// </summary>
    public List<string> RequiredRoles { get; set; } = new();

    /// <summary>
    /// Gets or sets the required permissions
    /// </summary>
    public List<string> RequiredPermissions { get; set; } = new();

    /// <summary>
    /// Gets or sets the request parameters
    /// </summary>
    public List<ApiParameterDocumentation> Parameters { get; set; } = new();

    /// <summary>
    /// Gets or sets the request body documentation
    /// </summary>
    public ApiRequestBodyDocumentation? RequestBody { get; set; }

    /// <summary>
    /// Gets or sets the response documentation
    /// </summary>
    public List<ApiResponseDocumentation> Responses { get; set; } = new();

    /// <summary>
    /// Gets or sets the examples
    /// </summary>
    public List<ApiExampleDocumentation> Examples { get; set; } = new();

    /// <summary>
    /// Gets or sets additional notes
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets deprecation information
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
    /// Gets or sets when this documentation was last updated
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets tags for categorization
    /// </summary>
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// Represents documentation for an API parameter
/// </summary>
public class ApiParameterDocumentation
{
    /// <summary>
    /// Gets or sets the parameter name
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the parameter type (query, path, header, form)
    /// </summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the data type (string, integer, boolean, etc.)
    /// </summary>
    [Required]
    public string DataType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the parameter is required
    /// </summary>
    public bool Required { get; set; } = false;

    /// <summary>
    /// Gets or sets the parameter description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the default value
    /// </summary>
    public string? DefaultValue { get; set; }

    /// <summary>
    /// Gets or sets example values
    /// </summary>
    public List<string> ExampleValues { get; set; } = new();

    /// <summary>
    /// Gets or sets validation constraints
    /// </summary>
    public string? Constraints { get; set; }
}

/// <summary>
/// Represents documentation for an API request body
/// </summary>
public class ApiRequestBodyDocumentation
{
    /// <summary>
    /// Gets or sets the content type
    /// </summary>
    [Required]
    public string ContentType { get; set; } = "application/json";

    /// <summary>
    /// Gets or sets the description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the request body is required
    /// </summary>
    public bool Required { get; set; } = true;

    /// <summary>
    /// Gets or sets the schema/model type
    /// </summary>
    public string? SchemaType { get; set; }

    /// <summary>
    /// Gets or sets example content
    /// </summary>
    public string? ExampleContent { get; set; }

    /// <summary>
    /// Gets or sets the properties documentation
    /// </summary>
    public List<ApiPropertyDocumentation> Properties { get; set; } = new();
}

/// <summary>
/// Represents documentation for an API response
/// </summary>
public class ApiResponseDocumentation
{
    /// <summary>
    /// Gets or sets the HTTP status code
    /// </summary>
    [Required]
    public int StatusCode { get; set; }

    /// <summary>
    /// Gets or sets the status description
    /// </summary>
    [Required]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the content type
    /// </summary>
    public string ContentType { get; set; } = "application/json";

    /// <summary>
    /// Gets or sets the schema/model type
    /// </summary>
    public string? SchemaType { get; set; }

    /// <summary>
    /// Gets or sets example content
    /// </summary>
    public string? ExampleContent { get; set; }

    /// <summary>
    /// Gets or sets response headers
    /// </summary>
    public List<ApiHeaderDocumentation> Headers { get; set; } = new();
}

/// <summary>
/// Represents documentation for an API example
/// </summary>
public class ApiExampleDocumentation
{
    /// <summary>
    /// Gets or sets the example name
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the example description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the example type (Request, Response, Error)
    /// </summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTTP status code for response examples
    /// </summary>
    public int? StatusCode { get; set; }

    /// <summary>
    /// Gets or sets the content type
    /// </summary>
    public string ContentType { get; set; } = "application/json";

    /// <summary>
    /// Gets or sets the example content
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Represents documentation for an API property
/// </summary>
public class ApiPropertyDocumentation
{
    /// <summary>
    /// Gets or sets the property name
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the property type
    /// </summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the property is required
    /// </summary>
    public bool Required { get; set; } = false;

    /// <summary>
    /// Gets or sets the property description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets example values
    /// </summary>
    public List<string> ExampleValues { get; set; } = new();

    /// <summary>
    /// Gets or sets validation constraints
    /// </summary>
    public string? Constraints { get; set; }
}

/// <summary>
/// Represents documentation for an API header
/// </summary>
public class ApiHeaderDocumentation
{
    /// <summary>
    /// Gets or sets the header name
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the header description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets whether the header is required
    /// </summary>
    public bool Required { get; set; } = false;

    /// <summary>
    /// Gets or sets example values
    /// </summary>
    public List<string> ExampleValues { get; set; } = new();
}