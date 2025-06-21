'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    if (!djId) {
      alert('DJ ID is required');
      return;
    }

    setLoading(true);
    try {
      const clientId = generateUUID();
      await setDoc(doc(db, 'users', djId, 'clients', clientId), {
        createdAt: Date.now(),
        status: 'pending',
        formCompleted: false
      });
      
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