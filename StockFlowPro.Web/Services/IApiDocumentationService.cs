using StockFlowPro.Web.Models.Documentation;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Interface for API documentation service
/// </summary>
public interface IApiDocumentationService
{
    /// <summary>
    /// Generates documentation for all API endpoints
    /// </summary>
    /// <returns>A collection of API endpoint documentation</returns>
    Task<IEnumerable<ApiEndpointDocumentation>> GenerateDocumentationAsync();

    /// <summary>
    /// Gets documentation for a specific endpoint
    /// </summary>
    /// <param name="method">HTTP method</param>
    /// <param name="path">Endpoint path</param>
    /// <returns>API endpoint documentation or null if not found</returns>
    Task<ApiEndpointDocumentation?> GetEndpointDocumentationAsync(string method, string path);

    /// <summary>
    /// Gets documentation grouped by category
    /// </summary>
    /// <returns>Documentation grouped by category</returns>
    Task<Dictionary<string, IEnumerable<ApiEndpointDocumentation>>> GetDocumentationByCategoryAsync();

    /// <summary>
    /// Gets documentation for a specific API version
    /// </summary>
    /// <param name="version">API version</param>
    /// <returns>Documentation for the specified version</returns>
    Task<IEnumerable<ApiEndpointDocumentation>> GetDocumentationByVersionAsync(string version);

    /// <summary>
    /// Generates OpenAPI specification
    /// </summary>
    /// <param name="version">API version</param>
    /// <returns>OpenAPI specification as JSON string</returns>
    Task<string> GenerateOpenApiSpecificationAsync(string version = "v1");

    /// <summary>
    /// Generates Postman collection
    /// </summary>
    /// <param name="version">API version</param>
    /// <returns>Postman collection as JSON string</returns>
    Task<string> GeneratePostmanCollectionAsync(string version = "v1");

    /// <summary>
    /// Generates markdown documentation
    /// </summary>
    /// <param name="version">API version</param>
    /// <returns>Markdown documentation</returns>
    Task<string> GenerateMarkdownDocumentationAsync(string version = "v1");

    /// <summary>
    /// Refreshes the documentation cache
    /// </summary>
    /// <returns>Task representing the refresh operation</returns>
    Task RefreshDocumentationAsync();

    /// <summary>
    /// Gets API statistics
    /// </summary>
    /// <returns>API statistics</returns>
    Task<ApiStatistics> GetApiStatisticsAsync();
}

/// <summary>
/// Represents API statistics
/// </summary>
public class ApiStatistics
{
    /// <summary>
    /// Gets or sets the total number of endpoints
    /// </summary>
    public int TotalEndpoints { get; set; }

    /// <summary>
    /// Gets or sets the number of endpoints by HTTP method
    /// </summary>
    public Dictionary<string, int> EndpointsByMethod { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of endpoints by category
    /// </summary>
    public Dictionary<string, int> EndpointsByCategory { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of endpoints by version
    /// </summary>
    public Dictionary<string, int> EndpointsByVersion { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of authenticated endpoints
    /// </summary>
    public int AuthenticatedEndpoints { get; set; }

    /// <summary>
    /// Gets or sets the number of deprecated endpoints
    /// </summary>
    public int DeprecatedEndpoints { get; set; }

    /// <summary>
    /// Gets or sets the number of experimental endpoints
    /// </summary>
    public int ExperimentalEndpoints { get; set; }

    /// <summary>
    /// Gets or sets when the statistics were last updated
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}