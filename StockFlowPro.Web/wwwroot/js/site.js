window.showSnackbar = function(message, type = 'info') {
    const existingSnackbar = document.querySelector('.toast-snackbar');
    if (existingSnackbar) {
        existingSnackbar.remove();
    }

    const snackbar = document.createElement('div');
    snackbar.className = `toast-snackbar toast-${type}`;
    
    const iconMap = {
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle'
    };
    
    snackbar.innerHTML = `
        <div class="toast-content">
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(snackbar);

    setTimeout(() => snackbar.classList.add('show'), 100);

    setTimeout(() => {
        snackbar.classList.remove('show');
        setTimeout(() => snackbar.remove(), 300);
    }, 3000);
};

const snackbarStyles = `
.toast-snackbar {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-left: 4px solid #0d6efd;
    padding: 12px 16px;
    z-index: 1050;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    max-width: 400px;
    min-width: 250px;
}

.toast-snackbar.show {
    transform: translateX(0);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333;
    font-size: 14px;
}

.toast-snackbar.toast-success {
    border-left-color: #198754;
}

.toast-snackbar.toast-error {
    border-left-color: #dc3545;
}

.toast-snackbar.toast-warning {
    border-left-color: #ffc107;
}

.toast-snackbar.toast-info {
    border-left-color: #0d6efd;
}

.toast-success .toast-content i {
    color: #198754;
}

.toast-error .toast-content i {
    color: #dc3545;
}

.toast-warning .toast-content i {
    color: #ffc107;
}

.toast-info .toast-content i {
    color: #0d6efd;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = snackbarStyles;
document.head.appendChild(styleSheet);
