class ProfileManager {
    constructor() {
        this.originalProfileData = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProfile();
    }

    bindEvents() {
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');
        const photoInput = document.getElementById('photoInput');
        const profilePhotoWrapper = document.querySelector('.profile-photo-wrapper');

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        }

        // Photo upload events
        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
        }

        if (profilePhotoWrapper) {
            profilePhotoWrapper.addEventListener('click', () => this.selectPhoto());
        }

        // Real-time validation
        ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });

        ['currentPassword', 'newPassword', 'confirmPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validatePasswordField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });
    }

    async loadProfile() {
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) {
                if (response.status === 401) {
                    // User is not authenticated
                    this.showAuthenticationError();
                    return;
                } else if (response.status === 404) {
                    throw new Error('Profile not found. Please contact support.');
                } else {
                    throw new Error('Failed to load profile: ' + response.status);
                }
            }
            
            const profile = await response.json();
            this.populateForm(profile);
            this.updateSummary(profile);
            this.originalProfileData = Object.assign({}, profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showToast('Error', error.message || 'Failed to load profile data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populateForm(profile) {
        document.getElementById('firstName').value = profile.firstName || '';
        document.getElementById('lastName').value = profile.lastName || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('phoneNumber').value = profile.phoneNumber || '';
        document.getElementById('role').value = profile.role || '';
        
        if (profile.dateOfBirth) {
            const date = new Date(profile.dateOfBirth);
            document.getElementById('dateOfBirth').value = date.toISOString().split('T')[0];
        }

        // Update profile photo
        this.updateProfilePhoto(profile.profilePhotoUrl);
    }

    updateProfilePhoto(photoUrl) {
        const profilePhoto = document.getElementById('profilePhoto');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        if (photoUrl && photoUrl !== '/images/default-avatar.svg') {
            profilePhoto.src = photoUrl;
            removePhotoBtn.style.display = 'inline-block';
        } else {
            profilePhoto.src = '/images/default-avatar.svg';
            removePhotoBtn.style.display = 'none';
        }
    }

    selectPhoto() {
        const photoInput = document.getElementById('photoInput');
        photoInput.click();
    }

    async handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!this.validatePhotoFile(file)) {
            return;
        }

        // Show preview
        this.showPhotoPreview(file);

        // Upload photo
        await this.uploadPhoto(file);
    }

    validatePhotoFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            this.showToast('Error', 'Please select a valid image file (JPG, PNG, GIF)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showToast('Error', 'File size must be less than 5MB', 'error');
            return false;
        }

        return true;
    }

    showPhotoPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const profilePhoto = document.getElementById('profilePhoto');
            profilePhoto.src = e.target.result;
            document.getElementById('removePhotoBtn').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }

    async uploadPhoto(file) {
        this.showLoading(true);

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch('/api/profile/upload-photo', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.showToast('Authentication Required', 'Please sign in to upload photos', 'error');
                    return;
                }
                
                let errorMessage = 'Failed to upload photo';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If response is not JSON, try to get text
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            this.updateProfilePhoto(result.photoUrl);
            
            // Update navbar avatar
            if (typeof window.updateNavbarAvatar === 'function') {
                window.updateNavbarAvatar(result.photoUrl);
            }
            
            this.showToast('Success', result.message || 'Profile photo updated successfully!', 'success');
        } catch (error) {
            console.error('Error uploading photo:', error);
            this.showToast('Error', error.message, 'error');
            // Revert to original photo on error
            this.updateProfilePhoto(this.originalProfileData?.profilePhotoUrl);
        } finally {
            this.showLoading(false);
            // Clear the input
            document.getElementById('photoInput').value = '';
        }
    }

    async removePhoto() {
        if (!confirm('Are you sure you want to remove your profile photo?')) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/profile/remove-photo', {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove photo');
            }

            this.updateProfilePhoto(null);
            
            // Update navbar avatar
            if (typeof window.updateNavbarAvatar === 'function') {
                window.updateNavbarAvatar(null);
            }
            
            this.showToast('Success', 'Profile photo removed successfully!', 'success');
        } catch (error) {
            console.error('Error removing photo:', error);
            this.showToast('Error', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateSummary(profile) {
        document.getElementById('summaryFullName').textContent = profile.fullName || '-';
        document.getElementById('summaryAge').textContent = profile.age ? profile.age + ' years' : '-';
        
        if (profile.createdAt) {
            const createdDate = new Date(profile.createdAt);
            document.getElementById('summaryMemberSince').textContent = createdDate.toLocaleDateString();
        }
        
        if (profile.updatedAt) {
            const updatedDate = new Date(profile.updatedAt);
            document.getElementById('summaryLastUpdated').textContent = updatedDate.toLocaleDateString();
        } else {
            document.getElementById('summaryLastUpdated').textContent = 'Never';
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        if (!this.validateProfileForm()) {
            return;
        }

        this.showLoading(true);
        
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            dateOfBirth: document.getElementById('dateOfBirth').value
        };

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const updatedProfile = await response.json();
            this.updateSummary(updatedProfile);
            this.originalProfileData = Object.assign({}, updatedProfile);
            this.showToast('Success', 'Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Error', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        if (!this.validatePasswordForm()) {
            return;
        }

        this.showLoading(true);
        
        const passwordData = {
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: document.getElementById('newPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        try {
            const response = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            document.getElementById('passwordForm').reset();
            this.showToast('Success', 'Password changed successfully!', 'success');
        } catch (error) {
            console.error('Error changing password:', error);
            this.showToast('Error', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    validateProfileForm() {
        let isValid = true;
        
        const fields = [
            { id: 'firstName', name: 'First name', required: true, maxLength: 50 },
            { id: 'lastName', name: 'Last name', required: true, maxLength: 50 },
            { id: 'phoneNumber', name: 'Phone number', required: true, pattern: /^\+?[1-9]\d{1,14}$/ },
            { id: 'dateOfBirth', name: 'Date of birth', required: true, type: 'date' }
        ];

        fields.forEach(field => {
            if (!this.validateField(field.id)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    errorMessage = (fieldId === 'firstName' ? 'First' : 'Last') + ' name is required';
                    isValid = false;
                } else if (value.length > 50) {
                    errorMessage = (fieldId === 'firstName' ? 'First' : 'Last') + ' name must not exceed 50 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) {
                    errorMessage = (fieldId === 'firstName' ? 'First' : 'Last') + ' name contains invalid characters';
                    isValid = false;
                }
                break;
            case 'phoneNumber':
                if (!value) {
                    errorMessage = 'Phone number is required';
                    isValid = false;
                } else if (!/^\+?[1-9]\d{1,14}$/.test(value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;
            case 'dateOfBirth':
                if (!value) {
                    errorMessage = 'Date of birth is required';
                    isValid = false;
                } else {
                    const birthDate = new Date(value);
                    const age = this.calculateAge(birthDate);
                    if (age < 13 || age > 120) {
                        errorMessage = 'Age must be between 13 and 120 years';
                        isValid = false;
                    }
                }
                break;
        }

        this.setFieldError(fieldId, errorMessage);
        return isValid;
    }

    validatePasswordForm() {
        let isValid = true;
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!this.validatePasswordField('currentPassword')) isValid = false;
        if (!this.validatePasswordField('newPassword')) isValid = false;
        if (!this.validatePasswordField('confirmPassword')) isValid = false;

        return isValid;
    }

    validatePasswordField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'currentPassword':
                if (!value) {
                    errorMessage = 'Current password is required';
                    isValid = false;
                }
                break;
            case 'newPassword':
                if (!value) {
                    errorMessage = 'New password is required';
                    isValid = false;
                } else if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters long';
                    isValid = false;
                } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@@\#\$\^&*])[A-Za-z\d!@@\#\$\^&*]/.test(value)) {
                    errorMessage = 'Password must contain uppercase, lowercase, number, and special character';
                    isValid = false;
                } else if (value === document.getElementById('currentPassword').value) {
                    errorMessage = 'New password must be different from current password';
                    isValid = false;
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    errorMessage = 'Please confirm your new password';
                    isValid = false;
                } else if (value !== document.getElementById('newPassword').value) {
                    errorMessage = 'Passwords do not match';
                    isValid = false;
                }
                break;
        }

        this.setFieldError(fieldId, errorMessage);
        return isValid;
    }

    setFieldError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (errorMessage) {
            field.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        } else {
            field.classList.remove('is-invalid');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        field.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    resetForm() {
        if (this.originalProfileData) {
            this.populateForm(this.originalProfileData);
            this.clearAllErrors();
        }
    }

    clearAllErrors() {
        const errorElements = document.querySelectorAll('.invalid-feedback');
        const invalidFields = document.querySelectorAll('.is-invalid');
        
        errorElements.forEach(el => el.textContent = '');
        invalidFields.forEach(field => field.classList.remove('is-invalid'));
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
        
        const buttons = document.querySelectorAll('#saveProfileBtn, #changePasswordBtn');
        buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            } else {
                if (btn.id === 'saveProfileBtn') {
                    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
                } else {
                    btn.innerHTML = '<i class="fas fa-key me-2"></i>Change Password';
                }
            }
        });
    }

    showAuthenticationError() {
        // Show authentication required message
        const profileContainer = document.querySelector('.profile-container');
        if (profileContainer) {
            profileContainer.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>Authentication Required</h4>
                    <p>You need to be logged in to view and edit your profile.</p>
                    <a href="/Login" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt me-2"></i>Sign In
                    </a>
                </div>
            `;
        }
        this.showToast('Authentication Required', 'Please sign in to access your profile', 'error');
    }

    showToast(title, message, type) {
        const toast = document.getElementById('notificationToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Reset classes
        toast.className = 'toast';
        toastIcon.className = 'fas me-2';
        
        switch (type) {
            case 'success':
                toast.classList.add('bg-success', 'text-white');
                toastIcon.classList.add('fa-check-circle');
                break;
            case 'error':
                toast.classList.add('bg-danger', 'text-white');
                toastIcon.classList.add('fa-exclamation-circle');
                break;
            default:
                toast.classList.add('bg-info', 'text-white');
                toastIcon.classList.add('fa-info-circle');
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function selectPhoto() {
    if (profileManager) {
        profileManager.selectPhoto();
    }
}

function removePhoto() {
    if (profileManager) {
        profileManager.removePhoto();
    }
}

function resetForm() {
    if (profileManager) {
        profileManager.resetForm();
    }
}

let profileManager;

document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});