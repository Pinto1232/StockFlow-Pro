import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Home } from 'lucide-react';
import { attachPendingSubscription, confirmCheckout } from '../../services/subscriptionService';
import { useQueryClient } from '@tanstack/react-query';
import { featuresQueryKey } from '../../hooks/useFeatures';
import { useCurrentUser } from '../../hooks/useAuth';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Confirming your subscription...');
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const processedRef = useRef(false);

  useEffect(() => {
    // Wait until we know if the user is logged in or not.
    if (isUserLoading) {
      console.log('[SuccessPage] Waiting for user authentication to resolve...');
      return;
    }

    const confirmSubscription = async () => {
      console.log('[SuccessPage] useEffect triggered, user auth resolved.');

      if (processedRef.current) {
        console.log('[SuccessPage] Aborting: processedRef.current is true.');
        return; // guard against React StrictMode double-invoke in dev
      }
      processedRef.current = true;
      console.log('[SuccessPage] processedRef.current set to true.');

      console.log(`[SuccessPage] Session ID: ${sessionId}`);
      if (!sessionId) {
        console.error('[SuccessPage] No session ID found.');
        setStatus('error');
        setMessage('No session ID found. Please return to the pricing page and try again.');
        return;
      }

      console.log(`[SuccessPage] Current user:`, currentUser);
      try {
        // If user not authenticated (no email), we can't attach now; finish with login instruction
        if (!currentUser?.email) {
          console.log('[SuccessPage] User not authenticated or has no email. Showing login message.');
          await queryClient.invalidateQueries({ queryKey: featuresQueryKey });
          setStatus('success');
          setMessage('Your payment was successful. Please log in to activate your subscription and access your new plan features.');
          return;
        }

        console.log(`[SuccessPage] Linking session ${sessionId} to email ${currentUser.email}`);
        // Link the session to the authenticated user's email
        await confirmCheckout(sessionId, currentUser.email);
        console.log('[SuccessPage] Session linked successfully.');

        console.log(`[SuccessPage] Attaching pending subscription for session ${sessionId}`);
        // Attempt to attach the pending subscription to the current user
        const attachResult = await attachPendingSubscription(sessionId);
        console.log('[SuccessPage] Attach result:', attachResult);

        if (attachResult.attached && attachResult.entitlements) {
          console.log('[SuccessPage] Attach successful. Updating cache and invalidating queries.');
          // Update cache immediately and also force a refetch to ensure freshness
          queryClient.setQueryData(featuresQueryKey, attachResult.entitlements);
          await queryClient.invalidateQueries({ queryKey: featuresQueryKey });
          setStatus('success');
          setMessage('Your subscription is now active! A confirmation email has been sent.');
        } else {
          console.log('[SuccessPage] Attach did not complete as expected. Invalidating queries.');
          // If not attached, it means the user might be a guest or already has the subscription
          await queryClient.invalidateQueries({ queryKey: featuresQueryKey });
          setStatus('success');
          setMessage('Your payment was successful. A confirmation email has been sent. Please log in to access your new plan features.');
        }
      } catch (error) {
        console.error('Error confirming subscription:', error);
        setStatus('error');
        setMessage('There was an issue activating your subscription. Please contact support.');
      }
    };

    confirmSubscription();
  }, [sessionId, queryClient, currentUser, isUserLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col space-y-3 w-full">
              <Link
                to="/app/dashboard"
                className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Go to Dashboard
              </Link>
              <Link
                to="/contact"
                className="w-full py-3 px-6 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" /> Contact Support
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col space-y-3 w-full">
              <Link
                to="/pricing"
                className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Back to Pricing
              </Link>
              <Link
                to="/contact"
                className="w-full py-3 px-6 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" /> Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;
