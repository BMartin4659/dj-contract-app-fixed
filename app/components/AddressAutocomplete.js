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
            bounds: null,
            // Add mobile-specific options
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'us' }
          });
          
          // Add mobile-specific event listeners
          inputRef.current.addEventListener('touchstart', (e) => {
            // Prevent default to avoid iOS zoom
            e.preventDefault();
            inputRef.current.focus();
          }, { passive: false });
          
          // Force refresh autocomplete on mobile after initialization
          setTimeout(() => {
            if (autocompleteRef.current && window.google?.maps?.event) {
              window.google.maps.event.trigger(autocompleteRef.current, 'resize');
            }
          }, 500);
        }

        autocomplete.addListener('place_changed', () => {
          if (!isComponentMounted) return;
          
          const place = autocomplete.getPlace();
          console.log('Place selected:', place);
          
          if (place?.formatted_address && onChange) {
            onChange({
              target: {
                name: name,
                value: place.formatted_address
              }
            });
          } else if (place?.name && onChange) {
            // Fallback to place name if formatted_address is not available
            onChange({
              target: {
                name: name,
                value: place.name
              }
            });
          }
        });

        autocompleteRef.current = autocomplete;
        
        // Add mobile-specific CSS for Google autocomplete dropdown
        const style = document.createElement('style');
        style.textContent = `
          .pac-container {
            z-index: 10000 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            border: 1px solid #ccc !important;
            font-size: 16px !important;
            position: absolute !important;
            background: white !important;
            margin-top: 4px !important;
          }
          .pac-item {
            padding: 14px 16px !important;
            border-bottom: 1px solid #eee !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            font-size: 16px !important;
          }
          .pac-item:hover, .pac-item:focus {
            background-color: #f5f5f5 !important;
          }
          .pac-item-selected {
            background-color: #e3f2fd !important;
          }
          .pac-item-query {
            font-size: 16px !important;
            line-height: 1.4 !important;
          }
          @media (max-width: 768px) {
            .pac-container {
              position: fixed !important;
              left: 8px !important;
              right: 8px !important;
              width: auto !important;
              max-width: calc(100vw - 16px) !important;
              z-index: 10001 !important;
              top: auto !important;
              bottom: auto !important;
              transform: none !important;
              margin-top: 0 !important;
            }
            .pac-item {
              padding: 16px !important;
              min-height: 48px !important;
              font-size: 16px !important;
              border-bottom: 1px solid #ddd !important;
            }
            .pac-item:last-child {
              border-bottom: none !important;
            }
            .pac-item-query {
              font-size: 16px !important;
              font-weight: 500 !important;
            }
          }
        `;
        if (!document.querySelector('#google-autocomplete-mobile-styles')) {
          style.id = 'google-autocomplete-mobile-styles';
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
  }, [isClient, onChange, name]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    
    // On mobile, manually trigger autocomplete after typing
    if (window.innerWidth <= 768 && autocompleteRef.current && e.target.value.length > 2) {
      setTimeout(() => {
        if (window.google?.maps?.event) {
          window.google.maps.event.trigger(autocompleteRef.current, 'focus');
          window.google.maps.event.trigger(inputRef.current, 'keydown', {
            keyCode: 40 // Down arrow to trigger dropdown
          });
        }
      }, 300);
    }
  };

  // Mobile-specific touch and focus handlers
  const handleInputFocus = (e) => {
    // On mobile, ensure the autocomplete dropdown is properly positioned
    if (window.innerWidth <= 768) {
      // Scroll input into view on mobile
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Force refresh of autocomplete positioning
        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.trigger(autocompleteRef.current, 'resize');
        }
        
        // Position the dropdown relative to the input on mobile
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          const inputRect = e.target.getBoundingClientRect();
          pacContainer.style.top = `${inputRect.bottom + window.scrollY + 4}px`;
          pacContainer.style.left = `8px`;
          pacContainer.style.right = `8px`;
          pacContainer.style.width = 'auto';
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
    // Small delay to allow autocomplete selection to work
    setTimeout(() => {
      if (window.innerWidth <= 768 && autocompleteRef.current) {
        // Ensure dropdown positioning is reset
        if (window.google?.maps?.event) {
          window.google.maps.event.trigger(autocompleteRef.current, 'resize');
        }
      }
    }, 150);
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
        onBlur={handleInputBlur}
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
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          // Prevent zoom on iOS
          ...(window?.innerWidth <= 768 && /iPad|iPhone|iPod/.test(navigator?.userAgent || '') ? {
            fontSize: '16px'
          } : {}),
          // Better mobile focus styles
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