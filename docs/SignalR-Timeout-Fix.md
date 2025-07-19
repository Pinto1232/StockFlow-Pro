# SignalR Timeout Fix and Configuration

## Problem Description

The StockFlow Pro application was experiencing SignalR connection timeouts with the error:

```
System.OperationCanceledException: Client hasn't sent a message/ping within the configured ClientTimeoutInterval.
```

This error occurs when clients don't send any messages or pings within the default 30-second timeout period, causing premature disconnections.

## Solution Overview

The fix involves several components:

1. **Enhanced SignalR Configuration** - Increased timeout intervals and added proper configuration
2. **Client-Side Connection Management** - Implemented heartbeat mechanism and automatic reconnection
3. **Server-Side Hub Improvements** - Added connection tracking and better error handling
4. **Configurable Settings** - Made all timeout settings configurable through appsettings.json

## Changes Made

### 1. SignalR Hub Configuration (Program.cs)

Updated the SignalR configuration with appropriate timeout settings:

```csharp
builder.Services.AddSignalR(options =>
{
    // Configure timeout settings to prevent premature disconnections
    options.ClientTimeoutInterval = TimeSpan.FromMinutes(5); // Increased from 30 seconds
    options.KeepAliveInterval = TimeSpan.FromSeconds(30); // Increased from 15 seconds
    options.HandshakeTimeout = TimeSpan.FromSeconds(30); // Increased from 15 seconds
    
    // Enable detailed errors in development
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    
    // Configure maximum message size (1MB)
    options.MaximumReceiveMessageSize = 1024 * 1024;
    
    // Configure streaming settings
    options.StreamBufferCapacity = 10;
});
```

### 2. Enhanced StockFlowHub

Added connection management features to the SignalR hub:

- **Heartbeat Tracking**: Monitors connection health with ping/pong mechanism
- **Connection Status**: Provides real-time connection statistics
- **Better Error Logging**: Enhanced error messages for debugging
- **Force Reconnection**: Allows manual reconnection for troubleshooting

Key methods added:
- `Ping()` - Client heartbeat method
- `GetConnectionStatus()` - Connection statistics
- `ForceReconnect()` - Manual reconnection trigger
- `SendNotificationToUser()` - Enhanced notification system

### 3. Client-Side Connection Manager

Created a comprehensive JavaScript connection manager (`signalr-connection-manager.js`) with:

- **Automatic Heartbeat**: Sends ping every 25 seconds (less than 30s keep-alive)
- **Exponential Backoff**: Smart reconnection with increasing delays
- **Connection State Management**: Tracks and manages connection states
- **Event Handling**: Comprehensive event system for connection lifecycle
- **Error Recovery**: Automatic recovery from connection failures

### 4. Configuration System

Implemented a configurable system through `SignalROptions` class:

```json
{
  "SignalR": {
    "ClientTimeoutIntervalMinutes": 5,
    "KeepAliveIntervalSeconds": 30,
    "HandshakeTimeoutSeconds": 30,
    "MaximumReceiveMessageSize": 1048576,
    "StreamBufferCapacity": 10,
    "EnableDetailedErrors": false,
    "EnableHeartbeat": true,
    "HeartbeatIntervalSeconds": 25,
    "MaxReconnectAttempts": 5,
    "ReconnectDelayMs": 5000,
    "EnableConnectionLogging": true,
    "ConnectionTimeoutSeconds": 15,
    "EnableAutomaticGroupCleanup": true,
    "GroupCleanupIntervalMinutes": 30,
    "MaxConcurrentConnectionsPerUser": 5,
    "EnableRateLimiting": true,
    "MaxRequestsPerMinute": 60
  }
}
```

## Configuration Parameters

### Timeout Settings
- **ClientTimeoutIntervalMinutes**: Maximum time without client activity (default: 5 minutes)
- **KeepAliveIntervalSeconds**: Server keep-alive ping interval (default: 30 seconds)
- **HandshakeTimeoutSeconds**: Initial connection handshake timeout (default: 30 seconds)
- **HeartbeatIntervalSeconds**: Client heartbeat interval (default: 25 seconds)

### Connection Management
- **MaxReconnectAttempts**: Maximum automatic reconnection attempts (default: 5)
- **ReconnectDelayMs**: Base delay between reconnection attempts (default: 5000ms)
- **MaxConcurrentConnectionsPerUser**: Limit concurrent connections per user (default: 5)

### Performance Settings
- **MaximumReceiveMessageSize**: Maximum message size in bytes (default: 1MB)
- **StreamBufferCapacity**: Buffer capacity for streaming (default: 10)
- **MaxRequestsPerMinute**: Rate limiting for hub methods (default: 60)

### Feature Flags
- **EnableDetailedErrors**: Show detailed error messages (default: false)
- **EnableHeartbeat**: Enable client heartbeat mechanism (default: true)
- **EnableConnectionLogging**: Log connection events (default: true)
- **EnableAutomaticGroupCleanup**: Clean up disconnected user groups (default: true)
- **EnableRateLimiting**: Enable rate limiting for hub methods (default: true)

## Testing

A comprehensive test page is available at `/signalr-test.html` that provides:

- Real-time connection status monitoring
- Connection statistics and uptime tracking
- Manual connection management (connect/disconnect/reconnect)
- Heartbeat testing with ping/pong
- Group management testing
- Notification system testing
- Connection log with detailed events

## Best Practices

### Client-Side
1. **Always implement heartbeat**: Send regular pings to keep connection alive
2. **Handle reconnection gracefully**: Implement exponential backoff for reconnection attempts
3. **Monitor connection state**: Track connection status and respond appropriately
4. **Implement proper error handling**: Handle all connection lifecycle events

### Server-Side
1. **Configure appropriate timeouts**: Balance between responsiveness and stability
2. **Log connection events**: Monitor connection patterns and issues
3. **Implement rate limiting**: Prevent abuse and ensure fair resource usage
4. **Clean up resources**: Remove disconnected users from groups automatically

### Configuration
1. **Environment-specific settings**: Use different timeouts for development vs production
2. **Monitor and adjust**: Track connection metrics and adjust timeouts as needed
3. **Security considerations**: Implement appropriate limits and validation
4. **Performance tuning**: Adjust buffer sizes and limits based on usage patterns

## Troubleshooting

### Common Issues

1. **Still getting timeouts**: 
   - Check if client is sending heartbeats
   - Verify KeepAliveInterval < ClientTimeoutInterval
   - Monitor network connectivity

2. **Frequent reconnections**:
   - Check network stability
   - Verify server resources
   - Review timeout configurations

3. **Performance issues**:
   - Monitor concurrent connections
   - Check message sizes
   - Review rate limiting settings

### Monitoring

Use the test page or implement similar monitoring to track:
- Connection success/failure rates
- Average connection duration
- Reconnection frequency
- Message throughput
- Error patterns

## Migration Notes

When upgrading existing applications:

1. **Update client code**: Implement the new connection manager
2. **Configure timeouts**: Add SignalR section to appsettings.json
3. **Test thoroughly**: Verify all connection scenarios work correctly
4. **Monitor production**: Watch for any new issues after deployment

## Future Enhancements

Potential improvements for the SignalR implementation:

1. **Connection pooling**: Implement connection pooling for better resource management
2. **Load balancing**: Add Redis backplane for multi-server scenarios
3. **Metrics collection**: Implement detailed metrics and monitoring
4. **Circuit breaker**: Add circuit breaker pattern for resilience
5. **Compression**: Enable message compression for better performance