using Microsoft.Extensions.Caching.Memory;
using StockFlowPro.Web.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service for managing documentation archive with automatic file watching
/// </summary>
public class DocumentationArchiveService : IDocumentationArchiveService, IDisposable
{
    private readonly ILogger<DocumentationArchiveService> _logger;
    private readonly IMemoryCache _cache;
    private readonly string _docsPath;
    private readonly string _cacheKey = "documentation_archive";
    private FileSystemWatcher? _fileWatcher;
    private readonly object _lockObject = new();

    // Documentation categories configuration
    private readonly Dictionary<string, DocumentationCategoryConfig> _categoryConfigs = new()
    {
        ["API"] = new("API Documentation", "API guides, endpoints, and integration documentation", "🔌"),
        ["Setup"] = new("Setup & Configuration", "Environment setup, installation, and configuration guides", "⚙️"),
        ["Security"] = new("Security", "Security guides, authentication, and authorization documentation", "🔒"),
        ["Testing"] = new("Testing", "Testing guides, strategies, and documentation", "🧪"),
        ["Database"] = new("Database", "Database schemas, migrations, and data documentation", "🗄️"),
        ["Reports"] = new("Reports & Analytics", "Reporting system and analytics documentation", "📊"),
        ["Notifications"] = new("Notifications", "Notification system and messaging documentation", "🔔"),
        ["Admin"] = new("Administration", "Administrative guides and system management", "👨‍💼"),
        ["Development"] = new("Development", "Development guides, tools, and best practices", "💻"),
        ["General"] = new("General", "General documentation and miscellaneous guides", "📄")
    };

    public DocumentationArchiveService(
        ILogger<DocumentationArchiveService> logger,
        IMemoryCache cache,
        IWebHostEnvironment environment)
    {
        _logger = logger;
        _cache = cache;
        _docsPath = Path.Combine(environment.ContentRootPath, "docs");
        
        // Ensure docs directory exists
        if (!Directory.Exists(_docsPath))
        {
            Directory.CreateDirectory(_docsPath);
            _logger.LogInformation("Created docs directory at: {DocsPath}", _docsPath);
        }

        StartFileWatcher();
    }

    public async Task<DocumentationArchive> GetDocumentationArchiveAsync()
    {
        if (_cache.TryGetValue(_cacheKey, out DocumentationArchive? cachedArchive) && cachedArchive != null)
        {
            return cachedArchive;
        }

        return await RefreshAndGetArchiveAsync();
    }

