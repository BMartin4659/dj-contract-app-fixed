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

    setLoading(true);
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
      setLoading(false);
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
    router.push('/');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Generate Client Form Link</h2>
      
      {/* Subscription Status */}
      {checkingSubscription ? (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">Checking subscription status...</p>
        </div>
      ) : (
        <div className={`mb-4 p-3 rounded-md ${
          subscriptionStatus?.hasActiveSubscription 
            ? 'bg-green-100 border border-green-200' 
            : 'bg-yellow-100 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                subscriptionStatus?.hasActiveSubscription ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {subscriptionStatus?.hasActiveSubscription 
                  ? `✅ Premium Plan (${subscriptionStatus.tier})` 
                  : '⚠️ Free Plan'
                }
              </p>
              <p className={`text-xs ${
                subscriptionStatus?.hasActiveSubscription ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {subscriptionStatus?.hasActiveSubscription 
                  ? 'Full access to custom fonts, styling, and premium features'
                  : 'Standard contract links only - Premium features require subscription'
                }
              </p>
            </div>
            {!subscriptionStatus?.hasActiveSubscription && (
              <button
                onClick={() => router.push('/subscription')}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-4">
        Create a unique link for your client to fill out their event details and preferences.
      </p>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {loading ? 'Generating...' : 'Generate New Link'}
        </button>
        
        <button
          onClick={handleGoToMainContract}
          className="px-6 py-3 rounded-md font-medium transition-colors bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white flex items-center gap-2"
        >
          📝 Main Contract
        </button>
      </div>

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
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
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

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
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