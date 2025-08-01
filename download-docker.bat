@echo off
echo 🐳 Docker Desktop Download Helper
echo ================================
echo.

echo Checking if Docker is already installed...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is already installed!
    docker --version
    echo.
    echo Ready to run monitoring setup!
    echo Run: start-monitoring.bat
    pause
    exit /b 0
)

echo ❌ Docker is not installed
echo.

echo Your system: Windows 10 Home Single Language 2009
echo ✅ Compatible with Docker Desktop
echo.

echo 📥 Downloading Docker Desktop installer...
echo This may take a few minutes depending on your internet speed...
echo.

set "url=https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe"
set "output=%USERPROFILE%\Downloads\DockerDesktopInstaller.exe"

echo Downloading from: %url%
echo Saving to: %output%
echo.

powershell -Command "& {Invoke-WebRequest -Uri '%url%' -OutFile '%output%' -UseBasicParsing}"

if %errorlevel% equ 0 (
    echo ✅ Download completed successfully!
    echo.
    echo 🚀 Starting Docker Desktop installer...
    echo.
    echo IMPORTANT NOTES:
    echo - Check "Use WSL 2 instead of Hyper-V" during installation
    echo - Restart your computer when prompted
    echo - Start Docker Desktop after restart
    echo.
    pause
    start "" "%output%"
) else (
    echo ❌ Download failed!
    echo.
    echo Please download manually from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Or try these alternatives:
    echo 1. Use Windows Store: Search for "Docker Desktop"
    echo 2. Use Winget: winget install Docker.DockerDesktop
    echo 3. Use Chocolatey: choco install docker-desktop
    echo.
)

echo.
echo 📋 After Docker installation:
echo 1. Restart your computer
echo 2. Start Docker Desktop
echo 3. Wait for whale icon in system tray
echo 4. Run: start-monitoring.bat
echo.
pause