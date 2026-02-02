import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, MapPin, Award, Briefcase, AlertCircle } from 'lucide-react';

const EditModal = ({ artisan, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    yearsOfExperience: '',
    status: 'pending',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Initialize form data when artisan changes
  useEffect(() => {
    if (artisan) {
      setFormData({
        businessName: artisan.businessName || '',
        fullName: artisan.fullName || artisan.user?.name || '',
        email: artisan.email || artisan.user?.email || '',
        phone: artisan.phone || artisan.phoneNumber || artisan.user?.phone || '',
        specialization: artisan.specialization || artisan.category || '',
        yearsOfExperience: artisan.yearsOfExperience || '',
        status: artisan.status || 'pending',
        address: artisan.address && typeof artisan.address === 'object' 
          ? {
              street: artisan.address.street || artisan.address.addressLine1 || '',
              city: artisan.address.city || '',
              state: artisan.address.state || '',
              postalCode: artisan.address.postalCode || artisan.address.zipCode || '',
              country: artisan.address.country || ''
            }
          : {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            }
      });
      setErrors({});
      setApiError('');
    }
  }, [artisan]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    // Optional email validation only if email exists
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Address validation
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError('');
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  try {
    // Helper function to safely handle values
    const prepareValue = (value) => {
      if (value === null || value === undefined || value === '') return '';
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'number') return value;
      return String(value).trim();
    };

    // Format the data for API
    const dataToSave = {
      businessName: prepareValue(formData.businessName),
      fullName: prepareValue(formData.fullName),
      phone: prepareValue(formData.phone),
      yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
      status: formData.status || 'pending',
      address: {
        street: prepareValue(formData.address?.street),
        city: prepareValue(formData.address?.city),
        state: prepareValue(formData.address?.state),
        postalCode: prepareValue(formData.address?.postalCode),
        country: prepareValue(formData.address?.country)
      }
    };

    // Handle specialization - convert comma-separated string to array
    if (formData.specialization) {
      if (typeof formData.specialization === 'string' && formData.specialization.includes(',')) {
        // Convert "Pottery,Painting" to ["Pottery", "Painting"]
        dataToSave.specialization = formData.specialization
          .split(',')
          .map(item => prepareValue(item))
          .filter(item => item !== '');
      } else if (typeof formData.specialization === 'string') {
        // Single specialization
        dataToSave.specialization = [prepareValue(formData.specialization)];
      } else if (Array.isArray(formData.specialization)) {
        // Already an array
        dataToSave.specialization = formData.specialization.map(item => prepareValue(item));
      }
    }

    // Add email only if it's different and editable
    const currentEmail = artisan?.email || artisan?.user?.email;
    if (formData.email && prepareValue(formData.email) !== prepareValue(currentEmail)) {
      dataToSave.email = prepareValue(formData.email);
    }

    console.log('Sending update data:', dataToSave); // Debug log
    
    await onSave(dataToSave);
    onClose(); // Close modal on success
  } catch (error) {
    console.error('Error updating artisan:', error);
    setApiError(error.response?.data?.message || error.message || 'Failed to update artisan. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`address.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`address.${field}`];
      setErrors(newErrors);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Artisan</h3>
              <p className="text-gray-600">Update artisan information</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" /> Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading || !artisan?.user?.email} 
                    title={artisan?.user?.email ? "Email cannot be changed (linked to user account)" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                    placeholder="e.g., +91 9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <Building className="w-5 h-5" /> Business Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization / Category
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                    placeholder="e.g., Pottery, Weaving, Jewelry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <MapPin className="w-5 h-5" /> Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                  />
                  {errors['address.city'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors['address.city']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                  />
                  {errors['address.state'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors['address.state']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors['address.country'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                  />
                  {errors['address.country'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors['address.country']}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;