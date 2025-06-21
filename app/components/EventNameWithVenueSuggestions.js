'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const EventNameWithVenueSuggestions = () => {
  const [eventName, setEventName] = useState('');
  const [venueSuggestions, setVenueSuggestions] = useState([]);
  const autocompleteServiceRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      libraries: ['places']
    });

    loader.load().then(() => {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    });
  }, []);

  const handleEventNameChange = (e) => {
    const input = e.target.value;
    setEventName(input);

    if (input.length > 2 && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: `${input} venue`,
          types: ['establishment'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setVenueSuggestions(predictions);
          } else {
            setVenueSuggestions([]);
          }
        }
      );
    } else {
      setVenueSuggestions([]);
    }
  };

  return (
    <div className="p-4">
      <label className="block mb-2 font-bold text-gray-700">Event Name</label>
      <input
        type="text"
        value={eventName}
        onChange={handleEventNameChange}
        className="w-full p-2 border rounded"
        placeholder="e.g. Wedding, Birthday, Corporate Event"
      />

      {venueSuggestions.length > 0 && (
        <ul className="border mt-2 rounded shadow bg-white z-50 relative">
          {venueSuggestions.map((venue) => (
            <li
              key={venue.place_id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {venue.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventNameWithVenueSuggestions; 