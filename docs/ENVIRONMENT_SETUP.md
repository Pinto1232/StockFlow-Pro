# Environment Configuration Setup Guide

## Overview

This guide explains how to set up and use environment variables in the StockFlow-Pro application using `.env` files for secure configuration management.

## Why Use .env Files?

### ✅ **Benefits**
- **Security**: Keep sensitive data (passwords, API keys) out of source control
- **Flexibility**: Different configurations for different environments
- **Convenience**: Easy to manage and update configuration
- **Best Practice**: Industry standard for configuration management
- **Team Collaboration**: Each developer can have their own local settings

### ❌ **Without .env Files**
- Sensitive data exposed in `appsettings.json`
- Hard to manage different environment configurations
- Risk of committing secrets to version control
- Difficult to deploy to different environments

## File Structure

```
StockFlow-Pro/
├── .env                    # Your actual environment variables (NOT in git)
├── .env.example           # Template file (committed to git)
├── .gitignore            # Excludes .env files from git
└── StockFlowPro.Web/
    ├── Configuration/
    │   └── EnvironmentConfig.cs  # Configuration helper class
    └── Program.cs        # Loads .env variables
```

## Setup Instructions

### 1. **Install Required Package**
The `DotNetEnv` package is already added to the project:
```xml
<PackageReference Include="DotNetEnv" Version="3.1.1" />
```

### 2. **Copy Template File**
```bash
# Copy the example file to create your local .env file
cp .env.example .env
```

### 3. **Configure Your Environment**
Edit the `.env` file with your actual values:

```bash
# Example configuration for development
DATABASE_CONNECTION_STRING=Data Source=StockFlowProDb.sqlite
USE_MOCK_DATA=true
SMTP_HOST=localhost
SMTP_PORT=587
# ... other settings
```

### 4. **Verify Setup**
The application will validate configuration on startup and show any missing required variables.

## Environment Variables Reference

### 🗄️ **Database Configuration**
```bash
# SQLite (Development)
DATABASE_CONNECTION_STRING=Data Source=StockFlowProDb.sqlite

# SQL Server (Production)
DATABASE_CONNECTION_STRING=Server=your-server;Database=StockFlowPro;Trusted_Connection=true;

# PostgreSQL (Alternative)
DATABASE_CONNECTION_STRING=Host=localhost;Database=stockflowpro;Username=user;Password=pass;
```

### 🔐 **Security Configuration**
```bash
# JWT Settings (for future use)
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
JWT_ISSUER=StockFlowPro
JWT_AUDIENCE=StockFlowPro-Users
JWT_EXPIRY_MINUTES=60

# Cookie Authentication
COOKIE_AUTH_NAME=StockFlowProAuth
COOKIE_SECURE=true          # true for HTTPS, false for development
COOKIE_SAME_SITE=Strict     # Strict, Lax, or None

# Password Requirements
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# Rate Limiting
RATE_LIMIT_USER_CREATION_PER_HOUR=3
RATE_LIMIT_IP_CREATION_PER_HOUR=10
RATE_LIMIT_SYNC_PER_HOUR=5
```

### 📧 **Email Configuration**
```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_SSL=true
SMTP_FROM_EMAIL=noreply@stockflowpro.com
SMTP_FROM_NAME=StockFlow Pro

# Alternative: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@stockflowpro.com
```

### 🔧 **Application Settings**
```bash
# Environment
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7001;http://localhost:5001

# Data Source
USE_MOCK_DATA=true

# Logging
LOG_LEVEL_DEFAULT=Information
LOG_LEVEL_MICROSOFT=Warning

# Storage
STORAGE_TYPE=Local
STORAGE_CONNECTION_STRING=./uploads

# Development
DETAILED_ERRORS=true
DEVELOPER_EXCEPTION_PAGE=true
MOCK_DATA_FILE_PATH=./App_Data/mock-users.json
```

### 🛡️ **Production Security**
```bash
# HTTPS
FORCE_HTTPS=true

# HSTS (HTTP Strict Transport Security)
HSTS_MAX_AGE_SECONDS=31536000
HSTS_INCLUDE_SUBDOMAINS=true

# Content Security Policy
CSP_DEFAULT_SRC='self'
CSP_SCRIPT_SRC='self' 'unsafe-inline'
CSP_STYLE_SRC='self' 'unsafe-inline'
```

