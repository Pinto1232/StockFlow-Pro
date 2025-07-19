// Invoice Management JavaScript

let currentInvoice = null;
let products = []; // CRITICAL: Always initialize as empty array
let newInvoiceItems = [];
let allInvoices = [];
let filteredInvoices = [];
let currentPage = 1;
let itemsPerPage = 5;

// EMERGENCY SAFETY CHECK - Ensure products is always an array
if (!Array.isArray(products)) {
    console.error('GLOBAL FIX: Products was not an array at startup:', typeof products, products);
    products = [];
}
window.products = products; // Also set on window for debugging 

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkUserPermissions();
    loadInvoices();
    loadProducts();
    loadUsers();
    
    // Add global modal cleanup event listeners
    setupModalCleanup();
    
    // Set default date to today for both modals
    const today = new Date().toISOString().split('T')[0];
    const invoiceDateField = document.getElementById('invoiceDate');
    if (invoiceDateField) {
        invoiceDateField.value = today;
    }
    const newInvoiceDateField = document.getElementById('newInvoiceDate');
    if (newInvoiceDateField) {
        newInvoiceDateField.value = today;
    }
    
    // Initialize page size dropdown event listeners
    document.querySelectorAll('.page-size-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            itemsPerPage = parseInt(e.target.dataset.size);
            currentPage = 1;
            document.getElementById('pageSize').textContent = itemsPerPage;
            displayInvoices();
        });
    });
});

// Setup modal cleanup event listeners
function setupModalCleanup() {
    console.log('🔧 Setting up modal cleanup listeners...');
    
    // Listen for Bootstrap modal hidden events
    const modal = document.getElementById('createInvoiceModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function () {
            console.log('🔴 Bootstrap modal hidden event triggered');
            // Ensure backdrop is completely removed
            setTimeout(() => {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => {
                    console.log('🔴 Cleanup: Removing leftover backdrop');
                    backdrop.remove();
                });
                
                // Reset body styles
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 100);
        });
        
        // Also listen for hide event (before hidden)
        modal.addEventListener('hide.bs.modal', function () {
            console.log('🔴 Bootstrap modal hide event triggered');
        });
    }
}

// Check user permissions and show appropriate UI
async function checkUserPermissions() {
    console.log('🟢 === CHECKING USER PERMISSIONS ===');
    
    try {
        console.log('🟢 Fetching auth status from /api/diagnostics/auth-status');
        const response = await fetch('/api/diagnostics/auth-status');
        console.log('🟢 Auth status response:', response.status, response.ok);
        
        if (response.ok) {
            const authStatus = await response.json();
            console.log('🟢 Auth status data:', authStatus);
            console.log('🟢 isAuthenticated:', authStatus.isAuthenticated);
            console.log('🟢 roles:', authStatus.roles);
            console.log('🟢 userId:', authStatus.userId);
            
            if (!authStatus.isAuthenticated) {
                console.log('🔴 User not authenticated - showing login warning');
                showPermissionWarning('You need to be logged in to manage invoices. Please <a href="/Login" class="alert-link">sign in</a> to continue.');
                disableInvoiceCreation();
            } else if (!authStatus.roles.includes('Manager') && !authStatus.roles.includes('Admin')) {
                console.log('🔴 User lacks required role - showing role upgrade warning');
                console.log('🔴 Current roles:', authStatus.roles);
                showPermissionWarning('You need Manager or Administrator privileges to create invoices. You currently have "' + (authStatus.roles[0] || 'User') + '" role. Please contact your administrator to upgrade your account.');
                disableInvoiceCreation();
            } else {
                console.log('🟢 ✅ User has correct role! Checking sync status...');
                // User has correct role, but check if they need synchronization
                await checkUserSyncStatus(authStatus.userId);
            }
        } else {
            console.error('🔴 Auth status request failed:', response.status);
            const errorText = await response.text();
            console.error('🔴 Auth status error:', errorText);
            // Don't disable on auth check failure - let user try
            console.log('🟡 Auth check failed, but not disabling invoice creation');
        }
    } catch (error) {
        console.error('🔴 Error checking user permissions:', error);
        // Don't disable on error - let user try
        console.log('🟡 Permission check failed, but not disabling invoice creation');
    }
    
    console.log('🟢 === PERMISSION CHECK COMPLETE ===');
}

// Check if user needs synchronization
async function checkUserSyncStatus(userId) {
    console.log('🔵 === CHECKING USER SYNC STATUS ===');
    console.log('🔵 Checking sync for user ID:', userId);
    
    try {
        const response = await fetch(`/api/usersynchronization/check/${userId}`);
        console.log('🔵 Sync check response:', response.status, response.ok);
        
        if (response.ok) {
            const syncStatus = await response.json();
            console.log('🔵 Sync status data:', syncStatus);
            console.log('🔵 Requires sync:', syncStatus.requiresSync);
            
            if (syncStatus.requiresSync) {
                console.log('🔴 User requires sync - showing sync warning');
                showSyncWarning('Your account needs to be synchronized with the database before you can create invoices.');
                disableInvoiceCreation();
            } else {
                console.log('🟢 ✅ User does not require sync - invoice creation enabled!');
            }
        } else {
            console.error('🔴 Sync check request failed:', response.status);
            const errorText = await response.text();
            console.error('🔴 Sync check error:', errorText);
            // Don't disable on sync check failure - let user try
            console.log('🟡 Sync check failed, but not disabling invoice creation');
        }
    } catch (error) {
        console.error('🔴 Error checking user sync status:', error);
        // Don't disable on error - let user try
        console.log('🟡 Sync check failed, but not disabling invoice creation');
    }
    
    console.log('🔵 === SYNC CHECK COMPLETE ===');
}

// Show synchronization warning
function showSyncWarning(message) {
    const container = document.getElementById('invoice-table-section');
    if (container) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning mb-3';
        warningDiv.innerHTML = `
            <i class="fas fa-sync-alt me-2"></i>
            ${message}
            <div class="mt-2">
                <button class="btn btn-sm btn-primary" onclick="attemptUserSync()">
                    <i class="fas fa-sync-alt me-1"></i>Sync My Account
                </button>
            </div>
        `;
        container.parentNode.insertBefore(warningDiv, container);
    }
}

