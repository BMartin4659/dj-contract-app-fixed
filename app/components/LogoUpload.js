import React, { useState, useRef } from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { FaUpload, FaTrash, FaSpinner, FaImage } from 'react-icons/fa';

export default function LogoUpload({ user, userProfile, onLogoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(userProfile?.customLogo || null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }
  };

  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 400x400 for base64 storage, maintain aspect ratio)
        const maxDimension = 400;
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          file.type,
          0.7 // 70% quality for smaller base64 size
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      console.log('🔄 Starting logo upload process...');
      
      validateFile(file);
      console.log('✅ File validation passed');

      // Compress and resize image
      console.log('📐 Processing image...');
      const processedFile = await processImageFile(file);
      console.log('✅ Image processed, size:', Math.round(processedFile.size / 1024), 'KB');

      // Convert to base64 for direct storage in Firestore (fallback method)
      console.log('🔄 Converting to base64...');
      const base64Data = await fileToBase64(processedFile);
      console.log('✅ Base64 conversion complete');

      // Update user profile in Firestore with base64 data
      console.log('💾 Saving logo to Firestore...');
      const timestamp = Date.now();
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        customLogo: base64Data,
        logoType: 'base64',
        logoPosition: userProfile?.logoPosition || 'center',
        logoUpdatedAt: timestamp
      });
      console.log('✅ Logo saved to Firestore');

      setPreviewUrl(base64Data);
      console.log('✅ Preview URL set');
      
      // Call callback to update parent component
      if (onLogoUpdate) {
        onLogoUpdate(base64Data);
      }

      // Force refresh of user profile data by dispatching a custom event
      window.dispatchEvent(new CustomEvent('logoUpdated', { 
        detail: { logoUrl: base64Data, userEmail: user.email }
      }));

      console.log('✅ Logo uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading logo:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse
      });
      
      let errorMessage = 'Failed to upload logo. ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Permission denied. Please check Firebase Storage rules.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage += 'Unknown error occurred. Please try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage += 'Upload timed out. Please try a smaller file or check your connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove your custom logo?')) {
      return;
    }

    try {
      setUploading(true);

      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        customLogo: null,
        logoType: null,
        logoPosition: null,
        logoUpdatedAt: Date.now()
      });

      setPreviewUrl(null);
      
      // Call callback to update parent component
      if (onLogoUpdate) {
        onLogoUpdate(null);
      }

      // Force refresh of user profile data by dispatching a custom event
      window.dispatchEvent(new CustomEvent('logoUpdated', { 
        detail: { logoUrl: null, userEmail: user.email }
      }));

      console.log('✅ Logo removed successfully');
    } catch (error) {
      console.error('❌ Error removing logo:', error);
      alert('Failed to remove logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePositionChange = async (position) => {
    try {
      // Update user profile in Firestore with new position
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        logoPosition: position,
        logoUpdatedAt: Date.now()
      });

      // Update parent component
      if (onLogoUpdate) {
        onLogoUpdate(previewUrl, position);
      }

      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('logoUpdated', { 
        detail: { 
          logoUrl: previewUrl, 
          logoPosition: position,
          userEmail: user.email 
        }
      }));

      console.log('✅ Logo position updated:', position);
    } catch (error) {
      console.error('❌ Error updating logo position:', error);
    }
  };

  const handleRestoreOriginal = async () => {
    if (!confirm('Are you sure you want to restore the original DJ Bobby Drake logo?')) {
      return;
    }

    try {
      setUploading(true);

      // Update user profile in Firestore to remove custom logo
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        customLogo: null,
        logoType: null,
        logoPosition: null,
        logoUpdatedAt: Date.now()
      });

      setPreviewUrl(null);
      
      // Update parent component
      if (onLogoUpdate) {
        onLogoUpdate(null, null);
      }

      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('logoUpdated', { 
        detail: { 
          logoUrl: null, 
          logoPosition: null,
          userEmail: user.email 
        }
      }));

      console.log('✅ Original logo restored');
    } catch (error) {
      console.error('❌ Error restoring original logo:', error);
      alert('Failed to restore original logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Check if user has subscription access
  const hasSubscription = userProfile?.subscription?.status === 'active' || 
                         userProfile?.subscription?.status === 'trial' ||
                         userProfile?.plan === 'admin';



  if (!hasSubscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaImage className="text-blue-600" />
          Custom Logo
        </h3>
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Custom logo upload is available for subscribers</p>
            <p className="text-sm text-gray-500">Upgrade your plan to upload your own logo or profile picture</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaImage className="text-blue-600" />
        Custom Logo / Profile Picture
      </h3>
      
      {/* Current Logo Preview */}
      {previewUrl && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Current Logo:</p>
          <div className="relative inline-block">
            {/* Circular logo container */}
            <div className="w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden bg-transparent shadow-sm relative">
              <img
                src={previewUrl}
                alt="Current logo"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: userProfile?.logoPosition || 'center',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
            <button
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors disabled:opacity-50"
              title="Remove logo"
            >
              <FaTrash className="w-3 h-3" />
            </button>
            {/* Restore original logo button */}
            <button
              onClick={handleRestoreOriginal}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-md transition-colors disabled:opacity-50 text-xs"
              title="Restore original logo"
            >
              🔄
            </button>
            {/* Position adjustment controls */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Adjust position:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Center', value: 'center' },
                  { label: 'Top', value: 'top' },
                  { label: 'Bottom', value: 'bottom' },
                  { label: 'Left', value: 'left' },
                  { label: 'Right', value: 'right' },
                  { label: 'Top Left', value: 'top left' },
                  { label: 'Top Right', value: 'top right' },
                  { label: 'Bottom Left', value: 'bottom left' },
                  { label: 'Bottom Right', value: 'bottom right' }
                ].map(position => (
                  <button
                    key={position.value}
                    onClick={() => handlePositionChange(position.value)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      (userProfile?.logoPosition || 'center') === position.value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {position.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="py-4">
            <FaSpinner className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">Uploading logo...</p>
            <button
              onClick={() => {
                setUploading(false);
                console.log('Upload canceled by user');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel Upload
            </button>
          </div>
        ) : (
          <>
            <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {previewUrl ? 'Replace Logo' : 'Upload Your Logo'}
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop your image here, or click to select
            </p>
            <button
              onClick={handleClickUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <FaUpload className="w-4 h-4" />
              Choose File
            </button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Supported formats: JPEG, PNG, WebP, GIF</p>
              <p>Maximum file size: 5MB</p>
              <p>Recommended size: 400x400 pixels</p>
            </div>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 