'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <button 
    type="button"
    onClick={onClick} 
    ref={ref}
    className="w-full"
    style={{
      backgroundColor: 'white',
      width: '100%',
      padding: 'clamp(12px, 2vw, 16px)',
      marginBottom: '1rem',
      borderRadius: '8px',
      border: '1px solid #ccc',
      color: value ? '#000' : '#6b7280',
      fontSize: 'clamp(16px, 2.5vw, 18px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      outline: 'none',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem top 50%',
      backgroundSize: '0.75rem auto',
      paddingRight: 'clamp(24px, 3vw, 32px)'
    }}
  >
    <span style={{ 
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textAlign: 'left',
      flex: 1
    }}>
      {value || placeholder}
    </span>
    <FaCalendarAlt style={{ 
      color: '#6b7280',
      marginLeft: '12px',
      fontSize: '16px',
      flexShrink: 0
    }} />
  </button>
));

CustomInput.displayName = 'CustomInput';

const ReactDatePickerField = ({ selectedDate, onChange, placeholder = "Select date" }) => {
  // Ensure we have a valid Date object
  const parsedDate = selectedDate ? new Date(selectedDate) : null;
  
  // Validate the date
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
  
  return (
    <div className="w-full max-w-md mx-auto">
      <DatePicker
        selected={isValidDate ? parsedDate : null}
        onChange={onChange}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="MMMM d, yyyy"
        placeholderText={placeholder}
      />
    </div>
  );
};

export default ReactDatePickerField; 