    public async Task<string?> GetDocumentationContentAsync(string fileName)
    {
        try
        {
            var filePath = Path.Combine(_docsPath, fileName);
            if (!File.Exists(filePath))
            {
                return null;
            }

            return await File.ReadAllTextAsync(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading documentation file: {FileName}", fileName);
            return null;
        }
    }

    public async Task<DocumentationSearchResult> SearchDocumentationAsync(string query)
    {
        var startTime = DateTime.UtcNow;
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        
        var result = new DocumentationSearchResult
        {
            Query = query,
            SearchTime = startTime
        };

        try
        {
            var archive = await GetDocumentationArchiveAsync();
            var matches = new List<DocumentationSearchMatch>();

            foreach (var category in archive.Categories)
            {
                foreach (var file in category.Files)
                {
                    var content = await GetDocumentationContentAsync(file.FileName);
                    if (content == null){ continue;}

                    var fileMatches = SearchInContent(content, query, file);
                    matches.AddRange(fileMatches);
                }
            }

            result.Matches = matches.OrderByDescending(m => m.RelevanceScore).ToList();
            result.TotalResults = matches.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documentation with query: {Query}", query);
        }

        stopwatch.Stop();
        result.SearchDurationMs = stopwatch.Elapsed.TotalMilliseconds;

        return result;
    }

    public async Task<DocumentationStats> GetDocumentationStatsAsync()
    {
        var archive = await GetDocumentationArchiveAsync();
        return archive.Stats;
    }

    public async Task RefreshArchiveAsync()
    {
        await RefreshAndGetArchiveAsync();
    }

    public void StartFileWatcher()
    {
        try
        {
            _fileWatcher?.Dispose();
            
            _fileWatcher = new FileSystemWatcher(_docsPath)
            {
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.CreationTime,
                Filter = "*.*",
                EnableRaisingEvents = true,
                IncludeSubdirectories = true
            };

            _fileWatcher.Changed += OnFileChanged;
            _fileWatcher.Created += OnFileChanged;
            _fileWatcher.Deleted += OnFileChanged;
            _fileWatcher.Renamed += OnFileRenamed;

            _logger.LogInformation("Documentation file watcher started for: {DocsPath}", _docsPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start documentation file watcher");
        }
    }

    public void StopFileWatcher()
    {
        _fileWatcher?.Dispose();
        _fileWatcher = null;
        _logger.LogInformation("Documentation file watcher stopped");
    }

    private async void OnFileChanged(object sender, FileSystemEventArgs e)
    {
        await Task.Delay(500); // Debounce file changes
        
        lock (_lockObject)
        {
            _cache.Remove(_cacheKey);
            _logger.LogInformation("Documentation cache invalidated due to file change: {FileName}", e.Name);
        }
    }

    private async void OnFileRenamed(object sender, RenamedEventArgs e)
    {
        await Task.Delay(500); // Debounce file changes
        
        lock (_lockObject)
        {
            _cache.Remove(_cacheKey);
            _logger.LogInformation("Documentation cache invalidated due to file rename: {OldName} -> {NewName}", e.OldName, e.Name);
        }
    }

    private async Task<DocumentationArchive> RefreshAndGetArchiveAsync()
    {
        try
        {
            var archive = new DocumentationArchive
            {
                LastUpdated = DateTime.UtcNow,
                Categories = new List<DocumentationCategory>()
            };

            var allFiles = new List<DocumentationFile>();

            // Scan all files in docs directory
            var files = Directory.GetFiles(_docsPath, "*.*", SearchOption.AllDirectories)
                .Where(f => IsDocumentationFile(f))
                .ToList();

            foreach (var filePath in files)
            {
                var docFile = await CreateDocumentationFileAsync(filePath);
                if (docFile != null)
                {
                    allFiles.Add(docFile);
                }
            }

            // Group files by category
            var categorizedFiles = allFiles.GroupBy(f => f.Category).ToList();

            foreach (var group in categorizedFiles)
            {
                var categoryName = group.Key;
                var config = _categoryConfigs.GetValueOrDefault(categoryName, 
                    new DocumentationCategoryConfig(categoryName, $"{categoryName} documentation", "📄"));

                var category = new DocumentationCategory
                {
                    Name = categoryName,
                    Description = config.Description,
                    Icon = config.Icon,
                    Files = group.OrderBy(f => f.DisplayName).ToList()
                };

                archive.Categories.Add(category);
            }

            // Sort categories by priority
            archive.Categories = archive.Categories
                .OrderBy(c => GetCategoryPriority(c.Name))
                .ThenBy(c => c.Name)
                .ToList();

            // Generate statistics
            archive.Stats = GenerateStats(allFiles);

            // Cache the result
            _cache.Set(_cacheKey, archive, TimeSpan.FromMinutes(30));

            _logger.LogInformation("Documentation archive refreshed with {FileCount} files in {CategoryCount} categories", 
                allFiles.Count, archive.Categories.Count);

            return archive;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing documentation archive");
            return new DocumentationArchive { LastUpdated = DateTime.UtcNow };
        }
    }

    private async Task<DocumentationFile?> CreateDocumentationFileAsync(string filePath)
    {
        try
        {
            var fileInfo = new FileInfo(filePath);
            var fileName = fileInfo.Name;
            var relativePath = Path.GetRelativePath(_docsPath, filePath);
            
            var docFile = new DocumentationFile
            {
                FileName = fileName,
                DisplayName = GetDisplayName(fileName),
                FileType = fileInfo.Extension.TrimStart('.').ToUpperInvariant(),
                FileSizeBytes = fileInfo.Length,
                FileSizeFormatted = FormatFileSize(fileInfo.Length),
                LastModified = fileInfo.LastWriteTime,
                CreatedDate = fileInfo.CreationTime,
                RelativePath = relativePath,
                Category = DetermineCategory(fileName),
                IsMarkdown = fileName.EndsWith(".md", StringComparison.OrdinalIgnoreCase),
                IsJson = fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase),
                IsSql = fileName.EndsWith(".sql", StringComparison.OrdinalIgnoreCase),
                IsYaml = fileName.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase) || 
                         fileName.EndsWith(".yml", StringComparison.OrdinalIgnoreCase)
            };

            // Generate description and tags
            docFile.Description = GenerateDescription(fileName);
            docFile.Tags = GenerateTags(fileName, docFile.Category);

            // Generate preview content
            try
            {
                var content = await File.ReadAllTextAsync(filePath);
                docFile.PreviewContent = GeneratePreview(content, 200);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not read content for preview: {FileName}", fileName);
                docFile.PreviewContent = "Preview not available";
            }

            return docFile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating documentation file object for: {FilePath}", filePath);
            return null;
        }
    }

