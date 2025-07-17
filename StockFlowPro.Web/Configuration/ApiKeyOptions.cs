namespace StockFlowPro.Web.Configuration;

/// <summary>
/// Configuration options for API key authentication
/// </summary>
public class ApiKeyOptions
{
    public const string SectionName = "ApiKey";

    /// <summary>
    /// Whether API key authentication is required
    /// </summary>
    public bool RequireApiKey { get; set; } = false;

    /// <summary>
    /// The header name for the API key
    /// </summary>
    public string HeaderName { get; set; } = "X-API-Key";

    /// <summary>
    /// The query parameter name for the API key
    /// </summary>
    public string QueryParameterName { get; set; } = "api_key";

    /// <summary>
    /// List of valid API keys
    /// </summary>
    public List<string> ValidApiKeys { get; set; } = new();

    /// <summary>
    /// Whether to allow API key in query parameters (less secure)
    /// </summary>
    public bool AllowQueryParameter { get; set; } = false;

    /// <summary>
    /// Whether to log API key usage
    /// </summary>
    public bool LogApiKeyUsage { get; set; } = true;
}