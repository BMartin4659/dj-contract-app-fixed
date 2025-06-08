'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to get days in month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Get dates for the calendar display
const getCalendarDates = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const CustomDatePickerField = ({ selectedDate, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const datePickerRef = useRef(null);

  // When selected date changes, update the displayed month/year
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [selectedDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Go to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Go to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (!date) return;
    onChange(date);
    setIsOpen(false);
  };

  const calendarDates = getCalendarDates(currentYear, currentMonth);

  return (
    <div className="w-full relative" ref={datePickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
        style={{
          backgroundColor: 'white',
          width: '100%',
          minHeight: '64px',
          padding: '16px',
          marginBottom: '1rem',
          borderRadius: '12px',
          border: '1px solid #ccc',
          color: selectedDate ? '#000' : '#6b7280',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          outline: 'none',
          position: 'relative'
        }}
      >
        <span style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left',
          flex: 1,
          lineHeight: '24px'
        }}>
          {selectedDate ? formatDate(new Date(selectedDate)) : placeholder}
        </span>
        <FaCalendarAlt style={{ 
          color: '#6b7280',
          marginLeft: '12px',
          fontSize: '20px',
          flexShrink: 0
        }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 50,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '380px',
            marginTop: '4px'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #eee'
          }}>
            <button onClick={prevMonth} style={{ padding: '8px', cursor: 'pointer' }}>
              <FaChevronLeft />
            </button>
            <div style={{ fontWeight: 500 }}>
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <button onClick={nextMonth} style={{ padding: '8px', cursor: 'pointer' }}>
              <FaChevronRight />
            </button>
          </div>

          <div style={{ padding: '8px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))',
              gap: '1px',
              marginBottom: '4px'
            }}>
              {DAYS.map(day => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#666',
                    padding: '4px 0'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))',
              gap: '1px'
            }}>
              {calendarDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    borderRadius: '4px',
                    cursor: date ? 'pointer' : 'default',
                    backgroundColor: date && selectedDate && 
                      date.toDateString() === new Date(selectedDate).toDateString() 
                      ? '#6366f1' 
                      : 'transparent',
                    color: date 
                      ? (selectedDate && date.toDateString() === new Date(selectedDate).toDateString()
                        ? 'white' 
                        : '#333')
                      : 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    margin: '0 auto',
                    padding: '0'
                  }}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePickerField; 