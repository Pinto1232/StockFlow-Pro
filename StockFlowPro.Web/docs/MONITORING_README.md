# 📊 StockFlow Pro Monitoring Setup

This directory contains a complete monitoring solution for StockFlow Pro using Grafana, Prometheus, Loki, and AlertManager.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- StockFlow Pro application running on localhost:5000

### Option 1: Automated Setup (Recommended)

#### Windows (Command Prompt)
```cmd
start-monitoring.bat
```

#### Windows (PowerShell) / Linux / macOS
```powershell
./start-monitoring.ps1
```

### Option 2: Manual Setup

1. **Install Grafana:**
   ```bash
   docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise
   ```

2. **Start the complete monitoring stack:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

3. **Import the dashboard:**
   ```bash
   curl -X POST http://localhost:3000/api/dashboards/db \
     -H 'Content-Type: application/json' \
     -d @stockflow-dashboard.json
   ```

## 📁 File Structure

```
StockFlow-Pro/
├── docker-compose.monitoring.yml    # Complete monitoring stack
├── stockflow-dashboard.json         # Pre-configured Grafana dashboard
├── grafana-setup-guide.md          # Detailed setup instructions
├── start-monitoring.bat            # Windows startup script
├── start-monitoring.ps1            # PowerShell startup script
├── prometheus/
│   ├── prometheus.yml              # Prometheus configuration
│   └── rules/
│       └── stockflow-alerts.yml    # Alert rules
├── alertmanager/
│   └── alertmanager.yml           # Alert routing configuration
├── grafana/
│   ├── provisioning/              # Auto-provisioning configs
│   └── dashboards/                # Dashboard files
├── loki/
│   └── loki.yml                   # Log aggregation config
└── promtail/
    └── promtail.yml               # Log shipping config
```

## 🔧 Services Included

| Service | Port | Purpose | URL |
|---------|------|---------|-----|
| Grafana | 3000 | Dashboards & Visualization | http://localhost:3000 |
| Prometheus | 9090 | Metrics Collection | http://localhost:9090 |
| AlertManager | 9093 | Alert Routing | http://localhost:9093 |
| Loki | 3100 | Log Aggregation | http://localhost:3100 |
| Node Exporter | 9100 | System Metrics | http://localhost:9100 |
| SQL Exporter | 4000 | Database Metrics | http://localhost:4000 |
| Redis | 6379 | Caching | - |
| Redis Exporter | 9121 | Redis Metrics | http://localhost:9121 |

## 🔐 Default Credentials

- **Grafana**: admin / admin123
- **Prometheus**: No authentication
- **AlertManager**: No authentication

## 📊 Pre-configured Dashboards

### 1. StockFlow Pro Overview
- API performance metrics
- Database connection status
- System resource usage
- Business metrics (inventory, users)
- Real-time alerts

### 2. Available Panels
- **API Performance**: Request rates, response times, error rates
- **Database Metrics**: Connection pools, query performance
- **System Resources**: CPU, memory, disk usage
- **Inventory Tracking**: Stock levels, low stock alerts
- **User Analytics**: Active users, authentication events
- **Error Tracking**: Application errors and exceptions

## 🚨 Alert Configuration

### Alert Severity Levels
- **Critical**: Immediate attention required (5min repeat)
- **Warning**: Should be addressed soon (30min repeat)
- **Info**: Informational only (4hr repeat)

### Pre-configured Alerts
- High API error rate (>5%)
- High response time (>2s)
- Database connection issues
- System resource exhaustion
- Low stock alerts
- Authentication failures
- Service downtime

### Notification Channels
- Email notifications
- Slack integration (configure webhook)
- PagerDuty integration (configure API key)

## 🔧 Configuration

### Environment Variables
Create a `.env` file for sensitive configuration:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@stockflowpro.com
SMTP_PASS=your-app-password

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Database Connection
SQL_SERVER_HOST=localhost
SQL_SERVER_USER=sa
SQL_SERVER_PASS=YourPassword123!
SQL_SERVER_DB=StockFlowProDb

# PagerDuty Integration
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-key
```

### Customizing Dashboards
1. Access Grafana at http://localhost:3000
2. Navigate to the StockFlow Pro dashboard
3. Click the gear icon → Settings → JSON Model
4. Modify the JSON configuration
5. Save changes

### Adding Custom Metrics
Add to your .NET application:

```csharp
// Install: dotnet add package prometheus-net.AspNetCore

