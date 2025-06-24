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

// Enhanced tab functionality
function switchTab(tabId) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    
    // Add active class to clicked tab
    document.getElementById(tabId + '-tab').classList.add('active');
    document.getElementById(tabId).classList.add('show', 'active');
}

document.addEventListener('DOMContentLoaded', function() {
    // Get server-side data passed from the page
    const pageData = window.loginPageData || {};
    const hasRegisterError = pageData.hasRegisterError || false;
    const hasRegisterSuccess = pageData.hasRegisterSuccess || false;
    
    // Show register tab if there are register messages
    if (hasRegisterError || hasRegisterSuccess) {
        switchTab('register');
    }

    // Enhanced tab click handlers
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    if (loginTab) {
        loginTab.addEventListener('click', function() {
            switchTab('login');
            clearFormErrors();
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', function() {
            switchTab('register');
            clearFormErrors();
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
    
    // Clear form errors function
    function clearFormErrors() {
        document.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
        });
        document.querySelectorAll('.form-error').forEach(error => {
            error.style.display = 'none';
        });
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