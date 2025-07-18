let products = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 5;

// Console log functionality
let consoleLogContainer;
let isConsoleVisible = true;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeConsole();
    loadProducts();
    loadDashboardStats();
    setupEventListeners();
});

// Initialize console log functionality
function initializeConsole() {
    consoleLogContainer = document.getElementById('consoleLogContainer');
    
    // Setup console toggle button
    const toggleBtn = document.getElementById('toggleConsoleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleConsole);
    }
    
    // Setup clear console button
    const clearBtn = document.getElementById('clearConsoleBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearConsole);
    }
    
    // Log initial message to both browser console and custom UI
    console.log('🚀 Product Management Console initialized - All data is also logged to browser console (F12)');
    console.info('💡 Tip: Open Developer Tools (F12) to see detailed product data with expandable objects');
    
    addConsoleLog('system', 'Product Management Console initialized - Ready to log database operations');
    addConsoleLog('system', '💡 All data is also logged to browser console (F12) for detailed inspection');
}

// Add log entry to console
function addConsoleLog(type, message) {
    // Log to browser console with appropriate method based on type
    const browserMessage = `[${type.toUpperCase()}] ${message}`;
    
    switch(type) {
        case 'error':
            console.error(browserMessage);
            break;
        case 'api':
        case 'database':
        case 'table-render':
            console.info(browserMessage);
            break;
        case 'table-data':
        case 'data-structure':
            console.log(browserMessage);
            break;
        case 'system':
        default:
            console.log(browserMessage);
            break;
    }
    
    // Also add to custom console UI
    if (!consoleLogContainer) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `console-log-entry ${type}`;
    
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;
    
    consoleLogContainer.appendChild(logEntry);
    
    // Auto-scroll to bottom
    consoleLogContainer.scrollTop = consoleLogContainer.scrollHeight;
    
    // Keep only last 100 entries to prevent memory issues
    const entries = consoleLogContainer.querySelectorAll('.console-log-entry');
    if (entries.length > 100) {
        entries[0].remove();
    }
}

