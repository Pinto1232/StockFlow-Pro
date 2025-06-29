// Password toggle functionality
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    // Load roles for register form
    loadRolesForRegisterForm();
    
    // Clear form errors function
    function clearFormErrors() {
        document.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
        });
        document.querySelectorAll('.form-error').forEach(error => {
            error.style.display = 'none';
        });
    }
    
    // Get server-side data passed from the page
    const pageData = window.loginPageData || {};
    const hasRegisterError = pageData.hasRegisterError || false;
    const hasRegisterSuccess = pageData.hasRegisterSuccess || false;
    
    // Show register tab if there are register messages
    if (hasRegisterError || hasRegisterSuccess) {
        // Use manual tab switching to avoid Bootstrap issues
        const registerTab = document.getElementById('register-tab');
        const registerPane = document.getElementById('register');
        const loginPane = document.getElementById('login');
        const loginTab = document.getElementById('login-tab');
        
        if (registerTab && registerPane && loginPane && loginTab) {
            // Remove active classes from login tab
            loginTab.classList.remove('active');
            loginPane.classList.remove('show', 'active');
            
            // Add active classes to register tab
            registerTab.classList.add('active');
            registerPane.classList.add('show', 'active');
        } else {
            console.error('Tab elements not found:', {
                registerTab: !!registerTab,
                registerPane: !!registerPane,
                loginPane: !!loginPane,
                loginTab: !!loginTab
            });
        }
    }

    // Add event listeners for tab switching to clear form errors
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    if (loginTab) {
        // Bootstrap tab event
        loginTab.addEventListener('shown.bs.tab', function() {
            clearFormErrors();
        });
        
        // Manual click event
        loginTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Manual tab switching
            const loginPane = document.getElementById('login');
            const registerPane = document.getElementById('register');
            
            if (loginPane && registerPane) {
                // Remove active from register
                registerTab?.classList.remove('active');
                registerPane.classList.remove('show', 'active');
                
                // Add active to login
                loginTab.classList.add('active');
                loginPane.classList.add('show', 'active');
                
                clearFormErrors();
            }
        });
    }
    
    if (registerTab) {
        // Bootstrap tab event
        registerTab.addEventListener('shown.bs.tab', function() {
            clearFormErrors();
        });
        
        // Manual click event
        registerTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Manual tab switching
            const loginPane = document.getElementById('login');
            const registerPane = document.getElementById('register');
            
            if (loginPane && registerPane) {
                // Remove active from login
                loginTab?.classList.remove('active');
                loginPane.classList.remove('show', 'active');
                
                // Add active to register
                registerTab.classList.add('active');
                registerPane.classList.add('show', 'active');
                
                clearFormErrors();
            }
        });
    }

    // Form validation
    const passwordField = document.getElementById('Register_Password');
    const confirmPasswordField = document.getElementById('Register_ConfirmPassword');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    if (passwordField && confirmPasswordField) {
        
        function validatePasswordLength() {
            const password = passwordField.value;
            const isValid = password.length >= 6 || password.length === 0;
            
            if (!isValid) {
                passwordField.classList.add('input-error');
                if (passwordError) passwordError.style.display = 'flex';
            } else {
                passwordField.classList.remove('input-error');
                if (passwordError) passwordError.style.display = 'none';
            }
            
            return isValid;
        }
        
        function validatePasswordMatch() {
            const password = passwordField.value;
            const confirmPassword = confirmPasswordField.value;
            const isValid = password === confirmPassword || confirmPassword.length === 0;
            
            if (!isValid) {
                confirmPasswordField.classList.add('input-error');
                if (confirmPasswordError) confirmPasswordError.style.display = 'flex';
            } else {
                confirmPasswordField.classList.remove('input-error');
                if (confirmPasswordError) confirmPasswordError.style.display = 'none';
            }
            
            return isValid;
        }
        
        // Real-time validation
        passwordField.addEventListener('input', function() {
            validatePasswordLength();
            if (confirmPasswordField.value) {
                validatePasswordMatch();
            }
        });
        
        confirmPasswordField.addEventListener('input', validatePasswordMatch);
        
        // Form submission validation
        const registerForm = document.querySelector('form[asp-page-handler="Register"]');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                const isPasswordValid = validatePasswordLength();
                const isMatchValid = validatePasswordMatch();
                
                if (!isPasswordValid || !isMatchValid) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }
    
    // Enhanced floating label behavior
    document.querySelectorAll('.floating-input input').forEach(input => {
        // Handle autofill detection
        function checkAutofill() {
            if (input.value || input.matches(':-webkit-autofill')) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
        
        input.addEventListener('input', checkAutofill);
        input.addEventListener('focus', checkAutofill);
        input.addEventListener('blur', checkAutofill);
        
        // Initial check
        setTimeout(checkAutofill, 100);
    });
    
    // Smooth form animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.form-group').forEach(group => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(group);
    });
});

// Load roles for register form dropdown
async function loadRolesForRegisterForm() {
    console.log('🔄 === LOADING ROLES FOR REGISTER FORM ===');
    
    const roleSelect = document.getElementById('Register_Role');
    if (!roleSelect) {
        console.log('🔴 Register_Role select element not found');
        return;
    }
    
    try {
        // Add cache busting to ensure fresh data
        const timestamp = new Date().getTime();
        console.log('🔄 Fetching roles from /api/role-management/roles/options with timestamp:', timestamp);
        
        const response = await fetch(`/api/role-management/roles/options?_t=${timestamp}`);
        console.log('🔄 Response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`Failed to load roles: ${response.status}`);
        }
        
        const roles = await response.json();
        console.log('🔄 Fetched roles for register form:', roles);
        console.log('🔄 Number of roles:', roles.length);
        
        // Clear existing options
        roleSelect.innerHTML = '';
        
        if (roles.length === 0) {
            console.log('🔴 No roles found, adding default option');
            roleSelect.innerHTML = '<option value="">No roles available</option>';
            return;
        }
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a role...';
        roleSelect.appendChild(defaultOption);
        
        // Add role options
        roles.forEach((role, index) => {
            console.log(`🔄 Adding role ${index + 1}:`, role.name, '-', role.displayName);
            
            const option = document.createElement('option');
            option.value = role.name;
            option.textContent = role.displayName;
            
            // Set User as default selected
            if (role.name === 'User') {
                option.selected = true;
                console.log('🔄 Set User role as default selected');
            }
            
            roleSelect.appendChild(option);
        });
        
        console.log('🔄 ✅ Successfully populated register form with', roles.length, 'roles');
        
    } catch (error) {
        console.error('🔴 Error loading roles for register form:', error);
        
        // Fallback to hardcoded roles
        console.log('🔄 Using fallback hardcoded roles');
        roleSelect.innerHTML = `
            <option value="">Select a role...</option>
            <option value="User" selected>User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
        `;
    }
}