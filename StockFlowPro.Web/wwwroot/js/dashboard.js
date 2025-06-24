// Dashboard JavaScript Functionality

// Enhanced sidebar functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    const isOpen = sidebar.classList.contains('show');
    
    if (isOpen) {
        // Closing sidebar
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        body.style.overflow = '';
        
        // Update ARIA attributes
        sidebar.setAttribute('aria-hidden', 'true');
    } else {
        // Opening sidebar
        sidebar.classList.add('show');
        overlay.classList.add('show');
        body.style.overflow = 'hidden'; // Prevent background scroll on mobile
        
        // Update ARIA attributes
        sidebar.setAttribute('aria-hidden', 'false');
        
        // Focus first menu item for accessibility
        setTimeout(() => {
            const firstMenuItem = sidebar.querySelector('.sidebar-menu-link');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, 300);
    }
}

function toggleSubmenu(element) {
    const menuItem = element.parentElement;
    const submenu = menuItem.querySelector('.sidebar-submenu');
    const isOpen = menuItem.classList.contains('open');
    
    // Close other open submenus
    document.querySelectorAll('.sidebar-menu-item.has-submenu.open').forEach(item => {
        if (item !== menuItem) {
            item.classList.remove('open');
            item.querySelector('.sidebar-submenu').classList.remove('show');
            item.querySelector('button').setAttribute('aria-expanded', 'false');
        }
    });
    
    // Toggle current submenu
    menuItem.classList.toggle('open');
    submenu.classList.toggle('show');
    
    // Update ARIA attributes
    element.setAttribute('aria-expanded', !isOpen);
    
    // Smooth scroll to show submenu if needed
    if (!isOpen) {
        setTimeout(() => {
            submenu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Enhanced click outside to close
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    // Check if click is on toggle button
    const isToggleButton = mobileMenuBtn && mobileMenuBtn.contains(event.target);
    
    // Close sidebar if clicking outside on mobile
    if (!sidebar.contains(event.target) && !isToggleButton && window.innerWidth < 992) {
        if (sidebar.classList.contains('show')) {
            toggleSidebar();
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    const sidebar = document.getElementById('sidebarDrawer');
    
    if (sidebar.classList.contains('show')) {
        switch(event.key) {
            case 'Escape':
                event.preventDefault();
                toggleSidebar();
                break;
            case 'Tab':
                // Trap focus within sidebar when open on mobile
                if (window.innerWidth < 992) {
                    const focusableElements = sidebar.querySelectorAll(
                        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
                break;
        }
    }
});

// Add loading states to menu links
document.addEventListener('DOMContentLoaded', function() {
    const menuLinks = document.querySelectorAll('.sidebar-menu-link[href]:not([href="#"])');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't add loading state for same page links
            if (this.getAttribute('href') === window.location.pathname) {
                return;
            }
            
            // Add loading state
            this.classList.add('loading');
            
            // Remove loading state after navigation or timeout
            setTimeout(() => {
                this.classList.remove('loading');
            }, 3000);
        });
    });
    
    // Initialize ARIA attributes
    const sidebar = document.getElementById('sidebarDrawer');
    if (sidebar) {
        sidebar.setAttribute('aria-hidden', 'true');
    }
    
    // Initialize submenu ARIA attributes
    document.querySelectorAll('.has-submenu button').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scrolling for better UX
document.querySelectorAll('.sidebar-menu-link[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Auto-close sidebar on window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth >= 992 && sidebar && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
});