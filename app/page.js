'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminAuth } from '../lib/utils';
import { isAdminEmail } from './constants';

export default function LandingPage() {
  const router = useRouter();

  // Admin Quick Access Panel
  const AdminPanel = () => {
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    
    return (
      <>
        {!showAdminPanel ? (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-yellow-600 transition-colors"
          >
            Admin
          </button>
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg w-80">
            <h3 className="font-medium text-gray-900 mb-3">Admin Access</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (AdminAuth.setAdminUser(email)) {
                router.push('/dj/dashboard');
              } else {
                alert('Invalid admin email');
              }
            }}>
              <input
                name="email"
                type="email"
                placeholder="Enter admin email"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-sm"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Access
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminPanel(false)}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  };

      return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Admin Panel */}
      <div className="fixed top-4 right-4 z-50">
        <AdminPanel />
      </div>

      {/* Header */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/dj-bobby-drake-logo.png"
                alt="DJ Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-xl font-bold text-gray-900">DJ Client Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
                          <Image
                src="/dj-bobby-drake-logo.png"
                alt="DJ Bobby Drake Logo"
                width={150}
                height={150}
              className="mx-auto rounded-full shadow-2xl border-4 border-white"
              />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Professional DJ
            <br />
            <span className="text-blue-600">Client Management</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Streamline your DJ business with professional contracts, automated booking, 
            client management, and seamless payment processing. Everything you need in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/contract-form" 
              className="text-blue-600 hover:text-blue-800 font-medium text-lg"
            >
              Try Contract Form (No Login Required) →
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Contracts</h3>
            <p className="text-gray-600">
              Professional contract forms with automatic pricing, payment integration, and digital signatures.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Client Portal</h3>
            <p className="text-gray-600">
              Centralized dashboard to manage all your clients, bookings, and communication in one place.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Processing</h3>
            <p className="text-gray-600">
              Integrated Stripe, PayPal, Venmo, and CashApp payments with automatic invoicing and receipts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 