'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Activated!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to our DJ Contract App! Your subscription has been successfully activated.
        </p>

        {/* Session Info */}
        {sessionId && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500 mb-1">Session ID:</p>
            <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
          </div>
        )}

        {/* What's Next */}
        <div className="text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              You now have access to all premium features
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              A confirmation email has been sent to you
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Your billing cycle has started
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              You can manage your subscription anytime
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
          
          <Link 
            href="/subscription"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors inline-block"
          >
            Manage Subscription
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <a href="mailto:support@djcontractapp.com" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
} 