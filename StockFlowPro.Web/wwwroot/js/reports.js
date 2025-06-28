
// Reports & Analytics JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
});

let charts = {}; // To store chart instances
let currentReportType = null; // Track current report for export

function initializeReportsPage() {
    console.log('Initializing Reports Page...');
    
    // Add loading animations
    addLoadingAnimations();
    
    // Initial data loading with error handling
    loadQuickStats();
    loadInitialCharts();
    loadAlerts();
    
    // Setup event listeners
    setupEventListeners();
}

function addLoadingAnimations() {
    // Add fade-in animation to main sections
    const sections = document.querySelectorAll('.report-category, .quick-stats-section, .alerts-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function setupEventListeners() {
    // Add click handlers for report cards
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
            if (modal) {
                modal.hide();
            }
        }
    });
}

async function loadQuickStats() {
    try {
        const response = await fetch('/api/reports/kpi');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();

        // Handle the actual DTO structure
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue || 0);
        document.getElementById('revenueGrowth').textContent = `${(stats.revenueGrowth || 0).toFixed(2)}%`;
        document.getElementById('totalOrders').textContent = (stats.totalOrders || 0).toLocaleString();
        document.getElementById('orderGrowth').textContent = `${(stats.orderGrowth || 0).toFixed(2)}%`;
        document.getElementById('inventoryValue').textContent = formatCurrency(stats.inventoryValue || 0);
        document.getElementById('inventoryTurnover').textContent = `${(stats.inventoryTurnover || 0).toFixed(2)}`;
        document.getElementById('profitMargin').textContent = `${(stats.grossProfitMargin || 0).toFixed(2)}%`;
        document.getElementById('marginChange').textContent = `${(stats.aovGrowth || 0).toFixed(2)}%`;

    } catch (error) {
        console.error('Error loading quick stats:', error);
        // Show error state on UI
        document.querySelectorAll('.stat-value').forEach(el => el.textContent = 'Error');
    }
}

async function loadInitialCharts() {
    try {
        // Check if chart elements exist before trying to create charts
        const revenueChartElement = document.getElementById('revenueChart');
        const productsChartElement = document.getElementById('productsChart');

        if (revenueChartElement) {
            // Revenue Chart
            const revenueResponse = await fetch('/api/reports/charts/line?groupBy=month');
            if (revenueResponse.ok) {
                const revenueData = await revenueResponse.json();
                createChart('revenueChart', 'line', revenueData);
            }
        }

        if (productsChartElement) {
            // Products Chart
            const productsResponse = await fetch('/api/reports/charts/doughnut?limit=5');
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                createChart('productsChart', 'doughnut', productsData);
            }
        }

    } catch (error) {
        console.error('Error loading initial charts:', error);
    }
}

async function loadAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading alerts...</div>';
    try {
        const response = await fetch('/api/reports/alerts?isActionable=true');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const alerts = await response.json();

        if (alerts.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No actionable alerts at this time.</p></div>';
            return;
        }

        let alertsHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.severity.toLowerCase()}">
                <div class="alert-icon"><i class="fas ${getAlertIcon(alert.severity)}"></i></div>
                <div class="alert-content">
                    <p class="alert-message">${alert.message}</p>
                    <small class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
                ${alert.actionLink ? `<a href="${alert.actionLink}" class="btn btn-sm btn-light">View</a>` : ''}
            </div>
        `).join('');
        container.innerHTML = alertsHTML;

    } catch (error) {
        console.error('Error loading alerts:', error);
        container.innerHTML = '<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Failed to load alerts.</p></div>';
    }
}

function createChart(chartId, chartType, data) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
        console.warn(`Chart element with ID '${chartId}' not found`);
        return;
    }
    
    const ctx = chartElement.getContext('2d');
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
    charts[chartId] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: data.labels,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                backgroundColor: chartType === 'line' ? 'rgba(75, 192, 192, 0.2)' : getChartColors(data.labels.length),
                borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : getChartColors(data.labels.length),
                borderWidth: 1,
                fill: chartType === 'line'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: chartType === 'doughnut' ? 'right' : 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: chartType !== 'doughnut' ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            } : {}
        }
    });
}

async function loadReport(reportType) {
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    const reportContent = document.getElementById('reportContent');
    const reportTitle = document.getElementById('reportModalLabel');
    
    reportTitle.textContent = 'Loading Report...';
    reportContent.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading report...</div>';
    modal.show();

    let url = '';
    let title = '';

    // Basic Reports
    if (reportType === 'inventory-overview') {
        url = '/api/reports/inventory/overview';
        title = 'Inventory Overview';
    } else if (reportType === 'sales-overview') {
        url = '/api/reports/sales/overview';
        title = 'Sales Overview';
    } else if (reportType === 'product-performance') {
        url = '/api/reports/products/performance?topCount=10&sortBy=revenue';
        title = 'Top 10 Product Performance';
    } 
    // Add other basic and advanced reports here
    else {
        reportContent.innerHTML = '<p>Report not implemented yet.</p>';
        reportTitle.textContent = 'Not Implemented';
        return;
    }
    
    reportTitle.textContent = title;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load report: ${response.statusText}`);
        const data = await response.json();
        renderReportContent(data, reportType);
    } catch (error) {
        console.error(`Error loading report ${reportType}:`, error);
        reportContent.innerHTML = `<div class="empty-state error"><p>Error loading report.</p><small>${error.message}</small></div>`;
    }
}

