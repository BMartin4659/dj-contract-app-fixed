'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Image from 'next/image';

export default function ClientContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const djId = searchParams.get('djId');

  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'Wedding',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    guestCount: '',
    venue: '',
    venueAddress: '',
    lighting: false,
    photography: false,
    videoVisuals: false,
    additionalHours: 0,
    paymentAmount: 'deposit',
    paymentMethod: '',
    specialRequests: '',
    signerName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [customLogo, setCustomLogo] = useState(null);
  const [logoPosition, setLogoPosition] = useState('center');

  // Event type options
  const eventTypes = [
    'Wedding', 'Birthday Party', 'Corporate Event', 'Graduation', 
    'Anniversary', 'Sweet 16', 'Holiday Party', 'Other'
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'stripe', label: 'Credit/Debit Card (Stripe)' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'venmo', label: 'Venmo' },
    { id: 'cashapp', label: 'CashApp' },
    { id: 'cash', label: 'Cash' }
  ];

  // Base pricing
  const basePrice = 400;
  const servicesPricing = {
    lighting: 75,
    photography: 150,
    videoVisuals: 100,
    additionalHour: 75
  };

  // Fetch DJ's custom logo
  useEffect(() => {
    const fetchDJLogo = async () => {
      if (djId) {
        try {
          const djDoc = await getDoc(doc(db, 'users', djId));
          if (djDoc.exists()) {
            const djData = djDoc.data();
            setCustomLogo(djData.customLogo || null);
            setLogoPosition(djData.logoPosition || 'center');
          }
        } catch (error) {
          console.error('Error fetching DJ logo:', error);
        }
      }
    };

    fetchDJLogo();
  }, [djId]);

  // Listen for logo updates
  useEffect(() => {
    const handleLogoUpdate = (event) => {
      const { logoUrl, logoPosition, userEmail } = event.detail;
      
      // Check if this update is for the current DJ
      if (djId === userEmail) {
        console.log('🔄 Logo updated, refreshing display:', logoUrl, logoPosition);
        setCustomLogo(logoUrl);
        if (logoPosition) {
          setLogoPosition(logoPosition);
        }
      }
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, [djId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotal = () => {
    let total = basePrice;
    if (formData.lighting) total += servicesPricing.lighting;
    if (formData.photography) total += servicesPricing.photography;
    if (formData.videoVisuals) total += servicesPricing.videoVisuals;
    total += (formData.additionalHours || 0) * servicesPricing.additionalHour;
    return total;
  };

  const calculateDeposit = () => {
    return Math.round(calculateTotal() * 0.5);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName) errors.clientName = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    if (!formData.eventDate) errors.eventDate = 'Event date is required';
    if (!formData.venue) errors.venue = 'Venue is required';
    if (!formData.venueAddress) errors.venueAddress = 'Venue address is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!formData.signerName) errors.signerName = 'Signature is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const bookingData = {
        ...formData,
        clientId,
        djId,
        totalAmount: calculateTotal(),
        depositAmount: calculateDeposit(),
        amountToPay: formData.paymentAmount === 'deposit' ? calculateDeposit() : calculateTotal(),
        contractType: 'basic',
        submittedAt: serverTimestamp(),
        status: 'pending'
      };

      // Save to Firestore
      await addDoc(collection(db, 'bookings'), bookingData);
      
      // Update client record
      if (clientId && djId) {
        await setDoc(doc(db, 'users', djId, 'clients', clientId), {
          formCompleted: true,
          completedAt: serverTimestamp(),
          bookingData
        }, { merge: true });
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        padding: '2rem 1rem'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '3rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              color: '#10b981'
            }}>
              ✅
            </div>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Thank You!
            </h2>
            <p style={{ 
              fontSize: '1.1rem',
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              Your event contract has been submitted successfully. 
              Your DJ will contact you shortly to confirm the details and arrange payment.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Event Summary
            </h3>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
              <strong>Event:</strong> {formData.eventType}
            </p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
              <strong>Date:</strong> {formData.eventDate}
            </p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
              <strong>Time:</strong> {formData.startTime} - {formData.endTime}
            </p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
              <strong>Total:</strong> ${calculateTotal()}
            </p>
            <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
              <strong>Amount Due:</strong> ${formData.paymentAmount === 'deposit' ? calculateDeposit() : calculateTotal()} ({formData.paymentAmount === 'deposit' ? 'Deposit' : 'Full Payment'})
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '3rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '5rem 4rem',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px solid #e5e7eb',
              overflow: 'hidden',
              backgroundColor: customLogo ? 'white' : 'transparent',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Image
                src={customLogo || "/dj-bobby-drake-logo-transparent-60.png"}
                alt="DJ Logo"
                width={100}
                height={100}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: customLogo ? 'cover' : 'contain',
                  objectPosition: logoPosition || 'center',
                  backgroundColor: customLogo ? 'white' : 'transparent'
                }}
              />
            </div>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            EVENT CONTRACT
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280'
          }}>
            Please fill out your event details below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Client Information */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.75rem'
            }}>
              Client Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: formErrors.clientName ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
                {formErrors.clientName && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.clientName}</span>
                )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: formErrors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.email}</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '1rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: formErrors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#1f2937',
                  boxSizing: 'border-box'
                }}
                placeholder="(123) 456-7890"
              />
              {formErrors.phone && (
                <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.phone}</span>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.75rem'
            }}>
              Event Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: formErrors.eventDate ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.eventDate && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.eventDate}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.75rem'
                }}>
                  Guest Count
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    boxSizing: 'border-box'
                  }}
                  placeholder="100"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: formErrors.venue ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    color: '#1f2937'
                  }}
                  placeholder="Event venue name"
                />
                {formErrors.venue && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{formErrors.venue}</span>
                )}
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Venue Address *
                </label>
                <input
                  type="text"
                  name="venueAddress"
                  value={formData.venueAddress}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: formErrors.venueAddress ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    color: '#1f2937'
                  }}
                  placeholder="Full venue address"
                />
                {formErrors.venueAddress && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{formErrors.venueAddress}</span>
                )}
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.75rem'
            }}>
              Additional Services
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.lighting ? '#eff6ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  name="lighting"
                  checked={formData.lighting}
                  onChange={handleChange}
                  style={{ marginRight: '0.75rem' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>Lighting Package</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>+${servicesPricing.lighting}</div>
                </div>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.photography ? '#eff6ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  name="photography"
                  checked={formData.photography}
                  onChange={handleChange}
                  style={{ marginRight: '0.75rem' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>Photography</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>+${servicesPricing.photography}</div>
                </div>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.videoVisuals ? '#eff6ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  name="videoVisuals"
                  checked={formData.videoVisuals}
                  onChange={handleChange}
                  style={{ marginRight: '0.75rem' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>Video Visuals</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>+${servicesPricing.videoVisuals}</div>
                </div>
              </label>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>Additional Hours</div>
                  <input
                    type="number"
                    name="additionalHours"
                    value={formData.additionalHours}
                    onChange={handleChange}
                    min="0"
                    style={{
                      width: '80px',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      color: '#1f2937'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  ${servicesPricing.additionalHour}/hour
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#1f2937',
                minHeight: '120px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="Any special requests or additional information..."
            />
          </div>

          {/* Payment Information */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.75rem'
            }}>
              Payment Information
            </h3>
            
            <div style={{ 
              backgroundColor: '#f3f4f6',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#4b5563' }}>Base Package:</span>
                <span style={{ fontWeight: '500', color: '#1f2937' }}>${basePrice}</span>
              </div>
              {formData.lighting && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4b5563' }}>Lighting:</span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>+${servicesPricing.lighting}</span>
                </div>
              )}
              {formData.photography && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4b5563' }}>Photography:</span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>+${servicesPricing.photography}</span>
                </div>
              )}
              {formData.videoVisuals && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4b5563' }}>Video Visuals:</span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>+${servicesPricing.videoVisuals}</span>
                </div>
              )}
              {formData.additionalHours > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4b5563' }}>Additional Hours ({formData.additionalHours}):</span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>+${formData.additionalHours * servicesPricing.additionalHour}</span>
                </div>
              )}
              <div style={{ 
                borderTop: '1px solid #d1d5db',
                paddingTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>Total:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>${calculateTotal()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Payment Amount
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentAmount"
                    value="deposit"
                    checked={formData.paymentAmount === 'deposit'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ color: '#1f2937' }}>Deposit (50%) - ${calculateDeposit()}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentAmount"
                    value="full"
                    checked={formData.paymentAmount === 'full'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ color: '#1f2937' }}>Full Payment - ${calculateTotal()}</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: formErrors.paymentMethod ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  color: '#1f2937',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>{method.label}</option>
                ))}
              </select>
              {formErrors.paymentMethod && (
                <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{formErrors.paymentMethod}</span>
              )}
            </div>
          </div>

          {/* Signature */}
          <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.75rem'
            }}>
              Digital Signature
            </h3>
            
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#92400e', margin: '0' }}>
                By signing below, you agree to the terms and conditions of this contract.
              </p>
            </div>

            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Type your full name to sign *
            </label>
            <input
              type="text"
              name="signerName"
              value={formData.signerName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: formErrors.signerName ? '2px solid #ef4444' : '2px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '1.5rem',
                color: '#1f2937',
                fontFamily: 'cursive',
                fontStyle: 'italic'
              }}
              placeholder="Your full legal name"
            />
            {formErrors.signerName && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{formErrors.signerName}</span>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ padding: '0 1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                padding: '1.25rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? 'Submitting Contract...' : 'Submit Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 