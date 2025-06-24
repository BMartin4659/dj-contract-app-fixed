'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// Import uuid dynamically to avoid SSR issues
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ClientLinkGenerator({ djId }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setSubscriptionStatus({ hasActiveSubscription: false, reason: 'Not authenticated' });
        setCheckingSubscription(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setSubscriptionStatus({ hasActiveSubscription: false, reason: 'No user profile found' });
          setCheckingSubscription(false);
          return;
        }

        const userData = userDoc.data();
        const subscription = userData.subscription;

        if (!subscription) {
          setSubscriptionStatus({ hasActiveSubscription: false, reason: 'No subscription found' });
          setCheckingSubscription(false);
          return;
        }

        const isActive = subscription.status === 'active';
        const tier = subscription.tier || 'basic';

        setSubscriptionStatus({
          hasActiveSubscription: isActive,
          tier: tier,
          status: subscription.status,
          provider: subscription.provider,
          reason: isActive ? 'Active subscription' : `Subscription status: ${subscription.status}`
        });
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus({ hasActiveSubscription: false, reason: 'Error checking subscription' });
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  const handleGenerateLink = async () => {
    if (!djId) {
      alert('DJ ID is required');
      return;
    }

    // Check if user has subscription for premium features
    if (!subscriptionStatus?.hasActiveSubscription) {
      // Free plan users can only generate standard contract links
      const confirmGenerate = window.confirm(
        'Free Plan: You can generate standard DJ contract links.\n\n' +
        'Premium features (custom fonts, advanced styling, templates) require a subscription.\n\n' +
        'Generate standard contract link?'
      );
      
      if (!confirmGenerate) {
        return;
      }
    }

    setIsGenerating(true);
    try {
      const clientId = generateUUID();
      
      // Add subscription info to client record
      const clientData = {
        createdAt: Date.now(),
        status: 'pending',
        formCompleted: false,
        contractType: subscriptionStatus?.hasActiveSubscription ? 'premium' : 'standard',
        djSubscriptionTier: subscriptionStatus?.tier || 'free'
      };
      
      await setDoc(doc(db, 'users', djId, 'clients', clientId), clientData);
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const contractLink = `${baseUrl}/?clientId=${clientId}&djId=${djId}`;
      setLink(contractLink);
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Error generating link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToMainContract = () => {
    router.push('/contract-form');
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      {/* Header with title and button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Generate Client Form Link
          </h2>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleGenerateLink}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                🔗
                <span className="hidden sm:inline">Generate New Link</span>
                <span className="sm:hidden">New Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subscription Status */}
      {checkingSubscription ? (
        <p className="mb-4 text-sm text-gray-600">Checking subscription status...</p>
      ) : (
        <div className="mb-4">
          <p className={`text-sm ${subscriptionStatus?.hasActiveSubscription ? 'text-gray-700' : 'text-red-600'}`}>
            {subscriptionStatus?.hasActiveSubscription 
              ? `✅ Premium Plan (${subscriptionStatus.tier}) - Full access to custom fonts, styling, and premium features` 
              : '⚠️ Free Plan - Standard contract links only - Premium features require subscription'
            }
          </p>
        </div>
      )}

      <p className="text-gray-600 mb-4">
        Create a unique link for your client to fill out their event details and preferences.
      </p>
      
      {link && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Share this link with your client:
          </p>
          <div className="flex gap-2">
            <input 
              value={link} 
              readOnly 
              className="flex-1 border border-gray-300 p-3 rounded-md bg-white text-sm"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-md font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This link is unique and can be used by one client. Generate a new link for each client.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Click &quot;Generate New Link&quot; to create a unique form link</li>
          <li>• Share the link with your client via email, text, or social media</li>
          <li>• Client fills out their event details without needing to create an account</li>
          <li>• You&apos;ll see their submission in your Client Portal</li>
          <li>• Automatic confirmation emails are sent using your custom templates</li>
        </ul>
      </div>
    </div>
  );
} 