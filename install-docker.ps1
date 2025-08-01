# Docker Installation Script for Windows
# Run as Administrator

param(
    [switch]$DownloadOnly,
    [switch]$CheckOnly
)

Write-Host "🐳 Docker Installation Helper for StockFlow Pro" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin -and -not $CheckOnly) {
    Write-Host "❌ This script needs to run as Administrator for installation." -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Running system check only..." -ForegroundColor Yellow
    $CheckOnly = $true
}

# System Requirements Check
Write-Host "🔍 Checking System Requirements..." -ForegroundColor Yellow
Write-Host ""

# Check Windows Version
$osInfo = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, WindowsBuildLabEx
Write-Host "OS: $($osInfo.WindowsProductName)" -ForegroundColor White
Write-Host "Version: $($osInfo.WindowsVersion)" -ForegroundColor White
Write-Host "Build: $($osInfo.WindowsBuildLabEx)" -ForegroundColor White

# Check if Windows version supports Docker Desktop
$windowsVersion = [System.Environment]::OSVersion.Version
$isWindows10 = $windowsVersion.Major -eq 10 -and $windowsVersion.Build -ge 19041
$isWindows11 = $windowsVersion.Major -eq 10 -and $windowsVersion.Build -ge 22000

if ($isWindows10 -or $isWindows11) {
    Write-Host "✅ Windows version supports Docker Desktop" -ForegroundColor Green
} else {
    Write-Host "❌ Windows version may not support Docker Desktop" -ForegroundColor Red
    Write-Host "   Minimum: Windows 10 Build 19041 or Windows 11" -ForegroundColor Yellow
}

Write-Host ""

# Check Memory
$memory = Get-ComputerInfo | Select-Object TotalPhysicalMemory
$memoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
Write-Host "Memory: $memoryGB GB" -ForegroundColor White
if ($memoryGB -ge 4) {
    Write-Host "✅ Sufficient memory for Docker" -ForegroundColor Green
} else {
    Write-Host "⚠️  Low memory - Docker may run slowly" -ForegroundColor Yellow
}

Write-Host ""

# Check Virtualization
try {
    $hyperV = Get-ComputerInfo | Select-Object HyperVRequirementVirtualizationFirmwareEnabled
    if ($hyperV.HyperVRequirementVirtualizationFirmwareEnabled) {
        Write-Host "✅ Virtualization is enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Virtualization is disabled - enable in BIOS" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Could not check virtualization status" -ForegroundColor Yellow
}

Write-Host ""

# Check if Docker is already installed
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is already installed: $dockerVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Ready to run monitoring setup!" -ForegroundColor Cyan
        Write-Host "Run: .\start-monitoring.ps1" -ForegroundColor White
        return
    }
} catch {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
}

# Check WSL 2
try {
    $wslVersion = wsl --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ WSL 2 is available" -ForegroundColor Green
    } else {
        Write-Host "❌ WSL 2 is not available" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ WSL 2 is not installed" -ForegroundColor Red
}

Write-Host ""

if ($CheckOnly) {
    Write-Host "📋 System Check Complete" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Or run this script as Administrator to auto-install" -ForegroundColor White
    Write-Host "3. Enable WSL 2 if not available" -ForegroundColor White
    Write-Host "4. Enable virtualization in BIOS if disabled" -ForegroundColor White
    return
}

# Installation Options
Write-Host "🛠️  Installation Options:" -ForegroundColor Cyan
Write-Host "1. Download Docker Desktop installer" -ForegroundColor White
Write-Host "2. Install via Winget (if available)" -ForegroundColor White
Write-Host "3. Install via Chocolatey (if available)" -ForegroundColor White
Write-Host "4. Enable WSL 2 features" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1-4) or 'q' to quit"

switch ($choice) {
    "1" {
        Write-Host "📥 Downloading Docker Desktop..." -ForegroundColor Yellow
        $url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $output = "$env:USERPROFILE\Downloads\DockerDesktopInstaller.exe"
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
            Write-Host "✅ Downloaded to: $output" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Starting installer..." -ForegroundColor Cyan
            Start-Process -FilePath $output -Wait
            Write-Host "✅ Installation complete!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please download manually from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host "📦 Installing via Winget..." -ForegroundColor Yellow
        try {
            winget install Docker.DockerDesktop
            Write-Host "✅ Installation complete!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Winget installation failed" -ForegroundColor Red
            Write-Host "Try option 1 (manual download) instead" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host "🍫 Installing via Chocolatey..." -ForegroundColor Yellow
        try {
            choco install docker-desktop -y
            Write-Host "✅ Installation complete!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Chocolatey installation failed" -ForegroundColor Red
            Write-Host "Install Chocolatey first: https://chocolatey.org/install" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host "🔧 Enabling WSL 2 features..." -ForegroundColor Yellow
        try {
            # Enable WSL
            dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
            
            # Enable Virtual Machine Platform
            dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
            
            Write-Host "✅ WSL 2 features enabled" -ForegroundColor Green
            Write-Host "⚠️  Restart required before installing Docker" -ForegroundColor Yellow
            
            $restart = Read-Host "Restart now? (y/N)"
            if ($restart -eq 'y' -or $restart -eq 'Y') {
                Restart-Computer
            }
        } catch {
            Write-Host "❌ Failed to enable WSL 2 features" -ForegroundColor Red
        }
    }
    
    "q" {
        Write-Host "👋 Exiting..." -ForegroundColor Yellow
        return
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Post-Installation Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your computer if prompted" -ForegroundColor White
Write-Host "2. Start Docker Desktop from Start Menu" -ForegroundColor White
Write-Host "3. Wait for Docker to start (whale icon in system tray)" -ForegroundColor White
Write-Host "4. Test with: docker --version" -ForegroundColor White
Write-Host "5. Run our monitoring setup: .\start-monitoring.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🆘 If you encounter issues:" -ForegroundColor Yellow
Write-Host "- Check the install-docker.md file for detailed troubleshooting" -ForegroundColor White
Write-Host "- Visit: https://docs.docker.com/desktop/troubleshoot/" -ForegroundColor White