// Show permission warning
function showPermissionWarning(message) {
    const container = document.getElementById('invoice-table-section');
    if (container) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning mb-3';
        warningDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary" onclick="requestRoleUpgrade()">
                    <i class="fas fa-user-plus me-1"></i>Request Role Upgrade
                </button>
            </div>
        `;
        container.parentNode.insertBefore(warningDiv, container);
    }
}

// Request role upgrade - redirect to the role upgrade request page
function requestRoleUpgrade() {
    window.location.href = '/RequestRoleUpgrade';
}

// Disable invoice creation buttons
function disableInvoiceCreation() {
    const createButtons = document.querySelectorAll('[data-bs-target="#createInvoiceModal"], [onclick*="createInvoice"]');
    createButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
        button.title = 'You need Manager or Administrator privileges to create invoices';
    });
}

// Load all invoices
async function loadInvoices() {
    try {
        showLoadingState();
        const response = await fetch('/api/invoices');
        if (response.ok) {
            const invoices = await response.json();
            allInvoices = invoices;
            filteredInvoices = [...invoices];
            currentPage = 1;
            displayInvoices();
        } else {
            console.error('Failed to load invoices');
            showAlert('Failed to load invoices', 'danger');
            showErrorState('Failed to load invoices');
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
        showAlert('Error loading invoices', 'danger');
        showErrorState('Error loading invoices');
    }
}

// Display invoices in the table
function displayInvoices() {
    const container = document.getElementById('invoice-table-section');
    const countElement = document.getElementById('invoiceCount');
    
    // Update count
    if (countElement) {
        const total = filteredInvoices.length;
        countElement.textContent = `${total} invoice${total !== 1 ? 's' : ''}`;
    }

    if (filteredInvoices.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInvoices = filteredInvoices.slice(startIndex, endIndex);

    const tableHTML = `
        <div class="table-responsive-wrapper">
            <table class="table table-hover invoice-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Date Created</th>
                        <th>Created By</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageInvoices.map(invoice => createInvoiceRowHTML(invoice)).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
    renderPagination();
}

// Create invoice row HTML
function createInvoiceRowHTML(invoice) {
    const invoiceNumber = invoice.id.substring(0, 8).toUpperCase();
    const createdDate = new Date(invoice.createdDate).toLocaleDateString();
    const createdByUserName = escapeHtml(invoice.createdByUserName || 'Unknown User');
    const totalItemCount = invoice.totalItemCount || 0;
    const total = window.FormattingUtils ? 
        window.FormattingUtils.formatCurrency(invoice.total || 0) : 
        `R${(invoice.total || 0).toFixed(2)}`;
    
    const statusBadge = invoice.isActive ? 
        '<span class="badge bg-success">Active</span>' : 
        '<span class="badge bg-secondary">Inactive</span>';

    return `
        <tr>
            <td><span class="invoice-number">${invoiceNumber}</span></td>
            <td>${createdDate}</td>
            <td><strong>${createdByUserName}</strong></td>
            <td>${totalItemCount}</td>
            <td><span class="invoice-total">${total}</span></td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editInvoice('${invoice.id}')" title="Edit">
                        <i class="fas fa-edit"></i> <span>Edit</span>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewInvoice('${invoice.id}')" title="View">
                        <i class="fas fa-eye"></i> <span>View</span>
                    </button>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-success dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="Download">
                            <i class="fas fa-download"></i> <span>Download</span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="downloadInvoice('${invoice.id}', 'pdf')">
                                <i class="fas fa-file-pdf text-danger me-2"></i>PDF
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="downloadInvoice('${invoice.id}', 'excel')">
                                <i class="fas fa-file-excel text-success me-2"></i>Excel
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="downloadInvoice('${invoice.id}', 'csv')">
                                <i class="fas fa-file-csv text-info me-2"></i>CSV
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="downloadInvoice('${invoice.id}', 'json')">
                                <i class="fas fa-file-code text-warning me-2"></i>JSON
                            </a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteInvoice('${invoice.id}')" title="Delete">
                        <i class="fas fa-trash"></i> <span>Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Get empty state HTML
function getEmptyStateHTML() {
    return `
        <div class="empty-state">
            <i class="fas fa-file-invoice-dollar"></i>
            <h5>No invoices found</h5>
            <p>Create your first invoice to get started.</p>
        </div>
    `;
}

// Show loading state
function showLoadingState() {
    const container = document.getElementById('invoice-table-section');
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading invoices...</div>
            </div>
        `;
    }
}

// Show error state
function showErrorState(message) {
    const container = document.getElementById('invoice-table-section');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger m-3" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${escapeHtml(message)}
            </div>
        `;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (text == null || text === undefined) {
        return '';
    }
    
    const textStr = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return textStr.replace(/[&<>"']/g, m => map[m]);
}

// Load products for the dropdown
async function loadProducts() {
    console.log('=== LOADING PRODUCTS START ===');
    
    // FORCE initialize products as empty array - CRITICAL
    window.products = [];
    products = [];
    
    console.log('Products initialized as:', products, 'Type:', typeof products, 'IsArray:', Array.isArray(products));
    
    try {
        console.log('Fetching from /api/products?activeOnly=true');
        const response = await fetch('/api/products?activeOnly=true');
        console.log('Response status:', response.status, 'OK:', response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Raw API response type:', typeof data);
            console.log('Raw API response:', data);
            console.log('Is data an array?', Array.isArray(data));
            
            // Handle different possible API response structures
            let productsArray = [];
            
            if (Array.isArray(data)) {
                productsArray = data;
                console.log('Products set from direct array:', productsArray.length);
            } else if (data && Array.isArray(data.data)) {
                productsArray = data.data;
                console.log('Products set from data.data:', productsArray.length);
            } else if (data && Array.isArray(data.items)) {
                productsArray = data.items;
                console.log('Products set from data.items:', productsArray.length);
            } else if (data && Array.isArray(data.products)) {
                productsArray = data.products;
                console.log('Products set from data.products:', productsArray.length);
            } else if (data && typeof data === 'object') {
                // If data is an object but not an array, try to extract array from common property names
                const possibleArrays = ['data', 'items', 'products', 'result', 'results'];
                for (const prop of possibleArrays) {
                    if (data[prop] && Array.isArray(data[prop])) {
                        productsArray = data[prop];
                        console.log(`Products set from data.${prop}:`, productsArray.length);
                        break;
                    }
                }
                
                if (productsArray.length === 0) {
                    console.error('Could not find array in API response. Available properties:', Object.keys(data));
                    showAlert('Products API returned unexpected data structure. Using empty list.', 'warning');
                }
            } else {
                console.error('API returned unexpected data type:', typeof data, data);
                showAlert('Products API returned invalid data. Using empty list.', 'warning');
            }
            
            // Ensure we have a valid array and create a safe copy
            products = Array.isArray(productsArray) ? [...productsArray] : [];
            
        } else {
            console.error('API request failed with status:', response.status);
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            products = [];
            showAlert('Failed to load products from server', 'danger');
        }
    } catch (error) {
        console.error('CATCH BLOCK - Error loading products:', error);
        products = [];
        showAlert('Network error loading products: ' + error.message, 'danger');
    }
    
    // FINAL SAFETY CHECK - ENSURE products is ALWAYS an array before calling populate functions
    if (!Array.isArray(products)) {
        console.error('EMERGENCY FIX - products is not array:', typeof products, products);
        products = [];
    }
    
    // Set window.products to the same reference
    window.products = products;
    
    console.log('Final products before populate:', products, 'Length:', products.length, 'IsArray:', Array.isArray(products));
    
    // ONLY call populate functions if products is confirmed to be an array
    if (Array.isArray(products)) {
        console.log('=== CALLING POPULATE FUNCTIONS ===');
        populateProductSelect();
        populateNewInvoiceProductSelect();
    } else {
        console.error('SKIPPING POPULATE - products is still not an array');
    }
    
    console.log('=== LOADING PRODUCTS END ===');
}

// Populate product select dropdown for edit modal
function populateProductSelect() {
    console.log('=== POPULATE PRODUCT SELECT START ===');
    console.log('populateProductSelect called, products:', products, 'isArray:', Array.isArray(products));
    
    const select = document.getElementById('productSelect');
    if (!select) {
        console.log('productSelect element not found');
        return;
    }
    
    // IMMEDIATE SAFETY CHECK - PREVENT CRASH AT ALL COSTS
    if (!products || !Array.isArray(products)) {
        console.error('EMERGENCY: Products is not an array, forcing empty array:', typeof products, products);
        products = [];
        window.products = [];
        select.innerHTML = '<option value="">No products available</option>';
        showAlert('Products data is invalid. Please refresh the page.', 'warning');
        return;
    }
    
    select.innerHTML = '<option value="">Select a product...</option>';
    
    console.log('Populating product select with', products.length, 'products');
    
    if (products.length === 0) {
        select.innerHTML = '<option value="">No products available</option>';
        return;
    }
    
    try {
        products.forEach(product => {
            if (!product || typeof product !== 'object') {
                console.warn('Invalid product object:', product);
                return;
            }
            
            const option = document.createElement('option');
            option.value = product.id || '';
            const formattedPrice = window.FormattingUtils ? 
                window.FormattingUtils.formatCurrency(product.costPerItem || 0) : 
                `R${(product.costPerItem || 0).toFixed(2)}`;
            option.textContent = `${product.name || 'Unknown Product'} - ${formattedPrice}`;
            option.dataset.price = product.costPerItem || 0;
            option.dataset.name = product.name || 'Unknown Product';
            select.appendChild(option);
        });
        console.log('Successfully populated product select with', products.length, 'products');
    } catch (error) {
        console.error('Error in populateProductSelect forEach:', error);
        select.innerHTML = '<option value="">Error loading products</option>';
        showAlert('Error populating product dropdown: ' + error.message, 'danger');
    }
}

// Populate product select dropdown for new invoice modal
function populateNewInvoiceProductSelect() {
    console.log('=== POPULATE NEW INVOICE PRODUCT SELECT START ===');
    console.log('populateNewInvoiceProductSelect called, products:', products, 'isArray:', Array.isArray(products));
    
    const select = document.getElementById('newInvoiceProductSelect');
    if (!select) {
        console.log('newInvoiceProductSelect element not found');
        return;
    }
    
    // IMMEDIATE SAFETY CHECK - PREVENT CRASH AT ALL COSTS
    if (!products || !Array.isArray(products)) {
        console.error('EMERGENCY: Products is not an array, forcing empty array:', typeof products, products);
        products = [];
        window.products = [];
        select.innerHTML = '<option value="">No products available</option>';
        showAlert('Products data is invalid. Please refresh the page.', 'warning');
        return;
    }
    
    select.innerHTML = '<option value="">Select a product...</option>';
    
    console.log('Populating new invoice product select with', products.length, 'products');
    
    if (products.length === 0) {
        select.innerHTML = '<option value="">No products available</option>';
        return;
    }
    
    try {
        products.forEach(product => {
            if (!product || typeof product !== 'object') {
                console.warn('Invalid product object:', product);
                return;
            }
            
            const option = document.createElement('option');
            option.value = product.id || '';
            const formattedPrice = window.FormattingUtils ? 
                window.FormattingUtils.formatCurrency(product.costPerItem || 0) : 
                `R${(product.costPerItem || 0).toFixed(2)}`;
            option.textContent = `${product.name || 'Unknown Product'} - ${formattedPrice}`;
            option.dataset.price = product.costPerItem || 0;
            option.dataset.name = product.name || 'Unknown Product';
            select.appendChild(option);
        });
        console.log('Successfully populated new invoice product select with', products.length, 'products');
    } catch (error) {
        console.error('Error in populateNewInvoiceProductSelect forEach:', error);
        select.innerHTML = '<option value="">Error loading products</option>';
        showAlert('Error populating new invoice product dropdown: ' + error.message, 'danger');
    }
}

// Load users for the filter dropdown
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            populateUserFilter(users);
        } else if (response.status === 401) {
            console.log('User not authenticated - users filter will be limited');
            // Don't show error for authentication issues in user loading
        } else {
            console.error('Failed to load users:', response.status);
            showAlert('Failed to load users for filtering', 'warning');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users for filtering', 'warning');
    }
}

// Populate user filter dropdown
function populateUserFilter(users) {
    console.log('=== POPULATE USER FILTER START ===');
    console.log('populateUserFilter called with:', users, 'Type:', typeof users, 'IsArray:', Array.isArray(users));
    
    const select = document.getElementById('userFilter');
    if (!select) {
        console.log('userFilter element not found');
        return;
    }
    
    select.innerHTML = '<option value="">All Users</option>';
    
    // SAFETY CHECK - Handle different response formats
    let usersArray = [];
    
    if (Array.isArray(users)) {
        usersArray = users;
        console.log('Users set from direct array:', usersArray.length);
    } else if (users && Array.isArray(users.data)) {
        usersArray = users.data;
        console.log('Users set from users.data:', usersArray.length);
    } else if (users && Array.isArray(users.items)) {
        usersArray = users.items;
        console.log('Users set from users.items:', usersArray.length);
    } else if (users && Array.isArray(users.users)) {
        usersArray = users.users;
        console.log('Users set from users.users:', usersArray.length);
    } else if (users && typeof users === 'object') {
        // If users is an object but not an array, try to extract array from common property names
        const possibleArrays = ['data', 'items', 'users', 'result', 'results'];
        for (const prop of possibleArrays) {
            if (users[prop] && Array.isArray(users[prop])) {
                usersArray = users[prop];
                console.log(`Users set from users.${prop}:`, usersArray.length);
                break;
            }
        }
        
        if (usersArray.length === 0) {
            console.error('Could not find array in users response. Available properties:', Object.keys(users));
            showAlert('Users API returned unexpected data structure. Filter will be limited.', 'warning');
        }
    } else {
        console.error('Users API returned unexpected data type:', typeof users, users);
        showAlert('Users API returned invalid data. Filter will be limited.', 'warning');
    }
    
    // FINAL SAFETY CHECK - ENSURE usersArray is ALWAYS an array
    if (!Array.isArray(usersArray)) {
        console.error('EMERGENCY FIX - usersArray is not array:', typeof usersArray, usersArray);
        usersArray = [];
    }
    
    console.log('Final usersArray before populate:', usersArray, 'Length:', usersArray.length, 'IsArray:', Array.isArray(usersArray));
    
    if (usersArray.length === 0) {
        select.innerHTML = '<option value="">All Users (No users available)</option>';
        return;
    }
    
    try {
        usersArray.forEach(user => {
            if (!user || typeof user !== 'object') {
                console.warn('Invalid user object:', user);
                return;
            }
            
            const option = document.createElement('option');
            option.value = user.id || '';
            option.textContent = `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
            select.appendChild(option);
        });
        console.log('Successfully populated user filter with', usersArray.length, 'users');
    } catch (error) {
        console.error('Error in populateUserFilter forEach:', error);
        select.innerHTML = '<option value="">All Users (Error loading users)</option>';
        showAlert('Error populating user filter: ' + error.message, 'danger');
    }
    
    console.log('=== POPULATE USER FILTER END ===');
}

