import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth';
import {
  type SubscriptionPlan,
  getPlansByInterval,
  createCheckoutSession,
  confirmCheckout,
  startHostedCheckout,
  checkEmail,
  sendVerificationEmail,
  type EmailCheckResponse,
  type SendVerificationResponse,
} from '../../services/subscriptionService';
import { getPricingDisplayInfo } from '../../utils/pricingUtils';
import { Check, CreditCard, Globe, Smartphone, Banknote, AlertCircle, Shield } from 'lucide-react';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const initialCadence = (searchParams.get('cadence') ?? 'monthly').toLowerCase() === 'annual' ? 'annual' : 'monthly';
  const [cadence, setCadence] = useState<'monthly' | 'annual'>(initialCadence);

  // Sync cadence state with URL parameter changes
  useEffect(() => {
    const urlCadence = (searchParams.get('cadence') ?? 'monthly').toLowerCase() === 'annual' ? 'annual' : 'monthly';
    setCadence(urlCadence);
  }, [searchParams]);

  useEffect(() => {
    // If URL is missing plan, try restore from localStorage for resilience
    const planIdInUrl = searchParams.get('plan');
    if (planIdInUrl) return;
    try {
      const persisted = JSON.parse(localStorage.getItem('selectedPlan') || 'null') as { id?: string; cadence?: 'monthly'|'annual' } | null;
      if (persisted?.id) {
        const params = new URLSearchParams(window.location.search);
        params.set('plan', persisted.id);
        if (persisted.cadence) params.set('cadence', persisted.cadence);
        navigate({ pathname: '/checkout', search: params.toString() }, { replace: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'applepay' | 'paypal' | 'eft'>('card');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email verification states
  const [emailStatus, setEmailStatus] = useState<'unchecked' | 'checking' | 'new_account' | 'existing_account' | 'verification_sent' | 'error'>('unchecked');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [sendingVerification, setSendingVerification] = useState<boolean>(false);

  const planId = searchParams.get('plan') ?? '';

  const [monthlyPlans, setMonthlyPlans] = useState<SubscriptionPlan[]>([]);
  const [annualPlans, setAnnualPlans] = useState<SubscriptionPlan[]>([]);

  // Robust plan pairing across cadences using a normalized key derived from plan name
  const normalizeKey = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

  type PlanGroup = { key: string; displayName: string; monthly?: SubscriptionPlan; annual?: SubscriptionPlan };
  const planGroups = useMemo<Record<string, PlanGroup>>(() => {
    const map: Record<string, PlanGroup> = {};
    for (const p of monthlyPlans) {
      const k = normalizeKey(p.name);
      map[k] = map[k] ?? { key: k, displayName: p.name };
      map[k].monthly = p;
    }
    for (const p of annualPlans) {
      const k = normalizeKey(p.name);
      const existing = map[k];
      map[k] = existing ?? { key: k, displayName: p.name };
      map[k].annual = p;
      // Prefer a more user-friendly display name if one side differs only by casing/spacing
      if (!existing) map[k].displayName = p.name;
    }
    return map;
  }, [monthlyPlans, annualPlans]);

  // Sorted groups for UI selection
  const planGroupList = useMemo(() => {
    const list = Object.values(planGroups);
    // Try to sort by known sortOrder where available, then by name
    const sortOrderOf = (g: PlanGroup) => {
      const so: number[] = [];
      if (g.monthly?.sortOrder != null) so.push(g.monthly.sortOrder);
      if (g.annual?.sortOrder != null) so.push(g.annual.sortOrder);
      return so.length ? Math.min(...so) : 9999;
    };
    return list.sort((a, b) => sortOrderOf(a) - sortOrderOf(b) || a.displayName.localeCompare(b.displayName));
  }, [planGroups]);

  // Determine initial plan selection from query param id or fallback to first available group
  const initialPlanKey = useMemo(() => {
    if (planId) {
      const m = monthlyPlans.find(p => p.id === planId);
      if (m) return normalizeKey(m.name);
      const a = annualPlans.find(p => p.id === planId);
      if (a) return normalizeKey(a.name);
      // try name match in case planId is actually a name
      const byNameKey = normalizeKey(planId);
      if (planGroups[byNameKey]) return byNameKey;
    }
    const firstKey = Object.keys(planGroups)[0];
    return firstKey ?? '';
  }, [planId, monthlyPlans, annualPlans, planGroups]);

  const [selectedPlanKey, setSelectedPlanKey] = useState<string>('');
  useEffect(() => {
    if (!initialPlanKey) return;
    setSelectedPlanKey(prev => (prev === initialPlanKey ? prev : initialPlanKey));
  }, [initialPlanKey]);

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

  // Chosen plan based on selected group and cadence, with graceful fallback to the other cadence if missing
  const chosenPlan: SubscriptionPlan | null = useMemo(() => {
    if (!selectedPlanKey) return null;
    const group = planGroups[selectedPlanKey];
    if (!group) return null;
    if (cadence === 'annual') return group.annual ?? group.monthly ?? null;
    return group.monthly ?? group.annual ?? null;
  }, [selectedPlanKey, planGroups, cadence]);

  // Keep URL in sync with current selection (plan id and cadence) for shareability and refresh stability
  useEffect(() => {
    if (!chosenPlan) return;
    const params = new URLSearchParams(window.location.search);
    params.set('plan', chosenPlan.id);
    params.set('cadence', cadence);
    navigate({ pathname: '/checkout', search: params.toString() }, { replace: true });
  }, [chosenPlan?.id, cadence, navigate, chosenPlan]);

  // No redirect if planId missing; we default to the first available plan group
  useEffect(() => {
    // noop: selection handled by initialPlanKey effect
  }, []);

  // Email verification functions
  const handleEmailCheck = async (emailToCheck: string) => {
    if (!emailToCheck || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailToCheck)) {
      setEmailStatus('unchecked');
      setEmailMessage('');
      return;
    }

    setCheckingEmail(true);
    setEmailStatus('checking');
    setEmailMessage('Checking email...');

    try {
      const result = await checkEmail(emailToCheck);
      if (result) {
        if (result.accountExists) {
          setEmailStatus('existing_account');
          setEmailMessage(result.message || 'Please sign in to continue with your purchase');
        } else {
          setEmailStatus('new_account');
          setEmailMessage(result.message || "We'll create an account for you");
        }
      } else {
        setEmailStatus('error');
        setEmailMessage('Unable to verify email. Please try again.');
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Unable to verify email. Please try again.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSendVerification = async () => {
    if (!chosenPlan || !email || !sessionId) {
      setError('Missing required information for verification');
      return;
    }

    setSendingVerification(true);
    setError(null);

    try {
      const result = await sendVerificationEmail(email, sessionId, chosenPlan.id, cadence);
      if (result?.sent) {
        // Store plan and cadence info for verification flow
        const verificationInfo = {
          sessionId,
          planId: chosenPlan.id,
          cadence,
          timestamp: Date.now()
        };
        localStorage.setItem('verificationInfo', JSON.stringify(verificationInfo));
        
        setEmailStatus('verification_sent');
        setEmailMessage(result.message || 'Please check your email and click the verification link to complete your purchase.');
      } else {
        setEmailStatus('error');
        setEmailMessage(result?.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Failed to send verification email. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  // Create session when plan is selected (for email verification flow)
  useEffect(() => {
    if (chosenPlan && !currentUser?.email && !sessionId) {
      createCheckoutSession(chosenPlan.id, cadence === 'annual')
        .then(sess => {
          if (sess.sessionId) {
            setSessionId(sess.sessionId);
          }
        })
        .catch(() => {
          // Ignore errors, session will be created during payment if needed
        });
    }
  }, [chosenPlan, cadence, currentUser?.email, sessionId]);

  // Check email when it changes (debounced)
  useEffect(() => {
    if (currentUser?.email) {
      // Skip email check for authenticated users
      setEmailStatus('unchecked');
      setEmailMessage('');
      return;
    }

    const timeoutId = setTimeout(() => {
      handleEmailCheck(email);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [email, currentUser?.email]);

  const canProceed = !!chosenPlan && (selectedMethod === 'card' || selectedMethod === 'applepay') && 
    (currentUser?.email || (emailStatus === 'new_account' || emailStatus === 'verification_sent'));

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

      // Handle different email verification states
      if (emailStatus === 'existing_account') {
        setError('Please sign in to your existing account to continue with your purchase.');
        return;
      }

      if (emailStatus === 'new_account') {
        // Send verification email for new accounts
        await handleSendVerification();
        return;
      }

      if (emailStatus === 'verification_sent') {
        setError('Please check your email and click the verification link to complete your purchase.');
        return;
      }

      if (emailStatus === 'checking') {
        setError('Please wait while we verify your email address.');
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
            {/* Plan Summary with Plan Selector */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
              {/* Plan selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={selectedPlanKey}
                  onChange={(e) => setSelectedPlanKey(e.target.value)}
                  className="w-full md:w-72 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  {planGroupList.map(g => (
                    <option key={g.key} value={g.key}>{g.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{chosenPlan.name}</h2>
                  <p className="text-gray-600">{chosenPlan.description}</p>
                </div>
                <div className="text-right">
                  {(() => {
                    const pricingInfo = getPricingDisplayInfo(
                      chosenPlan.price, 
                      chosenPlan.currency, 
                      chosenPlan.interval, 
                      chosenPlan.monthlyEquivalentPrice
                    );
                    return (
                      <>
                        <div className="text-3xl font-extrabold text-gray-900">{pricingInfo.mainPrice}</div>
                        <div className="text-gray-500">/{pricingInfo.interval}</div>
                        {pricingInfo.monthlyEquivalent && (
                          <div className="mt-1 space-y-1">
                            <div className="text-sm text-green-600 font-medium">
                              {pricingInfo.monthlyEquivalent} per month equivalent
                            </div>
                            {pricingInfo.calculationNote && (
                              <div className="text-xs text-gray-500">
                                ({pricingInfo.calculationNote})
                              </div>
                            )}
                          </div>
                        )}
                        {pricingInfo.annualEquivalent && (
                          <div className="text-xs text-gray-500 mt-1">
                            Annual: {pricingInfo.annualEquivalent}
                          </div>
                        )}
                      </>
                    );
                  })()}
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
                <div className="space-y-3 mb-2">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        emailStatus === 'error' ? 'border-red-300' : 
                        emailStatus === 'existing_account' ? 'border-orange-300' :
                        emailStatus === 'new_account' ? 'border-green-300' :
                        emailStatus === 'verification_sent' ? 'border-blue-300' :
                        'border-gray-300'
                      }`}
                      disabled={checkingEmail || sendingVerification}
                    />
                    {checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Email status message */}
                  {emailMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      emailStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      emailStatus === 'existing_account' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      emailStatus === 'new_account' ? 'bg-green-50 text-green-700 border border-green-200' :
                      emailStatus === 'verification_sent' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      emailStatus === 'checking' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="flex items-start gap-2">
                        {emailStatus === 'checking' && (
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mt-0.5"></div>
                        )}
                        {emailStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                        {emailStatus === 'existing_account' && <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />}
                        {emailStatus === 'new_account' && <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                        {emailStatus === 'verification_sent' && <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                        <span>{emailMessage}</span>
                      </div>
                      
                      {emailStatus === 'existing_account' && (
                        <div className="mt-2 flex items-center gap-3 text-sm">
                          <Link to={`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`} 
                                className="text-orange-600 hover:text-orange-700 font-medium underline">
                            Sign in to continue
                          </Link>
                        </div>
                      )}
                      
                      {emailStatus === 'verification_sent' && (
                        <div className="mt-2">
                          <button
                            onClick={handleSendVerification}
                            disabled={sendingVerification}
                            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                          >
                            {sendingVerification ? 'Sending...' : 'Resend verification email'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!emailMessage && (
                    <>
                      <p className="text-xs text-gray-500">We'll use this to link your subscription when you sign in.</p>
                      <div className="flex items-center gap-3 text-sm">
                        <Link to="/login" className="text-blue-600 hover:underline">Have an account? Sign in</Link>
                        <span className="text-gray-400">•</span>
                        <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
                      </div>
                    </>
                  )}
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
                disabled={!canProceed || submitting || sendingVerification}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Processing…' : 
                 sendingVerification ? 'Sending verification email...' :
                 emailStatus === 'new_account' && !currentUser?.email ? 'Send Verification Email' :
                 emailStatus === 'verification_sent' ? 'Check Your Email' :
                 `Pay Now ${getPricingDisplayInfo(chosenPlan.price, chosenPlan.currency, chosenPlan.interval).mainPrice}`}
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
