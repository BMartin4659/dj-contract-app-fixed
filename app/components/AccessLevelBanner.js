'use client';
import Link from 'next/link';
import { AuthRequirements } from '@/lib/utils';

export default function AccessLevelBanner({ user, className = "" }) {
  const accessLevel = AuthRequirements.getAccessLevel(user);
  
  if (accessLevel === 'admin') {
    return (
      <div className={`bg-yellow-100 border border-yellow-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-yellow-800 font-semibold">🔑 Admin Access</h3>
            <p className="text-yellow-700 text-sm">All features unlocked with unlimited access</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (accessLevel === 'premium') {
    return (
      <div className={`bg-purple-100 border border-purple-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-purple-800 font-semibold">💎 Premium Access</h3>
            <p className="text-purple-700 text-sm">All features unlocked with active subscription</p>
          </div>
          <Link 
            href="/dj/dashboard"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (accessLevel === 'trial') {
    return (
      <div className={`bg-green-100 border border-green-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-green-800 font-semibold">✨ Trial Access</h3>
            <p className="text-green-700 text-sm">Premium features enabled during trial period</p>
          </div>
          <Link 
            href="/subscription"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }
  
  if (accessLevel === 'basic' && !user) {
    return (
      <div className={`bg-blue-100 border border-blue-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-blue-800 font-semibold">📝 Basic Access</h3>
            <p className="text-blue-700 text-sm">
              You can use core features without signing in. Sign in as a DJ or get a subscription for premium features.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link 
              href="/auth/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/subscription"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // For authenticated users without premium access
  if (user && accessLevel === 'basic') {
    return (
      <div className={`bg-orange-100 border border-orange-300 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-orange-800 font-semibold">👋 Welcome, {user.displayName || user.email}</h3>
            <p className="text-orange-700 text-sm">
              Upgrade to a DJ plan or subscription to unlock premium features and dashboard access.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link 
              href="/subscription"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
} 