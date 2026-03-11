// src/components/Common/ProfileImageUpload.jsx
import React, { useState } from 'react';
import { Upload, X, User } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProfileImageUpload = ({ onImageUpload, existingImage = '', userName = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage);
  const [progress, setProgress] = useState(0);

  // Safe function call
  const safeImageUpload = (url) => {
    if (typeof onImageUpload === 'function') {
      onImageUpload(url);
    } else {
      console.error('❌ onImageUpload is not a function!');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file (smaller size for profile pics)
    if (file.size > 5 * 1024 * 1024) { // 5MB for profile pics
      alert('File size too large! Maximum size is 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type! Please upload JPG, PNG, or WebP images.');
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload through backend
    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Get auth headers
      const token = localStorage.getItem('tantika_token') || sessionStorage.getItem('tantika_token');
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to your backend - using the profile picture upload endpoint
      const response = await axios.post(`${API_URL}/upload/pfpupload`, formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        safeImageUpload(response.data.url);
        setTimeout(() => {
          alert('Profile picture uploaded successfully!');
        }, 300);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
      setPreview(existingImage); // Revert to existing image on error
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRemove = () => {
    setPreview('');
    safeImageUpload('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Profile Picture
      </label>
      
      <div className="space-y-4">
        {/* Preview - Circular for profile pics */}
        {preview ? (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
              <img
                src={preview}
                alt={userName ? `${userName}'s profile` : "Profile preview"}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Upload section */}
        <div className="space-y-2">
          <label className={`cursor-pointer inline-block w-full max-w-xs ${uploading && 'opacity-50'}`}>
            <div className={`p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
              uploading 
                ? 'border-blue-400 bg-blue-50' 
                : preview 
                ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50' 
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}>
              <div className="flex flex-col items-center justify-center space-y-2">
                {uploading ? (
                  <>
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-200 rounded-full"></div>
                        <div 
                          className="absolute w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                          style={{ transform: `rotate(${progress * 3.6}deg)` }}
                        ></div>
                      </div>
                      <span className="absolute -bottom-6 text-sm font-medium text-blue-600">
                        {progress}%
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-500" />
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700 block">
                        {preview ? 'Change Picture' : 'Upload Profile Picture'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        Click to browse
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          
          {/* Progress bar */}
          {uploading && progress > 0 && (
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supports JPG, PNG, WebP formats</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended: Square image, at least 400x400 pixels</p>
        <p className="text-blue-600 font-medium">✓ Your picture will be cropped to a circle</p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;