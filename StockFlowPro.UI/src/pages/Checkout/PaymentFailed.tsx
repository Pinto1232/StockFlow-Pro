import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw, Mail } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please check your payment details or try a different method.
        </p>
        <div className="flex flex-col space-y-3 w-full">
          <Link
            to="/checkout"
            className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Retry Payment
          </Link>
          <Link
            to="/contact"
            className="w-full py-3 px-6 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
