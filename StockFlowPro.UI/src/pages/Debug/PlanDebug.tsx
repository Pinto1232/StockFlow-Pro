import React, { useState, useEffect } from 'react';
import { getPlansByInterval } from '../../services/subscriptionService';

const PlanDebug: React.FC = () => {
  const [monthlyPlans, setMonthlyPlans] = useState<any[]>([]);
  const [annualPlans, setAnnualPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        console.log('Loading plans for debugging...');
        
        const monthly = await getPlansByInterval('Monthly');
        const annual = await getPlansByInterval('Annual');
        
        console.log('Monthly plans:', monthly);
        console.log('Annual plans:', annual);
        
        setMonthlyPlans(monthly);
        setAnnualPlans(annual);
      } catch (err) {
        console.error('Error loading plans:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  if (loading) {
    return <div className="p-8">Loading plans...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plan Debug Information</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Monthly Plans ({monthlyPlans.length})</h2>
          <div className="space-y-4">
            {monthlyPlans.map((plan, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <div className="text-xs space-y-1">
                  <p><strong>ID:</strong> {plan.id}</p>
                  <p><strong>Price:</strong> ${plan.price}</p>
                  <p><strong>Interval:</strong> {plan.interval}</p>
                  <p><strong>Currency:</strong> {plan.currency}</p>
                  <p><strong>Sort Order:</strong> {plan.sortOrder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Annual Plans ({annualPlans.length})</h2>
          <div className="space-y-4">
            {annualPlans.map((plan, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <div className="text-xs space-y-1">
                  <p><strong>ID:</strong> {plan.id}</p>
                  <p><strong>Price:</strong> ${plan.price}</p>
                  <p><strong>Interval:</strong> {plan.interval}</p>
                  <p><strong>Currency:</strong> {plan.currency}</p>
                  <p><strong>Sort Order:</strong> {plan.sortOrder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test URLs</h2>
        <div className="space-y-2">
          {monthlyPlans.map((plan) => (
            <div key={plan.id} className="text-sm">
              <strong>{plan.name} (Monthly):</strong>{' '}
              <a 
                href={`/checkout/personal-info?session_id=test-session&plan=${plan.id}&cadence=monthly`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /checkout/personal-info?session_id=test-session&plan={plan.id}&cadence=monthly
              </a>
            </div>
          ))}
          {annualPlans.map((plan) => (
            <div key={plan.id} className="text-sm">
              <strong>{plan.name} (Annual):</strong>{' '}
              <a 
                href={`/checkout/personal-info?session_id=test-session&plan=${plan.id}&cadence=annual`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /checkout/personal-info?session_id=test-session&plan={plan.id}&cadence=annual
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDebug;