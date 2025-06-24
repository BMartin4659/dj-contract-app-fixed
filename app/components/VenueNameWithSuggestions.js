'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaBuilding } from 'react-icons/fa';

const VenueNameWithSuggestions = ({ 
  value, 
  onChange, 
  name = "venueName",
  placeholder = "Enter venue name",
  required = true,
  style = {},
  className = "",
  fieldIcon = null,
  onAddressChange = null
}) => {
  const [venueSuggestions, setVenueSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    console.log('VenueNameWithSuggestions: Waiting for Google Maps API to be available');

    const checkGoogleMaps = () => {
      if (window.google?.maps?.places?.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        console.log('VenueNameWithSuggestions: Google Maps AutocompleteService initialized successfully');
        return true;
      }
      return false;
    };

    // Try to initialize immediately if already loaded
    if (checkGoogleMaps()) {
      return;
    }

    // Otherwise, poll for Google Maps availability
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 500);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    
    // Call the parent's onChange handler
    onChange(e);

    console.log('VenueNameWithSuggestions: Input changed to:', input, 'Length:', input.length, 'AutocompleteService ready:', !!autocompleteServiceRef.current);

    // Handle venue suggestions
    if (input.length > 2 && autocompleteServiceRef.current) {
      console.log('VenueNameWithSuggestions: Making Places API call for:', input);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: input,
          types: ['establishment'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          console.log('VenueNameWithSuggestions: Places API response - Status:', status, 'Predictions:', predictions?.length || 0);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Filter to get venue-like establishments
            const venueResults = predictions.filter(prediction => {
              const lowerDesc = prediction.description.toLowerCase();
              return lowerDesc.includes('center') || 
                     lowerDesc.includes('hall') || 
                     lowerDesc.includes('venue') || 
                     lowerDesc.includes('ballroom') || 
                     lowerDesc.includes('hotel') || 
                     lowerDesc.includes('resort') || 
                     lowerDesc.includes('club') || 
                     lowerDesc.includes('event') ||
                     lowerDesc.includes('banquet') ||
                     lowerDesc.includes('reception') ||
                     prediction.types.includes('lodging') ||
                     prediction.types.includes('event_venue');
            });
            console.log('VenueNameWithSuggestions: Filtered venue results:', venueResults.length);
            setVenueSuggestions(venueResults.slice(0, 5));
            setShowSuggestions(venueResults.length > 0);
          } else {
            console.log('VenueNameWithSuggestions: No results or error - Status:', status);
            setVenueSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      if (input.length <= 2) {
        console.log('VenueNameWithSuggestions: Input too short, clearing suggestions');
      }
      if (!autocompleteServiceRef.current) {
        console.log('VenueNameWithSuggestions: AutocompleteService not ready');
      }
      setVenueSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (venue) => {
    // Extract venue name from the description (usually the first part before the comma)
    const venueName = venue.structured_formatting?.main_text || venue.description.split(',')[0];
    
    // Create a synthetic event object
    const syntheticEvent = {
      target: {
        name: name,
        value: venueName,
        type: 'text'
      }
    };
    
    onChange(syntheticEvent);
    
    // If onAddressChange is provided, get place details and auto-fill address
    if (onAddressChange && venue.place_id && window.google?.maps?.places?.PlacesService) {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      placesService.getDetails(
        {
          placeId: venue.place_id,
          fields: ['formatted_address', 'name']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place.formatted_address) {
            console.log('VenueNameWithSuggestions: Auto-filling address:', place.formatted_address);
            
            // Create synthetic event for address field
            const addressEvent = {
              target: {
                name: 'venueLocation',
                value: place.formatted_address,
                type: 'text'
              }
            };
            
            onAddressChange(addressEvent);
          } else {
            console.log('VenueNameWithSuggestions: Could not get place details for address auto-fill');
          }
        }
      );
    }
    
    setShowSuggestions(false);
    setVenueSuggestions([]);
  };

  const handleInputFocus = () => {
    if (venueSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const baseStyle = {
    backgroundColor: 'white',
    width: '100%',
    padding: 'clamp(12px, 2vw, 16px)',
    marginBottom: '2rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    color: '#1a1a1a',
    fontSize: 'clamp(16px, 2.5vw, 18px)',
    fontWeight: '500',
    minHeight: '44px',
    lineHeight: '1.4',
    WebkitAppearance: 'none',
    appearance: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    boxSizing: 'border-box',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    ...style
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        required={required}
        style={baseStyle}
        className={className}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        autoComplete="organization"
      />
      
      {showSuggestions && venueSuggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none'
          }}
        >
          {venueSuggestions.map((venue) => (
            <li
              key={venue.place_id}
              onClick={() => handleSuggestionClick(venue)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '14px',
                color: '#333',
                backgroundColor: 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                {venue.structured_formatting?.main_text || venue.description.split(',')[0]}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {venue.structured_formatting?.secondary_text || venue.description.split(',').slice(1).join(',').trim()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VenueNameWithSuggestions; 