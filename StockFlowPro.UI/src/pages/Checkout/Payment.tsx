import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, CreditCard, AlertCircle, User, CheckCircle } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import { 
  getPlansByInterval, 
  type SubscriptionPlan, 
  startHostedCheckout,
  createCheckoutSession,
  confirmCheckout
} from '../../services/subscriptionService';

interface PersonalInfo {
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
  sessionId: string;
  planId: string;
  cadence: string;
  timestamp: number;
}

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan');
  const cadence = searchParams.get('cadence') || 'monthly';
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load personal information from localStorage
  useEffect(() => {
    try {
      const storedInfo = localStorage.getItem('checkoutPersonalInfo');
      if (storedInfo) {
        const info: PersonalInfo = JSON.parse(storedInfo);
        
        // Validate that the stored info matches current session
        if (info.sessionId === sessionId && info.planId === planId) {
          // Check if info is not too old (1 hour max)
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - info.timestamp < oneHour) {
            setPersonalInfo(info);
          } else {
            // Info is too old, redirect back to personal info
            navigate(`/checkout/personal-info?session_id=${sessionId}&plan=${planId}&cadence=${cadence}`);
            return;
          }
        } else {
          // Session/plan mismatch, redirect back
          navigate(`/checkout/personal-info?session_id=${sessionId}&plan=${planId}&cadence=${cadence}`);
          return;
        }
      } else {
        // No personal info found, redirect back
        navigate(`/checkout/personal-info?session_id=${sessionId}&plan=${planId}&cadence=${cadence}`);
        return;
      }
    } catch (error) {
      console.error('Error loading personal information:', error);
      navigate(`/checkout/personal-info?session_id=${sessionId}&plan=${planId}&cadence=${cadence}`);
      return;
    }
  }, [sessionId, planId, cadence, navigate]);

  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        navigate('/pricing');
        return;
      }

      try {
        setLoading(true);
        const interval = cadence === 'annual' ? 'Annual' : 'Monthly';
        const plans = await getPlansByInterval(interval);
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
          setSelectedPlan(plan);
        } else {
          navigate('/pricing');
          return;
        }
      } catch (error) {
        console.error('Failed to load plan:', error);
        navigate('/pricing');
      } finally {
        setLoading(false);
      }
    };

    if (personalInfo) {
      loadPlan();
    }
  }, [planId, cadence, navigate, personalInfo]);

  // Redirect if no session ID
  useEffect(() => {
    if (!sessionId) {
      navigate('/checkout');
    }
  }, [sessionId, navigate]);

  const handlePayment = async () => {
    if (!selectedPlan || !personalInfo || !sessionId) {
      setError('Missing required information for payment');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const yearly = cadence === 'annual';

      // Store personal info in session for backend to use
      try {
        await confirmCheckout(sessionId, personalInfo.email);
      } catch (error) {
        console.warn('Failed to confirm checkout with personal info:', error);
        // Continue anyway, this is not critical
      }

      // Prepare personal info for payment processor
      const personalInfoForPayment = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        company: personalInfo.company,
        address: personalInfo.address,
        city: personalInfo.city,
        state: personalInfo.state,
        zipCode: personalInfo.zipCode,
        country: personalInfo.country
      };

      if (currentUser?.email) {
        // Authenticated flow: create hosted checkout (Stripe Checkout)
        const res = await startHostedCheckout(selectedPlan.id, yearly, personalInfoForPayment);
        if (res?.url) {
          // Clear personal info from localStorage before redirecting to Stripe
          localStorage.removeItem('checkoutPersonalInfo');
          window.location.href = res.url;
          return;
        }
        setError('Unable to start payment. Please try again later.');
        return;
      }

      // Guest flow: create session and redirect to Stripe
      const sess = await createCheckoutSession(selectedPlan.id, yearly, personalInfoForPayment);
      
      if (sess.redirectUrl) {
        // Clear personal info from localStorage before redirecting to Stripe
        localStorage.removeItem('checkoutPersonalInfo');
        window.location.href = sess.redirectUrl;
        return;
      }
      
      // Fallback: navigate to success with session id if available
      if (sess.sessionId) {
        localStorage.removeItem('checkoutPersonalInfo');
        navigate(`/checkout/success?session_id=${encodeURIComponent(sess.sessionId)}`);
      } else {
        setError('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment initialization failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditInfo = () => {
    navigate(`/checkout/personal-info?session_id=${sessionId}&plan=${planId}&cadence=${cadence}`);
  };

  if (loading || !personalInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
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
        <button 
          onClick={handleEditInfo}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit information
        </button>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Shield className="w-4 h-4" /> Secure checkout
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                  <p className="text-gray-600">Review your information and complete your purchase</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* Personal Information Review */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Billing Information
                  </h2>
                  <button
                    onClick={handleEditInfo}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    <div>{personalInfo.email}</div>
                    <div>{personalInfo.phone}</div>
                    {personalInfo.company && <div>{personalInfo.company}</div>}
                    <div>
                      {personalInfo.address}<br />
                      {personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}<br />
                      {personalInfo.country}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Secure Card Payment</div>
                      <div className="text-sm text-blue-700">
                        You'll be redirected to our secure payment processor to complete your purchase
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Payment Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Complete Secure Payment
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  Your payment is secured with 256-bit SSL encryption
                </div>
                <div>
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </div>
              </div>
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

export default Payment;