// Toggle console visibility
function toggleConsole() {
    const consoleCard = document.getElementById('consoleLogCard');
    const toggleBtn = document.getElementById('toggleConsoleBtn');
    
    if (isConsoleVisible) {
        consoleCard.classList.add('collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Show';
        isConsoleVisible = false;
    } else {
        consoleCard.classList.remove('collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Hide';
        isConsoleVisible = true;
    }
}

// Clear console log
function clearConsole() {
    if (consoleLogContainer) {
        consoleLogContainer.innerHTML = `
            <div class="console-log-entry system">
                <span class="timestamp">[System]</span>
                <span class="message">Console cleared - Ready to log database operations</span>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(filterProducts, 300));
    
    // Clear search button
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            filterProducts();
        });
    }
    
    // Filter checkboxes
    document.getElementById('activeOnlyFilter').addEventListener('change', filterProducts);
    document.getElementById('inStockOnlyFilter').addEventListener('change', filterProducts);
    document.getElementById('lowStockOnlyFilter').addEventListener('change', filterProducts);
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Create product form
    document.getElementById('createProductForm').addEventListener('submit', handleCreateProduct);
    
    // Edit product form
    document.getElementById('editProductForm').addEventListener('submit', handleEditProduct);
    
    // Page size selector
    document.querySelectorAll('.page-size-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            itemsPerPage = parseInt(e.target.dataset.size);
            currentPage = 1;
            document.getElementById('pageSize').textContent = itemsPerPage;
            renderProductsTable();
            renderPagination();
        });
    });
}

// Load all products using enhanced API
async function loadProducts() {
    try {
        addConsoleLog('api', 'Making API call to /api/products (Enhanced) - Loading all products with formatting');
        
        const response = await fetch('/api/products');
        if (response.ok) {
            const apiResponse = await response.json();
            // Handle both direct array and ApiResponse wrapper
            products = apiResponse.data || apiResponse;
            filteredProducts = [...products];
            currentPage = 1;
            
            addConsoleLog('api', `Successfully loaded ${products.length} enhanced products from API`);
            addConsoleLog('database', `Database returned ${products.length} product records with shared utility formatting`);
            
            // Log complete product data structure for debugging
            console.group('📋 Complete Product Data Structure');
            products.forEach((product, index) => {
                console.log(`🔍 Product ${index + 1} Full Data:`, product);
            });
            console.groupEnd();
            
            // Also log to custom console UI
            addConsoleLog('data-structure', `📋 Complete Product Data Structure:`);
            products.forEach((product, index) => {
                addConsoleLog('data-structure', `🔍 Product ${index + 1} Full Data: ${JSON.stringify(product, null, 2)}`);
            });
            
            renderProductsTable();
            renderPagination();
        } else {
            addConsoleLog('error', `Failed to load products - HTTP ${response.status}`);
            showAlert('Error loading products', 'danger');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        addConsoleLog('error', `Error loading products: ${error.message}`);
        showAlert('Error loading products', 'danger');
    }
}

// Load enhanced dashboard statistics
async function loadDashboardStats() {
    try {
        addConsoleLog('api', 'Making API call to /api/products/dashboard-stats (Enhanced) - Loading formatted dashboard statistics');
        
        const response = await fetch('/api/products/dashboard-stats');
        if (response.ok) {
            const apiResponse = await response.json();
            const stats = apiResponse.data || apiResponse;
            
            // Use enhanced formatted values from shared utilities
            document.getElementById('totalProducts').textContent = stats.totalProductsFormatted || stats.totalProducts;
            document.getElementById('totalProducts').title = `${stats.totalProducts} products total`;
            
            document.getElementById('totalValue').textContent = stats.totalValueFormatted || ('R' + stats.totalValue.toFixed(2));
            document.getElementById('totalValue').title = `Total inventory value: ${stats.totalValueFormatted} (${stats.totalValueShort})`;
            
            document.getElementById('lowStockCount').textContent = `${stats.lowStockCount} (${stats.lowStockPercentage || '0%'})`;
            document.getElementById('lowStockCount').title = `${stats.lowStockCount} products with low stock (${stats.lowStockPercentage})`;
            
            document.getElementById('outOfStockCount').textContent = `${stats.outOfStockCount} (${stats.outOfStockPercentage || '0%'})`;
            document.getElementById('outOfStockCount').title = `${stats.outOfStockCount} products out of stock (${stats.outOfStockPercentage})`;
            
            // Add health score and status summary if available
            if (stats.healthScore !== undefined) {
                addConsoleLog('api', `Inventory Health Score: ${stats.healthScore}% - ${stats.statusSummary}`);
            }
            
            addConsoleLog('api', `Enhanced dashboard stats loaded - Total: ${stats.totalProductsFormatted}, Value: ${stats.totalValueFormatted}, Health: ${stats.healthScore}%`);
            addConsoleLog('database', `Enhanced dashboard statistics with shared utility formatting retrieved successfully`);
        } else {
            addConsoleLog('error', `Failed to load dashboard stats - HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        addConsoleLog('error', `Error loading dashboard stats: ${error.message}`);
    }
}

// Filter products based on search and filters
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeOnly = document.getElementById('activeOnlyFilter').checked;
    const inStockOnly = document.getElementById('inStockOnlyFilter').checked;
    const lowStockOnly = document.getElementById('lowStockOnlyFilter').checked;
    
    addConsoleLog('system', `Filtering products - Search: "${searchTerm}", Active: ${activeOnly}, InStock: ${inStockOnly}, LowStock: ${lowStockOnly}`);
    
    filteredProducts = products.filter(product => {
        return (!searchTerm || product.name.toLowerCase().includes(searchTerm)) &&
               (!activeOnly || product.isActive) &&
               (!inStockOnly || product.isInStock) &&
               (!lowStockOnly || product.isLowStock);
    });
    
    addConsoleLog('system', `Filter applied - ${filteredProducts.length} products match criteria`);
    
    currentPage = 1; // Reset to first page when filtering
    renderProductsTable();
    renderPagination();
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('activeOnlyFilter').checked = false;
    document.getElementById('inStockOnlyFilter').checked = false;
    document.getElementById('lowStockOnlyFilter').checked = false;
    
    filteredProducts = [...products];
    currentPage = 1;
    
    addConsoleLog('system', 'All filters cleared - Showing all products');
    
    renderProductsTable();
    renderPagination();
}

// Get paginated products for current page
function getPaginatedProducts() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
}

