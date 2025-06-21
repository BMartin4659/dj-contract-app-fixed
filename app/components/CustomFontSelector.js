'use client';
import React, { useState, useEffect } from 'react';
import { fontManager } from '@/app/utils/fontManager';
import { FaCrown, FaLock } from 'react-icons/fa';

export default function CustomFontSelector({ onFontChange, currentFont }) {
  const [fontData, setFontData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFont, setSelectedFont] = useState(currentFont || 'default');

  useEffect(() => {
    loadFontData();
  }, []);

  const loadFontData = async () => {
    try {
      setLoading(true);
      const data = await fontManager.getAvailableFontsWithSubscriptionInfo();
      setFontData(data);
      
      // Load saved font
      const savedFont = await fontManager.getSavedFont();
      setSelectedFont(savedFont);
      
      if (onFontChange) {
        onFontChange(savedFont);
      }
    } catch (error) {
      console.error('Error loading font data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFontChange = async (fontValue) => {
    try {
      const success = await fontManager.saveSelectedFont(fontValue);
      
      if (success) {
        setSelectedFont(fontValue);
        if (onFontChange) {
          onFontChange(fontValue);
        }
      } else {
        // If saving failed (likely due to subscription), show message
        const upgradeMessage = fontManager.getSubscriptionUpgradeMessage();
        alert(`${upgradeMessage.title}\n\n${upgradeMessage.message}`);
      }
    } catch (error) {
      console.error('Error changing font:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading fonts...</div>
      </div>
    );
  }

  if (!fontData) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-red-500">Error loading fonts</div>
      </div>
    );
  }

  const { fonts, subscriptionStatus, hasCustomFonts } = fontData;

  return (
    <div className="space-y-4">
      {/* Font Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Font
        </label>
        <select
          value={selectedFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
              {font.isCustom ? ' (Custom)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Font Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="text-sm text-gray-600 mb-2">Preview:</div>
        <div 
          style={{ fontFamily: fontManager.getFontFamily(selectedFont) }}
          className="text-2xl font-bold text-gray-800"
        >
          DJ Contract Agreement
        </div>
      </div>

      {/* Subscription Status */}
      <div className="space-y-3">
        {subscriptionStatus.hasActiveSubscription ? (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <FaCrown className="text-lg" />
            <div>
              <div className="font-medium">
                {subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)} Subscriber
              </div>
              <div className="text-sm text-green-700">
                Custom fonts available • {hasCustomFonts ? `${fonts.filter(f => f.isCustom).length} custom fonts loaded` : 'No custom fonts uploaded yet'}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800 mb-2">
              <FaLock className="text-lg" />
              <div className="font-medium">Custom Fonts - Premium Feature</div>
            </div>
            <div className="text-sm text-blue-700 mb-3">
              Upgrade to Standard or Premium to access custom fonts and enhance your contract branding.
            </div>
            <a
              href="/subscription"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FaCrown className="mr-2" />
              Upgrade Now
            </a>
          </div>
        )}
      </div>

      {/* Instructions for uploading custom fonts */}
      {subscriptionStatus.hasActiveSubscription && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="font-medium text-gray-800 mb-2">
            Adding Custom Fonts
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Upload your font files (.ttf, .otf, .woff, .woff2) to the <code className="bg-gray-200 px-1 rounded">public/fonts/custom/</code> directory</p>
            <p>2. The font will automatically appear in the list above</p>
            <p>3. Supported formats: TTF, OTF, WOFF, WOFF2</p>
          </div>
        </div>
      )}
    </div>
  );
} 