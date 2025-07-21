import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLogin, useRegister, useIsAuthenticated } from '../../hooks/useAuth';
import type { LoginRequest, RegisterRequest } from '../../types/index';
import './Auth.css';

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: 'User',
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isAuthenticated = useIsAuthenticated();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (loginErrors[name]) {
      setLoginErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (registerErrors[name]) {
      setRegisterErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!registerData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!registerData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    try {
      await loginMutation.mutateAsync(loginData);
      // Navigation will be handled by the redirect logic above
    } catch (error: any) {
      setLoginErrors({
        submit: error.response?.data?.message || 'Login failed. Please try again.',
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;

    try {
      await registerMutation.mutateAsync(registerData);
      setRegisterSuccess(true);
    } catch (error: any) {
      setRegisterErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (registerSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-content">
            <div className="auth-header">
              <h2 className="auth-title">Registration Successful!</h2>
              <p className="auth-subtitle">
                Your account has been created successfully. You can now{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setRegisterSuccess(false);
                    setActiveTab('login');
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  sign in
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
            type="button"
          >
            Register
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'login' && (
            <div className="tab-pane fade show active">
              <div className="auth-content">
                <div className="auth-header">
                  <h2 className="auth-title">Welcome Back</h2>
                  <p className="auth-subtitle">Please enter your credentials to continue</p>
                </div>
                
                {loginErrors.submit && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    {loginErrors.submit}
                  </div>
                )}
                
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-envelope input-icon"></i>
                      <input
                        type="email"
                        id="loginEmail"
                        name="email"
                        placeholder=" "
                        required
                        autoFocus
                        autoComplete="username"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className={loginErrors.email ? 'input-error' : ''}
                      />
                      <label htmlFor="loginEmail" className="floating-label">
                        Email Address
                      </label>
                    </div>
                    {loginErrors.email && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {loginErrors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-lock input-icon"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="loginPassword"
                        name="password"
                        placeholder=" "
                        required
                        autoComplete="current-password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={loginErrors.password ? 'input-error' : ''}
                      />
                      <label htmlFor="loginPassword" className="floating-label">
                        Password
                      </label>
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePassword}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {loginErrors.password && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {loginErrors.password}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                  </button>
                  
                  <div className="forgot-password">
                    <Link to="/forgot-password">Forgot your password?</Link>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'register' && (
            <div className="tab-pane fade show active">
              <div className="auth-content">
                <div className="auth-header">
                  <h2 className="auth-title">Create Account</h2>
                  <p className="auth-subtitle">Please fill in your information to get started</p>
                </div>
                
                {registerErrors.submit && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                    {registerErrors.submit}
                  </div>
                )}
                
                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <div className="floating-input">
                        <i className="fas fa-user input-icon"></i>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder=" "
                          required
                          autoComplete="given-name"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          className={registerErrors.firstName ? 'input-error' : ''}
                        />
                        <label htmlFor="firstName" className="floating-label">
                          First Name
                        </label>
                      </div>
                      {registerErrors.firstName && (
                        <div className="form-error">
                          <i className="fas fa-exclamation-circle"></i>
                          {registerErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <div className="floating-input">
                        <i className="fas fa-user input-icon"></i>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder=" "
                          required
                          autoComplete="family-name"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          className={registerErrors.lastName ? 'input-error' : ''}
                        />
                        <label htmlFor="lastName" className="floating-label">
                          Last Name
                        </label>
                      </div>
                      {registerErrors.lastName && (
                        <div className="form-error">
                          <i className="fas fa-exclamation-circle"></i>
                          {registerErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-envelope input-icon"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder=" "
                        required
                        autoComplete="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className={registerErrors.email ? 'input-error' : ''}
                      />
                      <label htmlFor="email" className="floating-label">
                        Email Address
                      </label>
                    </div>
                    {registerErrors.email && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {registerErrors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-phone input-icon"></i>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder=" "
                        required
                        autoComplete="tel"
                        value={registerData.phoneNumber}
                        onChange={handleRegisterChange}
                        className={registerErrors.phoneNumber ? 'input-error' : ''}
                      />
                      <label htmlFor="phoneNumber" className="floating-label">
                        Phone Number
                      </label>
                    </div>
                    {registerErrors.phoneNumber && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {registerErrors.phoneNumber}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-calendar input-icon"></i>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        placeholder=" "
                        required
                        autoComplete="bday"
                        value={registerData.dateOfBirth}
                        onChange={handleRegisterChange}
                        className={registerErrors.dateOfBirth ? 'input-error' : ''}
                      />
                      <label htmlFor="dateOfBirth" className="floating-label">
                        Date of Birth
                      </label>
                    </div>
                    {registerErrors.dateOfBirth && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {registerErrors.dateOfBirth}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-lock input-icon"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder=" "
                        required
                        autoComplete="new-password"
                        minLength={6}
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className={registerErrors.password ? 'input-error' : ''}
                      />
                      <label htmlFor="password" className="floating-label">
                        Password
                      </label>
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePassword}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {registerErrors.password && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {registerErrors.password}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <div className="floating-input">
                      <i className="fas fa-lock input-icon"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder=" "
                        required
                        autoComplete="new-password"
                        minLength={6}
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className={registerErrors.confirmPassword ? 'input-error' : ''}
                      />
                      <label htmlFor="confirmPassword" className="floating-label">
                        Confirm Password
                      </label>
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleConfirmPassword}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {registerErrors.confirmPassword}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-button success"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;