// NEW INVOICE FUNCTIONS

// Show add item form for new invoice
function showNewInvoiceAddItemForm() {
    document.getElementById('newInvoiceAddItemForm').style.display = 'block';
    document.getElementById('newInvoiceProductSelect').value = '';
    document.getElementById('newInvoiceItemUnitPrice').value = '';
    document.getElementById('newInvoiceItemQuantity').value = '1';
    document.getElementById('newInvoiceItemLineTotal').value = '';
}

// Hide add item form for new invoice
function hideNewInvoiceAddItemForm() {
    document.getElementById('newInvoiceAddItemForm').style.display = 'none';
}

// Update product info when product is selected in new invoice
function updateNewInvoiceProductInfo() {
    const select = document.getElementById('newInvoiceProductSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        document.getElementById('newInvoiceItemUnitPrice').value = selectedOption.dataset.price;
        updateNewInvoiceLineTotal();
    } else {
        document.getElementById('newInvoiceItemUnitPrice').value = '';
        document.getElementById('newInvoiceItemLineTotal').value = '';
    }
}

// Update line total when quantity or price changes in new invoice
function updateNewInvoiceLineTotal() {
    const unitPrice = parseFloat(document.getElementById('newInvoiceItemUnitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('newInvoiceItemQuantity').value) || 0;
    const lineTotal = unitPrice * quantity;
    
    const formattedLineTotal = window.FormattingUtils ? 
        window.FormattingUtils.formatCurrency(lineTotal) : 
        `R${lineTotal.toFixed(2)}`;
    document.getElementById('newInvoiceItemLineTotal').value = formattedLineTotal;
}

// Add item to new invoice (client-side only)
function addItemToNewInvoice() {
    const productSelect = document.getElementById('newInvoiceProductSelect');
    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].dataset.name;
    const unitPrice = parseFloat(document.getElementById('newInvoiceItemUnitPrice').value);
    const quantity = parseInt(document.getElementById('newInvoiceItemQuantity').value);

    if (!productId || !unitPrice || !quantity) {
        showAlert('Please fill in all item details', 'warning');
        return;
    }

    // Check if product already exists in the invoice
    const existingItemIndex = newInvoiceItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
        // Update existing item quantity
        newInvoiceItems[existingItemIndex].quantity += quantity;
        newInvoiceItems[existingItemIndex].lineTotal = newInvoiceItems[existingItemIndex].unitPrice * newInvoiceItems[existingItemIndex].quantity;
    } else {
        // Add new item
        const newItem = {
            productId: productId,
            productName: productName,
            unitPrice: unitPrice,
            quantity: quantity,
            lineTotal: unitPrice * quantity
        };
        newInvoiceItems.push(newItem);
    }

    displayNewInvoiceItems();
    updateNewInvoiceTotal();
    hideNewInvoiceAddItemForm();
    showAlert('Item added successfully', 'success');
}

