import React, { useEffect, useState } from 'react';
import { getPlansByInterval, type SubscriptionPlan } from '../../services/subscriptionService';
import { useGeolocationPricing, useCurrencyMismatch } from '../../hooks/useGeolocationPricing';
import { formatCurrencyAmount } from '../../utils/currencyMapping';
import CurrencySelector from '../../components/CurrencySelector';
import { 
  Check, Crown, Star, ArrowRight, Shield, Globe, 
  CheckCircle, MapPin, AlertCircle, Zap, Users,
  Clock, HeadphonesIcon, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [yearly, setYearly] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const navigate = useNavigate();

  // Geolocation pricing hook
  const [pricingState, pricingActions] = useGeolocationPricing({
    autoDetect: true,
    showOriginalPrices: false,
    compactFormat: false,
  });

  // Currency mismatch detection
  const currencyMismatch = useCurrencyMismatch();

  const loadPlans = async (interval: 'Monthly' | 'Annual') => {
    try {
      setIsLoadingPlans(true);
      console.log(`🔍 Loading ${interval} plans with currency: ${pricingState.currentCurrency}`);
      
      // Get plans with geolocation-aware pricing
      const p = await getPlansByInterval(interval, pricingState.currentCurrency);
      
      // Convert plans to user's preferred currency if needed
      const convertedPlans = await pricingActions.convertPlans(p, pricingState.currentCurrency);
      
      // Sort plans by order
      const sortedPlans = convertedPlans.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name));
      
      setPlans(sortedPlans);
      console.log(`✅ Loaded ${sortedPlans.length} ${interval} plans in ${pricingState.currentCurrency}`);
    } catch (error) {
      console.error(`❌ Failed to load ${interval} plans:`, error);
      // Fallback to basic plan loading
      const p = await getPlansByInterval(interval);
      setPlans(p.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)));
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadPlans(yearly ? 'Annual' : 'Monthly');
    })();
  }, [yearly, pricingState.currentCurrency]);

  // Handle currency changes
  const handleCurrencyChange = async (newCurrency: string) => {
    console.log(`💰 Currency changed to: ${newCurrency}`);
    pricingActions.setCurrency(newCurrency);
  };

  const openCheckoutPage = (plan: SubscriptionPlan) => {
    try {
      localStorage.setItem(
        'selectedPlan',
        JSON.stringify({
          id: plan.id,
          cadence: yearly ? 'annual' : 'monthly',
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
        })
      );
    } catch {}
    navigate(`/checkout?plan=${encodeURIComponent(plan.id)}&cadence=${yearly ? 'annual' : 'monthly'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StockFlow Pro
                </span>
                <div className="text-xs text-gray-500 font-medium">HR Module</div>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Home</Link>
              <Link to="/#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign in</Link>
              <Link to="/register" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
              <Zap className="w-4 h-4" />
              Flexible Pricing Plans
            </div>
            
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Scale your HR operations with confidence. All plans include our core features 
              with flexible options to match your business needs.
            </p>
            
            {/* Location and Currency Info */}
            {pricingState.location && (
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {pricingState.location.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Currency: {pricingState.currentCurrency}</span>
                </div>
                {pricingState.isLocationLoading && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Detecting location...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Currency Mismatch Warning */}
            {currencyMismatch.hasMismatch && (
              <div className="max-w-md mx-auto mb-8">
                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">Currency Mismatch Detected</p>
                    <p className="text-sm">
                      We detected you're in {currencyMismatch.detectedCurrencyInfo?.name}. 
                      <button
                        onClick={pricingActions.useDetectedCurrency}
                        className="ml-1 underline hover:no-underline font-medium"
                      >
                        Switch to {currencyMismatch.detectedCurrency}?
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Currency Selector and Billing Toggle */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-16">
            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Currency:</label>
              <CurrencySelector
                selectedCurrency={pricingState.currentCurrency}
                onCurrencyChange={handleCurrencyChange}
                compact={false}
                showLabel={false}
                className="min-w-[250px]"
              />
            </div>
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-4">
              <span className={`text-lg font-medium transition-colors ${!yearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button 
                onClick={() => setYearly(v => !v)} 
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium transition-colors ${yearly ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yearly
                </span>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                  <Star className="w-4 h-4" />
                  Save 20%
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {isLoadingPlans ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 flex flex-col">
                  <div className="text-center mb-8">
                    <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="text-center mb-8">
                    <div className="h-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-4 mb-8 flex-grow">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              plans.map((plan) => {
                const isAnnual = plan.interval === 'Annual';
                
                return (
                  <div 
                    key={plan.id} 
                    className={`relative rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                      plan.isPopular 
                        ? 'border-blue-500 bg-white shadow-xl scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } p-8 flex flex-col`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg">
                          <Crown className="w-4 h-4" />
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-5xl font-extrabold text-gray-900">
                          {formatCurrencyAmount(plan.price, plan.currency)}
                        </span>
                        <span className="text-gray-500 font-medium text-lg">/{plan.interval.toLowerCase()}</span>
                      </div>
                      
                      {/* Monthly equivalent for annual plans */}
                      {isAnnual && plan.monthlyEquivalentPrice && (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 font-medium">
                            {formatCurrencyAmount(plan.monthlyEquivalentPrice, plan.currency)} per month equivalent
                          </p>
                          <p className="text-xs text-gray-500">
                            Billed annually
                          </p>
                        </div>
                      )}
                      
                      {/* Annual equivalent for monthly plans */}
                      {!isAnnual && (
                        <p className="text-sm text-gray-500">
                          Annual: {formatCurrencyAmount(plan.price * 12 * 0.8, plan.currency)} (save 20% with yearly billing)
                        </p>
                      )}
                      
                      {/* Currency conversion disclaimer */}
                      {pricingState.location && plan.currency !== 'USD' && (
                        <p className="text-xs text-gray-400 mt-2">
                          Prices converted from USD. Exchange rates may vary.
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-grow">
                      {(plan.features ?? []).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => openCheckoutPage(plan)}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                        plan.isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                          : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Choose {plan.name}
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Footer with Currency Info */}
          <div className="text-center mb-16">
            <div className="max-w-3xl mx-auto">
              {pricingState.location && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Localized Pricing</h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">
                    Prices are automatically converted to your local currency ({pricingState.currentCurrency}) 
                    based on your location ({pricingState.location.country}).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Real-time exchange rates</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>No hidden fees</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span>Local payment methods</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about our pricing and plans.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">What currencies do you support?</h3>
                <p className="text-gray-600 text-sm">We support major currencies including USD, EUR, GBP, CAD, AUD, and many more based on your location.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Are there any setup fees?</h3>
                <p className="text-gray-600 text-sm">No setup fees, no hidden costs. You only pay the subscription price shown above.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibent text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">Yes, we offer a 30-day money-back guarantee for all new subscriptions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8" />
              <span className="text-2xl font-bold">StockFlow Pro</span>
            </div>
            <p className="text-gray-400 mb-6">Streamline your HR operations with confidence.</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <div className="flex items-center gap-1">
                <HeadphonesIcon className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;