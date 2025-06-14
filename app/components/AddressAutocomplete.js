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

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
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
        // Add mobile-specific parameters for better mobile performance
        const isMobile = window.innerWidth <= 768;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async${isMobile ? '&region=US&language=en' : ''}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          // Longer delay on mobile for better initialization
          const delay = window.innerWidth <= 768 ? 1000 : 500;
          setTimeout(() => {
            resolve(!!window.google?.maps?.places?.Autocomplete);
          }, delay);
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
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'name', 'place_id'],
            // Mobile-specific options
            strictBounds: false,
            bounds: null
          }
        );

        // Mobile-specific fixes
        if (window.innerWidth <= 768) {
          // Disable strict bounds on mobile for better results
          autocomplete.setOptions({
            strictBounds: false,
            bounds: null
          });
        }

        autocomplete.addListener('place_changed', () => {
          if (!isComponentMounted) return;
          
          const place = autocomplete.getPlace();
          if (place?.formatted_address && onChange) {
            onChange({
              target: {
                name: name,
                value: place.formatted_address
              }
            });
          }
        });

        autocompleteRef.current = autocomplete;
        
        // Mobile-specific styling for the dropdown
        if (window.innerWidth <= 768) {
          // Add mobile-specific CSS for Google autocomplete dropdown
          const style = document.createElement('style');
          style.textContent = `
            .pac-container {
              z-index: 9999 !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
              border: 1px solid #ccc !important;
              font-size: 16px !important;
            }
            .pac-item {
              padding: 12px 16px !important;
              border-bottom: 1px solid #eee !important;
              cursor: pointer !important;
            }
            .pac-item:hover {
              background-color: #f5f5f5 !important;
            }
            .pac-item-selected {
              background-color: #e3f2fd !important;
            }
            @media (max-width: 768px) {
              .pac-container {
                max-width: calc(100vw - 32px) !important;
                left: 16px !important;
                right: 16px !important;
                width: auto !important;
              }
            }
          `;
          if (!document.querySelector('#google-autocomplete-mobile-styles')) {
            style.id = 'google-autocomplete-mobile-styles';
            document.head.appendChild(style);
          }
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
  }, [isClient, onChange, name]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Mobile-specific touch and focus handlers
  const handleInputFocus = (e) => {
    // On mobile, ensure the autocomplete dropdown is properly positioned
    if (window.innerWidth <= 768 && autocompleteRef.current) {
      setTimeout(() => {
        // Force refresh of autocomplete positioning
        window.google?.maps?.event?.trigger(autocompleteRef.current, 'resize');
      }, 100);
    }
  };

  const handleInputTouchStart = (e) => {
    // Prevent zoom on iOS when focusing input
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      e.target.style.fontSize = '16px';
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
    <div className="relative w-full" style={{
      // Mobile-specific container improvements
      position: 'relative',
      zIndex: 1,
      // Ensure proper stacking context for mobile dropdowns
      ...(window?.innerWidth <= 768 ? {
        isolation: 'isolate'
      } : {})
    }}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onTouchStart={handleInputTouchStart}
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
          // Mobile-specific improvements
          WebkitAppearance: 'none',
          appearance: 'none',
          touchAction: 'manipulation',
          // Prevent zoom on iOS
          ...(window?.innerWidth <= 768 && /iPad|iPhone|iPod/.test(navigator?.userAgent || '') ? {
            fontSize: '16px'
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