// Display items in new invoice table
function displayNewInvoiceItems() {
    const tbody = document.getElementById('newInvoiceItemsTableBody');
    tbody.innerHTML = '';

    if (newInvoiceItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No items added yet</td></tr>';
        return;
    }

    newInvoiceItems.forEach((item, index) => {
        const formattedUnitPrice = window.FormattingUtils ? 
            window.FormattingUtils.formatCurrency(item.unitPrice) : 
            `R${item.unitPrice.toFixed(2)}`;
        const formattedLineTotal = window.FormattingUtils ? 
            window.FormattingUtils.formatCurrency(item.lineTotal) : 
            `R${item.lineTotal.toFixed(2)}`;
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.productName)}</td>
            <td>${formattedUnitPrice}</td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                       value="${item.quantity}" min="1" 
                       onchange="updateNewInvoiceItemQuantity(${index}, this.value)">
            </td>
            <td>${formattedLineTotal}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="removeNewInvoiceItem(${index})" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update item quantity in new invoice
function updateNewInvoiceItemQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        showAlert('Quantity must be at least 1', 'warning');
        return;
    }

    newInvoiceItems[index].quantity = parseInt(newQuantity);
    newInvoiceItems[index].lineTotal = newInvoiceItems[index].unitPrice * newInvoiceItems[index].quantity;
    
    displayNewInvoiceItems();
    updateNewInvoiceTotal();
}

// Remove item from new invoice
function removeNewInvoiceItem(index) {
    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }

    newInvoiceItems.splice(index, 1);
    displayNewInvoiceItems();
    updateNewInvoiceTotal();
    showAlert('Item removed successfully', 'success');
}

// Update total for new invoice (client-side calculation)
function updateNewInvoiceTotal() {
    const total = newInvoiceItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const formattedTotal = window.FormattingUtils ? 
        window.FormattingUtils.formatCurrency(total) : 
        `R${total.toFixed(2)}`;
    document.getElementById('newInvoiceTotal').value = formattedTotal;
}

// Save new invoice to server
async function saveNewInvoice() {
    console.log('=== SAVE NEW INVOICE START ===');
    
    const invoiceDate = document.getElementById('newInvoiceDate').value;
    console.log('Invoice date:', invoiceDate);
    
    if (!invoiceDate) {
        showAlert('Please select an invoice date', 'warning');
        return;
    }

    console.log('New invoice items:', newInvoiceItems);
    if (newInvoiceItems.length === 0) {
        showAlert('Please add at least one item to the invoice', 'warning');
        return;
    }

    try {
        console.log('Creating invoice with date:', invoiceDate);
        
        // First create the invoice
        const createResponse = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createdDate: invoiceDate
            })
        });

        console.log('Create response status:', createResponse.status);
        console.log('Create response ok:', createResponse.ok);

        if (!createResponse.ok) {
            console.error('Invoice creation failed with status:', createResponse.status);
            const errorText = await createResponse.text();
            console.error('Error response:', errorText);
            await handleInvoiceCreationError(createResponse);
            return;
        }

        const invoice = await createResponse.json();
        console.log('Invoice created successfully:', invoice);

        // Then add all items to the invoice
        console.log('Adding', newInvoiceItems.length, 'items to invoice');
        for (const item of newInvoiceItems) {
            console.log('Adding item:', item);
            
            const addItemResponse = await fetch(`/api/invoices/${invoice.id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: item.productId,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity
                })
            });

            console.log('Add item response status:', addItemResponse.status);

            if (!addItemResponse.ok) {
                const error = await addItemResponse.text();
                console.error('Failed to add item:', error);
                showAlert(`Failed to add item ${item.productName}: ${error}`, 'danger');
                return;
            }
        }

        console.log('All items added successfully');
        showAlert('Invoice created successfully', 'success');
        
        // Close modal properly
        closeCreateInvoiceModal();
        
        // Reset the form
        newInvoiceItems = [];
        displayNewInvoiceItems();
        updateNewInvoiceTotal();
        document.getElementById('newInvoiceDate').value = new Date().toISOString().split('T')[0];
        
        loadInvoices();
        console.log('=== SAVE NEW INVOICE END ===');
    } catch (error) {
        console.error('Error creating invoice:', error);
        showAlert('Error creating invoice: ' + error.message, 'danger');
    }
}

// Handle invoice creation errors with helpful messages
async function handleInvoiceCreationError(response) {
    const status = response.status;
    let errorMessage = '';
    
    try {
        const errorText = await response.text();
        let errorData = null;
        
        // Try to parse JSON error response
        try {
            errorData = JSON.parse(errorText);
        } catch {
            // If not JSON, use the text as is
        }
        
        if (status === 401) {
            errorMessage = 'You need to be logged in to create invoices. Please <a href="/Login" class="alert-link">sign in</a> to continue.';
        } else if (status === 403) {
            errorMessage = 'You don\'t have permission to create invoices. Only Managers and Administrators can create invoices. Please contact your administrator to upgrade your account.';
        } else if (status === 400) {
            // Check if this is a synchronization error
            if (errorData && errorData.requiresSync) {
                showSyncRequiredDialog(errorData.userId, errorData.message);
                return;
            } else if (errorText.includes('authentication') || errorText.includes('log in')) {
                errorMessage = 'Authentication required. Please <a href="/Login" class="alert-link">sign in</a> to create invoices.';
            } else if (errorText.includes('permission') || errorText.includes('role') || errorText.includes('Manager') || errorText.includes('Admin')) {
                errorMessage = 'You need Manager or Administrator privileges to create invoices. Please contact your administrator to upgrade your account.';
            } else if (errorText.includes('synchronization') || errorText.includes('sync')) {
                errorMessage = 'Your account needs to be synchronized with the database. <button class="btn btn-sm btn-primary ms-2" onclick="attemptUserSync()">Sync Account</button>';
            } else {
                errorMessage = `Unable to create invoice: ${errorText}`;
            }
        } else {
            errorMessage = `Failed to create invoice (Error ${status}): ${errorText}`;
        }
    } catch (parseError) {
        errorMessage = `Failed to create invoice (Error ${status}). Please try again or contact support.`;
    }
    
    showAlert(errorMessage, 'danger');
}

// EXISTING INVOICE FUNCTIONS (for editing)

// Create new invoice (old function - kept for compatibility)
async function createInvoice() {
    const invoiceDate = document.getElementById('invoiceDate').value;
    
    if (!invoiceDate) {
        showAlert('Please select an invoice date', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createdDate: invoiceDate
            })
        });

        if (response.ok) {
            const invoice = await response.json();
            showAlert('Invoice created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('createInvoiceModal')).hide();
            loadInvoices();
            // Immediately open the invoice for editing
            editInvoice(invoice.id);
        } else {
            const error = await response.text();
            showAlert(`Failed to create invoice: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        showAlert('Error creating invoice', 'danger');
    }
}

