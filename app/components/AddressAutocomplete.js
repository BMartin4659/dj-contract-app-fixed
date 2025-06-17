'use client';

import { useEffect, useRef, useState } from 'react';

// Global Google Maps error suppression
if (typeof window !== 'undefined') {
  // Suppress Google Maps error dialogs globally
  const suppressGoogleMapsErrors = () => {
    // Override console.error to suppress Google Maps errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Google Maps') || 
          message.includes('maps.googleapis.com') ||
          message.includes('InvalidKeyMapError') ||
          message.includes('ApiNotActivatedMapError') ||
          message.includes('QuotaExceededError')) {
        // Silently ignore Google Maps errors
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Override window.alert to suppress Google Maps alerts
    const originalAlert = window.alert;
    window.alert = (message) => {
      if (typeof message === 'string' && 
          (message.includes('Google Maps') || 
           message.includes('maps.googleapis.com') ||
           message.includes('This page can\'t load Google Maps correctly'))) {
        // Silently ignore Google Maps alerts
        return;
      }
      originalAlert(message);
    };

    // Override window.confirm for Google Maps
    const originalConfirm = window.confirm;
    window.confirm = (message) => {
      if (typeof message === 'string' && 
          (message.includes('Google Maps') || 
           message.includes('maps.googleapis.com'))) {
        // Auto-dismiss Google Maps confirms
        return false;
      }
      return originalConfirm(message);
    };
  };

  // Apply suppression immediately
  suppressGoogleMapsErrors();
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter venue address",
  name = "venueLocation",
  required = true,
  style = {},
  className = ""
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isClient || !inputRef.current) return;

    let isComponentMounted = true;

    const loadGoogleMapsAPI = async () => {
      try {
        setDebugInfo('Checking Google Maps API...');
        
        // Check if already loaded
        if (window.google?.maps?.places?.Autocomplete) {
          setDebugInfo('Google Maps API already loaded');
          return true;
        }
        
        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          setDebugInfo('Waiting for existing Google Maps script...');
          // Wait for existing script to load
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (window.google?.maps?.places?.Autocomplete) {
                clearInterval(checkInterval);
                setDebugInfo('Google Maps API loaded from existing script');
                resolve(true);
              }
            }, 100);
            
            setTimeout(() => {
              clearInterval(checkInterval);
              const loaded = !!window.google?.maps?.places?.Autocomplete;
              setDebugInfo(loaded ? 'Google Maps API loaded (timeout)' : 'Google Maps API failed to load (timeout)');
              resolve(loaded);
            }, 5000); // Reduced timeout
          });
        }
        
        // Load new script with better error handling
        setDebugInfo('Loading Google Maps API script...');
        return new Promise((resolve) => {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-5o9YY4NS8y8F2ZTg8-zibHYRP_1dOEc';
          setDebugInfo(`Using API key: ${apiKey.substring(0, 10)}...`);
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
          script.async = true;
          script.defer = true;
          
          // Add global callback
          window.initGoogleMaps = () => {
            setDebugInfo('Google Maps API callback triggered');
            setTimeout(() => {
              const loaded = !!window.google?.maps?.places?.Autocomplete;
              setDebugInfo(loaded ? 'Google Maps API ready' : 'Google Maps API not ready after callback');
              resolve(loaded);
            }, 100);
          };
          
          script.onload = () => {
            setDebugInfo('Google Maps script loaded');
            // Fallback if callback doesn't trigger
            setTimeout(() => {
              if (!window.google?.maps?.places?.Autocomplete) {
                setDebugInfo('Fallback: Google Maps API not ready');
                resolve(false);
              }
            }, 2000);
          };
          
          script.onerror = (error) => {
            setDebugInfo(`Script error: ${error.message || 'Unknown error'}`);
            // Always resolve false to prevent popup errors
            resolve(false);
          };
          
          // Add timeout to prevent hanging
          setTimeout(() => {
            if (!window.google?.maps?.places?.Autocomplete) {
              setDebugInfo('Google Maps API load timeout');
              resolve(false);
            }
          }, 10000);
          
          document.head.appendChild(script);
        });
      } catch (error) {
        setDebugInfo(`Load error: ${error.message}`);
        // Always return false to prevent popup errors
        return false;
      }
    };

    const initializeAutocomplete = async () => {
      try {
        if (!isComponentMounted || !inputRef.current) return;

        // Skip if already initialized
        if (autocompleteRef.current) {
          setDebugInfo('Autocomplete already initialized');
          return;
        }

        setDebugInfo('Initializing autocomplete...');

        // Suppress Google Maps error dialogs
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        window.alert = () => {};
        window.confirm = () => true;

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'name', 'place_id', 'geometry'],
            strictBounds: false,
            bounds: null
          }
        );

        // Restore original alert/confirm after initialization
        setTimeout(() => {
          window.alert = originalAlert;
          window.confirm = originalConfirm;
        }, 1000);

        // Enhanced place change listener
        autocomplete.addListener('place_changed', () => {
          if (!isComponentMounted) return;
          
          const place = autocomplete.getPlace();
          setDebugInfo(`Place selected: ${place?.name || place?.formatted_address || 'Unknown'}`);
          
          // Only auto-fill if user explicitly selected from dropdown (not just typing)
          if (place?.place_id && !userTyping) {
            const addressValue = place.formatted_address || place.name || '';
            if (addressValue && onChange) {
              onChange({
                target: {
                  name: name,
                  value: addressValue
                }
              });
              setDebugInfo(`Address set: ${addressValue}`);
            }
          }
        });

        autocompleteRef.current = autocomplete;
        
        // Add improved CSS for autocomplete dropdown
        const style = document.createElement('style');
        style.textContent = `
          .pac-container {
            z-index: 10000 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            border: 1px solid #ccc !important;
            font-size: 16px !important;
            background: white !important;
            margin-top: 4px !important;
            max-height: 300px !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .pac-item {
            padding: 12px 16px !important;
            border-bottom: 1px solid #eee !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            font-size: 16px !important;
            transition: background-color 0.2s ease !important;
            user-select: none !important;
            -webkit-user-select: none !important;
          }
          .pac-item:hover, .pac-item:focus {
            background-color: #f8f9fa !important;
          }
          .pac-item-selected {
            background-color: #e3f2fd !important;
          }
          .pac-item:last-child {
            border-bottom: none !important;
          }
          .pac-item-query {
            font-size: 16px !important;
            line-height: 1.4 !important;
            color: #333 !important;
          }
          .pac-matched {
            font-weight: 600 !important;
            color: #1976d2 !important;
          }
          @media (max-width: 768px) {
            .pac-container {
              position: fixed !important;
              left: 16px !important;
              right: 16px !important;
              width: auto !important;
              max-width: none !important;
              top: auto !important;
              bottom: auto !important;
              max-height: 50vh !important;
              border-radius: 12px !important;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
            }
            .pac-item {
              padding: 16px 20px !important;
              min-height: 56px !important;
              font-size: 16px !important;
              line-height: 1.3 !important;
            }
            .pac-item-query {
              font-size: 16px !important;
              line-height: 1.3 !important;
            }
          }
        `;
        
        if (!document.querySelector('#google-autocomplete-styles')) {
          style.id = 'google-autocomplete-styles';
          document.head.appendChild(style);
        }
        
        setIsReady(true);
        setError(null);
        setDebugInfo('Autocomplete initialized successfully');
        console.log('Address autocomplete initialized successfully');
      } catch (err) {
        const errorMsg = `Autocomplete init error: ${err.message}`;
        setDebugInfo(errorMsg);
        console.error('Error initializing autocomplete:', err);
        // Don't show error to user, just fall back to regular input
        setError(null);
        setIsReady(true); // Allow regular text input
      }
    };

    const setupAutocomplete = async () => {
      try {
        setDebugInfo('Setting up autocomplete...');
        const loaded = await loadGoogleMapsAPI();
        if (loaded && isComponentMounted) {
          await initializeAutocomplete();
        } else {
          setDebugInfo('Google Maps API failed to load - using regular input');
          // Don't show error, just use regular input
          setError(null);
          setIsReady(true);
        }
      } catch (err) {
        const errorMsg = `Setup error: ${err.message}`;
        setDebugInfo(errorMsg);
        console.error('Error setting up autocomplete:', err);
        // Don't show error, just use regular input
        setError(null);
        setIsReady(true);
      }
    };

    setupAutocomplete();

    return () => {
      isComponentMounted = false;
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isClient, onChange, name, userTyping]);

  const handleInputChange = (e) => {
    setUserTyping(true);
    
    if (onChange) {
      onChange(e);
    }
    
    // Clear the typing flag after user stops typing for a moment
    setTimeout(() => {
      setUserTyping(false);
    }, 1000);
  };

  const handleInputFocus = (e) => {
    // Reset typing state when focusing
    setUserTyping(false);
    
    // On mobile, ensure proper positioning and prevent zoom
    if (window.innerWidth <= 768) {
      // Prevent zoom on iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        e.target.style.fontSize = '16px';
      }
      
      // Scroll into view with better positioning
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Ensure autocomplete dropdown appears in viewport
        const rect = e.target.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // If there's more space above, position dropdown above
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          // Add class to position dropdown above
          setTimeout(() => {
            const dropdown = document.querySelector('.pac-container');
            if (dropdown) {
              dropdown.style.bottom = `${viewportHeight - rect.top + 8}px`;
              dropdown.style.top = 'auto';
            }
          }, 100);
        }
      }, 100);
    }
  };

  const handleInputTouchStart = (e) => {
    // Prevent zoom on iOS when focusing input
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      e.target.style.fontSize = '16px';
    }
  };

  const handleInputBlur = (e) => {
    // Allow time for autocomplete selection
    setTimeout(() => {
      setUserTyping(false);
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Don't interfere with autocomplete dropdown navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      setUserTyping(false);
    }
  };

  // Render nothing on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <input
        type="text"
        placeholder={placeholder}
        className={`field-input ${className}`}
        style={{
          width: '100%',
          padding: 'clamp(12px, 2vw, 16px)',
          border: '1px solid #ccc',
          borderRadius: '8px',
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          backgroundColor: 'white',
          marginBottom: '1rem',
          ...style
        }}
      />
    );
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onTouchStart={handleInputTouchStart}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="address-line1"
        className={`field-input ${className}`}
        style={{
          width: '100%',
          padding: 'clamp(12px, 2vw, 16px)',
          border: '1px solid #ccc',
          borderRadius: '8px',
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          backgroundColor: 'white',
          marginBottom: '1rem',
          WebkitAppearance: 'none',
          appearance: 'none',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          // Prevent zoom on iOS
          ...(window?.innerWidth <= 768 && /iPad|iPhone|iPod/.test(navigator?.userAgent || '') ? {
            fontSize: '16px'
          } : {}),
          // Better mobile styles
          ...(window?.innerWidth <= 768 ? {
            minHeight: '44px',
            lineHeight: '1.4'
          } : {}),
          ...style
        }}
      />
      
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
      
      {!isReady && !error && (
        <p className="text-gray-500 text-xs mt-1">
          Loading address suggestions...
        </p>
      )}
    </div>
  );
} 