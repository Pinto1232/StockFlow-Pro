import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth';
import {
  type SubscriptionPlan,
  getPlansByInterval,
  createCheckoutSession,
  confirmCheckout,
  startHostedCheckout,
} from '../../services/subscriptionService';
import { Check, CreditCard, Globe, Smartphone, Banknote, AlertCircle, Shield } from 'lucide-react';

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const initialCadence = (searchParams.get('cadence') ?? 'monthly').toLowerCase() === 'annual' ? 'annual' : 'monthly';
  const [cadence, setCadence] = useState<'monthly' | 'annual'>(initialCadence);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'applepay' | 'paypal' | 'eft'>('card');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get('plan') ?? '';

  const [monthlyPlans, setMonthlyPlans] = useState<SubscriptionPlan[]>([]);
  const [annualPlans, setAnnualPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    // Prefill email if authenticated
    if (currentUser?.email) setEmail(currentUser.email);
  }, [currentUser?.email]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Load both intervals so user can toggle at checkout
        const [mp, ap] = await Promise.all([
          getPlansByInterval('Monthly'),
          getPlansByInterval('Annual'),
        ]);
        if (!cancelled) {
          setMonthlyPlans(mp);
          setAnnualPlans(ap);
        }
      } catch {
        if (!cancelled) setError('Failed to load plans.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const monthlyPlan = useMemo(() => monthlyPlans.find(p => p.id === planId) ?? null, [monthlyPlans, planId]);
  // Try to find annual plan by same name (common convention) or same id if backend maps 1:1
  const annualPlan = useMemo(() => {
    if (!monthlyPlan) return annualPlans.find(p => p.id === planId) ?? null;
    const byName = annualPlans.find(p => p.name.toLowerCase() === monthlyPlan.name.toLowerCase());
    return byName ?? (annualPlans.find(p => p.id === planId) ?? null);
  }, [annualPlans, monthlyPlan, planId]);

  const chosenPlan: SubscriptionPlan | null = cadence === 'annual' ? (annualPlan ?? null) : (monthlyPlan ?? null);

  useEffect(() => {
    if (!planId) {
      navigate('/pricing', { replace: true });
    }
  }, [planId, navigate]);

  const canProceed = !!chosenPlan && (selectedMethod === 'card' || selectedMethod === 'applepay');

  const onPayNow = async () => {
    if (!chosenPlan) {
      setError('No plan selected.');
      return;
    }

    if (!currentUser?.email) {
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (selectedMethod === 'paypal' || selectedMethod === 'eft') {
      setError('Selected payment method is not yet supported. Please choose Card or Apple Pay.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const yearly = cadence === 'annual';

      if (currentUser?.email) {
        // Authenticated flow: create hosted checkout (Stripe Checkout)
        const res = await startHostedCheckout(chosenPlan.id, yearly);
        if (res?.url) {
          window.location.href = res.url;
          return;
        }
        setError('Unable to start checkout. Please try again later.');
        return;
      }

      // Guest flow: create session and link email so it can be attached after login
      const sess = await createCheckoutSession(chosenPlan.id, yearly);
      if (sess.sessionId && email) {
        try { await confirmCheckout(sess.sessionId, email); } catch { /* ignore */ }
      }
      if (sess.redirectUrl) {
        window.location.href = sess.redirectUrl;
        return;
      }
      // Fallback: navigate to success with session id if available so Success page can proceed
      if (sess.sessionId) {
        navigate(`/checkout/success?session_id=${encodeURIComponent(sess.sessionId)}`);
      } else {
        navigate('/checkout/success');
      }
    } catch {
      setError('Payment initialization failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/pricing" className="text-gray-700 hover:text-gray-900 font-medium">Back to pricing</Link>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Shield className="w-4 h-4" /> Secure checkout
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center bg-white rounded-xl shadow">Loading...</div>
        ) : !chosenPlan ? (
          <div className="p-8 text-center bg-white rounded-xl shadow">
            <p className="text-gray-700 mb-4">Selected plan not found.</p>
            <Link to="/pricing" className="text-blue-600 hover:underline">Go back to pricing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Summary */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{chosenPlan.name}</h2>
                  <p className="text-gray-600">{chosenPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{formatPrice(chosenPlan.price, chosenPlan.currency)}</div>
                  <div className="text-gray-500">/{cadence === 'annual' ? 'year' : 'month'}</div>
                  {cadence === 'annual' && chosenPlan.monthlyEquivalentPrice && (
                    <div className="text-sm text-green-600 font-medium mt-1">~{formatPrice(chosenPlan.monthlyEquivalentPrice, chosenPlan.currency)} per month equivalent</div>
                  )}
                </div>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center gap-4 mb-6">
                <span className={`font-medium ${cadence === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                <button
                  onClick={() => setCadence(cadence === 'monthly' ? 'annual' : 'monthly')}
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${cadence === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className={`font-medium ${cadence === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>Yearly</span>
                <span className="ml-2 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Save 20%</span>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold mb-3">What you get</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(chosenPlan.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment & Account */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              {currentUser?.email ? (
                <div className="p-3 rounded-lg bg-gray-50 text-gray-700">
                  Logged in as <span className="font-medium">{currentUser.email}</span>
                </div>
              ) : (
                <div className="space-y-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">We'll use this to link your subscription when you sign in.</p>
                  <div className="flex items-center gap-3 text-sm">
                    <Link to="/login" className="text-blue-600 hover:underline">Have an account? Sign in</Link>
                    <span className="text-gray-400">•</span>
                    <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold mt-6 mb-2">Payment method</h3>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pm" checked={selectedMethod === 'card'} onChange={() => setSelectedMethod('card')} />
                  <CreditCard className="w-5 h-5" />
                  <span>Credit / Debit Card</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border ${selectedMethod === 'applepay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pm" checked={selectedMethod === 'applepay'} onChange={() => setSelectedMethod('applepay')} />
                  <Smartphone className="w-5 h-5" />
                  <span>Apple Pay</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border opacity-60 cursor-not-allowed border-gray-200`} title="Coming soon">
                  <input type="radio" name="pm" disabled />
                  <Globe className="w-5 h-5" />
                  <span>PayPal</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border opacity-60 cursor-not-allowed border-gray-200`} title="Coming soon">
                  <input type="radio" name="pm" disabled />
                  <Banknote className="w-5 h-5" />
                  <span>Instant EFT</span>
                </label>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
                You will be charged in <span className="font-medium">{chosenPlan.currency}</span>. Taxes may apply. Renewals occur automatically for subscription plans.
              </div>

              <button
                onClick={onPayNow}
                disabled={!canProceed || submitting}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Processing…' : `Pay Now ${formatPrice(chosenPlan.price, chosenPlan.currency)}`}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-500">© {new Date().getFullYear()} StockFlow Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
