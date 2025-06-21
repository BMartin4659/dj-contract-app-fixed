'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import SystemFontSelector from '../components/SystemFontSelector';

export default function FontSelectorDemo() {
  const [selectedFont, setSelectedFont] = useState('Ka Blam');

  const handleFontChange = (fontName) => {
    setSelectedFont(fontName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            System Font Selector Demo
          </h1>
          <p className="text-xl text-blue-200">
            Browse and test all fonts available on your device
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Font Selector */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Font Selector</h2>
            <SystemFontSelector 
              onFontChange={handleFontChange}
              currentFont={selectedFont}
            />
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatically detects available system fonts</li>
                <li>• Works on Windows, macOS, and Linux</li>
                <li>• Keyboard navigation with arrow keys (↑↓)</li>
                <li>• Mouse scroll wheel support</li>
                <li>• Real-time font preview with live updates</li>
                <li>• Double-click or Enter to apply fonts instantly</li>
                <li>• Search functionality with type-ahead</li>
                <li>• Supports custom fonts from your public/fonts directory</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Keyboard Shortcuts:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">↑↓</kbd> Navigate fonts</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> Select font</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> Close dropdown</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Space</kbd> Open dropdown</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Scroll</kbd> Navigate list</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Double-click</kbd> Apply font</div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Preview</h2>
            
            {/* Large Header Preview */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
              <h3 
                style={{ 
                  fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                  fontSize: 'clamp(28px, 4vw, 36px)',
                  color: 'transparent',
                  WebkitTextStroke: '2px #000',
                  textStroke: '2px #000',
                  fontWeight: 'bold'
                }}
                className="mb-2"
              >
                EVENT CONTRACT
              </h3>
              <div className="text-sm text-gray-500">
                Current font: {selectedFont}
              </div>
            </div>

            {/* Sample Text Sizes */}
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Large Title</div>
                <div 
                  style={{ 
                    fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}
                  className="text-gray-800"
                >
                  Wedding Reception
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Medium Title</div>
                <div 
                  style={{ 
                    fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                    fontSize: '24px',
                    fontWeight: '600'
                  }}
                  className="text-gray-800"
                >
                  DJ Services Contract
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Regular Text</div>
                <div 
                  style={{ 
                    fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                    fontSize: '16px'
                  }}
                  className="text-gray-700"
                >
                  This is how regular paragraph text will appear using the selected font. 
                  It should be readable and professional for contract documents.
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Small Text</div>
                <div 
                  style={{ 
                    fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                    fontSize: '14px'
                  }}
                  className="text-gray-600"
                >
                  Terms and conditions, fine print, or additional details would appear in this size.
                </div>
              </div>
            </div>

            {/* Font Info */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Font Information</h4>
              <div className="text-sm text-gray-600">
                <div><strong>Selected:</strong> {selectedFont}</div>
                <div><strong>CSS Family:</strong> &quot;{selectedFont}&quot;, system-ui, sans-serif</div>
                <div><strong>Fallback:</strong> system-ui, sans-serif</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">For Developers</h3>
              <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono">
                <div className="text-gray-600 mb-2">{/* Import the component */}</div>
                <div className="text-blue-600">import SystemFontSelector from &apos;./components/SystemFontSelector&apos;;</div>
                <br />
                <div className="text-gray-600 mb-2">{/* Use in your component */}</div>
                <div className="text-green-600">&lt;SystemFontSelector</div>
                <div className="text-green-600 ml-4">onFontChange=&#123;handleFontChange&#125;</div>
                <div className="text-green-600 ml-4">currentFont=&#123;selectedFont&#125;</div>
                <div className="text-green-600">/&gt;</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Detects fonts on Windows, macOS, and Linux</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Search through available fonts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time preview of selected font</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Includes custom fonts from public/fonts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Responsive design with mobile support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Main Contract
          </Link>
        </div>
      </div>
    </div>
  );
} 