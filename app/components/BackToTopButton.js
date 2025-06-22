'use client';

import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={scrollToTop}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-gray-400 font-medium text-xs sm:text-sm"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
        }}
        title="Back to top"
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <FaChevronUp className="text-xs" />
        </div>
        <span className="font-bold tracking-tight">
          <span className="hidden sm:inline">Back to Top</span>
          <span className="sm:hidden">Top</span>
        </span>
      </button>
    </div>
  );
};

export default BackToTopButton; 