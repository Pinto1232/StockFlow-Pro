# 🚀 Quick Docker Installation for Windows 10 Home

Your system: **Windows 10 Home Single Language 2009** ✅ Compatible with Docker Desktop!

## Step 1: Download Docker Desktop (2 minutes)

**Direct Download Link:**
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

Or visit: https://www.docker.com/products/docker-desktop/

## Step 2: Install Docker Desktop (5 minutes)

1. **Run the installer** (Docker Desktop Installer.exe)
2. **Check "Use WSL 2 instead of Hyper-V"** (important for Windows 10 Home)
3. **Follow the installation wizard**
4. **Restart your computer** when prompted

## Step 3: First Time Setup (3 minutes)

1. **Start Docker Desktop** from Start Menu
2. **Accept the service agreement**
3. **Skip Docker Hub sign-in** (optional)
4. **Wait for Docker to start** - you'll see a whale icon in the system tray

## Step 4: Verify Installation (1 minute)

Open Command Prompt or PowerShell and run:
```cmd
docker --version
docker run hello-world
```

You should see:
```
Docker version 24.x.x, build xxxxxxx
Hello from Docker!
```

## Step 5: Run StockFlow Pro Monitoring (2 minutes)

Once Docker is working, come back to this directory and run:

```cmd
# Simple Grafana only
docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise

# Or full monitoring stack
start-monitoring.bat
```

## Troubleshooting

### If WSL 2 is not installed:
1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart computer
4. Try Docker installation again

### If you get virtualization errors:
1. Restart computer
2. Enter BIOS/UEFI (usually F2, F12, or Del during startup)
3. Enable "Intel VT-x" or "AMD-V" virtualization
4. Save and exit BIOS

### If Docker Desktop won't start:
1. Right-click Docker Desktop icon
2. Select "Restart Docker Desktop"
3. Wait 2-3 minutes for startup

## Quick Test Commands

After installation, test these commands:
```cmd
# Check Docker is running
docker --version

# Test with simple container
docker run hello-world

# Start Grafana for StockFlow Pro
docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise

# Check running containers
docker ps

# Access Grafana
# Open browser: http://localhost:3000
# Login: admin/admin
```

## Next Steps After Docker is Ready

1. **Test Grafana:** http://localhost:3000 (admin/admin)
2. **Run monitoring stack:** `start-monitoring.bat`
3. **Access StockFlow Pro:** Your existing application will automatically detect Grafana

---

**Total Time: ~15 minutes** ⏱️

**Need Help?** Check the detailed `install-docker.md` file for more troubleshooting options.