    private bool IsDocumentationFile(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        var allowedExtensions = new[] { ".md", ".txt", ".json", ".yaml", ".yml", ".sql", ".xml", ".html" };
        return allowedExtensions.Contains(extension);
    }

    private string DetermineCategory(string fileName)
    {
        var lowerFileName = fileName.ToLowerInvariant();

        if (lowerFileName.Contains("api")){ return "API";}
        if (lowerFileName.Contains("setup") || lowerFileName.Contains("environment") || lowerFileName.Contains("config")) {return "Setup";}
        if (lowerFileName.Contains("security") || lowerFileName.Contains("auth") || lowerFileName.Contains("credential")) {return "Security";}
        if (lowerFileName.Contains("test")) {return "Testing";}
        if (lowerFileName.Contains("database") || lowerFileName.Contains("schema") || lowerFileName.Contains(".sql")) {return "Database";}
        if (lowerFileName.Contains("report") || lowerFileName.Contains("analytics")) {return "Reports";}
        if (lowerFileName.Contains("notification") || lowerFileName.Contains("email")) {return "Notifications";}
        if (lowerFileName.Contains("admin") || lowerFileName.Contains("credential")) {return "Admin";}
        if (lowerFileName.Contains("development") || lowerFileName.Contains("vscode") || lowerFileName.Contains("github")) {return "Development";}

        return "General";
    }

