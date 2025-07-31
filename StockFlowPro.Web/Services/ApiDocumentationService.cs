using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Caching.Memory;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Web.Models.Documentation;
using System.Reflection;
using System.Text.Json;
using System.Text;

namespace StockFlowPro.Web.Services;

/// <summary>
/// Service for generating and managing API documentation
/// </summary>
public class ApiDocumentationService : IApiDocumentationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ApiDocumentationService> _logger;
    private const string CACHE_KEY = "api_documentation";
    private const int CACHE_DURATION_MINUTES = 30;

    public ApiDocumentationService(
        IServiceProvider serviceProvider,
        IMemoryCache cache,
        ILogger<ApiDocumentationService> logger)
    {
        _serviceProvider = serviceProvider;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ApiEndpointDocumentation>> GenerateDocumentationAsync()
    {
        return await _cache.GetOrCreateAsync(CACHE_KEY, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CACHE_DURATION_MINUTES);
            
            _logger.LogInformation("Generating API documentation...");
            
            var documentation = new List<ApiEndpointDocumentation>();
            
            using var scope = _serviceProvider.CreateScope();
            var actionDescriptorCollectionProvider = scope.ServiceProvider
                .GetRequiredService<IActionDescriptorCollectionProvider>();

            var actionDescriptors = actionDescriptorCollectionProvider.ActionDescriptors.Items
                .OfType<ControllerActionDescriptor>()
                .Where(ad => ad.ControllerTypeInfo.Namespace?.Contains("Controllers.Api") == true)
                .ToList();

            foreach (var actionDescriptor in actionDescriptors)
            {
                try
                {
                    var endpointDoc = await GenerateEndpointDocumentationAsync(actionDescriptor);
                    if (endpointDoc != null)
                    {
                        documentation.Add(endpointDoc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating documentation for {Controller}.{Action}", 
                        actionDescriptor.ControllerName, actionDescriptor.ActionName);
                }
            }

            _logger.LogInformation("Generated documentation for {Count} endpoints", documentation.Count);
            return documentation;
        }) ?? Enumerable.Empty<ApiEndpointDocumentation>();
    }

    /// <inheritdoc />
    public async Task<ApiEndpointDocumentation?> GetEndpointDocumentationAsync(string method, string path)
    {
        var allDocumentation = await GenerateDocumentationAsync();
        return allDocumentation.FirstOrDefault(d => 
            d.Method.Equals(method, StringComparison.OrdinalIgnoreCase) && 
            d.Path.Equals(path, StringComparison.OrdinalIgnoreCase));
    }

    /// <inheritdoc />
    public async Task<Dictionary<string, IEnumerable<ApiEndpointDocumentation>>> GetDocumentationByCategoryAsync()
    {
        var allDocumentation = await GenerateDocumentationAsync();
        return allDocumentation
            .GroupBy(d => d.Category)
            .ToDictionary(g => g.Key, g => g.AsEnumerable());
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ApiEndpointDocumentation>> GetDocumentationByVersionAsync(string version)
    {
        var allDocumentation = await GenerateDocumentationAsync();
        return allDocumentation.Where(d => d.Version.Equals(version, StringComparison.OrdinalIgnoreCase));
    }

    /// <inheritdoc />
    public async Task<string> GenerateOpenApiSpecificationAsync(string version = "v1")
    {
        var documentation = await GetDocumentationByVersionAsync(version);
        
        var openApiSpec = new
        {
            openapi = "3.0.1",
            info = new
            {
                title = "StockFlow Pro API",
                version = version,
                description = "Comprehensive inventory management API",
                contact = new
                {
                    name = "StockFlow Pro Support",
                    email = "support@stockflowpro.com"
                }
            },
            servers = new[]
            {
                new { url = "/api", description = "API Server" }
            },
            paths = documentation.GroupBy(d => d.Path).ToDictionary(
                g => g.Key,
                g => g.ToDictionary(
                    d => d.Method.ToLowerInvariant(),
                    d => new
                    {
                        summary = d.Summary,
                        description = d.Description,
                        tags = new[] { d.Category },
                        parameters = d.Parameters.Select(p => new
                        {
                            name = p.Name,
                            @in = p.Type,
                            required = p.Required,
                            description = p.Description,
                            schema = new { type = p.DataType }
                        }),
                        requestBody = d.RequestBody != null ? new
                        {
                            required = d.RequestBody.Required,
                            content = new Dictionary<string, object>
                            {
                                [d.RequestBody.ContentType] = new
                                {
                                    schema = new { type = "object" },
                                    example = d.RequestBody.ExampleContent
                                }
                            }
                        } : null,
                        responses = d.Responses.ToDictionary(
                            r => r.StatusCode.ToString(),
                            r => new
                            {
                                description = r.Description,
                                content = new Dictionary<string, object>
                                {
                                    [r.ContentType] = new
                                    {
                                        schema = new { type = "object" },
                                        example = r.ExampleContent
                                    }
                                }
                            }
                        ),
                        security = d.RequiresAuthentication ? new[]
                        {
                            new Dictionary<string, string[]> { ["Cookie"] = Array.Empty<string>() }
                        } : null
                    }
                )
            ),
            components = new
            {
                securitySchemes = new
                {
                    Cookie = new
                    {
                        type = "apiKey",
                        @in = "cookie",
                        name = "StockFlowAuth"
                    }
                }
            }
        };

        return JsonSerializer.Serialize(openApiSpec, new JsonSerializerOptions 
        { 
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }

    /// <inheritdoc />
    public async Task<string> GeneratePostmanCollectionAsync(string version = "v1")
    {
        var documentation = await GetDocumentationByVersionAsync(version);
        
        var collection = new
        {
            info = new
            {
                name = $"StockFlow Pro API {version}",
                description = "Comprehensive inventory management API collection",
                schema = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            auth = new
            {
                type = "apikey",
                apikey = new[]
                {
                    new { key = "key", value = "X-API-Key", type = "string" },
                    new { key = "value", value = "{{api_key}}", type = "string" },
                    new { key = "in", value = "header", type = "string" }
                }
            },
            variable = new[]
            {
                new { key = "base_url", value = "{{base_url}}", type = "string" },
                new { key = "api_key", value = "your_api_key_here", type = "string" }
            },
            item = documentation.GroupBy(d => d.Category).Select(g => new
            {
                name = g.Key,
                item = g.Select(d => new
                {
                    name = d.Summary,
                    request = new
                    {
                        method = d.Method,
                        header = new[]
                        {
                            new { key = "Content-Type", value = "application/json", type = "text" }
                        },
                        url = new
                        {
                            raw = $"{{{{base_url}}}}{d.Path}",
                            host = new[] { "{{base_url}}" },
                            path = d.Path.Split('/').Where(p => !string.IsNullOrEmpty(p)).ToArray()
                        },
                        body = d.RequestBody?.ExampleContent != null ? new
                        {
                            mode = "raw",
                            raw = d.RequestBody.ExampleContent
                        } : null
                    },
                    response = d.Responses.Select(r => new
                    {
                        name = $"{r.StatusCode} - {r.Description}",
                        originalRequest = new
                        {
                            method = d.Method,
                            header = Array.Empty<object>(),
                            url = new
                            {
                                raw = $"{{{{base_url}}}}{d.Path}",
                                host = new[] { "{{base_url}}" },
                                path = d.Path.Split('/').Where(p => !string.IsNullOrEmpty(p)).ToArray()
                            }
                        },
                        status = r.Description,
                        code = r.StatusCode,
                        body = r.ExampleContent ?? ""
                    }).ToArray()
                }).ToArray()
            }).ToArray()
        };

        return JsonSerializer.Serialize(collection, new JsonSerializerOptions 
        { 
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }

    /// <inheritdoc />
    public async Task<string> GenerateMarkdownDocumentationAsync(string version = "v1")
    {
        var documentation = await GetDocumentationByVersionAsync(version);
        var groupedDocs = documentation.GroupBy(d => d.Category);
        
        var markdown = new StringBuilder();
        
        // Header
        markdown.AppendLine($"# StockFlow Pro API Documentation - {version}");
        markdown.AppendLine();
        markdown.AppendLine("## Overview");
        markdown.AppendLine("Comprehensive inventory management API for StockFlow Pro.");
        markdown.AppendLine();
        
        // Table of Contents
        markdown.AppendLine("## Table of Contents");
        foreach (var group in groupedDocs)
        {
            markdown.AppendLine($"- [{group.Key}](#{group.Key.ToLowerInvariant().Replace(" ", "-")})");
        }
        markdown.AppendLine();
        
        // Categories
        foreach (var group in groupedDocs)
        {
            markdown.AppendLine($"## {group.Key}");
            markdown.AppendLine();
            
            foreach (var endpoint in group.OrderBy(e => e.Path))
            {
                markdown.AppendLine($"### {endpoint.Method} {endpoint.Path}");
                markdown.AppendLine();
                markdown.AppendLine($"**Summary:** {endpoint.Summary}");
                markdown.AppendLine();
                
                if (!string.IsNullOrEmpty(endpoint.Description))
                {
                    markdown.AppendLine($"**Description:** {endpoint.Description}");
                    markdown.AppendLine();
                }
                
                // Authentication
                if (endpoint.RequiresAuthentication)
                {
                    markdown.AppendLine("**Authentication:** Required");
                    if (endpoint.RequiredRoles.Any())
                    {
                        markdown.AppendLine($"**Required Roles:** {string.Join(", ", endpoint.RequiredRoles)}");
                    }
                    if (endpoint.RequiredPermissions.Any())
                    {
                        markdown.AppendLine($"**Required Permissions:** {string.Join(", ", endpoint.RequiredPermissions)}");
                    }
                    markdown.AppendLine();
                }
                
                // Parameters
                if (endpoint.Parameters.Any())
                {
                    markdown.AppendLine("**Parameters:**");
                    markdown.AppendLine("| Name | Type | Required | Description |");
                    markdown.AppendLine("|------|------|----------|-------------|");
                    foreach (var param in endpoint.Parameters)
                    {
                        markdown.AppendLine($"| {param.Name} | {param.DataType} | {(param.Required ? "Yes" : "No")} | {param.Description} |");
                    }
                    markdown.AppendLine();
                }
                
                // Request Body
                if (endpoint.RequestBody != null)
                {
                    markdown.AppendLine("**Request Body:**");
                    markdown.AppendLine($"- Content Type: {endpoint.RequestBody.ContentType}");
                    markdown.AppendLine($"- Required: {(endpoint.RequestBody.Required ? "Yes" : "No")}");
                    if (!string.IsNullOrEmpty(endpoint.RequestBody.ExampleContent))
                    {
                        markdown.AppendLine("- Example:");
                        markdown.AppendLine("```json");
                        markdown.AppendLine(endpoint.RequestBody.ExampleContent);
                        markdown.AppendLine("```");
                    }
                    markdown.AppendLine();
                }
                
                // Responses
                if (endpoint.Responses.Any())
                {
                    markdown.AppendLine("**Responses:**");
                    foreach (var response in endpoint.Responses.OrderBy(r => r.StatusCode))
                    {
                        markdown.AppendLine($"- **{response.StatusCode}** - {response.Description}");
                        if (!string.IsNullOrEmpty(response.ExampleContent))
                        {
                            markdown.AppendLine("  ```json");
                            markdown.AppendLine($"  {response.ExampleContent}");
                            markdown.AppendLine("  ```");
                        }
                    }
                    markdown.AppendLine();
                }
                
                // Additional Info
                if (!string.IsNullOrEmpty(endpoint.Notes))
                {
                    markdown.AppendLine($"**Notes:** {endpoint.Notes}");
                    markdown.AppendLine();
                }
                
                if (!string.IsNullOrEmpty(endpoint.DeprecationMessage))
                {
                    markdown.AppendLine($"**⚠️ Deprecated:** {endpoint.DeprecationMessage}");
                    markdown.AppendLine();
                }
                
                if (endpoint.IsExperimental)
                {
                    markdown.AppendLine("**🧪 Experimental:** This endpoint is experimental and may change.");
                    markdown.AppendLine();
                }
                
                markdown.AppendLine("---");
                markdown.AppendLine();
            }
        }
        
        return markdown.ToString();
    }

    /// <inheritdoc />
    public async Task RefreshDocumentationAsync()
    {
        _cache.Remove(CACHE_KEY);
        await GenerateDocumentationAsync();
        _logger.LogInformation("API documentation cache refreshed");
    }

    /// <inheritdoc />
    public async Task<ApiStatistics> GetApiStatisticsAsync()
    {
        var documentation = await GenerateDocumentationAsync();
        
        return new ApiStatistics
        {
            TotalEndpoints = documentation.Count(),
            EndpointsByMethod = documentation.GroupBy(d => d.Method)
                .ToDictionary(g => g.Key, g => g.Count()),
            EndpointsByCategory = documentation.GroupBy(d => d.Category)
                .ToDictionary(g => g.Key, g => g.Count()),
            EndpointsByVersion = documentation.GroupBy(d => d.Version)
                .ToDictionary(g => g.Key, g => g.Count()),
            AuthenticatedEndpoints = documentation.Count(d => d.RequiresAuthentication),
            DeprecatedEndpoints = documentation.Count(d => !string.IsNullOrEmpty(d.DeprecationMessage)),
            ExperimentalEndpoints = documentation.Count(d => d.IsExperimental),
            LastUpdated = DateTime.UtcNow
        };
    }

    private Task<ApiEndpointDocumentation?> GenerateEndpointDocumentationAsync(ControllerActionDescriptor actionDescriptor)
    {
        try
        {
            var methodInfo = actionDescriptor.MethodInfo;
            var controllerType = actionDescriptor.ControllerTypeInfo;
            
            // Get route information
            var routeAttribute = methodInfo.GetCustomAttribute<RouteAttribute>() 
                ?? controllerType.GetCustomAttribute<RouteAttribute>();
            
            var httpMethodAttribute = methodInfo.GetCustomAttributes()
                .FirstOrDefault(attr => attr.GetType().Name.StartsWith("Http") && attr.GetType().Name.EndsWith("Attribute"));
            
            if (httpMethodAttribute == null) 
            {
                return Task.FromResult<ApiEndpointDocumentation?>(null);
            }
            
            var httpMethod = httpMethodAttribute.GetType().Name.Replace("Http", "").Replace("Attribute", "").ToUpperInvariant();
            var path = GetEndpointPath(actionDescriptor, routeAttribute);
            
            // Get documentation attribute
            var docAttribute = methodInfo.GetCustomAttribute<ApiDocumentationAttribute>()
                ?? controllerType.GetCustomAttribute<ApiDocumentationAttribute>();
            
            // Get authorization info
            var authAttributes = methodInfo.GetCustomAttributes<AuthorizeAttribute>()
                .Concat(controllerType.GetCustomAttributes<AuthorizeAttribute>())
                .ToList();
            
            var allowAnonymous = methodInfo.GetCustomAttribute<AllowAnonymousAttribute>() != null;
            
            var documentation = new ApiEndpointDocumentation
            {
                Id = $"{controllerType.Name}.{methodInfo.Name}",
                Method = httpMethod,
                Path = path,
                Summary = docAttribute?.Summary ?? $"{httpMethod} {path}",
                Description = docAttribute?.Description ?? "",
                Version = docAttribute?.Version ?? "v1",
                Category = docAttribute?.Category ?? actionDescriptor.ControllerName,
                ControllerName = actionDescriptor.ControllerName,
                ActionName = actionDescriptor.ActionName,
                RequiresAuthentication = !allowAnonymous && authAttributes.Any(),
                RequiredRoles = authAttributes.SelectMany(a => a.Roles?.Split(',') ?? Array.Empty<string>())
                    .Where(r => !string.IsNullOrWhiteSpace(r))
                    .Select(r => r.Trim())
                    .Distinct()
                    .ToList(),
                RequiredPermissions = docAttribute?.RequiredPermissions?.ToList() ?? new List<string>(),
                Notes = docAttribute?.Notes,
                DeprecationMessage = docAttribute?.DeprecationMessage,
                IsExperimental = docAttribute?.IsExperimental ?? false,
                RateLimit = docAttribute?.RateLimit,
                CacheInfo = docAttribute?.CacheInfo,
                LastUpdated = DateTime.UtcNow
            };
            
            // Add parameters
            documentation.Parameters = GetParameterDocumentation(actionDescriptor);
            
            // Add request body documentation
            documentation.RequestBody = GetRequestBodyDocumentation(methodInfo);
            
            // Add response documentation
            documentation.Responses = GetResponseDocumentation(methodInfo);
            
            // Add examples
            documentation.Examples = GetExampleDocumentation(methodInfo);
            
            // Add tags
            documentation.Tags = new List<string> { documentation.Category };
            if (documentation.IsExperimental)
            {
                documentation.Tags.Add("Experimental");
            }
            if (!string.IsNullOrEmpty(documentation.DeprecationMessage))
            {
                documentation.Tags.Add("Deprecated");
            }
            
            return Task.FromResult<ApiEndpointDocumentation?>(documentation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating documentation for {Controller}.{Action}", 
                actionDescriptor.ControllerName, actionDescriptor.ActionName);
            return Task.FromResult<ApiEndpointDocumentation?>(null);
        }
    }

    private static string GetEndpointPath(ControllerActionDescriptor actionDescriptor, RouteAttribute? routeAttribute)
    {
        if (routeAttribute?.Template != null)
        {
            return "/" + routeAttribute.Template.TrimStart('/');
        }
        
        var controllerName = actionDescriptor.ControllerName.ToLowerInvariant();
        var actionName = actionDescriptor.ActionName.ToLowerInvariant();
        
        return $"/api/{controllerName}/{actionName}";
    }

    private static List<ApiParameterDocumentation> GetParameterDocumentation(ControllerActionDescriptor actionDescriptor)
    {
        var parameters = new List<ApiParameterDocumentation>();
        
        foreach (var parameter in actionDescriptor.Parameters)
        {
            var paramDoc = new ApiParameterDocumentation
            {
                Name = parameter.Name,
                DataType = GetSimpleTypeName(parameter.ParameterType),
                Description = $"Parameter of type {parameter.ParameterType.Name}",
                Required = !parameter.ParameterType.IsNullable() && parameter.ParameterType != typeof(string)
            };
            
            // Determine parameter type based on binding source
            if (parameter.BindingInfo?.BindingSource?.Id == "Path")
            {
                paramDoc.Type = "path";
                paramDoc.Required = true;
            }
            else if (parameter.BindingInfo?.BindingSource?.Id == "Query")
            {
                paramDoc.Type = "query";
            }
            else if (parameter.BindingInfo?.BindingSource?.Id == "Header")
            {
                paramDoc.Type = "header";
            }
            else if (parameter.BindingInfo?.BindingSource?.Id == "Form")
            {
                paramDoc.Type = "form";
            }
            else
            {
                // Default to query for simple types, body for complex types
                paramDoc.Type = parameter.ParameterType.IsPrimitive || 
                               parameter.ParameterType == typeof(string) || 
                               parameter.ParameterType == typeof(DateTime) ||
                               parameter.ParameterType == typeof(Guid) ? "query" : "body";
            }
            
            parameters.Add(paramDoc);
        }
        
        return parameters;
    }

    private static ApiRequestBodyDocumentation? GetRequestBodyDocumentation(MethodInfo methodInfo)
    {
        var parameters = methodInfo.GetParameters();
        var bodyParameter = parameters.FirstOrDefault(p => 
            !p.ParameterType.IsPrimitive && 
            p.ParameterType != typeof(string) && 
            p.ParameterType != typeof(DateTime) &&
            p.ParameterType != typeof(Guid) &&
            !p.ParameterType.IsEnum);
        
        if (bodyParameter == null) 
        {
            return null;
        }
        
        return new ApiRequestBodyDocumentation
        {
            ContentType = "application/json",
            Description = $"Request body of type {bodyParameter.ParameterType.Name}",
            Required = true,
            SchemaType = bodyParameter.ParameterType.Name
        };
    }

    private static List<ApiResponseDocumentation> GetResponseDocumentation(MethodInfo methodInfo)
    {
        var responses = new List<ApiResponseDocumentation>();
        
        // Add default success response
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 200,
            Description = "Success",
            ContentType = "application/json",
            SchemaType = GetReturnTypeName(methodInfo.ReturnType)
        });
        
        // Add common error responses
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 400,
            Description = "Bad Request",
            ContentType = "application/json"
        });
        
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 401,
            Description = "Unauthorized",
            ContentType = "application/json"
        });
        
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 403,
            Description = "Forbidden",
            ContentType = "application/json"
        });
        
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 404,
            Description = "Not Found",
            ContentType = "application/json"
        });
        
        responses.Add(new ApiResponseDocumentation
        {
            StatusCode = 500,
            Description = "Internal Server Error",
            ContentType = "application/json"
        });
        
        return responses;
    }

    private static List<ApiExampleDocumentation> GetExampleDocumentation(MethodInfo methodInfo)
    {
        var examples = new List<ApiExampleDocumentation>();
        
        var exampleAttributes = methodInfo.GetCustomAttributes<ApiExampleAttribute>();
        foreach (var example in exampleAttributes)
        {
            examples.Add(new ApiExampleDocumentation
            {
                Name = example.Name,
                Description = example.Description,
                Type = example.Type.ToString(),
                StatusCode = example.Type == ExampleType.Response || example.Type == ExampleType.Error 
                    ? example.StatusCode : null,
                ContentType = example.ContentType,
                Content = example.Content
            });
        }
        
        return examples;
    }

    private static string GetSimpleTypeName(Type type)
    {
        if (type == typeof(string)) 
        {
            return "string";
        }
        if (type == typeof(int) || type == typeof(int?))
        { 
            return "integer";
        }
        if (type == typeof(long) || type == typeof(long?))
        { 
            return "integer";
        }
        if (type == typeof(bool) || type == typeof(bool?)) 
        {
            return "boolean";
        }
        if (type == typeof(DateTime) || type == typeof(DateTime?)) 
        {
            return "string";
        }
        if (type == typeof(Guid) || type == typeof(Guid?)) 
        {
            return "string";
        }
        if (type == typeof(decimal) || type == typeof(decimal?) || 
            type == typeof(double) || type == typeof(double?) ||
            type == typeof(float) || type == typeof(float?)) 
        {
            return "number";
        }
        if (type.IsEnum) 
        {
            return "string";
        }
        
        return "object";
    }

    private static string GetReturnTypeName(Type returnType)
    {
        if (returnType.IsGenericType)
        {
            var genericType = returnType.GetGenericTypeDefinition();
            if (genericType == typeof(Task<>) || genericType == typeof(ActionResult<>))
            {
                return GetReturnTypeName(returnType.GetGenericArguments()[0]);
            }
        }
        
        return GetSimpleTypeName(returnType);
    }
}

/// <summary>
/// Extension methods for type checking
/// </summary>
public static class TypeExtensions
{
    /// <summary>
    /// Determines if a type is nullable
    /// </summary>
    /// <param name="type">The type to check</param>
    /// <returns>True if the type is nullable</returns>
    public static bool IsNullable(this Type type)
    {
        return Nullable.GetUnderlyingType(type) != null;
    }
}