'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if Firebase is properly configured
    if (!auth) {
      setError('🔧 Firebase authentication is not configured. Please check your Firebase project setup.');
      return;
    }
    
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dj/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/api-key-not-valid':
          setError('🔧 Firebase configuration error. Please check your Firebase project setup.');
          break;
        default:
          setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50/80 backdrop-blur border border-red-200/60 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-3 text-left">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-5 py-5 border border-gray-300/60 rounded-lg placeholder-gray-400 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 leading-normal text-left"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3 text-left">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none block w-full px-5 py-5 border border-gray-300/60 rounded-lg placeholder-gray-400 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 leading-normal text-left"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-5 px-8 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white backdrop-blur-sm ${
            loading
              ? 'bg-gray-400/80 cursor-not-allowed'
              : 'bg-blue-600/90 hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          } transition-all duration-200`}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
} 