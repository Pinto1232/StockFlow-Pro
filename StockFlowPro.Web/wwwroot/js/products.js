// Products Management JavaScript

let products = [];
let filteredProducts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadDashboardStats();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(filterProducts, 300));
    
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
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
            filteredProducts = [...products];
            renderProductsTable();
        } else {
            showAlert('Error loading products', 'danger');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Error loading products', 'danger');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/products/dashboard-stats');
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalProducts').textContent = stats.totalProducts;
            document.getElementById('totalValue').textContent = '$' + stats.totalValue.toFixed(2);
            document.getElementById('lowStockCount').textContent = stats.lowStockCount;
            document.getElementById('outOfStockCount').textContent = stats.outOfStockCount;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Filter products based on search and filters
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeOnly = document.getElementById('activeOnlyFilter').checked;
    const inStockOnly = document.getElementById('inStockOnlyFilter').checked;
    const lowStockOnly = document.getElementById('lowStockOnlyFilter').checked;
    
    filteredProducts = products.filter(product => {
        // Search filter
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Active only filter
        if (activeOnly && !product.isActive) {
            return false;
        }
        
        // In stock only filter
        if (inStockOnly && !product.isInStock) {
            return false;
        }
        
        // Low stock only filter
        if (lowStockOnly && !product.isLowStock) {
            return false;
        }
        
        return true;
    });
    
    renderProductsTable();
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('activeOnlyFilter').checked = false;
    document.getElementById('inStockOnlyFilter').checked = false;
    document.getElementById('lowStockOnlyFilter').checked = false;
    
    filteredProducts = [...products];
    renderProductsTable();
}

// Render products table
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // Stock status badge
        let stockBadge = '';
        if (!product.isInStock) {
            stockBadge = '<span class="badge badge-danger">Out of Stock</span>';
        } else if (product.isLowStock) {
            stockBadge = '<span class="badge badge-warning">Low Stock</span>';
        } else {
            stockBadge = '<span class="badge badge-success">In Stock</span>';
        }
        
        // Active status badge
        const activeBadge = product.isActive 
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-secondary">Inactive</span>';
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.costPerItem.toFixed(2)}</td>
            <td>${product.numberInStock} ${stockBadge}</td>
            <td>$${product.totalValue.toFixed(2)}</td>
            <td>${activeBadge}</td>
            <td>${new Date(product.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="updateStock('${product.id}', ${product.numberInStock})">
                    <i class="fas fa-boxes"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}', '${product.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
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
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showAlert('Product created successfully', 'success');
            document.getElementById('createProductForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('createProductModal')).hide();
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            showAlert('Error creating product: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        showAlert('Error creating product', 'danger');
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
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
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showAlert('Product updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            showAlert('Error updating product: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showAlert('Error updating product', 'danger');
    }
}

// Update stock (quick update)
function updateStock(productId, currentStock) {
    const newStock = prompt(`Update stock for this product (current: ${currentStock}):`);
    if (newStock === null || newStock === '') return;
    
    const stockNumber = parseInt(newStock);
    if (isNaN(stockNumber) || stockNumber < 0) {
        showAlert('Please enter a valid stock number', 'danger');
        return;
    }
    
    updateProductStock(productId, stockNumber);
}

// Update product stock via API
async function updateProductStock(productId, newStock) {
    try {
        const response = await fetch(`/api/products/${productId}/stock`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numberInStock: newStock })
        });
        
        if (response.ok) {
            showAlert('Stock updated successfully', 'success');
            loadProducts();
            loadDashboardStats();
        } else {
            const error = await response.text();
            showAlert('Error updating stock: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showAlert('Error updating stock', 'danger');
    }
}

// Delete product
function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        return;
    }
    
    deleteProductConfirmed(productId);
}

// Delete product confirmed
async function deleteProductConfirmed(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('Product deleted successfully', 'success');
            loadProducts();
            loadDashboardStats();
        } else {
            showAlert('Error deleting product', 'danger');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
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