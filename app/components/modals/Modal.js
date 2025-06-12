'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

/**
 * A reusable modal component for displaying information
 */
const Modal = ({
  title = 'Information',
  icon = <FaInfoCircle className="text-blue-500 mr-2" />,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  footer = null,
}) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div
        className={`bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full ${maxWidth} transform transition-all duration-300 ease-in-out ${
          animateIn ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        } flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            {icon}
            {title}
          </h2>
          {showCloseButton && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="px-5 py-4 overflow-y-auto text-base text-gray-700 dark:text-gray-300 flex-1" style={{ fontSize: '16px', lineHeight: '1.5' }}>
          {children}
        </div>

        <div className="px-5 pb-4 pt-2 flex justify-end">
          {footer || (
            <button
              onClick={onClose}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition w-full text-base"
              style={{ fontSize: '16px' }}
            >
              Ok
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