// Render products table
function renderProductsTable() {
    const container = document.getElementById('product-table-section');
    if (!container) return;

    if (filteredProducts.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        updateProductCount();
        return;
    }

    const paginatedProducts = getPaginatedProducts();
    
    // Console log the products being displayed in the current page
    console.group(`🔄 Rendering Product Management Table - Page ${currentPage}`);
    console.info(`Showing ${paginatedProducts.length} of ${filteredProducts.length} products`);
    
    addConsoleLog('table-render', `🔄 Rendering Product Management Table - Page ${currentPage}, Showing ${paginatedProducts.length} of ${filteredProducts.length} products`);
    
    // Log detailed data for each product being displayed
    paginatedProducts.forEach((product, index) => {
        const productData = {
            id: product.id,
            name: product.name,
            formattedName: product.formattedName,
            costPerItem: product.costPerItem,
            formattedPrice: product.formattedPrice,
            numberInStock: product.numberInStock,
            totalValue: product.totalValue,
            formattedTotalValue: product.formattedTotalValue,
            isActive: product.isActive,
            isInStock: product.isInStock,
            isLowStock: product.isLowStock,
            stockStatus: product.stockStatus,
            createdAt: product.createdAt,
            createdDisplay: product.createdDisplay,
            createdFriendly: product.createdFriendly
        };
        
        // Log to browser console with expandable object
        console.log(`📊 Product ${index + 1} Data:`, productData);
        
        // Log to custom console UI
        addConsoleLog('table-data', `📊 Product ${index + 1}: ${JSON.stringify(productData, null, 2)}`);
    });
    
    console.groupEnd();
    
    const tableHTML = `
        <div class="table-responsive-wrapper">
            <table class="table table-hover product-table" id="productsTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Cost per Item</th>
                        <th>Stock</th>
                        <th>Total Value</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedProducts.map(product => createProductRowHTML(product)).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
    updateProductCount();
}

function createProductRowHTML(product) {
    // Use enhanced formatted data from shared utilities if available
    const productName = product.formattedName || product.name;
    const productPrice = product.formattedPrice || product.costPerItem.toFixed(2);
    const productTotalValue = product.formattedTotalValue || product.totalValue.toFixed(2);
    const stockDisplay = product.stockDisplay || `${product.numberInStock} units`;
    const createdDisplay = product.createdDisplay || new Date(product.createdAt).toLocaleDateString();
    const createdFriendly = product.createdFriendly || '';
    
    // Console log the product data being displayed in the table
    addConsoleLog('table-data', `📋 Product Table Row Data: ID=${product.id}, Name="${productName}", Price="${productPrice}", Stock="${stockDisplay}", TotalValue="${productTotalValue}", Status="${product.isActive ? 'Active' : 'Inactive'}", Created="${createdDisplay}"`);
    
    // Use enhanced status badges if available
    const stockStatusBadge = product.stockStatusBadge;
    let stockBadge;
    if (stockStatusBadge) {
        const badgeClass = stockStatusBadge === 'danger' ? 'bg-danger' : 
                          stockStatusBadge === 'warning' ? 'bg-warning' : 'bg-success';
        const badgeText = product.stockStatus || 'In Stock';
        stockBadge = `<span class="badge ${badgeClass}">${badgeText}</span>`;
    } else {
        // Fallback to original logic
        if (!product.isInStock) {
            stockBadge = '<span class="badge bg-danger">Out of Stock</span>';
        } else if (product.isLowStock) {
            stockBadge = '<span class="badge bg-warning">Low Stock</span>';
        } else {
            stockBadge = '<span class="badge bg-success">In Stock</span>';
        }
    }
    
    // Use enhanced active status badge if available
    const activeBadge = product.activeStatusBadge ? 
        `<span class="badge ${product.activeStatusBadge === 'Active' ? 'bg-success' : 'bg-secondary'}">${product.activeStatusBadge}</span>` :
        (product.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>');
    
    // Add enhanced information in tooltips
    const priceTooltip = product.priceRange ? `Price Range: ${product.priceRange}` : '';
    const stockTooltip = product.stockLevel ? `Stock Level: ${product.stockLevel}` : '';
    const createdTooltip = createdFriendly ? `Created ${createdFriendly}` : '';
    
    return `
        <tr>
            <td><strong title="${escapeHtml(productName)}">${escapeHtml(productName)}</strong></td>
            <td title="${priceTooltip}">${productPrice}</td>
            <td title="${stockTooltip}">${stockDisplay} ${stockBadge}</td>
            <td title="Total Value: ${productTotalValue}">${productTotalValue}</td>
            <td>${activeBadge}</td>
            <td title="${createdTooltip}">${createdDisplay}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="Edit Product">
                        <i class="fas fa-edit"></i> <span>Edit</span>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="updateStock('${product.id}', ${product.numberInStock})" title="Update Stock">
                        <i class="fas fa-boxes"></i> <span>Stock</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}', '${escapeHtml(product.name)}')" title="Delete Product">
                        <i class="fas fa-trash"></i> <span>Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function getEmptyStateHTML() {
    const searchTerm = document.getElementById('searchInput').value;
    const message = searchTerm ? 
        'No products found matching your search criteria.' : 
        'No products found.';
    
    return `
        <div class="empty-state">
            <i class="fas fa-boxes"></i>
            <h5>${message}</h5>
            ${searchTerm ? '<p>Try adjusting your search terms or filters.</p>' : '<p>Create your first product to get started.</p>'}
        </div>
    `;
}

