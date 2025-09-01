import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, CreditCard, AlertCircle, User, Building, MapPin, Phone, Mail } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import { getPlansByInterval, type SubscriptionPlan } from '../../services/subscriptionService';

interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface FormErrors {
  [key: string]: string;
}

const PersonalInfo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan');
  const cadence = searchParams.get('cadence') || 'monthly';
  
  const [formData, setFormData] = useState<PersonalInfoForm>({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      console.log('PersonalInfo: Loading plan with params:', { planId, cadence, sessionId });
      
      if (!planId) {
        console.error('PersonalInfo: No planId provided, redirecting to pricing');
        // Add a small delay to see the error
        setTimeout(() => navigate('/pricing'), 3000);
        return;
      }

      if (!sessionId) {
        console.error('PersonalInfo: No sessionId provided, redirecting to checkout');
        setTimeout(() => navigate('/checkout'), 3000);
        return;
      }

      try {
        setLoading(true);
        const interval = cadence === 'annual' ? 'Annual' : 'Monthly';
        console.log('PersonalInfo: Fetching plans for interval:', interval);
        
        const plans = await getPlansByInterval(interval);
        console.log('PersonalInfo: Available plans:', plans.map(p => ({ id: p.id, name: p.name })));
        
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
          console.log('PersonalInfo: Plan found:', { id: plan.id, name: plan.name });
          setSelectedPlan(plan);
        } else {
          console.error(`PersonalInfo: Plan with id ${planId} not found in ${interval} plans`);
          console.error('Available plan IDs:', plans.map(p => p.id));
          // Add a small delay to see the error
          setTimeout(() => navigate('/pricing'), 3000);
          return;
        }
      } catch (error) {
        console.error('PersonalInfo: Failed to load plan:', error);
        // Add a small delay to see the error
        setTimeout(() => navigate('/pricing'), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId, cadence, sessionId, navigate]);

  // Pre-fill email if user is authenticated
  useEffect(() => {
    if (currentUser?.email) {
      setFormData(prev => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser?.email]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // Email validation
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation (US format)
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PersonalInfoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store personal information in localStorage for the payment process
      const personalInfo = {
        ...formData,
        sessionId,
        planId,
        cadence,
        timestamp: Date.now()
      };
      
      localStorage.setItem('checkoutPersonalInfo', JSON.stringify(personalInfo));
      
      // Navigate to Stripe payment with all necessary parameters
      const params = new URLSearchParams({
        session_id: sessionId,
        plan: planId || '',
        cadence: cadence,
        step: 'payment'
      });
      
      navigate(`/checkout/payment?${params.toString()}`);
      
    } catch (error) {
      console.error('Error saving personal information:', error);
      setErrors({ submit: 'Failed to save information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <div className="mt-4 text-sm text-gray-600 text-left">
            <p><strong>Session ID:</strong> {sessionId || 'Missing'}</p>
            <p><strong>Plan ID:</strong> {planId || 'Missing'}</p>
            <p><strong>Cadence:</strong> {cadence}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => 
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/checkout" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to checkout
        </Link>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Shield className="w-4 h-4" /> Secure checkout
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
                  <p className="text-gray-600">Please provide your billing information to complete your purchase</p>
                </div>
              </div>

              {errors.submit && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>{errors.submit}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!!currentUser?.email}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } ${currentUser?.email ? 'bg-gray-100' : ''} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Enter your street address"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                {/* City, State, ZIP */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter state"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="12345"
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continue to Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {selectedPlan && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Billed {cadence === 'annual' ? 'annually' : 'monthly'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(selectedPlan.price, selectedPlan.currency)}
                      </div>
                      {cadence === 'annual' && selectedPlan.monthlyEquivalentPrice && (
                        <div className="text-sm text-gray-500">
                          ${selectedPlan.monthlyEquivalentPrice.toFixed(2)}/month
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(selectedPlan.price, selectedPlan.currency)}</span>
                  </div>
                  
                  {selectedPlan.features && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Included features:</h4>
                      <ul className="space-y-1">
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalInfo;