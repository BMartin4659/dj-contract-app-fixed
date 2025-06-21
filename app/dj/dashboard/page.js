'use client';
import DJClientPortal from '@/app/components/DJClientPortal';
import ClientLinkGenerator from '@/app/components/ClientLinkGenerator';
import EmailTemplateEditor from '@/app/components/EmailTemplateEditor';
import SubscribeButtons from '@/app/components/SubscribeButtons';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DJDashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.email));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getSubscriptionStatus = () => {
    if (!userProfile?.subscription) return 'No subscription';
    
    const { status, planType, trialEnds } = userProfile.subscription;
    
    if (status === 'trial') {
      const daysLeft = Math.ceil((trialEnds - Date.now()) / (1000 * 60 * 60 * 24));
      return `${planType} trial (${daysLeft} days left)`;
    }
    
    return `${planType} - ${status}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DJ Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.displayName || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {getSubscriptionStatus()}
              </div>
              <Link
                href="/music-library"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Music Library
              </Link>
              <Link
                href="/wedding-agenda"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Wedding Agenda
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        {userProfile?.subscription?.status === 'trial' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Free Trial Active</h3>
                <p className="text-yellow-700">
                  Your {userProfile.subscription.planType} trial expires in{' '}
                  {Math.ceil((userProfile.subscription.trialEnds - Date.now()) / (1000 * 60 * 60 * 24))} days.
                  Upgrade to continue using all features.
                </p>
              </div>
              <Link
                href="/subscription"
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 font-medium"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Link Generator */}
          <div className="lg:col-span-2">
            <ClientLinkGenerator djId={user.email} />
          </div>

          {/* Client Portal */}
          <div className="lg:col-span-2">
            <DJClientPortal djId={user.email} />
          </div>

          {/* Email Template Editor */}
          <div className="lg:col-span-2">
            <EmailTemplateEditor djId={user.email} />
          </div>

          {/* Subscription Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Subscription Management</h2>
              <p className="text-gray-600 mb-6">
                Manage your subscription plan and billing information.
              </p>
              <SubscribeButtons />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/music-library"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Music Library</h3>
                <p className="text-sm text-gray-600">Browse songs and playlists</p>
              </div>
            </Link>

            <Link
              href="/wedding-agenda"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wedding Agenda</h3>
                <p className="text-sm text-gray-600">Plan wedding timeline</p>
              </div>
            </Link>

            <Link
              href="/subscription"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Billing</h3>
                <p className="text-sm text-gray-600">Manage subscription</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 