'use client';

import React, { useState, useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const SignatureField = ({ onSignatureChange, showTermsModal }) => {
  const [signerName, setSignerName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const handleNameChange = (e) => {
    let name = e.target.value;
    if (name) {
      name = name.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    setSignerName(name);
    setNameError('');
    if (name.trim()) {
      onSignatureChange(name, true, name);
    } else {
      onSignatureChange(null, false, '');
    }
  };
  
  return (
    <div id="signature-section" style={{ marginBottom: '2rem' }}>
      <div style={{ 
        marginBottom: '1rem',
        backgroundColor: '#0070f3',
        color: 'white',
        padding: '14px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <span>By entering your name below, you agree to the terms and conditions.</span>
        <FaInfoCircle 
          style={{ 
            marginLeft: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'white'
          }}
          onClick={(e) => {
            e.preventDefault();
            if (showTermsModal) showTermsModal();
          }}
          title="View Terms and Conditions"
        />
      </div>
      
      <input
        type="text"
        value={signerName}
        onChange={handleNameChange}
        placeholder="Enter your full name"
        style={{
          width: '100%',
          padding: 'clamp(12px, 2vw, 16px)',
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: nameError ? '0.5rem' : '1rem'
        }}
      />
      {nameError && <p style={{ color: 'red', marginBottom: '1rem' }}>{nameError}</p>}
    </div>
  );
};

export default SignatureField; 