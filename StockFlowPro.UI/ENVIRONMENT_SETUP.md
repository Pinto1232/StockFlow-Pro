# Environment Configuration Guide

This guide explains how to configure and use different environments in the StockFlow-Pro frontend application.

## Overview

The application supports four different environments:
- **Development** (`development`) - Local development with hot reload
- **Staging** (`staging`) - Pre-production testing environment
- **Production** (`production`) - Live production environment
- **Docker** (`docker`) - Docker containerized development

## Environment Files

### File Priority (Vite's environment file loading order)
1. `.env.local` (always loaded, ignored by git)
2. `.env.[mode]` (e.g., `.env.production`, `.env.staging`)
3. `.env` (default fallback)

### Available Environment Files

- **`.env`** - Default configuration (development settings)
- **`.env.development`** - Development-specific settings
- **`.env.staging`** - Staging environment settings
- **`.env.production`** - Production environment settings
- **`.env.docker`** - Docker container settings
- **`.env.local`** - Local overrides (create this file for personal settings)

## Environment Variables

### Core Configuration
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_WS_URL` - WebSocket URL for SignalR
- `VITE_NODE_ENV` - Node environment (development/production)
- `VITE_APP_ENV` - Application environment (development/staging/production/docker)

### Feature Flags
- `VITE_ENABLE_DEBUG` - Enable debug logging
- `VITE_ENABLE_DEVTOOLS` - Enable development tools
- `VITE_ENABLE_MOCK_DATA` - Enable mock data (for testing)

### Logging
- `VITE_LOG_LEVEL` - Logging level (debug/info/warn/error)
- `VITE_ENABLE_API_LOGGING` - Enable API request/response logging

### Performance
- `VITE_API_TIMEOUT` - API request timeout in milliseconds
- `VITE_ENABLE_CACHE` - Enable client-side caching

### Security
- `VITE_ENABLE_HTTPS` - Force HTTPS connections
- `VITE_STRICT_MODE` - Enable strict security mode

### External Services
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_ANALYTICS_ID` - Analytics tracking ID

## Usage

### Development Scripts

```bash
# Development (default)
npm run dev

# Development with staging config
npm run dev:staging

# Development with production config
npm run dev:production

# Development with docker config
npm run dev:docker
```

### Build Scripts

```bash
# Production build (default)
npm run build

# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build (explicit)
npm run build:production

# Docker build
npm run build:docker
```

### Preview Scripts

```bash
# Preview production build
npm run preview

# Preview staging build
npm run preview:staging

# Preview production build (explicit)
npm run preview:production
```

### Utility Scripts

```bash
# Check current environment variables
npm run env:check
```

## Environment-Specific Configurations

### Development
- **API URL**: `http://localhost:5131/api`
- **WebSocket**: `ws://localhost:5131/stockflowhub`
- **Debug**: Enabled
- **DevTools**: Enabled
- **API Logging**: Enabled
- **Cache**: Disabled
- **HTTPS**: Disabled

### Staging
- **API URL**: `https://api-staging.stockflow.pro/api`
- **WebSocket**: `wss://api-staging.stockflow.pro/stockflowhub`
- **Debug**: Enabled
- **DevTools**: Enabled
- **API Logging**: Enabled
- **Cache**: Enabled
- **HTTPS**: Enabled

### Production
- **API URL**: `https://api.stockflow.pro/api`
- **WebSocket**: `wss://api.stockflow.pro/stockflowhub`
- **Debug**: Disabled
- **DevTools**: Disabled
- **API Logging**: Disabled
- **Cache**: Enabled
- **HTTPS**: Enabled

### Docker
- **API URL**: `http://localhost:5000/api`
- **WebSocket**: `ws://localhost:5000/stockflowhub`
- **Debug**: Enabled
- **DevTools**: Enabled
- **API Logging**: Enabled
- **Cache**: Disabled
- **HTTPS**: Disabled

## Configuration Usage in Code

### Import Configuration
```typescript
import { config, isDevelopment, isStaging, isProduction } from '../config/environment';
```

### Use Configuration
```typescript
// Access configuration values
const apiUrl = config.API_BASE_URL;
const timeout = config.API_TIMEOUT;

// Environment checks
if (isDevelopment) {
  console.log('Running in development mode');
}

// Debug logging (only shows in development/staging)
debugLog('This is a debug message', { data: 'example' });

// API logging (configurable per environment)
apiLog('API request made', { url: '/api/products' });
```

### Environment Info Component
```typescript
import { EnvironmentInfo, EnvironmentDetails } from '../components/Debug/EnvironmentInfo';

// Show environment badge
<EnvironmentInfo />

// Show detailed environment info (development only)
<EnvironmentDetails />
```

## Local Development Setup

### 1. Create Local Override File
Create `.env.local` for personal settings (this file is ignored by git):

```bash
# .env.local - Personal development settings
VITE_API_BASE_URL=http://localhost:5131/api
VITE_ENABLE_DEBUG=true
VITE_ENABLE_API_LOGGING=true
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Verify Configuration
- Check the browser console for environment configuration logs
- Use the `npm run env:check` command to see current variables
- Look for the environment badge in the UI (development/staging only)

## Deployment

### Staging Deployment
```bash
# Build for staging
npm run build:staging

# Preview staging build locally
npm run preview:staging
```

### Production Deployment
```bash
# Build for production
npm run build:production

# Preview production build locally
npm run preview:production
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure variables start with `VITE_`
   - Check file naming (`.env.development`, not `.env.dev`)
   - Restart the development server after changing environment files

2. **API connection issues**
   - Verify `VITE_API_BASE_URL` is correct for your environment
   - Check if the backend is running on the specified port
   - Ensure CORS is configured properly on the backend

3. **SignalR connection issues**
   - Verify `VITE_WS_URL` matches your backend SignalR hub URL
   - Check browser console for SignalR connection logs
   - Ensure the backend SignalR hub is properly configured

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Check current configuration in browser console
# Look for "Environment configuration loaded" log message

# Test API connectivity
# Check browser network tab for API requests
```

## Security Notes

- Never commit `.env.local` files
- Keep production secrets secure and use proper secret management
- Ensure `VITE_ENABLE_DEBUG` is `false` in production
- Use HTTPS in staging and production environments
- Regularly rotate API keys and secrets

## Best Practices

1. **Environment Separation**: Keep environment configurations clearly separated
2. **Secret Management**: Use proper secret management for sensitive data
3. **Validation**: Always validate required environment variables
4. **Documentation**: Document any new environment variables
5. **Testing**: Test configuration changes in all environments
6. **Monitoring**: Monitor environment-specific logs and metrics