// In Program.cs or Startup.cs
app.UseMetricServer(); // Exposes /metrics endpoint

// Custom metrics
public class BusinessMetrics
{
    private static readonly Gauge ProductsInStock = Metrics
        .CreateGauge("stockflow_products_in_stock", "Products currently in stock");
    
    private static readonly Counter OrdersProcessed = Metrics
        .CreateCounter("stockflow_orders_total", "Total orders processed");
    
    public void UpdateProductCount(int count)
    {
        ProductsInStock.Set(count);
    }
    
    public void IncrementOrderCount()
    {
        OrdersProcessed.Inc();
    }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

#### 2. Docker Issues
```bash
# Restart Docker Desktop
# Or restart Docker service on Linux
sudo systemctl restart docker

# Check Docker logs
docker-compose -f docker-compose.monitoring.yml logs
```

#### 3. Grafana Not Loading
```bash
# Check Grafana logs
docker logs stockflow-grafana

# Restart Grafana
docker restart stockflow-grafana
```

#### 4. No Metrics Data
1. Verify your .NET app exposes `/metrics` endpoint
2. Check Prometheus targets: http://localhost:9090/targets
3. Verify network connectivity between containers

#### 5. Alerts Not Firing
1. Check AlertManager status: http://localhost:9093
2. Verify alert rules in Prometheus: http://localhost:9090/alerts
3. Check email/Slack configuration

### Health Checks
```bash
# Check all services
docker-compose -f docker-compose.monitoring.yml ps

# Check specific service logs
docker-compose -f docker-compose.monitoring.yml logs grafana
docker-compose -f docker-compose.monitoring.yml logs prometheus
docker-compose -f docker-compose.monitoring.yml logs alertmanager

# Test endpoints
curl http://localhost:3000/api/health     # Grafana
curl http://localhost:9090/-/ready        # Prometheus
curl http://localhost:9093/-/ready        # AlertManager
```

## 📈 Performance Tuning

### Prometheus Optimization
```yaml
# In prometheus.yml
global:
  scrape_interval: 15s      # Adjust based on needs
  evaluation_interval: 15s  # How often to evaluate rules

# Retention settings
storage:
  tsdb:
    retention.time: 15d     # Keep data for 15 days
    retention.size: 10GB    # Max storage size
```

### Grafana Optimization
```yaml
# In grafana.ini
[dashboards]
default_home_dashboard_path = /var/lib/grafana/dashboards/stockflow-dashboard.json

[alerting]
enabled = true
execute_alerts = true

[metrics]
enabled = true
interval_seconds = 10
```

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Review alert thresholds and adjust as needed
2. **Monthly**: Clean up old logs and metrics data
3. **Quarterly**: Review and update dashboards
4. **As needed**: Update Docker images

### Backup Strategy
```bash
# Backup Grafana data
docker exec stockflow-grafana tar czf - /var/lib/grafana > grafana-backup.tar.gz

# Backup Prometheus data
docker exec stockflow-prometheus tar czf - /prometheus > prometheus-backup.tar.gz

# Backup configuration files
tar czf monitoring-config-backup.tar.gz prometheus/ alertmanager/ grafana/
```

### Updates
```bash
# Update all images
docker-compose -f docker-compose.monitoring.yml pull

# Restart with new images
docker-compose -f docker-compose.monitoring.yml up -d
```

## 📚 Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [StockFlow Pro API Documentation](http://localhost:5000/swagger)

## 🆘 Support

For issues with the monitoring setup:
1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Consult the official documentation
4. Create an issue in the StockFlow Pro repository

## 🎯 Next Steps

1. **Customize Alerts**: Adjust thresholds based on your environment
2. **Add Business Metrics**: Implement custom metrics in your application
3. **Set Up Notifications**: Configure Slack/email/PagerDuty integrations
4. **Create Custom Dashboards**: Build dashboards for specific use cases
5. **Implement Log Aggregation**: Configure application logging to Loki
6. **Set Up Backup Strategy**: Implement regular backups of monitoring data

---

**Happy Monitoring! 📊🚀**