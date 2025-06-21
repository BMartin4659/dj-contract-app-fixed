'use client';

import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTopButton = ({ 
  threshold = 300, 
  smooth = true,
  className = "",
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const defaultStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '0 4px 12px rgba(0, 112, 243, 0.3)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    ...style
  };

  const hoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 16px rgba(0, 112, 243, 0.4)'
  };

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top-btn ${className}`}
      style={defaultStyle}
      onMouseEnter={(e) => {
        Object.assign(e.target.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.target.style, defaultStyle);
      }}
      aria-label="Back to top"
      title="Back to top"
    >
      <FaArrowUp />
    </button>
  );
};

export default BackToTopButton; 