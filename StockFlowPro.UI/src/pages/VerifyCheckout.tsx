import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../services/subscriptionService';

const VerifyCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    const sessionId = searchParams.get('session');

    if (!token || !sessionId) {
      setStatus('error');
      setMessage('Invalid verification link. Please try again or contact support.');
      return;
    }

    const performVerification = async () => {
      try {
        const result = await verifyEmail(token, sessionId);
        
        if (result?.verified) {
          setStatus('success');
          setMessage(result.message || 'Email verified successfully!');
          
          // Redirect to success page after a short delay
          setTimeout(() => {
            if (result.redirectUrl) {
              window.location.href = result.redirectUrl;
            } else {
              navigate(`/checkout/success?session_id=${sessionId}`);
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result?.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    performVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you to complete your purchase...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col space-y-3 w-full">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Pricing
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="w-full py-3 px-6 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCheckout;