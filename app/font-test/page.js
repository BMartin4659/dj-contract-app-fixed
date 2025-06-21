'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import CustomFontSelector from '../components/CustomFontSelector';
import { fontManager } from '../utils/fontManager';

export default function FontTestPage() {
  const router = useRouter();
  const [currentFont, setCurrentFont] = useState('default');
  const [headerStyle, setHeaderStyle] = useState({});

  const handleFontChange = (fontValue) => {
    setCurrentFont(fontValue);
    const fontFamily = fontManager.getFontFamily(fontValue);
    setHeaderStyle({ fontFamily });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Font Test Page</h1>
          <p className="text-gray-600 mt-2">
            Test custom fonts with subscription verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Font Selector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Font Selector
            </h2>
            <CustomFontSelector 
              onFontChange={handleFontChange}
              currentFont={currentFont}
            />
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Live Preview
            </h2>
            <div className="space-y-6">
              {/* Contract Header Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 
                  style={headerStyle}
                  className="text-4xl font-bold text-gray-800 text-center mb-4"
                >
                  DJ CONTRACT AGREEMENT
                </h3>
                <div className="text-gray-600 text-center space-y-2">
                  <p>This is how your contract header will look</p>
                  <p className="text-sm">Current font: <span className="font-medium">{currentFont}</span></p>
                </div>
              </div>

              {/* Additional Preview Text */}
              <div className="space-y-4">
                <div>
                  <h4 style={headerStyle} className="text-2xl font-bold text-gray-800 mb-2">
                    Event Details
                  </h4>
                  <p className="text-gray-600">
                    Regular text content will remain unchanged. Only headers and titles will use the custom font.
                  </p>
                </div>

                <div>
                  <h4 style={headerStyle} className="text-xl font-bold text-gray-800 mb-2">
                    Terms & Conditions
                  </h4>
                  <p className="text-gray-600">
                    This demonstrates how section headers will appear throughout your contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Integration Instructions
          </h2>
          <div className="text-gray-600 space-y-3">
            <p>
              To integrate the font selector into your main contract form:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Import the <code className="bg-gray-100 px-2 py-1 rounded">CustomFontSelector</code> component</li>
              <li>Add it to your form, typically in a settings or styling section</li>
              <li>Use the <code className="bg-gray-100 px-2 py-1 rounded">onFontChange</code> callback to update your header styles</li>
              <li>Apply the font family to your contract headers using the <code className="bg-gray-100 px-2 py-1 rounded">fontManager.getFontFamily()</code> method</li>
            </ol>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Example usage:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`import CustomFontSelector from './components/CustomFontSelector';
import { fontManager } from './utils/fontManager';

// In your component:
const [selectedFont, setSelectedFont] = useState('default');
const handleFontChange = (fontValue) => {
  setSelectedFont(fontValue);
  // Apply to headers
};

// In your JSX:
<h1 style={{ fontFamily: fontManager.getFontFamily(selectedFont) }}>
  DJ CONTRACT AGREEMENT
</h1>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 