function updateProductCount() {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        const total = filteredProducts.length;
        countElement.textContent = `${total} product${total !== 1 ? 's' : ''}`;
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    console.log('Product Pagination Debug:', {
        filteredProductsLength: filteredProducts.length,
        itemsPerPage: itemsPerPage,
        totalPages: totalPages,
        paginationContainer: paginationContainer
    });
    
    if (!paginationContainer) {
        console.error('Pagination container not found!');
        return;
    }
    
    if (totalPages <= 1) {
        console.log('Not enough pages for pagination, hiding pagination');
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;

    // Calculate page range to show
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // First page and ellipsis
    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;
    console.log('Product pagination rendered successfully with', totalPages, 'pages');

    // Add event listeners to pagination links
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                changePage(page);
            }
        });
    });
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    addConsoleLog('system', `Changed to page ${page} of ${totalPages}`);
    
    renderProductsTable();
    renderPagination();
    
    // Scroll to top of table
    const tableElement = document.getElementById('productsTable');
    if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle create product form submission
async function handleCreateProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('createProductName').value,
        costPerItem: parseFloat(document.getElementById('createProductCost').value),
        numberInStock: parseInt(document.getElementById('createProductStock').value)
    };
    
    try {
        addConsoleLog('api', `Creating new product: ${productData.name} - Cost: ${productData.costPerItem}, Stock: ${productData.numberInStock}`);
        
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            const newProduct = await response.json();
            addConsoleLog('api', `Product created successfully: ${newProduct.name} (ID: ${newProduct.id})`);
            addConsoleLog('database', `New product record inserted into database`);
            
            showAlert('Product created successfully', 'success');
            document.getElementById('createProductForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('createProductModal')).hide();
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            addConsoleLog('error', `Failed to create product: ${error}`);
            showAlert('Error creating product: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        addConsoleLog('error', `Error creating product: ${error.message}`);
        showAlert('Error creating product', 'danger');
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    addConsoleLog('system', `Opening edit form for product: ${product.name} (ID: ${productId})`);
    
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCost').value = product.costPerItem;
    document.getElementById('editProductStock').value = product.numberInStock;
    
    new bootstrap.Modal(document.getElementById('editProductModal')).show();
}

// Handle edit product form submission
async function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const productData = {
        name: document.getElementById('editProductName').value,
        costPerItem: parseFloat(document.getElementById('editProductCost').value),
        numberInStock: parseInt(document.getElementById('editProductStock').value)
    };
    
    try {
        addConsoleLog('api', `Updating product ID: ${productId} - Name: ${productData.name}, Cost: ${productData.costPerItem}, Stock: ${productData.numberInStock}`);
        
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            const updatedProduct = await response.json();
            addConsoleLog('api', `Product updated successfully: ${updatedProduct.name} (ID: ${productId})`);
            addConsoleLog('database', `Product record updated in database`);
            
            showAlert('Product updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            addConsoleLog('error', `Failed to update product: ${error}`);
            showAlert('Error updating product: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        addConsoleLog('error', `Error updating product: ${error.message}`);
        showAlert('Error updating product', 'danger');
    }
}

// Update stock (quick update)
function updateStock(productId, currentStock) {
    const product = products.find(p => p.id === productId);
    const productName = product ? product.name : 'Unknown';
    
    addConsoleLog('system', `Opening stock update for product: ${productName} (Current: ${currentStock})`);
    
    const newStock = prompt(`Update stock for this product (current: ${currentStock}):`);
    if (newStock === null || newStock === '') return;
    
    const stockNumber = parseInt(newStock);
    if (isNaN(stockNumber) || stockNumber < 0) {
        addConsoleLog('error', `Invalid stock number entered: ${newStock}`);
        showAlert('Please enter a valid stock number', 'danger');
        return;
    }
    
    updateProductStock(productId, stockNumber);
}

// Update product stock via API
async function updateProductStock(productId, newStock) {
    try {
        addConsoleLog('api', `Updating stock for product ID: ${productId} - New stock: ${newStock}`);
        
        const response = await fetch(`/api/products/${productId}/stock`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numberInStock: newStock })
        });
        
        if (response.ok) {
            const updatedProduct = await response.json();
            addConsoleLog('api', `Stock updated successfully for product: ${updatedProduct.name} - New stock: ${newStock}`);
            addConsoleLog('database', `Product stock updated in database`);
            
            showAlert('Stock updated successfully', 'success');
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            addConsoleLog('error', `Failed to update stock: ${error}`);
            showAlert('Error updating stock: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        addConsoleLog('error', `Error updating stock: ${error.message}`);
        showAlert('Error updating stock', 'danger');
    }
}

// Delete product
function deleteProduct(productId, productName) {
    addConsoleLog('system', `Delete confirmation requested for product: ${productName} (ID: ${productId})`);
    
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        addConsoleLog('system', `Delete cancelled for product: ${productName}`);
        return;
    }
    
    deleteProductConfirmed(productId);
}

// Delete product confirmed
async function deleteProductConfirmed(productId) {
    try {
        addConsoleLog('api', `Deleting product ID: ${productId}`);
        
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            addConsoleLog('api', `Product deleted successfully (ID: ${productId})`);
            addConsoleLog('database', `Product record removed from database`);
            
            showAlert('Product deleted successfully', 'success');
            loadProducts();
            loadDashboardStats();
        } else {
            addConsoleLog('error', `Failed to delete product - HTTP ${response.status}`);
            showAlert('Error deleting product', 'danger');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        addConsoleLog('error', `Error deleting product: ${error.message}`);
        showAlert('Error deleting product', 'danger');
    }
}

// Utility functions
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of container
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Console Log Show/Hide functionality and Stats Tooltips
function initializeProductsPageExtensions() {
    const showConsoleBtn = document.getElementById('showConsoleBtn');
    const toggleConsoleBtn = document.getElementById('toggleConsoleBtn');
    const consoleLogCard = document.getElementById('consoleLogCard');
    
    // Show console log when "Show Console Log" button is clicked
    if (showConsoleBtn) {
        showConsoleBtn.addEventListener('click', function() {
            consoleLogCard.style.display = 'block';
            showConsoleBtn.style.display = 'none';
        });
    }
    
    // Hide console log when "Hide" button is clicked
    if (toggleConsoleBtn) {
        toggleConsoleBtn.addEventListener('click', function() {
            consoleLogCard.style.display = 'none';
            showConsoleBtn.style.display = 'inline-flex';
        });
    }

    // Function to update tooltip values
    function updateTooltipValues() {
        const statsValues = document.querySelectorAll('.stats-card-value');
        statsValues.forEach(function(element) {
            const currentValue = element.textContent || element.innerText;
            element.setAttribute('title', currentValue);
        });
    }

    // Update tooltips initially
    updateTooltipValues();

    // Create a MutationObserver to watch for changes in stats values
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('stats-card-value')) {
                    const currentValue = target.textContent || target.innerText;
                    target.setAttribute('title', currentValue);
                }
            }
        });
    });

    // Start observing changes to stats card values
    const statsCards = document.querySelectorAll('.stats-card-value');
    statsCards.forEach(function(card) {
        observer.observe(card, {
            childList: true,
            characterData: true,
            subtree: true
        });
    });

    // Also provide a global function to manually update tooltips
    window.updateStatsTooltips = updateTooltipValues;
}

// Initialize the extensions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPageExtensions();
    logEnhancedFeaturesInfo();
});

// Log information about enhanced features and shared utilities integration
function logEnhancedFeaturesInfo() {
    addConsoleLog('system', '📦 String Extensions: Title case formatting, truncation, slug generation');
    addConsoleLog('system', '💰 Decimal Extensions: Currency formatting, percentage calculations, short format (K/M/B)');
    addConsoleLog('system', '⏰ DateTime Extensions: Friendly time display, consistent date formatting');
    addConsoleLog('system', '🎯 Enhanced API: Products now include formatted properties using shared utilities');
    addConsoleLog('system', '📊 Dashboard Stats: Enhanced with percentages, health scores, and formatted values');
    addConsoleLog('system', '✨ UI Improvements: Tooltips, enhanced badges, and better visual feedback');
}