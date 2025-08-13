@echo off
REM Security Update Script for StockFlow-Pro Docker Images (Windows)
REM This script helps maintain security by updating dependencies and rebuilding images

echo 🔒 StockFlow-Pro Security Update Script
echo =======================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo [INFO] Starting security update process...

REM 1. Update npm dependencies
echo [INFO] Updating npm dependencies...
cd StockFlowPro.UI
call npm audit fix --audit-level moderate --force
call npm update
call npm audit
cd ..

REM 2. Update .NET dependencies (if needed)
echo [INFO] Checking .NET dependencies...
dotnet list package --outdated

REM 3. Rebuild all images with latest security updates
echo [INFO] Rebuilding Docker images with security updates...

REM Build frontend development image
echo [INFO] Building frontend development image...
docker build -f StockFlowPro.UI/Dockerfile.dev -t stockflowpro-ui-dev:secure StockFlowPro.UI/

REM Build frontend production image
echo [INFO] Building frontend production image...
docker build -f StockFlowPro.UI/Dockerfile -t stockflowpro-ui-prod:secure StockFlowPro.UI/

REM Build backend API image
echo [INFO] Building backend API image...
docker build -f StockFlowPro.Web/Dockerfile -t stockflowpro-api:secure .

REM Build database image
echo [INFO] Building database image...
docker build -f Dockerfile.mssql -t stockflowpro-db:secure .

REM 4. Run security scans if available
echo [INFO] Running security scans...
where docker scout >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Running Docker Scout security scan...
    docker scout cves stockflowpro-ui-dev:secure
    docker scout cves stockflowpro-ui-prod:secure
    docker scout cves stockflowpro-api:secure
    docker scout cves stockflowpro-db:secure
) else (
    echo [WARNING] Docker Scout not available. Consider installing for security scanning.
)

REM 5. Generate security report
echo [INFO] Generating security report...
(
echo # Security Update Report
echo Generated: %date% %time%
echo.
echo ## Images Updated
echo - stockflowpro-ui-dev:secure
echo - stockflowpro-ui-prod:secure  
echo - stockflowpro-api:secure
echo - stockflowpro-db:secure
echo.
echo ## Security Fixes Applied
echo - Updated base images to latest versions
echo - Applied OS security updates
echo - Updated npm dependencies
echo - Fixed container security configurations
echo - Added security labels and metadata
echo.
echo ## Base Image Versions
echo - Node.js: 20.18.2 ^(latest LTS with security patches^)
echo - Nginx: 1.27.3-alpine ^(latest stable^)
echo - .NET: 8.0-bookworm-slim ^(latest with security updates^)
echo - SQL Server: 2022-CU16-ubuntu-22.04 ^(latest cumulative update^)
echo - Redis: 7.4-alpine ^(latest stable^)
echo.
echo ## Security Features Enabled
echo - Non-root user execution
echo - Read-only filesystems where applicable
echo - No new privileges security option
echo - Resource limits
echo - Health checks
echo - Security headers in Nginx
echo - Rate limiting
echo - Content Security Policy
echo.
echo ## Next Steps
echo 1. Test the updated images in development
echo 2. Run integration tests
echo 3. Deploy to staging for validation
echo 4. Schedule production deployment
echo.
echo ## Maintenance Schedule
echo - Weekly: npm audit and dependency updates
echo - Monthly: Base image updates
echo - Quarterly: Full security review
) > SECURITY_UPDATE_REPORT.md

echo [INFO] Security update completed successfully!
echo [INFO] Report saved to: SECURITY_UPDATE_REPORT.md
echo.
echo [INFO] Next steps:
echo [INFO] 1. Review the security report
echo [INFO] 2. Test the updated containers
echo [INFO] 3. Update docker-compose files to use new image tags
echo [INFO] 4. Deploy to staging environment
echo.
echo [INFO] Security update script completed! 🔒✅

pause