'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div 
    className="datepicker-input"
    onClick={(e) => {
      try {
        onClick(e);
      } catch (error) {
        console.error('Input click error:', error);
      }
    }}
    ref={ref}
    style={{
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: 'clamp(12px, 2vw, 16px)',
      fontSize: 'clamp(16px, 2.5vw, 18px)',
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      boxSizing: 'border-box',
      marginBottom: '0.5rem'
    }}
  >
    <span style={{ 
      color: value ? '#000' : '#6b7280',
      fontSize: 'clamp(16px, 2.5vw, 18px)',
      flex: 1,
      marginRight: '8px'
    }}>
      {value || placeholder || 'Select a date'}
    </span>
    <FaCalendarAlt style={{ color: '#6366f1', fontSize: '1.2rem', flexShrink: 0 }} />
  </div>
));

CustomInput.displayName = 'CustomInput';

const ReactDatePickerField = ({ 
  selectedDate, 
  onChange, 
  placeholder = 'Select event date',
  dateFormat = 'MMMM d, yyyy',
  minDate = new Date(),
  error = null
}) => {
  const [isClient, setIsClient] = useState(false);

  // Client-side detection - only runs once on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize date validation to prevent unnecessary recalculations
  const { validDate, isValid } = React.useMemo(() => {
    const validDate = selectedDate ? new Date(selectedDate) : null;
    const isValid = validDate && !isNaN(validDate.getTime());
    return { validDate: isValid ? validDate : null, isValid };
  }, [selectedDate]);

  // Memoize date change handler
  const handleDateChange = React.useCallback((date) => {
    if (date && !isNaN(date.getTime())) {
      onChange(date);
    } else {
      onChange(null);
    }
  }, [onChange]);

  // Render fallback on server side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="relative w-full">
        <div 
          className="datepicker-input"
          style={{
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: 'clamp(12px, 2vw, 16px)',
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxSizing: 'border-box',
            marginBottom: '0.5rem'
          }}
        >
          <span style={{ 
            flex: 1,
            marginRight: '8px',
            fontSize: 'clamp(16px, 2.5vw, 18px)'
          }}>{placeholder || 'Select event date'}</span>
          <FaCalendarAlt style={{ color: '#6366f1', fontSize: '1.2rem', flexShrink: 0 }} />
        </div>
        {error && (
          <p className="text-red-500 text-xs italic mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ width: '100%' }}>
      <DatePicker
        selected={validDate}
        onChange={handleDateChange}
        customInput={<CustomInput />}
        dateFormat={dateFormat}
        minDate={minDate}
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        className="w-full"
        popperProps={{
          strategy: "absolute"
        }}
      />
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
      
      {/* Simplified global styles */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100% !important;
          display: block;
        }
        
        .react-datepicker__input-container {
          width: 100% !important;
          display: block;
        }
        
        .datepicker-input {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .react-datepicker-popper {
          width: max-content !important;
          z-index: 9999 !important;
        }
        
        .date-picker-calendar {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          max-width: 320px !important;
          width: 100% !important;
        }
        
        .date-picker-calendar .react-datepicker__header {
          padding: 16px !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .date-picker-calendar .react-datepicker__day {
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          margin: 0.15rem !important;
          font-size: 14px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        .date-picker-calendar .react-datepicker__day-name {
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0.15rem !important;
        }
        
        .date-picker-calendar .react-datepicker__navigation {
          top: 16px !important;
          width: 32px !important;
          height: 32px !important;
        }
        
        .date-picker-calendar .react-datepicker__navigation--previous {
          left: 16px !important;
        }
        
        .date-picker-calendar .react-datepicker__navigation--next {
          right: 16px !important;
        }
        
        @media (max-width: 768px) {
          .react-datepicker-popper {
            position: fixed !important;
            z-index: 10000 !important;
            width: auto !important;
            max-width: 90vw !important;
            left: 50% !important;
            margin-left: -160px !important;
          }
          
          .react-datepicker-wrapper {
            width: 100% !important;
          }
          
          .datepicker-input input {
            font-size: 16px !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReactDatePickerField; 