// Edit invoice
async function editInvoice(invoiceId) {
    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (response.ok) {
            currentInvoice = await response.json();
            populateEditForm(currentInvoice);
            new bootstrap.Modal(document.getElementById('editInvoiceModal')).show();
        } else {
            showAlert('Failed to load invoice details', 'danger');
        }
    } catch (error) {
        console.error('Error loading invoice:', error);
        showAlert('Error loading invoice', 'danger');
    }
}

// Populate edit form with invoice data
function populateEditForm(invoice) {
    document.getElementById('editInvoiceId').value = invoice.id;
    document.getElementById('editInvoiceDate').value = invoice.createdDate.split('T')[0];
    const formattedTotal = window.FormattingUtils ? 
        window.FormattingUtils.formatCurrency(invoice.total) : 
        `R${invoice.total.toFixed(2)}`;
    document.getElementById('editInvoiceTotal').value = formattedTotal;
    
    displayInvoiceItems(invoice.items);
}

// Display invoice items in the edit modal
function displayInvoiceItems(items) {
    const tbody = document.getElementById('invoiceItemsTableBody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No items in this invoice</td></tr>';
        return;
    }

    items.forEach(item => {
        const formattedUnitPrice = window.FormattingUtils ? 
            window.FormattingUtils.formatCurrency(item.unitPrice) : 
            `R${item.unitPrice.toFixed(2)}`;
        const formattedLineTotal = window.FormattingUtils ? 
            window.FormattingUtils.formatCurrency(item.lineTotal) : 
            `R${item.lineTotal.toFixed(2)}`;
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.productName)}</td>
            <td>${formattedUnitPrice}</td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                       value="${item.quantity}" min="1" 
                       onchange="updateItemQuantity('${item.productId}', this.value)">
            </td>
            <td>${formattedLineTotal}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="removeItemFromInvoice('${item.productId}')" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update product info when product is selected
function updateProductInfo() {
    const select = document.getElementById('productSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        document.getElementById('itemUnitPrice').value = selectedOption.dataset.price;
        updateLineTotal();
    } else {
        document.getElementById('itemUnitPrice').value = '';
        document.getElementById('itemLineTotal').value = '';
    }
}

// Update line total when quantity or price changes
function updateLineTotal() {
    const unitPrice = parseFloat(document.getElementById('itemUnitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 0;
    const lineTotal = unitPrice * quantity;
    
    const formattedLineTotal = window.FormattingUtils ? 
        window.FormattingUtils.formatCurrency(lineTotal) : 
        `R${lineTotal.toFixed(2)}`;
    document.getElementById('itemLineTotal').value = formattedLineTotal;
}

// Show add item form
function showAddItemForm() {
    document.getElementById('addItemForm').style.display = 'block';
    document.getElementById('productSelect').value = '';
    document.getElementById('itemUnitPrice').value = '';
    document.getElementById('itemQuantity').value = '1';
    document.getElementById('itemLineTotal').value = '';
}

// Hide add item form
function hideAddItemForm() {
    document.getElementById('addItemForm').style.display = 'none';
}

// Add item to invoice
async function addItemToInvoice() {
    const productSelect = document.getElementById('productSelect');
    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].dataset.name;
    const unitPrice = parseFloat(document.getElementById('itemUnitPrice').value);
    const quantity = parseInt(document.getElementById('itemQuantity').value);

    if (!productId || !unitPrice || !quantity) {
        showAlert('Please fill in all item details', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/invoices/${currentInvoice.id}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                productName: productName,
                unitPrice: unitPrice,
                quantity: quantity
            })
        });

        if (response.ok) {
            currentInvoice = await response.json();
            populateEditForm(currentInvoice);
            hideAddItemForm();
            showAlert('Item added successfully', 'success');
        } else {
            const error = await response.text();
            showAlert(`Failed to add item: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showAlert('Error adding item', 'danger');
    }
}

// Update item quantity
async function updateItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        showAlert('Quantity must be at least 1', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/invoices/${currentInvoice.id}/items/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quantity: parseInt(newQuantity)
            })
        });

        if (response.ok) {
            currentInvoice = await response.json();
            populateEditForm(currentInvoice);
            showAlert('Item quantity updated', 'success');
        } else {
            const error = await response.text();
            showAlert(`Failed to update item: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error updating item:', error);
        showAlert('Error updating item', 'danger');
    }
}

// Remove item from invoice
async function removeItemFromInvoice(productId) {
    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }

    try {
        const response = await fetch(`/api/invoices/${currentInvoice.id}/items/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            currentInvoice = await response.json();
            populateEditForm(currentInvoice);
            showAlert('Item removed successfully', 'success');
        } else {
            const error = await response.text();
            showAlert(`Failed to remove item: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showAlert('Error removing item', 'danger');
    }
}

// Update invoice
async function updateInvoice() {
    const invoiceId = document.getElementById('editInvoiceId').value;
    const invoiceDate = document.getElementById('editInvoiceDate').value;

    try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createdDate: invoiceDate
            })
        });

        if (response.ok) {
            showAlert('Invoice updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editInvoiceModal')).hide();
            loadInvoices();
        } else {
            const error = await response.text();
            showAlert(`Failed to update invoice: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error updating invoice:', error);
        showAlert('Error updating invoice', 'danger');
    }
}

// View invoice (read-only)
function viewInvoice(invoiceId) {
    editInvoice(invoiceId); // For now, use the same modal but could be made read-only
}

// Delete invoice
async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Invoice deleted successfully', 'success');
            loadInvoices();
        } else {
            const error = await response.text();
            showAlert(`Failed to delete invoice: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showAlert('Error deleting invoice', 'danger');
    }
}

