'use client';
import DJClientPortal from '@/app/components/DJClientPortal';
import ClientLinkGenerator from '@/app/components/ClientLinkGenerator';
import EmailTemplateEditor from '@/app/components/EmailTemplateEditor';
import SubscribeButtons from '@/app/components/SubscribeButtons';
import LogoUpload from '@/app/components/LogoUpload';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminAuth } from '@/lib/utils';
import { isAdminEmail } from '@/app/constants';

export default function DJDashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customLogo, setCustomLogo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for admin access first
    const adminUser = AdminAuth.getAdminUser();
    if (adminUser) {
      console.log('🔑 Admin access to dashboard:', adminUser.email);
      setUser(adminUser);
      setUserProfile({
        email: adminUser.email,
        subscription: adminUser.subscription,
        plan: 'admin'
      });
      setLoading(false);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Check if user is admin
        if (isAdminEmail(currentUser.email)) {
          console.log('🔑 Admin user accessing dashboard:', currentUser.email);
          const adminUser = AdminAuth.createAdminUser(currentUser.email);
          AdminAuth.setAdminUser(currentUser.email);
          setUser(adminUser);
          setUserProfile({
            email: adminUser.email,
            subscription: adminUser.subscription,
            plan: 'admin'
          });
        } else {
          setUser(currentUser);
          
          // Fetch user profile from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.email));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserProfile(userData);
              
              // Check if user qualifies for dashboard access (DJ or active subscription)
              const subscription = userData.subscription;
              const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trial';
              const isDJ = userData.plan === 'dj' || userData.isDJ || hasActiveSubscription;
              
              if (!isDJ && !hasActiveSubscription) {
                console.log('🚫 Dashboard access denied - no active subscription or DJ status');
                alert('Dashboard access requires an active subscription or DJ account. Please upgrade your plan or sign up as a DJ.');
                router.push('/auth/login');
                return;
              }
            } else {
              // User exists in auth but no profile - redirect to complete profile
              console.log('⚠️ User profile not found, redirecting to login');
              router.push('/auth/login');
              return;
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            router.push('/auth/login');
            return;
          }
        }
      } else {
        // No authenticated user - redirect to login for dashboard access
        console.log('🔒 Dashboard requires authentication - redirecting to login');
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      // Clear admin session if it exists
      AdminAuth.clearAdminSession();
      
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGoToMainContract = () => {
    router.push('/contract-form');
  };

  const handleLogoUpdate = (logoUrl, logoPosition) => {
    setCustomLogo(logoUrl);
    // Update userProfile state as well
    setUserProfile(prev => ({
      ...prev,
      customLogo: logoUrl,
      logoPosition: logoPosition || prev?.logoPosition || 'center'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
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
      <header className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-12 sm:py-16">
          {/* Sign Out Button - Upper Right Corner */}
          <button
            onClick={handleSignOut}
            className="absolute top-2 right-2 px-1.5 py-1 text-gray-600 bg-gray-50 hover:bg-gray-100 font-normal rounded text-xs border border-gray-200 hover:border-gray-300 shadow-sm transition-colors duration-200"
          >
            Sign Out
          </button>
          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
              DJ Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome back, <span className="font-medium">{user.displayName || user.email}</span>
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={handleGoToMainContract}
              className="px-4 py-3 sm:px-5 sm:py-3.5 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm sm:text-base">Contract</span>
            </button>
            <button
              onClick={() => router.push('/music-library')}
              className="px-4 py-3 sm:px-5 sm:py-3.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-sm sm:text-base">Music</span>
            </button>
            <button
              onClick={() => router.push('/wedding-agenda')}
              className="px-4 py-3 sm:px-5 sm:py-3.5 text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm sm:text-base">Agenda</span>
            </button>
          </div>
          
          {/* Subscription Status */}
          <div className="text-center">
            <div className="text-sm text-gray-700 font-semibold px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 inline-block shadow-sm">
              {getSubscriptionStatus()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        {/* Subscription Status */}
        {userProfile?.subscription?.status === 'trial' && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Free Trial Active</h3>
                <p className="text-sm sm:text-base text-yellow-700 mt-1">
                  Your {userProfile.subscription.planType} trial expires in{' '}
                  <span className="font-semibold">
                    {Math.ceil((userProfile.subscription.trialEnds - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </span>.
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> </span>
                  Upgrade to continue using all features.
                </p>
              </div>
              <button
                onClick={() => router.push('/subscription')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 self-start sm:self-auto"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Client Link Generator */}
          <div className="lg:col-span-1">
            <ClientLinkGenerator djId={user.email} />
          </div>

          {/* Logo Upload */}
          <div className="lg:col-span-1">
            <LogoUpload 
              user={user} 
              userProfile={userProfile} 
              onLogoUpdate={handleLogoUpdate} 
            />
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
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Subscription Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Manage your subscription plan and billing information.
              </p>
              <SubscribeButtons />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button
              onClick={() => router.push('/music-library')}
              className="flex items-center p-4 sm:p-5 lg:p-6 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group text-left transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 sm:mr-5 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-md">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">Music Library</h3>
                <p className="text-sm sm:text-base text-gray-600">Browse songs and playlists</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/wedding-agenda')}
              className="flex items-center p-4 sm:p-5 lg:p-6 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg group text-left transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4 sm:mr-5 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-md">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">Wedding Agenda</h3>
                <p className="text-sm sm:text-base text-gray-600">Plan wedding timeline</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/subscription')}
              className="flex items-center p-4 sm:p-5 lg:p-6 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group sm:col-span-2 lg:col-span-1 text-left transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4 sm:mr-5 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 shadow-md">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">Billing & Subscription</h3>
                <p className="text-sm sm:text-base text-gray-600">Manage your subscription plan</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 