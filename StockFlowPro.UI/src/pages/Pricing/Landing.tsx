import React, { useEffect, useState } from 'react';
import { getPlansByInterval, type SubscriptionPlan } from '../../services/subscriptionService';
import { Check, Zap, Crown, Star, ArrowRight, Shield, Clock, Users, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);

const Landing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [yearly, setYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadPlans = async (interval: 'Monthly' | 'Annual') => {
    const p = await getPlansByInterval(interval);
    setPlans(p.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)));
  };

  useEffect(() => {
    (async () => {
      await loadPlans(yearly ? 'Annual' : 'Monthly');
    })();
  }, [yearly]);

  const openModalForPlan = async (plan: SubscriptionPlan) => {
    setLoadingPlanId(plan.id);
    const cadence = yearly ? 'annual' : 'monthly';
    navigate(`/checkout?plan=${encodeURIComponent(plan.id)}&cadence=${cadence}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span>StockFlow Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Sign in</Link>
            <Link to="/register" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-0">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6 border border-blue-200">
              <Zap className="w-4 h-4" />
              Powerful inventory management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Simple pricing for
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> every stage</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose a plan that fits your business and scale confidently. 
              Change or cancel anytime with our flexible subscription options.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg font-medium transition-colors ${!yearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setYearly(v => !v)} 
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-medium transition-colors ${yearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <Star className="w-3 h-3" />
                Save 20%
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isAnnual = plan.interval === 'Annual';
              const price = plan.price;
              return (
                <div 
                  key={plan.id} 
                  className={`relative rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.isPopular 
                      ? 'border-blue-500 bg-white shadow-xl' 
                      : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300'
                  } p-8 flex flex-col`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg">
                        <Crown className="w-4 h-4" />
                        Most popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">{formatPrice(price, plan.currency)}</span>
                      <span className="text-gray-500 font-medium">/{isAnnual ? 'year' : 'month'}</span>
                    </div>
                    {plan.monthlyEquivalentPrice && isAnnual && (
                      <p className="text-sm text-green-600 font-medium">
                        ~{formatPrice(plan.monthlyEquivalentPrice, plan.currency)} per month equivalent
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
                    onClick={() => openModalForPlan(plan)}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                      plan.isPopular 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                    } disabled:opacity-50 disabled:transform-none`}
                    disabled={loadingPlanId === plan.id}
                  >
                    {loadingPlanId === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Choose {plan.name}
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-8 text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">24/7 support</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              By subscribing you agree to our{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="#">Terms of Service</a>
              {' '}and{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-500">
            © {new Date().getFullYear()} StockFlow Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
