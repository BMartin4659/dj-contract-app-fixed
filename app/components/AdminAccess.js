'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuth } from '@/lib/utils';
import { isAdminEmail } from '@/app/constants';

export default function AdminAccess() {
  const [email, setEmail] = useState('');
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const router = useRouter();

  const handleAdminAccess = (e) => {
    e.preventDefault();
    
    if (!email) {
      alert('Please enter an email address.');
      return;
    }
    
    if (!isAdminEmail(email)) {
      alert('Access denied. This email is not authorized for admin access.');
      return;
    }
    
    // Set admin user session
    const success = AdminAuth.setAdminUser(email);
    if (success) {
      console.log('🔑 Admin access granted to:', email);
      router.push('/dj/dashboard');
    } else {
      alert('Failed to set admin access. Please try again.');
    }
  };

  const handleSecretClick = () => {
    setShowAdminAccess(true);
  };

  if (!showAdminAccess) {
    // Hidden admin access trigger - click the logo 5 times quickly
    return (
      <div 
        onClick={handleSecretClick}
        className="absolute top-4 left-4 w-8 h-8 opacity-0 cursor-pointer"
        title="Admin Access"
      />
    );
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🔑 Admin Access
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          Enter your admin email to bypass authentication and access all features.
        </p>
        
        <form onSubmit={handleAdminAccess} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admin email"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium text-sm"
            >
              Grant Admin Access
            </button>
            <button
              type="button"
              onClick={() => setShowAdminAccess(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 