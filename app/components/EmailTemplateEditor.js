'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EmailTemplateEditor({ djId }) {
  const [templates, setTemplates] = useState({
    confirmation: '',
    receipt: '',
    reminder: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const ref = doc(db, 'users', djId);
        const snap = await getDoc(ref);
        const data = snap.data();
        if (data && data.emailTemplates) {
          setTemplates(data.emailTemplates);
        } else {
          setTemplates({
            confirmation: 'Thank you for booking with us! We look forward to making your event unforgettable.',
            receipt: 'Here is your receipt for your recent booking. Thank you for choosing our DJ services.',
            reminder: 'Your event is coming up soon! Just a reminder from us. We can\'t wait to celebrate with you.'
          });
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (djId) {
      fetchTemplates();
    }
  }, [djId]);

  const handleChange = (e) => {
    setTemplates({
      ...templates,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', djId), {
        emailTemplates: templates
      }, { merge: true });
      alert('Templates saved successfully!');
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('Error saving templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Customize Your Email Templates</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Confirmation Email Template
          </label>
          <textarea
            name="confirmation"
            value={templates.confirmation}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter your confirmation email message..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Sent when a client books your services
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Receipt Email Template
          </label>
          <textarea
            name="receipt"
            value={templates.receipt}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter your receipt email message..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Sent when payment is completed
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Reminder Email Template
          </label>
          <textarea
            name="reminder"
            value={templates.reminder}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter your reminder email message..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Sent as event reminders to clients
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {saving ? 'Saving...' : 'Save Templates'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Available Variables:</h3>
        <div className="text-sm text-blue-700 space-y-1">
                     <p><code className="bg-blue-100 px-1 rounded">{'{{clientName}}'}</code> - Client&apos;s name</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{eventDate}}'}</code> - Event date</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{eventType}}'}</code> - Type of event</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{venueName}}'}</code> - Venue name</p>
          <p><code className="bg-blue-100 px-1 rounded">{'{{totalAmount}}'}</code> - Total amount</p>
        </div>
      </div>
    </div>
  );
} 