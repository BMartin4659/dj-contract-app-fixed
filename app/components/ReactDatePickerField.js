'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div 
    className="datepicker-input field-input"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        // On mobile, ensure any virtual keyboard is dismissed
        if (window.innerWidth <= 768 && document.activeElement) {
          document.activeElement.blur();
        }
        onClick(e);
      } catch (error) {
        console.error('Input click error:', error);
      }
    }}
    onTouchStart={(e) => {
      e.preventDefault();
    }}
    onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        // On mobile, ensure any virtual keyboard is dismissed
        if (window.innerWidth <= 768 && document.activeElement) {
          document.activeElement.blur();
        }
        onClick(e);
      } catch (error) {
        console.error('Touch click error:', error);
      }
    }}
    ref={ref}
    style={{
      backgroundColor: 'white',
      width: '100%',
      padding: 'clamp(12px, 2vw, 16px)',
      marginBottom: '1rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
      color: '#1a1a1a', // Darker text for better mobile visibility
      fontSize: 'clamp(16px, 2.5vw, 18px)',
      fontWeight: '500', // Thicker font weight for mobile readability
      minHeight: '44px',
      lineHeight: '1.4',
      WebkitAppearance: 'none',
      appearance: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      userSelect: 'text',
      WebkitUserSelect: 'text',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }}
  >
    <span style={{ 
      color: value ? '#000' : '#6b7280',
      fontSize: 'clamp(16px, 2.5vw, 18px)',
      flex: 1,
      marginRight: '8px',
      pointerEvents: 'none'
    }}>
      {value || placeholder || 'Select a date'}
    </span>
    <FaCalendarAlt style={{ color: '#6366f1', fontSize: '1.2rem', flexShrink: 0, pointerEvents: 'none' }} />
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
  const [isMobile, setIsMobile] = useState(false);

  // Client-side detection - only runs once on mount
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
          className="datepicker-input field-input"
          style={{
            backgroundColor: 'white',
            width: '100%',
            padding: 'clamp(12px, 2vw, 16px)',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            color: '#1a1a1a', // Darker text for better mobile visibility
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            fontWeight: '500', // Thicker font weight for mobile readability
            minHeight: '44px',
            lineHeight: '1.4',
            WebkitAppearance: 'none',
            appearance: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            userSelect: 'text',
            WebkitUserSelect: 'text',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
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
        popperPlacement={isMobile ? "bottom" : "bottom-start"}
        className="w-full"
        popperContainer={({ children }) => (
          <div className="react-datepicker-portal">
            {children}
          </div>
        )}
        popperProps={{
          strategy: "absolute",
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
                padding: isMobile ? 16 : 8,
                altBoundary: true
              }
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: isMobile ? ['top', 'bottom'] : ['top-start', 'bottom-end', 'top-end']
              }
            },
            {
              name: 'offset',
              options: {
                offset: [0, isMobile ? 8 : 4]
              }
            }
          ]
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
        
        .react-datepicker-portal {
          position: relative !important;
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          max-width: 320px !important;
          width: 100% !important;
          font-family: inherit !important;
        }
        
        @media (max-width: 768px) {
          .react-datepicker {
            max-width: 280px !important;
            font-size: 14px !important;
          }
          
          .react-datepicker__header {
            padding: 12px !important;
          }
          
          .react-datepicker__day {
            width: 2.2rem !important;
            height: 2.2rem !important;
            line-height: 2.2rem !important;
            margin: 0.1rem !important;
          }
          
          .react-datepicker__navigation {
            width: 40px !important;
            height: 40px !important;
          }
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
            z-index: 10000 !important;
            width: auto !important;
            max-width: 90vw !important;
          }
          
          .react-datepicker {
            width: 280px !important;
            max-width: 90vw !important;
            margin: 0 auto !important;
          }
          
          .react-datepicker-wrapper {
            width: 100% !important;
          }
          
          .datepicker-input {
            font-size: 16px !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          
          .datepicker-input input {
            font-size: 16px !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          
          /* Improve touch targets for mobile */
          .react-datepicker__day {
            width: 2.2rem !important;
            height: 2.2rem !important;
            line-height: 2.2rem !important;
            margin: 0.2rem !important;
            font-size: 14px !important;
            touch-action: manipulation !important;
          }
          
          .react-datepicker__navigation {
            width: 40px !important;
            height: 40px !important;
            touch-action: manipulation !important;
          }
          
          /* Ensure proper positioning relative to input */
          .react-datepicker-popper[data-placement^="bottom"] {
            margin-top: 4px !important;
          }
          
          .react-datepicker-popper[data-placement^="top"] {
            margin-bottom: 4px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReactDatePickerField; 