// Filter invoices
async function filterInvoices() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const userId = document.getElementById('userFilter').value;

    let url = '/api/invoices';
    const params = new URLSearchParams();

    if (startDate && endDate) {
        url = '/api/invoices/date-range';
        params.append('startDate', startDate);
        params.append('endDate', endDate);
    } else if (userId) {
        url = `/api/invoices/user/${userId}`;
    }

    if (params.toString()) {
        url += '?' + params.toString();
    }

    try {
        showLoadingState();
        const response = await fetch(url);
        if (response.ok) {
            const invoices = await response.json();
            allInvoices = invoices;
            filteredInvoices = [...invoices];
            currentPage = 1;
            displayInvoices();
        } else {
            showAlert('Failed to filter invoices', 'danger');
            showErrorState('Failed to filter invoices');
        }
    } catch (error) {
        console.error('Error filtering invoices:', error);
        showAlert('Error filtering invoices', 'danger');
        showErrorState('Error filtering invoices');
    }
}

// Clear filters
function clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('userFilter').value = '';
    loadInvoices();
}

// Download invoice in specified format
async function downloadInvoice(invoiceId, format) {
    // Find the download button for this invoice
    const downloadButton = document.querySelector(`[onclick*="downloadInvoice('${invoiceId}', '${format}')"]`)?.closest('.btn-group')?.querySelector('.dropdown-toggle');
    
    try {
        // Add loading state to button
        if (downloadButton) {
            downloadButton.classList.add('downloading');
            downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Downloading...</span>';
        }
        
        showAlert(`Preparing ${format.toUpperCase()} download...`, 'info');
        
        const response = await fetch(`/api/invoices/${invoiceId}/download/${format}`, {
            method: 'GET',
            headers: {
                'Accept': getAcceptHeader(format)
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            showAlert(`Failed to download invoice: ${errorText}`, 'danger');
            return;
        }

        // Get filename from response headers or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `invoice_${invoiceId.substring(0, 8)}.${getFileExtension(format)}`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showAlert(`${format.toUpperCase()} downloaded successfully`, 'success');
    } catch (error) {
        console.error('Error downloading invoice:', error);
        showAlert(`Error downloading invoice: ${error.message}`, 'danger');
    } finally {
        // Reset button state
        if (downloadButton) {
            downloadButton.classList.remove('downloading');
            downloadButton.innerHTML = '<i class="fas fa-download"></i> <span>Download</span>';
        }
    }
}

// Get appropriate Accept header for format
function getAcceptHeader(format) {
    switch (format.toLowerCase()) {
        case 'pdf':
            return 'application/pdf';
        case 'excel':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'csv':
            return 'text/csv';
        case 'json':
            return 'application/json';
        default:
            return 'application/octet-stream';
    }
}

// Get file extension for format
function getFileExtension(format) {
    switch (format.toLowerCase()) {
        case 'pdf':
            return 'pdf';
        case 'excel':
            return 'xlsx';
        case 'csv':
            return 'csv';
        case 'json':
            return 'json';
        default:
            return 'txt';
    }
}

// Render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');

    console.log('Invoice Pagination Debug:', {
        filteredInvoicesLength: filteredInvoices.length,
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

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

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
    console.log('Invoice pagination rendered successfully with', totalPages, 'pages');

    // Add event listeners to pagination links
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                displayInvoices();
            }
        });
    });
}

