# 📊 Grafana Monitoring Setup for StockFlow Pro

This guide provides comprehensive instructions for setting up Grafana monitoring for the StockFlow Pro inventory management system.

## 🚀 Quick Setup Guide

### 1. Install Grafana

#### Option A: Docker (Recommended)
```bash
# Install Grafana Enterprise with Docker
docker run -d -p 3000:3000 --name grafana grafana/grafana-enterprise

# Or with persistent storage
docker run -d \
  -p 3000:3000 \
  --name grafana \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana-enterprise
```

#### Option B: Windows Installation
1. Download Grafana from https://grafana.com/grafana/download
2. Extract and run `bin\grafana-server.exe`
3. Access Grafana at http://localhost:3000

### 2. Initial Grafana Configuration

1. **Access Grafana**: Navigate to http://localhost:3000
2. **Default Login**: 
   - Username: `admin`
   - Password: `admin` (you'll be prompted to change this)
3. **Change Password**: Set a secure password when prompted

### 3. Configure Data Sources

#### A. Prometheus (Metrics Collection)
```yaml
# Add Prometheus data source
Name: Prometheus
Type: Prometheus
URL: http://localhost:9090
Access: Server (default)
```

#### B. Loki (Log Aggregation)
```yaml
# Add Loki data source
Name: Loki
Type: Loki
URL: http://localhost:3100
Access: Server (default)
```

#### C. SQL Server (Database Metrics)
```yaml
# Add SQL Server data source
Name: SQL Server
Type: Microsoft SQL Server
Host: localhost:1433
Database: StockFlowProDb
User: your_username
Password: your_password
```

### 4. Import StockFlow Pro Dashboard

#### Method A: API Import
```bash
curl -X POST http://localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d @stockflow-dashboard.json
```

#### Method B: Manual Import
1. Go to Grafana → Dashboards → Import
2. Upload the `stockflow-dashboard.json` file
3. Configure data source mappings
4. Click "Import"

### 5. Update StockFlow Pro Configuration

The `loadGrafanaDashboard()` function in `index.html` has been updated to automatically detect Grafana availability and load the dashboard:

```javascript
// The iframe will automatically load:
// http://localhost:3000/d/stockflow/stockflow-pro?orgId=1&refresh=5s&kiosk=tv
```

## 📈 Recommended Dashboards

### 1. API Performance Dashboard
- **Request Rates**: Requests per second/minute
- **Response Times**: P50, P95, P99 percentiles
- **Error Rates**: 4xx and 5xx error percentages
- **Endpoint Performance**: Individual API endpoint metrics

### 2. Database Metrics Dashboard
- **Connection Pool**: Active/idle connections
- **Query Performance**: Execution times, slow queries
- **Database Health**: CPU, memory, disk usage
- **Lock Statistics**: Deadlocks, blocking queries

### 3. System Resources Dashboard
- **CPU Usage**: Application and system CPU
- **Memory Usage**: Heap, non-heap, garbage collection
- **Disk I/O**: Read/write operations and throughput
- **Network I/O**: Inbound/outbound traffic

### 4. Business Metrics Dashboard
- **Inventory Levels**: Stock counts, low stock alerts
- **User Activity**: Active users, authentication events
- **Transaction Volume**: Orders, invoices, revenue
- **System Usage**: Feature adoption, user engagement

### 5. Alert Management Dashboard
- **System Alerts**: Critical, warning, info alerts
- **Performance Thresholds**: SLA violations
- **Error Tracking**: Exception rates and types
- **Availability Monitoring**: Uptime/downtime tracking

## 🔧 Advanced Configuration

### Prometheus Configuration (prometheus.yml)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "stockflow_rules.yml"

scrape_configs:
  - job_name: 'stockflow-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'sql-server'
    static_configs:
      - targets: ['localhost:9182']
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Loki Configuration (loki.yml)
```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

### Alert Rules (stockflow_rules.yml)
```yaml
groups:
  - name: stockflow_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: LowStockAlert
        expr: stockflow_products_low_stock > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Multiple products low in stock"
          description: "{{ $value }} products are low in stock"

      - alert: DatabaseConnectionsHigh
        expr: sqlserver_connections_active / sqlserver_connections_total > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool usage high"
          description: "Connection pool is {{ $value }}% full"
```

## 🔔 Notification Channels

### Slack Integration
```json
{
  "name": "stockflow-alerts",
  "type": "slack",
  "settings": {
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "channel": "#stockflow-alerts",
    "username": "Grafana",
    "title": "StockFlow Pro Alert",
    "text": "{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
  }
}
```

### Email Notifications
```json
{
  "name": "email-alerts",
  "type": "email",
  "settings": {
    "addresses": "admin@stockflowpro.com;ops@stockflowpro.com",
    "subject": "StockFlow Pro Alert: {{ .GroupLabels.alertname }}",
    "body": "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"
  }
}
```

## 📊 Custom Metrics for StockFlow Pro

### Application Metrics to Implement
```csharp
// In your .NET application, add these metrics
public class StockFlowMetrics
{
    private static readonly Counter RequestsTotal = Metrics
        .CreateCounter("stockflow_requests_total", "Total requests", new[] { "method", "endpoint", "status" });

    private static readonly Histogram RequestDuration = Metrics
        .CreateHistogram("stockflow_request_duration_seconds", "Request duration");

    private static readonly Gauge ProductsTotal = Metrics
        .CreateGauge("stockflow_products_total", "Total products in inventory");

    private static readonly Gauge ProductsLowStock = Metrics
        .CreateGauge("stockflow_products_low_stock", "Products with low stock");

    private static readonly Gauge UsersActive = Metrics
        .CreateGauge("stockflow_users_active", "Currently active users");

    private static readonly Counter AuthAttempts = Metrics
        .CreateCounter("stockflow_auth_attempts_total", "Authentication attempts", new[] { "result" });
}
```

## 🚨 Alerting Best Practices

### 1. Alert Severity Levels
- **Critical**: System down, data loss, security breach
- **Warning**: Performance degradation, approaching limits
- **Info**: Maintenance events, configuration changes

### 2. Alert Thresholds
- **Error Rate**: > 1% for critical, > 0.5% for warning
- **Response Time**: > 2s for critical, > 1s for warning
- **CPU Usage**: > 90% for critical, > 80% for warning
- **Memory Usage**: > 95% for critical, > 85% for warning

### 3. Alert Grouping
- Group related alerts to avoid notification spam
- Use time-based grouping for burst events
- Implement escalation policies for unacknowledged alerts

## 🔍 Troubleshooting

### Common Issues

#### 1. Grafana Not Loading Dashboard
```bash
# Check if Grafana is running
curl http://localhost:3000/api/health

# Check logs
docker logs grafana
```

#### 2. Data Source Connection Issues
- Verify data source URLs and credentials
- Check network connectivity
- Review Grafana logs for connection errors

#### 3. Missing Metrics
- Ensure Prometheus is scraping your application
- Verify metrics endpoint is accessible
- Check metric naming and labels

#### 4. Dashboard Import Failures
- Validate JSON syntax in dashboard file
- Check data source mappings
- Verify panel queries and data sources

### Performance Optimization

#### 1. Query Optimization
- Use appropriate time ranges for queries
- Implement query caching where possible
- Optimize Prometheus recording rules

#### 2. Dashboard Performance
- Limit the number of panels per dashboard
- Use template variables for dynamic filtering
- Implement auto-refresh intervals appropriately

#### 3. Data Retention
- Configure appropriate retention policies
- Archive old data to reduce storage costs
- Implement data compaction strategies

## 📚 Additional Resources

### Documentation Links
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [.NET Metrics with Prometheus](https://github.com/prometheus-net/prometheus-net)

### Community Resources
- [Grafana Community](https://community.grafana.com/)
- [Prometheus Community](https://prometheus.io/community/)
- [StockFlow Pro GitHub](https://github.com/your-org/stockflow-pro)

### Support Contacts
- **Technical Support**: support@stockflowpro.com
- **Emergency Escalation**: ops@stockflowpro.com
- **Documentation Issues**: docs@stockflowpro.com

---

## 🎯 Next Steps

1. **Install Grafana** using the Docker command above
2. **Configure data sources** for your environment
3. **Import the dashboard** using the provided JSON file
4. **Set up alerting** based on your operational requirements
5. **Customize dashboards** for your specific use cases
6. **Train your team** on using Grafana for monitoring

The StockFlow Pro dashboard will automatically detect when Grafana is available and switch from the setup instructions to the live dashboard view.