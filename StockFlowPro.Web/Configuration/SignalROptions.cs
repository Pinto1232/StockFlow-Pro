namespace StockFlowPro.Web.Configuration;

/// <summary>
/// Configuration options for SignalR hub settings
/// </summary>
public class SignalROptions
{
    public const string SectionName = "SignalR";

    /// <summary>
    /// Client timeout interval in minutes (default: 5 minutes)
    /// </summary>
    public int ClientTimeoutIntervalMinutes { get; set; } = 5;

    /// <summary>
    /// Keep alive interval in seconds (default: 30 seconds)
    /// </summary>
    public int KeepAliveIntervalSeconds { get; set; } = 30;

    /// <summary>
    /// Handshake timeout in seconds (default: 30 seconds)
    /// </summary>
    public int HandshakeTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Maximum receive message size in bytes (default: 1MB)
    /// </summary>
    public long MaximumReceiveMessageSize { get; set; } = 1024 * 1024;

    /// <summary>
    /// Stream buffer capacity (default: 10)
    /// </summary>
    public int StreamBufferCapacity { get; set; } = 10;

    /// <summary>
    /// Enable detailed errors in development (default: false)
    /// </summary>
    public bool EnableDetailedErrors { get; set; } = false;

    /// <summary>
    /// Enable connection heartbeat monitoring (default: true)
    /// </summary>
    public bool EnableHeartbeat { get; set; } = true;

    /// <summary>
    /// Heartbeat interval in seconds (default: 25 seconds)
    /// </summary>
    public int HeartbeatIntervalSeconds { get; set; } = 25;

    /// <summary>
    /// Maximum number of automatic reconnection attempts (default: 5)
    /// </summary>
    public int MaxReconnectAttempts { get; set; } = 5;

    /// <summary>
    /// Base reconnection delay in milliseconds (default: 5000ms)
    /// </summary>
    public int ReconnectDelayMs { get; set; } = 5000;

    /// <summary>
    /// Enable connection logging (default: true)
    /// </summary>
    public bool EnableConnectionLogging { get; set; } = true;

    /// <summary>
    /// Connection timeout for initial handshake in seconds (default: 15 seconds)
    /// </summary>
    public int ConnectionTimeoutSeconds { get; set; } = 15;

    /// <summary>
    /// Enable automatic group cleanup for disconnected users (default: true)
    /// </summary>
    public bool EnableAutomaticGroupCleanup { get; set; } = true;

    /// <summary>
    /// Group cleanup interval in minutes (default: 30 minutes)
    /// </summary>
    public int GroupCleanupIntervalMinutes { get; set; } = 30;

    /// <summary>
    /// Maximum concurrent connections per user (default: 5)
    /// </summary>
    public int MaxConcurrentConnectionsPerUser { get; set; } = 5;

    /// <summary>
    /// Enable rate limiting for hub methods (default: true)
    /// </summary>
    public bool EnableRateLimiting { get; set; } = true;

    /// <summary>
    /// Rate limit: maximum requests per minute per connection (default: 60)
    /// </summary>
    public int MaxRequestsPerMinute { get; set; } = 60;

    /// <summary>
    /// Convert to TimeSpan for ClientTimeoutInterval
    /// </summary>
    public TimeSpan ClientTimeoutInterval => TimeSpan.FromMinutes(ClientTimeoutIntervalMinutes);

    /// <summary>
    /// Convert to TimeSpan for KeepAliveInterval
    /// </summary>
    public TimeSpan KeepAliveInterval => TimeSpan.FromSeconds(KeepAliveIntervalSeconds);

    /// <summary>
    /// Convert to TimeSpan for HandshakeTimeout
    /// </summary>
    public TimeSpan HandshakeTimeout => TimeSpan.FromSeconds(HandshakeTimeoutSeconds);

    /// <summary>
    /// Convert to TimeSpan for HeartbeatInterval
    /// </summary>
    public TimeSpan HeartbeatInterval => TimeSpan.FromSeconds(HeartbeatIntervalSeconds);

    /// <summary>
    /// Convert to TimeSpan for ReconnectDelay
    /// </summary>
    public TimeSpan ReconnectDelay => TimeSpan.FromMilliseconds(ReconnectDelayMs);

    /// <summary>
    /// Convert to TimeSpan for ConnectionTimeout
    /// </summary>
    public TimeSpan ConnectionTimeout => TimeSpan.FromSeconds(ConnectionTimeoutSeconds);

    /// <summary>
    /// Convert to TimeSpan for GroupCleanupInterval
    /// </summary>
    public TimeSpan GroupCleanupInterval => TimeSpan.FromMinutes(GroupCleanupIntervalMinutes);

    /// <summary>
    /// Validate configuration values
    /// </summary>
    public void Validate()
    {
        if (ClientTimeoutIntervalMinutes <= 0)
            throw new ArgumentException("ClientTimeoutIntervalMinutes must be greater than 0");

        if (KeepAliveIntervalSeconds <= 0)
            throw new ArgumentException("KeepAliveIntervalSeconds must be greater than 0");

        if (HandshakeTimeoutSeconds <= 0)
            throw new ArgumentException("HandshakeTimeoutSeconds must be greater than 0");

        if (MaximumReceiveMessageSize <= 0)
            throw new ArgumentException("MaximumReceiveMessageSize must be greater than 0");

        if (StreamBufferCapacity <= 0)
            throw new ArgumentException("StreamBufferCapacity must be greater than 0");

        if (HeartbeatIntervalSeconds <= 0)
            throw new ArgumentException("HeartbeatIntervalSeconds must be greater than 0");

        if (MaxReconnectAttempts < 0)
            throw new ArgumentException("MaxReconnectAttempts must be greater than or equal to 0");

        if (ReconnectDelayMs <= 0)
            throw new ArgumentException("ReconnectDelayMs must be greater than 0");

        if (ConnectionTimeoutSeconds <= 0)
            throw new ArgumentException("ConnectionTimeoutSeconds must be greater than 0");

        if (GroupCleanupIntervalMinutes <= 0)
            throw new ArgumentException("GroupCleanupIntervalMinutes must be greater than 0");

        if (MaxConcurrentConnectionsPerUser <= 0)
            throw new ArgumentException("MaxConcurrentConnectionsPerUser must be greater than 0");

        if (MaxRequestsPerMinute <= 0)
            throw new ArgumentException("MaxRequestsPerMinute must be greater than 0");

        // Ensure KeepAlive is less than ClientTimeout
        if (KeepAliveInterval >= ClientTimeoutInterval)
            throw new ArgumentException("KeepAliveInterval must be less than ClientTimeoutInterval");

        // Ensure Heartbeat is less than KeepAlive
        if (HeartbeatInterval >= KeepAliveInterval)
            throw new ArgumentException("HeartbeatInterval should be less than KeepAliveInterval");
    }
}