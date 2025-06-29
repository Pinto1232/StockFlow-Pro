# PowerShell script to clean up build artifacts and kill any processes that might be locking files
# This script helps prevent MSB3026 and MSB3027 build errors

Write-Host "=== StockFlow-Pro Build Cleanup Script ===" -ForegroundColor Green

# Function to safely kill processes
function Kill-ProcessSafely {
    param([string]$ProcessName)
    
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "Killing $($processes.Count) $ProcessName process(es)..." -ForegroundColor Yellow
            $processes | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
    catch {
        Write-Host "Could not kill $ProcessName processes: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to remove directory safely
function Remove-DirectorySafely {
    param([string]$Path)
    
    if (Test-Path $Path) {
        try {
            Write-Host "Removing directory: $Path" -ForegroundColor Yellow
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
        catch {
            Write-Host "Could not remove directory $Path: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Kill potentially problematic processes
Write-Host "Killing potentially problematic processes..." -ForegroundColor Cyan
Kill-ProcessSafely "HashGenerator"
Kill-ProcessSafely "dotnet"
Kill-ProcessSafely "MSBuild"
Kill-ProcessSafely "VBCSCompiler"

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 2

# Remove problematic directories
Write-Host "Removing problematic directories..." -ForegroundColor Cyan
Remove-DirectorySafely "StockFlowPro.Web\HashGenerator"
Remove-DirectorySafely "StockFlowPro.Web\bin"
Remove-DirectorySafely "StockFlowPro.Web\obj"

# Clean the solution
Write-Host "Running dotnet clean..." -ForegroundColor Cyan
try {
    dotnet clean --verbosity quiet
    Write-Host "Clean completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Clean failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Build the solution
Write-Host "Running dotnet build..." -ForegroundColor Cyan
try {
    dotnet build --verbosity quiet
    Write-Host "Build completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=== Cleanup and Build Complete ===" -ForegroundColor Green