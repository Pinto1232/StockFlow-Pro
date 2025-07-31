namespace StockFlowPro.Web.Models;

/// <summary>
/// Represents the complete documentation archive
/// </summary>
public class DocumentationArchive
{
    public DateTime LastUpdated { get; set; }
    public List<DocumentationCategory> Categories { get; set; } = new();
    public DocumentationStats Stats { get; set; } = new();
}

/// <summary>
/// Represents a category of documentation
/// </summary>
public class DocumentationCategory
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<DocumentationFile> Files { get; set; } = new();
    public int FileCount => Files.Count;
}

/// <summary>
/// Represents a documentation file
/// </summary>
public class DocumentationFile
{
    public string FileName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FileSizeFormatted { get; set; } = string.Empty;
    public DateTime LastModified { get; set; }
    public DateTime CreatedDate { get; set; }
    public string RelativePath { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Category { get; set; } = string.Empty;
    public bool IsMarkdown { get; set; }
    public bool IsJson { get; set; }
    public bool IsSql { get; set; }
    public bool IsYaml { get; set; }
    public string PreviewContent { get; set; } = string.Empty;
}

/// <summary>
/// Represents documentation search results
/// </summary>
public class DocumentationSearchResult
{
    public string Query { get; set; } = string.Empty;
    public int TotalResults { get; set; }
    public List<DocumentationSearchMatch> Matches { get; set; } = new();
    public DateTime SearchTime { get; set; }
    public double SearchDurationMs { get; set; }
}

/// <summary>
/// Represents a search match in documentation
/// </summary>
public class DocumentationSearchMatch
{
    public DocumentationFile File { get; set; } = new();
    public List<string> MatchingLines { get; set; } = new();
    public int LineNumber { get; set; }
    public double RelevanceScore { get; set; }
    public string Context { get; set; } = string.Empty;
}

/// <summary>
/// Represents documentation statistics
/// </summary>
public class DocumentationStats
{
    public int TotalFiles { get; set; }
    public int TotalCategories { get; set; }
    public long TotalSizeBytes { get; set; }
    public string TotalSizeFormatted { get; set; } = string.Empty;
    public DateTime LastScanTime { get; set; }
    public Dictionary<string, int> FileTypeDistribution { get; set; } = new();
    public Dictionary<string, int> CategoryDistribution { get; set; } = new();
    public DocumentationFile? MostRecentFile { get; set; }
    public DocumentationFile? LargestFile { get; set; }
    public List<string> RecentlyModified { get; set; } = new();
}