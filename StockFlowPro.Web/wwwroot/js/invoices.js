// Invoice Management JavaScript

let currentInvoice = null;
let products = [];
let newInvoiceItems = []; // Client-side storage for new invoice items

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
    loadProducts();
    loadUsers();
    
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
});

// Load all invoices
async function loadInvoices() {
    try {
        showLoadingState();
        const response = await fetch('/api/invoices');
        if (response.ok) {
            const invoices = await response.json();
            displayInvoices(invoices);
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
function displayInvoices(invoices) {
    const container = document.getElementById('invoice-table-section');
    const countElement = document.getElementById('invoiceCount');
    
    // Update count
    if (countElement) {
        const total = invoices.length;
        countElement.textContent = `${total} invoice${total !== 1 ? 's' : ''}`;
    }

    if (invoices.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        return;
    }

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
                    ${invoices.map(invoice => createInvoiceRowHTML(invoice)).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// Create invoice row HTML
function createInvoiceRowHTML(invoice) {
    const invoiceNumber = invoice.id.substring(0, 8).toUpperCase();
    const createdDate = new Date(invoice.createdDate).toLocaleDateString();
    const createdByUserName = escapeHtml(invoice.createdByUserName || 'Unknown User');
    const totalItemCount = invoice.totalItemCount || 0;
    const total = invoice.total ? invoice.total.toFixed(2) : '0.00';
    
    const statusBadge = invoice.isActive ? 
        '<span class="badge bg-success">Active</span>' : 
        '<span class="badge bg-secondary">Inactive</span>';

    return `
        <tr>
            <td><span class="invoice-number">${invoiceNumber}</span></td>
            <td>${createdDate}</td>
            <td><strong>${createdByUserName}</strong></td>
            <td>${totalItemCount}</td>
            <td><span class="invoice-total">R${total}</span></td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editInvoice('${invoice.id}')" title="Edit">
                        <i class="fas fa-edit"></i> <span>Edit</span>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewInvoice('${invoice.id}')" title="View">
                        <i class="fas fa-eye"></i> <span>View</span>
                    </button>
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
    try {
        const response = await fetch('/api/products?activeOnly=true');
        if (response.ok) {
            products = await response.json();
            populateProductSelect();
            populateNewInvoiceProductSelect();
        } else {
            console.error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Populate product select dropdown for edit modal
function populateProductSelect() {
    const select = document.getElementById('productSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - R${product.costPerItem.toFixed(2)}`;
        option.dataset.price = product.costPerItem;
        option.dataset.name = product.name;
        select.appendChild(option);
    });
}

// Populate product select dropdown for new invoice modal
function populateNewInvoiceProductSelect() {
    const select = document.getElementById('newInvoiceProductSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - R${product.costPerItem.toFixed(2)}`;
        option.dataset.price = product.costPerItem;
        option.dataset.name = product.name;
        select.appendChild(option);
    });
}

// Load users for the filter dropdown
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            populateUserFilter(users);
        } else {
            console.error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Populate user filter dropdown
function populateUserFilter(users) {
    const select = document.getElementById('userFilter');
    select.innerHTML = '<option value="">All Users</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName}`;
        select.appendChild(option);
    });
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
    
    document.getElementById('newInvoiceItemLineTotal').value = `R${lineTotal.toFixed(2)}`;
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.productName)}</td>
            <td>R${item.unitPrice.toFixed(2)}</td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                       value="${item.quantity}" min="1" 
                       onchange="updateNewInvoiceItemQuantity(${index}, this.value)">
            </td>
            <td>R${item.lineTotal.toFixed(2)}</td>
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
    document.getElementById('newInvoiceTotal').value = `R${total.toFixed(2)}`;
}

// Save new invoice to server
async function saveNewInvoice() {
    const invoiceDate = document.getElementById('newInvoiceDate').value;
    
    if (!invoiceDate) {
        showAlert('Please select an invoice date', 'warning');
        return;
    }

    if (newInvoiceItems.length === 0) {
        showAlert('Please add at least one item to the invoice', 'warning');
        return;
    }

    try {
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

        if (!createResponse.ok) {
            const error = await createResponse.text();
            showAlert(`Failed to create invoice: ${error}`, 'danger');
            return;
        }

        const invoice = await createResponse.json();

        // Then add all items to the invoice
        for (const item of newInvoiceItems) {
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

            if (!addItemResponse.ok) {
                const error = await addItemResponse.text();
                showAlert(`Failed to add item ${item.productName}: ${error}`, 'danger');
                return;
            }
        }

        showAlert('Invoice created successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('createInvoiceModal')).hide();
        
        // Reset the form
        newInvoiceItems = [];
        displayNewInvoiceItems();
        updateNewInvoiceTotal();
        document.getElementById('newInvoiceDate').value = new Date().toISOString().split('T')[0];
        
        loadInvoices();
    } catch (error) {
        console.error('Error creating invoice:', error);
        showAlert('Error creating invoice', 'danger');
    }
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
    document.getElementById('editInvoiceTotal').value = `R${invoice.total.toFixed(2)}`;
    
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.productName)}</td>
            <td>R${item.unitPrice.toFixed(2)}</td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                       value="${item.quantity}" min="1" 
                       onchange="updateItemQuantity('${item.productId}', this.value)">
            </td>
            <td>R${item.lineTotal.toFixed(2)}</td>
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
    
    document.getElementById('itemLineTotal').value = `R${lineTotal.toFixed(2)}`;
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
            displayInvoices(invoices);
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