function renderReportContent(data, reportType) {
    const container = document.getElementById('reportContent');
    let contentHTML = '';

    if (reportType === 'inventory-overview') {
        const asOfDate = data.asOfDate ? new Date(data.asOfDate).toLocaleDateString() : new Date().toLocaleDateString();
        const totalProducts = data.totalProducts || 0;
        const totalUnits = data.totalUnitsInStock || data.totalUnits || 0;
        const inventoryValue = data.totalInventoryValue || data.inventoryValue || 0;
        const lowStockCount = data.lowStockCount || 0;
        const outOfStockCount = data.outOfStockCount || 0;
        
        contentHTML = `
            <div class="report-header mb-4">
                <h4 class="text-primary">Inventory Overview</h4>
                <p class="text-muted">As of ${asOfDate}</p>
            </div>
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <h5 class="card-title text-primary">${totalProducts.toLocaleString()}</h5>
                            <p class="card-text">Total Products</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-info">
                        <div class="card-body text-center">
                            <h5 class="card-title text-info">${totalUnits.toLocaleString()}</h5>
                            <p class="card-text">Total Units</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <h5 class="card-title text-success">${formatCurrency(inventoryValue)}</h5>
                            <p class="card-text">Inventory Value</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="alert alert-warning d-flex align-items-center">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <div>
                            <strong>Low Stock:</strong> ${lowStockCount.toLocaleString()} items
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="alert alert-danger d-flex align-items-center">
                        <i class="fas fa-times-circle me-2"></i>
                        <div>
                            <strong>Out of Stock:</strong> ${outOfStockCount.toLocaleString()} items
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (reportType === 'product-performance') {
        contentHTML = '<h4>Top 10 Products by Revenue</h4>';
        contentHTML += '<div class="table-responsive">';
        contentHTML += '<table class="table table-hover table-striped">';
        contentHTML += '<thead class="table-dark"><tr><th>Product</th><th>Units Sold</th><th>Total Revenue</th></tr></thead><tbody>';
        data.forEach(p => {
            const unitsSold = p.unitsSold || p.quantitySold || p.totalQuantity || 0;
            const productName = p.productName || p.name || 'Unknown Product';
            const totalRevenue = p.totalRevenue || p.revenue || 0;
            contentHTML += `<tr>
                <td><strong>${productName}</strong></td>
                <td class="text-center">${unitsSold.toLocaleString()}</td>
                <td class="text-end"><strong>${formatCurrency(totalRevenue)}</strong></td>
            </tr>`;
        });
        contentHTML += '</tbody></table>';
        contentHTML += '</div>';
    }
    // Add rendering for other reports
    else {
        contentHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    container.innerHTML = contentHTML;
}


// Global functions accessible from HTML
window.loadReport = loadReport;

window.refreshCharts = function() {
    loadInitialCharts();
};

window.refreshAlerts = function() {
    loadAlerts();
};

window.openFullDashboard = function() {
    // This could navigate to a more detailed dashboard page
    alert('Opening full dashboard (not implemented).');
};

window.exportReport = function() {
    // This would get the current report type and trigger an export
    alert('Exporting report (not implemented).');
};


// --- UTILITY FUNCTIONS ---

function formatCurrency(value) {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
}

function getAlertIcon(severity) {
    switch (severity.toLowerCase()) {
        case 'critical': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function getChartColors(numColors) {
    const colors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];
    let result = [];
    for (let i = 0; i < numColors; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}
