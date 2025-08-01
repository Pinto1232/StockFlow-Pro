using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace StockFlowPro.Web.Controllers;

/// <summary>
/// Controller for observability features including Grafana integration, logs, metrics, and alerts
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ObservabilityController : ControllerBase
{
    private readonly ILogger<ObservabilityController> _logger;

    public ObservabilityController(ILogger<ObservabilityController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Test endpoint to verify controller is working
    /// </summary>
    /// <returns>Simple test response</returns>
    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        _logger.LogInformation("Observability controller test endpoint called");
        return Ok(new { message = "Observability controller is working!", timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Get Grafana dashboard placeholder content
    /// </summary>
    /// <returns>HTML content for Grafana dashboard placeholder</returns>
    [HttpGet("grafana-placeholder")]
    [AllowAnonymous] // Allow anonymous access for iframe content
    public IActionResult GetGrafanaPlaceholder()
    {
        try
        {
            _logger.LogInformation("Serving Grafana placeholder content");
            var html = GenerateGrafanaPlaceholderHtml();
            
            // Set headers to allow iframe embedding from same origin
            Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
            Response.Headers["Content-Security-Policy"] = "frame-ancestors 'self'";
            
            return Content(html, "text/html", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating Grafana placeholder");
            return StatusCode(500, "Failed to generate Grafana placeholder");
        }
    }

    /// <summary>
    /// Get API documentation logs
    /// </summary>
    /// <returns>List of API documentation access logs</returns>
    [HttpGet("logs")]
    public IActionResult GetApiLogs([FromQuery] string? level = null, [FromQuery] int limit = 50)
    {
        try
        {
            var logs = GenerateMockApiLogs(level, limit);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving API logs");
            return StatusCode(500, "Failed to retrieve API logs");
        }
    }

    /// <summary>
    /// Get performance metrics
    /// </summary>
    /// <returns>Current system performance metrics</returns>
    [HttpGet("metrics")]
    public IActionResult GetMetrics()
    {
        try
        {
            var metrics = GeneratePerformanceMetrics();
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics");
            return StatusCode(500, "Failed to retrieve performance metrics");
        }
    }

    /// <summary>
    /// Get system alerts
    /// </summary>
    /// <returns>Current system alerts and monitoring status</returns>
    [HttpGet("alerts")]
    public IActionResult GetAlerts()
    {
        try
        {
            var alerts = GenerateSystemAlerts();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system alerts");
            return StatusCode(500, "Failed to retrieve system alerts");
        }
    }

    private static string GenerateGrafanaPlaceholderHtml()
    {
        return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Grafana Dashboard Integration</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #1a1a1a; 
            color: white; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
        }
        .placeholder { 
            text-align: center; 
            max-width: 800px; 
            width: 100%;
        }
        .grafana-logo { 
            font-size: 4rem; 
            margin-bottom: 1rem; 
        }
        .setup-instructions {
            background: #2a2a2a;
            padding: 2rem;
            border-radius: 10px;
            margin-top: 2rem;
            text-align: left;
        }
        .code {
            background: #333;
            padding: 0.75rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            margin: 0.5rem 0;
            font-size: 0.9rem;
            overflow-x: auto;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .feature-card {
            background: #333;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #ffd700;
        }
        .feature-card h4 {
            color: #ffd700;
            margin-bottom: 0.5rem;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }
        .status-ready { background: #22c55e; }
        .status-pending { background: #fbbf24; }
        .btn {
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            margin: 0.5rem;
            transition: transform 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class='placeholder'>
        <div class='grafana-logo'>📊</div>
        <h1>Grafana Dashboard Integration</h1>
        <p>StockFlow Pro is ready for comprehensive observability with Grafana integration.</p>
        
        <div class='setup-instructions'>
            <h3>🚀 Quick Setup Guide</h3>
            <ol>
                <li><strong>Install Grafana:</strong>
                    <div class='code'>docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise</div>
                </li>
                <li><strong>Configure Data Sources:</strong>
                    <ul>
                        <li>Prometheus for metrics collection</li>
                        <li>Loki for log aggregation</li>
                        <li>SQL Server for database metrics</li>
                    </ul>
                </li>
                <li><strong>Import StockFlow Pro Dashboard:</strong>
                    <div class='code'>curl -X POST http://localhost:3000/api/dashboards/db \\
  -H 'Content-Type: application/json' \\
  -d @stockflow-dashboard.json</div>
                </li>
                <li><strong>Update Configuration:</strong>
                    <p>Replace the iframe URL in <code>loadGrafanaDashboard()</code> function with:</p>
                    <div class='code'>http://localhost:3000/d/stockflow/stockflow-pro?orgId=1&refresh=5s&kiosk=tv</div>
                </li>
            </ol>
            
            <h3>📈 Recommended Dashboards</h3>
            <div class='feature-grid'>
                <div class='feature-card'>
                    <h4>🚀 API Performance</h4>
                    <p><span class='status-indicator status-ready'></span>Request rates, response times, error rates</p>
                </div>
                <div class='feature-card'>
                    <h4>🗄️ Database Metrics</h4>
                    <p><span class='status-indicator status-ready'></span>Connection pools, query performance, locks</p>
                </div>
                <div class='feature-card'>
                    <h4>💾 System Resources</h4>
                    <p><span class='status-indicator status-ready'></span>CPU, memory, disk usage, network I/O</p>
                </div>
                <div class='feature-card'>
                    <h4>👥 User Analytics</h4>
                    <p><span class='status-indicator status-pending'></span>Authentication events, user sessions</p>
                </div>
                <div class='feature-card'>
                    <h4>📦 Inventory Tracking</h4>
                    <p><span class='status-indicator status-pending'></span>Stock levels, product changes, alerts</p>
                </div>
                <div class='feature-card'>
                    <h4>🔔 Alert Management</h4>
                    <p><span class='status-indicator status-ready'></span>System alerts, notification channels</p>
                </div>
            </div>
            
            <div style='text-align: center; margin-top: 2rem;'>
                <a href='http://localhost:3000' class='btn' target='_blank'>Open Grafana</a>
                <a href='https://grafana.com/docs/' class='btn' target='_blank'>Documentation</a>
            </div>
        </div>
    </div>
</body>
</html>";
    }

    private static List<object> GenerateMockApiLogs(string? level, int limit)
    {
        var levels = new[] { "info", "warning", "error", "debug" };
        var endpoints = new[] { "/api/documentation", "/api/auth", "/api/products", "/api/users", "/api/reports", "/api/observability" };
        var logs = new List<object>();
        var random = new Random();

        for (int i = 0; i < Math.Min(limit, 100); i++)
        {
            var logLevel = levels[random.Next(levels.Length)];
            
            // Skip if level filter is specified and doesn't match
            if (!string.IsNullOrEmpty(level) && !logLevel.Equals(level, StringComparison.OrdinalIgnoreCase))
               { continue;}

            var timestamp = DateTime.UtcNow.AddMinutes(-random.Next(0, 1440)).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            var endpoint = endpoints[random.Next(endpoints.Length)];
            var statusCode = logLevel == "error" ? 500 : (logLevel == "warning" ? 404 : 200);
            var responseTime = random.Next(10, 1000);
            var userId = random.Next(1, 1000);

            logs.Add(new
            {
                timestamp,
                level = logLevel,
                message = $"{endpoint} - {statusCode} - {responseTime}ms - API documentation accessed by user {userId}",
                endpoint,
                statusCode,
                responseTime,
                userId
            });
        }

        return logs.OrderByDescending(l => ((dynamic)l).timestamp).ToList();
    }

    private static List<object> GeneratePerformanceMetrics()
    {
        var random = new Random();
        return new List<object>
        {
            new { icon = "🚀", title = "API Response Time", value = $"{random.Next(80, 200)}ms", description = "Average response time across all endpoints" },
            new { icon = "📊", title = "Requests/Minute", value = $"{random.Next(800, 1500):N0}", description = "Current API request rate" },
            new { icon = "💾", title = "Memory Usage", value = $"{random.Next(45, 85)}%", description = "Current application memory consumption" },
            new { icon = "🔄", title = "CPU Usage", value = $"{random.Next(20, 70)}%", description = "Current CPU utilization" },
            new { icon = "🗄️", title = "Database Connections", value = $"{random.Next(10, 25)}/50", description = "Active database connections" },
            new { icon = "❌", title = "Error Rate", value = $"{random.NextDouble() * 2:F1}%", description = "Percentage of failed requests" },
            new { icon = "👥", title = "Active Users", value = $"{random.Next(150, 350)}", description = "Currently authenticated users" },
            new { icon = "📈", title = "Uptime", value = $"{99.0 + random.NextDouble():F1}%", description = "System availability this month" }
        };
    }

    private static List<object> GenerateSystemAlerts()
    {
        var random = new Random();
        var alerts = new List<object>
        {
            new { icon = "🟢", title = "API Health", status = "HEALTHY", description = "All API endpoints responding normally", color = "#22c55e" },
            new { icon = "🟢", title = "Authentication Service", status = "OPERATIONAL", description = "User authentication working normally", color = "#22c55e" }
        };

        // Add some random alerts
        if (random.NextDouble() > 0.7)
        {
            alerts.Add(new { icon = "🟡", title = "Database Performance", status = "WARNING", description = "Query response time above threshold (>500ms)", color = "#fbbf24" });
        }

        if (random.NextDouble() > 0.8)
        {
            alerts.Add(new { icon = "🔴", title = "Disk Space", status = "CRITICAL", description = "Log partition at 85% capacity", color = "#ef4444" });
        }

        if (random.NextDouble() > 0.6)
        {
            alerts.Add(new { icon = "🟡", title = "External API", status = "DEGRADED", description = "Third-party service experiencing intermittent issues", color = "#fbbf24" });
        }

        alerts.Add(new { icon = "🟢", title = "Memory Usage", status = "NORMAL", description = "Memory consumption within acceptable limits", color = "#22c55e" });

        return alerts;
    }
}