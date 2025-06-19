using Microsoft.EntityFrameworkCore;
using StockFlowPro.Infrastructure.Data;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;
using MediatR;
using FluentValidation;
using Microsoft.Extensions.Http;

namespace StockFlowPro.Web.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOptimizedServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection"), sqliteOptions =>
            {
                sqliteOptions.CommandTimeout(30);
            });
            
            options.EnableSensitiveDataLogging(false);
            options.EnableServiceProviderCaching();
            options.EnableDetailedErrors(false);
            
            options.ConfigureWarnings(warnings =>
            {
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.RowLimitingOperationWithoutOrderByWarning);
            });
        });

        services.AddMemoryCache(options =>
        {
            options.SizeLimit = 1000;
            options.CompactionPercentage = 0.25;
        });

        services.AddResponseCaching(options =>
        {
            options.MaximumBodySize = 1024 * 1024;
            options.UseCaseSensitivePaths = false;
        });

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.PropertyNameCaseInsensitive = true;
        });

        services.AddHttpClient();
        services.Configure<HttpClientFactoryOptions>(options =>
        {
            options.HandlerLifetime = TimeSpan.FromMinutes(5);
        });

        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
        });

        return services;
    }

    public static IServiceCollection AddOptimizedMediatR(this IServiceCollection services)
    {
        services.AddMediatR(typeof(StockFlowPro.Application.Commands.Users.CreateUserCommand).Assembly);

        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));

        return services;
    }
}

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();
            
            if (stopwatch.ElapsedMilliseconds > 1000)
            {
                _logger.LogWarning("Slow request: {RequestName} took {ElapsedMilliseconds}ms", 
                    requestName, stopwatch.ElapsedMilliseconds);
            }
            
            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Request {RequestName} failed after {ElapsedMilliseconds}ms", 
                requestName, stopwatch.ElapsedMilliseconds);
            throw new InvalidOperationException($"Request {requestName} failed after {stopwatch.ElapsedMilliseconds}ms. See inner exception for details.", ex);
        }
    }
}

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);
            var validationResults = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, cancellationToken)));
            var failures = validationResults.SelectMany(r => r.Errors).Where(f => f != null).ToList();

            if (failures.Count != 0)
            {
                var errorMessage = $"Validation failed for {typeof(TRequest).Name}: {string.Join(", ", failures.Select(f => f.ErrorMessage))}";
                throw new ValidationException(errorMessage, failures);
            }
        }

        return await next();
    }
}

public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(IMemoryCache cache, ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (request is IQuery<TResponse> query)
        {
            var cacheKey = $"{typeof(TRequest).Name}_{query.GetHashCode()}";
            
            if (_cache.TryGetValue(cacheKey, out TResponse? cachedResponse))
            {
                _logger.LogDebug("Cache hit for {RequestName}", typeof(TRequest).Name);
                return cachedResponse!;
            }

            try
            {
                var response = await next();
                
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                    Size = 1
                };
                
                _cache.Set(cacheKey, response, cacheOptions);
                _logger.LogDebug("Cached response for {RequestName}", typeof(TRequest).Name);
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute and cache request {RequestName}", typeof(TRequest).Name);
                throw new InvalidOperationException($"Failed to execute cacheable request {typeof(TRequest).Name}. See inner exception for details.", ex);
            }
        }

        return await next();
    }
}

public interface IQuery<out TResponse> : IRequest<TResponse>
{
}
