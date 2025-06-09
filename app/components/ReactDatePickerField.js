'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <button 
    type="button"
    onClick={onClick} 
    ref={ref}
    className="react-datepicker__input-container button"
  >
    <span>
      {value || placeholder}
    </span>
  </button>
));

CustomInput.displayName = 'CustomInput';

const ReactDatePickerField = ({ selectedDate, onChange, placeholder = "Select date" }) => {
  // Ensure we have a valid Date object
  const parsedDate = selectedDate ? new Date(selectedDate) : null;
  
  // Validate the date
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
  
  return (
    <div className="w-full h-[42px]">
      <DatePicker
        selected={isValidDate ? parsedDate : null}
        onChange={onChange}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="MMMM d, yyyy"
        placeholderText={placeholder}
        className="w-full"
      />
    </div>
  );
};

export default ReactDatePickerField; 