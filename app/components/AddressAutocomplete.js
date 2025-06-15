'use client';

import { useEffect, useRef, useState } from 'react';

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
      // Check if already loaded
      if (window.google?.maps?.places?.Autocomplete) {
        return true;
      }
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places?.Autocomplete) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(!!window.google?.maps?.places?.Autocomplete);
          }, 10000);
        });
      }
      
      // Load new script
      return new Promise((resolve, reject) => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-5o9YY4NS8y8F2ZTg8-zibHYRP_1dOEc';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setTimeout(() => {
            resolve(!!window.google?.maps?.places?.Autocomplete);
          }, 300);
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps API'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initializeAutocomplete = async () => {
      try {
        if (!isComponentMounted || !inputRef.current) return;

        // Skip if already initialized
        if (autocompleteRef.current) return;

        console.log('Initializing address autocomplete...');

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address', 'establishment'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'name', 'place_id'],
            strictBounds: false,
            bounds: null
          }
        );

        // Make autocomplete less aggressive - only show suggestions when user pauses typing
        autocomplete.addListener('place_changed', () => {
          if (!isComponentMounted) return;
          
          const place = autocomplete.getPlace();
          console.log('Place selected:', place);
          
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
              position: absolute !important;
              left: 0 !important;
              right: 0 !important;
              width: auto !important;
              max-width: none !important;
            }
            .pac-item {
              padding: 14px 16px !important;
              min-height: 48px !important;
              font-size: 16px !important;
            }
          }
        `;
        if (!document.querySelector('#google-autocomplete-styles')) {
          style.id = 'google-autocomplete-styles';
          document.head.appendChild(style);
        }
        
        setIsReady(true);
        setError(null);
        console.log('Address autocomplete initialized successfully');
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Address suggestions temporarily unavailable');
      }
    };

    const setupAutocomplete = async () => {
      try {
        const loaded = await loadGoogleMapsAPI();
        if (loaded && isComponentMounted) {
          await initializeAutocomplete();
        }
      } catch (err) {
        console.error('Error setting up autocomplete:', err);
        setError('Address suggestions temporarily unavailable');
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
    
    // On mobile, ensure proper positioning
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
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
        <p className="text-gray-500 text-xs mt-1">Loading address suggestions...</p>
      )}
    </div>
  );
} 