## Environment-Specific Configurations

### 🔧 **Development (.env)**
```bash
ASPNETCORE_ENVIRONMENT=Development
USE_MOCK_DATA=true
COOKIE_SECURE=false
DETAILED_ERRORS=true
FORCE_HTTPS=false
PASSWORD_MIN_LENGTH=6
```

### 🚀 **Production (.env.production)**
```bash
ASPNETCORE_ENVIRONMENT=Production
USE_MOCK_DATA=false
COOKIE_SECURE=true
DETAILED_ERRORS=false
FORCE_HTTPS=true
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
```

### 🧪 **Testing (.env.test)**
```bash
ASPNETCORE_ENVIRONMENT=Test
USE_MOCK_DATA=true
DATABASE_CONNECTION_STRING=Data Source=:memory:
DETAILED_ERRORS=true
```

## Usage in Code

### **Accessing Configuration**
```csharp
// Using the EnvironmentConfig helper class
var connectionString = EnvironmentConfig.DatabaseConnectionString;
var useMockData = EnvironmentConfig.UseMockData;
var jwtSecret = EnvironmentConfig.JwtSecretKey;

// Direct environment variable access
var customSetting = Environment.GetEnvironmentVariable("CUSTOM_SETTING") ?? "default";
```

### **Configuration Validation**
```csharp
// Automatic validation on startup
EnvironmentConfig.ValidateConfiguration();

// Get configuration summary for debugging
var configSummary = EnvironmentConfig.GetConfigurationSummary();
```

## Security Best Practices

### ✅ **Do's**
- ✅ Use strong, unique values for secrets
- ✅ Keep `.env` files out of version control
- ✅ Use different configurations for different environments
- ✅ Validate required environment variables on startup
- ✅ Use secure defaults for production settings
- ✅ Regularly rotate secrets and API keys

### ❌ **Don'ts**
- ❌ Never commit `.env` files to git
- ❌ Don't use weak or default passwords
- ❌ Don't share `.env` files via email or chat
- ❌ Don't use production secrets in development
- ❌ Don't hardcode sensitive values in code

## Deployment Considerations

### **Local Development**
- Use `.env` file for local configuration
- Keep sensitive values secure
- Use development-friendly settings

### **CI/CD Pipeline**
- Set environment variables in CI/CD system
- Use secure variable storage (Azure Key Vault, AWS Secrets Manager)
- Validate configuration in deployment scripts

### **Production Deployment**
- Use environment variables or secure configuration providers
- Enable all security features
- Use strong passwords and secrets
- Monitor configuration changes

## Troubleshooting

### **Common Issues**

1. **Missing .env file**
   ```
   Error: Configuration validation failed
   Solution: Copy .env.example to .env and configure values
   ```

2. **Invalid JWT secret**
   ```
   Error: JWT_SECRET_KEY must be at least 32 characters long
   Solution: Use a longer, more secure secret key
   ```

3. **Database connection issues**
   ```
   Error: Unable to connect to database
   Solution: Check DATABASE_CONNECTION_STRING value
   ```

4. **Environment variables not loading**
   ```
   Solution: Ensure .env file is in the project root directory
   ```

### **Debugging Configuration**
```csharp
// Log configuration summary (excludes sensitive data)
var config = EnvironmentConfig.GetConfigurationSummary();
foreach (var item in config)
{
    Console.WriteLine($"{item.Key}: {item.Value}");
}
```

## Migration from appsettings.json

### **Before (appsettings.json)**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=StockFlowProDb.sqlite"
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Username": "your-email@gmail.com",
    "Password": "your-password"
  }
}
```

### **After (.env)**
```bash
DATABASE_CONNECTION_STRING=Data Source=StockFlowProDb.sqlite
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-password
```

## Additional Resources

- [DotNetEnv Documentation](https://github.com/tonerdo/dotnet-env)
- [ASP.NET Core Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Security Configuration Guidelines](https://docs.microsoft.com/en-us/aspnet/core/security/)

## Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Verify your `.env` file syntax
3. Review the `EnvironmentConfig.cs` class
4. Check application logs for configuration errors
5. Ensure all required variables are set

Remember: **Never commit sensitive information to version control!**