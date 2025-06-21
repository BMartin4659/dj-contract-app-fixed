'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import SubscribeButtons from '../components/SubscribeButtons';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function SubscriptionPage() {
  const router = useRouter();
  const [djEmail, setDjEmail] = useState('');
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!djEmail) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'users', djEmail);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const subscription = userData.subscription;
        
        if (subscription) {
          setCurrentPlan(subscription.tier || 'basic');
          setSubscriptionData(subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (djEmail) {
      fetchSubscriptionData();
    }
  };

  // Authentication state management
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation Button - Only for authenticated DJs */}
        {user && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/dj/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-400 font-medium"
              style={{
                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)';
              }}
            >
              <FaArrowLeft style={{ fontSize: '14px' }} />
              <span>DJ Dashboard</span>
            </button>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DJ Contract App Subscriptions
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan to grow your DJ business
          </p>
        </div>

        {/* Email Input Section */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleEmailSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Enter Your DJ Email</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={djEmail}
                onChange={(e) => setDjEmail(e.target.value)}
                placeholder="your.dj.email@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Check Plan'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              We&apos;ll check your current subscription status
            </p>
          </form>
        </div>

        {/* Current Subscription Info */}
        {djEmail && subscriptionData && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Current Subscription</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold capitalize">{subscriptionData.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold capitalize ${
                    subscriptionData.status === 'active' 
                      ? 'text-green-600' 
                      : subscriptionData.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {subscriptionData.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-semibold capitalize">{subscriptionData.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Started</p>
                  <p className="font-semibold">{formatDate(subscriptionData.createdAt)}</p>
                </div>
                {subscriptionData.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-gray-600">Next Billing</p>
                    <p className="font-semibold">{formatDate(subscriptionData.currentPeriodEnd)}</p>
                  </div>
                )}
                {subscriptionData.cancelledAt && (
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="font-semibold text-red-600">{formatDate(subscriptionData.cancelledAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        {djEmail ? (
          <SubscribeButtons 
            djEmail={djEmail} 
            currentPlan={currentPlan}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Please enter your email above to view subscription options
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access 
                to premium features until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">What&apos;s the difference between Standard and Premium?</h3>
              <p className="text-gray-600">
                Standard includes all basic features you need to run your DJ business. Premium adds 
                advanced customization, analytics, and priority support for growing businesses.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied within the first 
                30 days, we&apos;ll provide a full refund.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">How do I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                You can change your plan anytime from this page. Upgrades take effect immediately, 
                while downgrades take effect at the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 