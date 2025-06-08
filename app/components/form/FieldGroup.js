'use client';

import React from 'react';

/**
 * A reusable form field group component with consistent styling and optional help text
 */
const FieldGroup = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon = null,
  options = [],
  children,
  disabled = false,
  className = '',
  containerClassName = '',
  iconStyle = {},
  helpText = '', // new
  compact = false, // new
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            disabled={disabled}
            required={required}
          >
            <option value="" disabled>
              Select {label}
            </option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'} rounded-lg border ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={name} className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
        {icon && <span className="inline-block mr-2" style={iconStyle}>{icon}</span>}
        {label}
      </label>
      {renderInput()}
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {children}
    </div>
  );
};

export default FieldGroup;
