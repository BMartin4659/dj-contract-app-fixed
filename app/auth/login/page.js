'use client';
import LoginForm from '@/app/components/LoginForm';
import GoogleLoginButton from '@/app/components/GoogleLoginButton';
import AdminAccess from '@/app/components/AdminAccess';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: 'url(/dj-background-new.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Professional Login Card */}
      <div className="max-w-lg w-full space-y-8">
        {/* Clean Card Container */}
        <div 
          className="bg-white rounded-2xl shadow-xl px-10 py-12 border border-gray-100"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Sign in to your DJ management dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="mt-10 space-y-8">
            <LoginForm />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-3 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <GoogleLoginButton />
          </div>

          {/* Admin Access */}
          <AdminAccess />

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
                             Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 