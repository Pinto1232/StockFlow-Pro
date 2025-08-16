import React, { useState, useEffect, useRef } from 'react';
import DateTime from 'react-datetime';
import moment from 'moment';
import { X, Calendar, Clock, User, Mail, Building, CheckCircle, AlertCircle, Zap, Coffee, Sun } from 'lucide-react';
import 'react-datetime/css/react-datetime.css';

interface DemoSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark' | 'blue';
}

interface DemoFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  selectedDateTime: moment.Moment | null;
  message: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  dateTime?: string;
}

interface QuickSelectOption {
  label: string;
  icon: React.ReactNode;
  getValue: () => moment.Moment;
  description: string;
}

const DemoScheduler: React.FC<DemoSchedulerProps> = ({ isOpen, onClose, theme = 'light' }) => {
  const [formData, setFormData] = useState<DemoFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    selectedDateTime: null,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [dateFormat, setDateFormat] = useState<'US' | 'EU' | 'ISO'>('US');
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasFocusedRef = useRef(false);
  const onCloseRef = useRef<() => void>(onClose);

  // Keep latest onClose in a ref so keyboard handler always calls the current function
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Theme configurations
  const themes = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      accent: 'from-blue-600 to-indigo-600',
      accentHover: 'from-blue-700 to-indigo-700'
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      border: 'border-gray-600',
      accent: 'from-purple-600 to-pink-600',
      accentHover: 'from-purple-700 to-pink-700'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      accent: 'from-blue-600 to-cyan-600',
      accentHover: 'from-blue-700 to-cyan-700'
    }
  };

  const currentTheme = themes[theme];

  // Quick select options for common time slots
  const quickSelectOptions: QuickSelectOption[] = [
    {
      label: 'Tomorrow Morning',
      icon: <Sun className="w-4 h-4" />,
      getValue: () => moment().add(1, 'day').hour(10).minute(0),
      description: '10:00 AM tomorrow'
    },
    {
      label: 'This Week',
      icon: <Zap className="w-4 h-4" />,
      getValue: () => moment().add(2, 'days').hour(14).minute(0),
      description: 'Next available slot this week'
    },
    {
      label: 'Next Week',
      icon: <Coffee className="w-4 h-4" />,
      getValue: () => moment().add(1, 'week').day(1).hour(11).minute(0),
      description: 'Monday morning next week'
    }
  ];

  // Enhanced validation
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.selectedDateTime) {
      newErrors.dateTime = 'Please select a date and time for your demo';
    } else if (!isValidBusinessDay(formData.selectedDateTime) || !isValidBusinessTime(formData.selectedDateTime)) {
      newErrors.dateTime = 'Please select a valid business day and time (Mon-Fri, 9AM-5PM)';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof DemoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateTimeChange = (value: moment.Moment | string) => {
    if (moment.isMoment(value)) {
      setFormData(prev => ({ ...prev, selectedDateTime: value }));
      if (errors.dateTime) {
        setErrors(prev => ({ ...prev, dateTime: undefined }));
      }
    }
  };

  const handleQuickSelect = (option: QuickSelectOption) => {
    const dateTime = option.getValue();
    if (isValidBusinessDay(dateTime) && isValidBusinessTime(dateTime)) {
      setFormData(prev => ({ ...prev, selectedDateTime: dateTime }));
      setShowQuickSelect(false);
      if (errors.dateTime) {
        setErrors(prev => ({ ...prev, dateTime: undefined }));
      }
    }
  };

  // Allow selecting any future weekday on the calendar
  const isValidBusinessDay = (current: moment.Moment) => {
    const today = moment().startOf('day');
    const isWeekday = current.day() !== 0 && current.day() !== 6;
    return isWeekday && current.isSameOrAfter(today, 'day');
  };

  // Validate business hours and future time for the selected datetime
  const isValidBusinessTime = (current: moment.Moment) => {
    const now = moment();
    const isFuture = current.isAfter(now);
    const isBusinessHours = current.hour() >= 9 && current.hour() < 17;
    return isFuture && isBusinessHours;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          phone: '',
          selectedDateTime: null,
          message: ''
        });
        setErrors({});
        onClose();
      }, 3000);
  } catch {
      setIsSubmitting(false);
      setErrors({ dateTime: 'Failed to schedule demo. Please try again.' });
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.company.trim() &&
      formData.selectedDateTime &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      Object.keys(errors).length === 0
    );
  };

  const formatDateTime = (dateTime: moment.Moment) => {
    const formats = {
      US: 'MMMM Do, YYYY [at] h:mm A',
      EU: 'Do MMMM YYYY [at] HH:mm',
      ISO: 'YYYY-MM-DD [at] HH:mm'
    };
    return dateTime.format(formats[dateFormat]);
  };

  // Keyboard navigation and focus management (focus only once per open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCloseRef.current?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (!hasFocusedRef.current) {
        const firstFocusable = containerRef.current?.querySelector(
          'input, textarea, select, button, [tabindex]'
        ) as HTMLElement | null;
        if (firstFocusable) {
          firstFocusable.focus();
          hasFocusedRef.current = true;
        }
      }
    } else {
      // Reset for next open
      hasFocusedRef.current = false;
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="demo-scheduler-title">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div ref={containerRef} className={`relative ${currentTheme.bg} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100`}>
          {/* Header */}
          <div className={`sticky top-0 ${currentTheme.bg} ${currentTheme.border} border-b px-6 py-4 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 id="demo-scheduler-title" className={`text-2xl font-bold ${currentTheme.text}`}>
                  Schedule Your Demo
                </h2>
                <p className="text-gray-600 mt-1">Book a personalized demo of StockFlow Pro</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Date Format Selector */}
                <div className="flex items-center gap-1 mr-2">
                  <button
                    type="button"
                    onClick={() => setDateFormat(dateFormat === 'US' ? 'EU' : dateFormat === 'EU' ? 'ISO' : 'US')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Change date format"
                  >
                    {dateFormat}
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSubmitted ? (
              // Success State with animation
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Demo Scheduled!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for scheduling a demo. We'll send you a calendar invitation and join details shortly.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    Demo Date: {formData.selectedDateTime && formatDateTime(formData.selectedDateTime)}
                  </p>
                </div>
              </div>
            ) : (
              // Form with enhanced features
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="animate-fadeIn">
                  <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm ${
                          errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="John"
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <div id="firstName-error" className="mt-1 flex items-center gap-1 text-sm text-red-600 animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm ${
                          errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <div id="lastName-error" className="mt-1 flex items-center gap-1 text-sm text-red-600 animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="animate-fadeIn">
                  <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="john.doe@company.com"
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <div id="email-error" className="mt-1 flex items-center gap-1 text-sm text-red-600 animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="animate-fadeIn">
                  <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                    <Building className="w-5 h-5" />
                    Company Information
                  </h3>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm ${
                        errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Your Company Inc."
                      aria-describedby={errors.company ? 'company-error' : undefined}
                      autoComplete="organization"
                    />
                    {errors.company && (
                      <div id="company-error" className="mt-1 flex items-center gap-1 text-sm text-red-600 animate-slideIn">
                        <AlertCircle className="w-4 h-4" />
                        {errors.company}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="animate-fadeIn">
                  <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                    <Calendar className="w-5 h-5" />
                    Select Date & Time *
                  </h3>
                  
                  {/* Quick Select Options */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setShowQuickSelect(!showQuickSelect)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-2 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Quick Select
                    </button>
                    {showQuickSelect && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 animate-slideIn">
                        {quickSelectOptions.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickSelect(option)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left transform hover:scale-105"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {option.icon}
                              <span className="font-medium text-sm">{option.label}</span>
                            </div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`bg-gray-50 border rounded-lg p-4 transition-all duration-200 ${errors.dateTime ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <DateTime
                      value={formData.selectedDateTime}
                      onChange={handleDateTimeChange}
                      isValidDate={isValidBusinessDay}
                      input={false}
                      className="w-full"
                      timeConstraints={{
                        hours: { min: 9, max: 16, step: 1 },
                        minutes: { min: 0, max: 59, step: 30 }
                      }}
                    />
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" />
                        Available: Monday - Friday, 9:00 AM - 5:00 PM
                      </div>
                      {formData.selectedDateTime && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 font-medium animate-slideIn">
                          Selected: {formatDateTime(formData.selectedDateTime)}
                        </div>
                      )}
                    </div>
                    {errors.dateTime && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-red-600 animate-slideIn">
                        <AlertCircle className="w-4 h-4" />
                        {errors.dateTime}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Message */}
                <div className="animate-fadeIn">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-base sm:text-sm"
                    placeholder="Tell us about your specific needs or questions..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-base sm:text-sm min-h-[48px] sm:min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r ${currentTheme.accent} text-white font-semibold rounded-lg hover:${currentTheme.accentHover} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-sm min-h-[48px] sm:min-h-[44px] transform hover:scale-105 disabled:hover:scale-100`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Schedule Demo
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles for react-datetime and animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }

        .rdtPicker {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }
        
        .rdtPicker td.rdtDay:hover,
        .rdtPicker td.rdtHour:hover,
        .rdtPicker td.rdtMinute:hover {
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .rdtPicker td.rdtActive,
        .rdtPicker td.rdtActive:hover {
          background: linear-gradient(to right, #2563eb, #4f46e5);
          color: white;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rdtPicker td.rdtToday:before {
          border-bottom-color: #2563eb;
        }
        
        .rdtPicker th {
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          font-weight: 600;
          padding: 0.75rem 0.5rem;
        }
        
        .rdtPicker .rdtSwitch {
          color: #1f2937;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .rdtPicker .rdtSwitch:hover {
          background: #f3f4f6;
        }
        
        .rdtPicker .rdtNext,
        .rdtPicker .rdtPrev {
          color: #6b7280;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .rdtPicker .rdtNext:hover,
        .rdtPicker .rdtPrev:hover {
          color: #2563eb;
          background: #f3f4f6;
        }
        
        .rdtDisabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background: #f9fafb !important;
        }
        
        .rdtPicker td {
          padding: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .rdtPicker td:hover {
          transform: scale(1.05);
        }
        
        .rdtPicker .rdtTimeToggle {
          text-align: center;
          padding: 0.5rem;
          border-top: 1px solid #e5e7eb;
          color: #2563eb;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .rdtPicker .rdtTimeToggle:hover {
          background: #f3f4f6;
        }

        /* Mobile responsiveness improvements */
        @media (max-width: 640px) {
          .rdtPicker {
            font-size: 0.875rem;
          }
          
          .rdtPicker td {
            padding: 0.75rem 0.5rem;
            min-height: 44px;
            min-width: 44px;
          }
          
          .rdtPicker th {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DemoScheduler;