import React, { useEffect, useState } from 'react';
import { getPublicPlans, createCheckoutSession, type SubscriptionPlan } from '../../services/subscriptionService';
import { Check, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);

const Landing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [yearly, setYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getPublicPlans();
      // Sort by sortOrder then name
      setPlans(p.slice().sort((a,b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)));
    })();
  }, []);

  const onCheckout = async (plan: SubscriptionPlan) => {
    setLoadingPlanId(plan.id);
    try {
      const res = await createCheckoutSession(plan.id, yearly);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert('Checkout initialized (demo). No redirect URL provided.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to start checkout.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
        <Link to="/login" className="text-gray-700 hover:text-gray-900 font-semibold">StockFlow Pro</Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">Sign in</Link>
          <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get started</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4"><Zap className="w-4 h-4"/> Powerful inventory management</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">Simple pricing for every stage</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose a plan that fits your business and scale confidently. Change or cancel anytime.</p>
        </section>

        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={!yearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}>Monthly</span>
          <button onClick={() => setYearly(v=>!v)} className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition">
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${yearly ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={yearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}>Yearly <span className="ml-1 text-green-600">(save ~20%)</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const base = plan.price;
            const price = yearly ? +(base * 12 * 0.8).toFixed(2) : base;
            return (
              <div key={plan.id} className={`rounded-2xl border ${plan.isPopular ? 'border-blue-500' : 'border-gray-200'} bg-white shadow-sm hover:shadow-md transition p-6 flex flex-col`}>
                {plan.isPopular && (
                  <div className="mb-2 inline-flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit text-sm font-semibold">
                    <Crown className="w-4 h-4"/> Most popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">{formatPrice(price, plan.currency)}</span>
                  <span className="text-gray-500">/{yearly ? 'year' : 'month'}</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-700">
                  {(plan.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => onCheckout(plan)}
                  className={`mt-auto px-4 py-2 rounded-lg ${plan.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black/90'} disabled:opacity-50`}
                  disabled={loadingPlanId === plan.id}
                >{loadingPlanId === plan.id ? 'Processing…' : `Choose ${plan.name}`}</button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">By subscribing you agree to our <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy</a>.</p>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center text-gray-500">
        © {new Date().getFullYear()} StockFlow Pro
      </footer>
    </div>
  );
};

export default Landing;
