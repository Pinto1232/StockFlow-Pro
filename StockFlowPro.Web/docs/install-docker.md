# 🐳 Docker Installation Guide for Windows

## Quick Installation Steps

### Option 1: Docker Desktop (Recommended)

1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Or direct link: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **System Requirements:**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
   - OR Windows 11 64-bit: Home or Pro version 21H2 or higher
   - WSL 2 feature enabled
   - Virtualization enabled in BIOS

3. **Installation Process:**
   - Run the Docker Desktop Installer.exe
   - Follow the installation wizard
   - When prompted, ensure "Use WSL 2 instead of Hyper-V" is checked
   - Restart your computer when installation completes

4. **First Time Setup:**
   - Start Docker Desktop from Start Menu
   - Accept the service agreement
   - Sign in or create a Docker Hub account (optional)
   - Wait for Docker to start (whale icon in system tray)

### Option 2: Enable WSL 2 (if needed)

If you get WSL 2 errors, run these commands in PowerShell as Administrator:

```powershell
# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer
Restart-Computer

# After restart, set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu (optional but recommended)
wsl --install -d Ubuntu
```

### Option 3: Alternative - Podman Desktop

If Docker Desktop doesn't work, try Podman:

1. **Download Podman Desktop:**
   - Go to: https://podman-desktop.io/downloads
   - Download Windows installer

2. **Install and Setup:**
   - Run the installer
   - Start Podman Desktop
   - Initialize Podman machine

## Verification Steps

After installation, verify Docker is working:

```cmd
# Open Command Prompt or PowerShell
docker --version
docker run hello-world
```

You should see:
```
Docker version 24.x.x, build xxxxxxx
Hello from Docker!
```

## Troubleshooting Common Issues

### Issue 1: WSL 2 Installation Incomplete
```powershell
# Download and install WSL 2 kernel update
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
```

### Issue 2: Virtualization Not Enabled
1. Restart computer and enter BIOS/UEFI
2. Enable Intel VT-x or AMD-V
3. Enable Hyper-V in Windows Features

### Issue 3: Docker Desktop Won't Start
```cmd
# Reset Docker Desktop
"C:\Program Files\Docker\Docker\Docker Desktop.exe" --reset-to-factory-defaults
```

### Issue 4: Permission Issues
```powershell
# Add user to docker-users group
net localgroup docker-users "your-username" /add
# Logout and login again
```

## Quick Test After Installation

Once Docker is installed, test with our monitoring stack:

```cmd
# Test basic Docker functionality
docker run hello-world

# Test our Grafana setup
docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise

# Check if it's running
docker ps

# Access Grafana
# Open browser: http://localhost:3000
# Login: admin/admin
```

## Next Steps After Docker Installation

1. **Verify Docker is running:**
   ```cmd
   docker --version
   docker info
   ```

2. **Run our monitoring setup:**
   ```cmd
   # From the StockFlow-Pro directory
   start-monitoring.bat
   ```

3. **Access services:**
   - Grafana: http://localhost:3000
   - Prometheus: http://localhost:9090
   - StockFlow Pro: Your existing application

## Alternative Installation Methods

### Chocolatey (Package Manager)
```powershell
# Install Chocolatey first: https://chocolatey.org/install
# Then install Docker
choco install docker-desktop
```

### Winget (Windows Package Manager)
```cmd
winget install Docker.DockerDesktop
```

### Scoop (Package Manager)
```powershell
# Install Scoop first: https://scoop.sh/
# Then install Docker
scoop bucket add extras
scoop install docker
```

## System Requirements Check

Run this PowerShell script to check if your system is ready:

```powershell
# Check Windows version
Get-ComputerInfo | Select WindowsProductName, WindowsVersion, TotalPhysicalMemory

# Check if Hyper-V is available
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# Check if WSL is available
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

# Check if virtualization is enabled
Get-ComputerInfo | Select HyperVRequirementVirtualizationFirmwareEnabled
```

## Post-Installation Configuration

After Docker is installed and running:

1. **Configure Docker settings:**
   - Right-click Docker icon in system tray
   - Go to Settings
   - Adjust memory allocation (recommend 4GB+)
   - Enable file sharing for your project directory

2. **Test with our monitoring stack:**
   ```cmd
   cd C:\Users\pinto\Documents\Development\StockFlow-Pro
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

3. **Verify all services are running:**
   ```cmd
   docker-compose -f docker-compose.monitoring.yml ps
   ```

## Support Resources

- **Docker Documentation:** https://docs.docker.com/desktop/windows/
- **Docker Community:** https://forums.docker.com/
- **WSL 2 Documentation:** https://docs.microsoft.com/en-us/windows/wsl/
- **Troubleshooting Guide:** https://docs.docker.com/desktop/troubleshoot/

---

Once Docker is installed, come back and we'll run the monitoring setup! 🚀