    private string GetDisplayName(string fileName)
    {
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        
        // Convert underscores and hyphens to spaces
        var displayName = nameWithoutExtension.Replace('_', ' ').Replace('-', ' ');
        
        // Convert to title case
        return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayName.ToLowerInvariant());
    }

    private string GenerateDescription(string fileName)
    {
        var lowerFileName = fileName.ToLowerInvariant();

        return lowerFileName switch
        {
            var name when name.Contains("api") && name.Contains("documentation") => "Comprehensive API documentation and endpoint reference",
            var name when name.Contains("setup") => "Setup and configuration instructions",
            var name when name.Contains("environment") => "Environment configuration and setup guide",
            var name when name.Contains("security") => "Security implementation and best practices",
            var name when name.Contains("auth") => "Authentication and authorization guide",
            var name when name.Contains("test") => "Testing documentation and guidelines",
            var name when name.Contains("database") => "Database schema and data management",
            var name when name.Contains("report") => "Reporting system documentation",
            var name when name.Contains("notification") => "Notification system configuration and usage",
            var name when name.Contains("admin") => "Administrative documentation and procedures",
            var name when name.Contains("credential") => "Credential management and security",
            var name when name.Contains("github") => "GitHub integration and workflow documentation",
            var name when name.Contains("vscode") => "Visual Studio Code setup and configuration",
            var name when name.Contains("postman") => "Postman collection for API testing",
            var name when name.Contains("openapi") => "OpenAPI specification and schema",
            _ => "Documentation file"
        };
    }

    private List<string> GenerateTags(string fileName, string category)
    {
        var tags = new List<string> { category.ToLowerInvariant() };
        var lowerFileName = fileName.ToLowerInvariant();

        if (lowerFileName.Contains("api")) {tags.Add("api");}
        if (lowerFileName.Contains("setup")) {tags.Add("setup");}
        if (lowerFileName.Contains("config")) {tags.Add("configuration");}
        if (lowerFileName.Contains("security")) {tags.Add("security");}
        if (lowerFileName.Contains("auth")) {tags.Add("authentication");}
        if (lowerFileName.Contains("test")) {tags.Add("testing");}
        if (lowerFileName.Contains("database")){ tags.Add("database");}
        if (lowerFileName.Contains("schema")) {tags.Add("schema");}
        if (lowerFileName.Contains("migration")) {tags.Add("migration");}
        if (lowerFileName.Contains("report")) {tags.Add("reporting");}
        if (lowerFileName.Contains("notification")) {tags.Add("notifications");}
        if (lowerFileName.Contains("email")) {tags.Add("email");}
        if (lowerFileName.Contains("admin")) {tags.Add("administration");}
        if (lowerFileName.Contains("guide")) {tags.Add("guide");}
        if (lowerFileName.Contains("implementation")) {tags.Add("implementation");}

        return tags.Distinct().ToList();
    }

    private string GeneratePreview(string content, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(content))
            {return "No content available";}

        // Remove markdown headers and formatting for preview
        var cleanContent = Regex.Replace(content, @"^#+\s*", "", RegexOptions.Multiline);
        cleanContent = Regex.Replace(cleanContent, @"\*\*(.*?)\*\*", "$1");
        cleanContent = Regex.Replace(cleanContent, @"\*(.*?)\*", "$1");
        cleanContent = Regex.Replace(cleanContent, @"`(.*?)`", "$1");
        
        // Get first meaningful paragraph
        var lines = cleanContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var preview = string.Join(" ", lines.Take(3)).Trim();

        if (preview.Length > maxLength)
        {
            preview = preview.Substring(0, maxLength) + "...";
        }

        return string.IsNullOrWhiteSpace(preview) ? "No preview available" : preview;
    }

    private DocumentationStats GenerateStats(List<DocumentationFile> files)
    {
        var stats = new DocumentationStats
        {
            TotalFiles = files.Count,
            TotalCategories = files.Select(f => f.Category).Distinct().Count(),
            TotalSizeBytes = files.Sum(f => f.FileSizeBytes),
            LastScanTime = DateTime.UtcNow,
            FileTypeDistribution = files.GroupBy(f => f.FileType)
                .ToDictionary(g => g.Key, g => g.Count()),
            CategoryDistribution = files.GroupBy(f => f.Category)
                .ToDictionary(g => g.Key, g => g.Count()),
            MostRecentFile = files.OrderByDescending(f => f.LastModified).FirstOrDefault(),
            LargestFile = files.OrderByDescending(f => f.FileSizeBytes).FirstOrDefault(),
            RecentlyModified = files.OrderByDescending(f => f.LastModified)
                .Take(5)
                .Select(f => f.FileName)
                .ToList()
        };

        stats.TotalSizeFormatted = FormatFileSize(stats.TotalSizeBytes);

        return stats;
    }

    private List<DocumentationSearchMatch> SearchInContent(string content, string query, DocumentationFile file)
    {
        var matches = new List<DocumentationSearchMatch>();
        var lines = content.Split('\n');
        var queryLower = query.ToLowerInvariant();

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i];
            var lineLower = line.ToLowerInvariant();

            if (lineLower.Contains(queryLower))
            {
                var match = new DocumentationSearchMatch
                {
                    File = file,
                    LineNumber = i + 1,
                    MatchingLines = new List<string> { line.Trim() },
                    Context = GetContext(lines, i, 2),
                    RelevanceScore = CalculateRelevanceScore(line, query, file.FileName)
                };

                matches.Add(match);
            }
        }

        return matches;
    }

    private string GetContext(string[] lines, int lineIndex, int contextLines)
    {
        var start = Math.Max(0, lineIndex - contextLines);
        var end = Math.Min(lines.Length - 1, lineIndex + contextLines);
        
        var contextLines_list = new List<string>();
        for (int i = start; i <= end; i++)
        {
            var prefix = i == lineIndex ? ">>> " : "    ";
            contextLines_list.Add($"{prefix}{lines[i].Trim()}");
        }

        return string.Join("\n", contextLines_list);
    }

    private double CalculateRelevanceScore(string line, string query, string fileName)
    {
        var score = 0.0;
        var lineLower = line.ToLowerInvariant();
        var queryLower = query.ToLowerInvariant();
        var fileNameLower = fileName.ToLowerInvariant();

        // Exact match in line
        if (lineLower.Contains(queryLower))
            {score += 10.0;}

        // Match in filename
        if (fileNameLower.Contains(queryLower))
            {score += 5.0;}

        // Header match (markdown)
        if (line.TrimStart().StartsWith("#"))
            {score += 3.0;}

        // Beginning of line match
        if (lineLower.TrimStart().StartsWith(queryLower))
            {score += 2.0;}

        return score;
    }

    private string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }

    private int GetCategoryPriority(string categoryName)
    {
        return categoryName switch
        {
            "API" => 1,
            "Setup" => 2,
            "Security" => 3,
            "Database" => 4,
            "Testing" => 5,
            "Reports" => 6,
            "Notifications" => 7,
            "Admin" => 8,
            "Development" => 9,
            _ => 10
        };
    }

    public void Dispose()
    {
        StopFileWatcher();
    }

    private record DocumentationCategoryConfig(string Name, string Description, string Icon);
}