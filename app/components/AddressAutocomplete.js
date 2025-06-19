'use client';

import { useEffect, useRef, useState } from 'react';

// Simple global flags
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;

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

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !inputRef.current) return;

    const loadGoogleMaps = async () => {
      try {
        // Check if already loaded
        if (isGoogleMapsLoaded && window.google?.maps?.places?.Autocomplete) {
          initializeAutocomplete();
          return;
        }

        // Prevent multiple loading attempts
        if (isGoogleMapsLoading) return;
        isGoogleMapsLoading = true;

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Wait for existing script
          await waitForGoogleMaps();
          initializeAutocomplete();
          return;
        }

        // Load Google Maps API
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-5o9YY4NS8y8F2ZTg8-zibHYRP_1dOEc';
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            isGoogleMapsLoaded = true;
            isGoogleMapsLoading = false;
            resolve();
          };
          
          script.onerror = () => {
            isGoogleMapsLoading = false;
            reject(new Error('Failed to load Google Maps'));
          };
          
          document.head.appendChild(script);
        });

        await waitForGoogleMaps();
        initializeAutocomplete();

      } catch (error) {
        console.warn('Google Maps failed to load:', error);
        isGoogleMapsLoading = false;
      }
    };

    const waitForGoogleMaps = () => {
      return new Promise((resolve) => {
        const check = () => {
          if (window.google?.maps?.places?.Autocomplete) {
            isGoogleMapsLoaded = true;
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    const initializeAutocomplete = () => {
      try {
        if (!window.google?.maps?.places?.Autocomplete || !inputRef.current) {
          return;
        }

        // Simple autocomplete setup
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'us' }
        });

        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            // Create a synthetic event object that matches what handleChange expects
            const syntheticEvent = {
              target: {
                name: name,
                value: place.formatted_address,
                type: 'text'
              }
            };
            onChange(syntheticEvent);
          }
        });

        setIsReady(true);

      } catch (error) {
        console.warn('Failed to initialize autocomplete:', error);
      }
    };

    loadGoogleMaps();

  }, [isClient, onChange, name]);

  const handleInputChange = (e) => {
    // Pass through the actual event object since it already has the correct structure
    onChange(e);
  };

  const baseStyle = {
    width: '100%',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    color: '#000',
    outline: 'none',
    boxSizing: 'border-box',
    ...style
  };

  if (!isClient) {
    return (
      <input
        type="text"
        name={name}
        value={value || ''}
        readOnly
        placeholder={placeholder}
        style={baseStyle}
        className={className}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        style={baseStyle}
        className={className}
        autoComplete="off"
        // Mobile-specific attributes
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck="false"
      />
      {!isReady && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#666',
          pointerEvents: 'none'
        }}>
          Loading...
        </div>
      )}
    </div>
  );
} 