// Show synchronization required dialog
function showSyncRequiredDialog(userId, message) {
    const modalHtml = `
        <div class="modal fade" id="syncRequiredModal" tabindex="-1" aria-labelledby="syncRequiredModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="syncRequiredModalLabel">
                            <i class="fas fa-sync-alt me-2"></i>Account Synchronization Required
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            ${message || 'Your account needs to be synchronized with the database before you can create invoices.'}
                        </div>
                        <p>This is a one-time process that will enable all invoice management features for your account.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="performUserSync('${userId}')">
                            <i class="fas fa-sync-alt me-2"></i>Sync My Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('syncRequiredModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('syncRequiredModal'));
    modal.show();
}

// Attempt user synchronization - simplified version
async function attemptUserSync() {
    try {
        showAlert('Synchronizing your account...', 'info');
        
        const response = await fetch('/api/usersynchronization/sync-self', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: 'Self-service synchronization for invoice creation'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Account synchronized successfully! You can now create invoices.', 'success');
            
            // Refresh the page to update permissions
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            const errorText = await response.text();
            console.error('Sync failed with status:', response.status, 'Error:', errorText);
            let errorMessage = 'Account synchronization failed.';
            
            if (response.status === 400) {
                if (errorText.includes('already synchronized') || errorText.includes("doesn't require sync")) {
                    errorMessage = 'Your account is already synchronized and ready to use.';
                    showAlert(errorMessage, 'info');
                    return; // Don't show as error if already synced
                } else if (errorText.includes('not found')) {
                    errorMessage = 'Your account was not found in the system. Please contact an administrator.';
                } else if (errorText.includes('authentication')) {
                    errorMessage = 'Authentication error. Please log out and log back in.';
                } else {
                    errorMessage = `Synchronization failed: ${errorText}`;
                }
            } else if (response.status === 401) {
                errorMessage = 'You need to be logged in to sync your account. Please log out and log back in.';
            } else if (response.status === 403) {
                errorMessage = 'You don\'t have permission to synchronize your account. Please contact an administrator.';
            }
            
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error performing user sync:', error);
        showAlert('Network error during account synchronization. Please try again.', 'danger');
    }
}

// Perform user synchronization
async function performUserSync(userId) {
    try {
        showAlert('Synchronizing your account...', 'info');
        
        const response = await fetch('/api/usersynchronization/sync-self', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: 'Self-service synchronization for invoice creation'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Account synchronized successfully! You can now create invoices.', 'success');
            
            // Close any open modals
            const syncModal = document.getElementById('syncRequiredModal');
            if (syncModal) {
                bootstrap.Modal.getInstance(syncModal)?.hide();
            }
            
            // Refresh the page to update permissions
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            const errorText = await response.text();
            let errorMessage = 'Account synchronization failed.';
            
            if (response.status === 400) {
                if (errorText.includes('already synchronized')) {
                    errorMessage = 'Your account is already synchronized. Please refresh the page and try again.';
                } else if (errorText.includes('not found')) {
                    errorMessage = 'Your account was not found in the system. Please contact an administrator.';
                } else {
                    errorMessage = `Synchronization failed: ${errorText}`;
                }
            } else if (response.status === 403) {
                errorMessage = 'You don\'t have permission to synchronize your account. Please contact an administrator.';
            }
            
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error performing user sync:', error);
        showAlert('Network error during account synchronization. Please try again.', 'danger');
    }
}

// Open create invoice modal
function openCreateInvoiceModal() {
    console.log('🔵 === MODAL DEBUG START ===');
    console.log('🔵 Function openCreateInvoiceModal() called');
    
    try {
        // Check if modal element exists
        const modalElement = document.getElementById('createInvoiceModal');
        console.log('🔵 Modal element found:', !!modalElement);
        console.log('🔵 Modal element:', modalElement);
        
        // Check Bootstrap availability
        console.log('🔵 Bootstrap available:', typeof bootstrap !== 'undefined');
        console.log('🔵 Bootstrap.Modal available:', typeof bootstrap !== 'undefined' && !!bootstrap.Modal);
        
        // Try Bootstrap 5 method first
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('🔵 Attempting Bootstrap modal...');
            try {
                const modal = new bootstrap.Modal(modalElement);
                console.log('🔵 Bootstrap Modal instance created:', modal);
                modal.show();
                console.log('🔵 ✅ Modal.show() called successfully');
                
                // Check if modal is actually visible
                setTimeout(() => {
                    const isVisible = modalElement.classList.contains('show');
                    console.log('🔵 Modal visible after 100ms:', isVisible);
                    console.log('🔵 Modal classes:', modalElement.className);
                    console.log('🔵 Modal style.display:', modalElement.style.display);
                }, 100);
                
            } catch (bootstrapError) {
                console.error('🔴 Bootstrap modal error:', bootstrapError);
                throw bootstrapError;
            }
        } else {
            // Fallback: manually show modal
            console.log('🔵 Bootstrap not available, using manual method');
            
            if (modalElement) {
                console.log('🔵 Setting modal styles manually...');
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                modalElement.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                
                console.log('🔵 Modal classes after manual show:', modalElement.className);
                console.log('🔵 Modal style.display after manual show:', modalElement.style.display);
                
                // Add backdrop
                console.log('🔵 Adding backdrop...');
                const existingBackdrop = document.getElementById('modal-backdrop');
                if (existingBackdrop) {
                    existingBackdrop.remove();
                }
                
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                backdrop.id = 'modal-backdrop';
                document.body.appendChild(backdrop);
                
                console.log('🔵 ✅ Modal shown manually');
            } else {
                console.error('🔴 Modal element not found!');
                showAlert('Error: Could not find invoice creation modal', 'danger');
                return;
            }
        }
        
        // Reset form
        console.log('🔵 Resetting form...');
        const dateField = document.getElementById('newInvoiceDate');
        if (dateField) {
            dateField.value = new Date().toISOString().split('T')[0];
            console.log('🔵 Date field set to:', dateField.value);
        } else {
            console.error('🔴 Date field not found!');
        }
        
        newInvoiceItems = [];
        displayNewInvoiceItems();
        updateNewInvoiceTotal();
        
        console.log('🔵 ✅ Modal opening process completed');
        
    } catch (error) {
        console.error('🔴 Error opening modal:', error);
        console.error('🔴 Error stack:', error.stack);
        showAlert('Error opening invoice creation modal: ' + error.message, 'danger');
    }
    
    console.log('🔵 === MODAL DEBUG END ===');
}

// Close create invoice modal (fallback)
function closeCreateInvoiceModal() {
    console.log('🔴 Closing create invoice modal...');
    
    try {
        const modal = document.getElementById('createInvoiceModal');
        if (modal) {
            // Try Bootstrap method first
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                try {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        console.log('🔴 Closing with Bootstrap instance');
                        modalInstance.hide();
                    } else {
                        console.log('🔴 No Bootstrap instance found, creating new one to close');
                        const newModalInstance = new bootstrap.Modal(modal);
                        newModalInstance.hide();
                    }
                } catch (bootstrapError) {
                    console.error('🔴 Bootstrap close error:', bootstrapError);
                    // Fall back to manual close
                    manualCloseModal(modal);
                }
            } else {
                // Manual close
                manualCloseModal(modal);
            }
        }
    } catch (error) {
        console.error('🔴 Error closing modal:', error);
    }
}

// Manual modal close function
function manualCloseModal(modal) {
    console.log('🔴 Closing modal manually...');
    
    // Hide modal
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    
    // Remove all backdrops (in case there are multiple)
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        console.log('🔴 Removing backdrop:', backdrop);
        backdrop.remove();
    });
    
    // Also remove by ID
    const namedBackdrop = document.getElementById('modal-backdrop');
    if (namedBackdrop) {
        console.log('🔴 Removing named backdrop');
        namedBackdrop.remove();
    }
    
    // Reset body styles that might be set by Bootstrap
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    console.log('🔴 ✅ Modal closed manually');
}

// Test invoice creation function
async function testInvoiceCreation() {
    console.log('=== TEST INVOICE CREATION START ===');
    
    try {
        showAlert('Testing invoice creation...', 'info');
        
        const today = new Date().toISOString().split('T')[0];
        console.log('Creating test invoice with date:', today);
        
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createdDate: today
            })
        });

        console.log('Test response status:', response.status);
        console.log('Test response ok:', response.ok);

        if (response.ok) {
            const invoice = await response.json();
            console.log('Test invoice created successfully:', invoice);
            showAlert('✅ Test invoice created successfully! Invoice ID: ' + invoice.id.substring(0, 8), 'success');
            loadInvoices(); // Refresh the invoice list
        } else {
            const errorText = await response.text();
            console.error('❌ Test invoice creation failed with status:', response.status);
            console.error('❌ Error response:', errorText);
            showAlert('❌ Test invoice creation failed: ' + errorText, 'danger');
        }
    } catch (error) {
        console.error('Error in test invoice creation:', error);
        showAlert('Error in test invoice creation: ' + error.message, 'danger');
    }
    
    console.log('=== TEST INVOICE CREATION END ===');
}

// Show alert message
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed slide-up`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to page
    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}