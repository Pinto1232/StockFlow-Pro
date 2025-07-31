using StockFlowPro.Web.Models;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service interface for managing documentation archive
/// </summary>
public interface IDocumentationArchiveService
{
    /// <summary>
    /// Get the complete documentation archive organized by categories
    /// </summary>
    Task<DocumentationArchive> GetDocumentationArchiveAsync();

    /// <summary>
    /// Get the content of a specific documentation file
    /// </summary>
    Task<string?> GetDocumentationContentAsync(string fileName);

    /// <summary>
    /// Search documentation content by query
    /// </summary>
    Task<DocumentationSearchResult> SearchDocumentationAsync(string query);

    /// <summary>
    /// Get documentation statistics
    /// </summary>
    Task<DocumentationStats> GetDocumentationStatsAsync();

    /// <summary>
    /// Refresh the documentation archive (scan for new files)
    /// </summary>
    Task RefreshArchiveAsync();

    /// <summary>
    /// Watch for file system changes and auto-refresh
    /// </summary>
    void StartFileWatcher();

    /// <summary>
    /// Stop watching for file system changes
    /// </summary>
    void StopFileWatcher();
}