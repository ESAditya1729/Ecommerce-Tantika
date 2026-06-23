// src/components/Modals/EditOfferModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditOfferModal = ({ isOpen, onClose, offer, product, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    type: 'percentage',
    value: 0,
    isActive: false,
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (offer && offer.discount) {
      // Populate from the product's discount data
      const discount = offer.discount;
      setFormData({
        type: discount.type || 'percentage',
        value: discount.value || 0,
        isActive: discount.isActive || false,
        startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
        endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : '',
      });
    } else if (product && product.discount) {
      // Alternative: if product is passed directly
      const discount = product.discount;
      setFormData({
        type: discount.type || 'percentage',
        value: discount.value || 0,
        isActive: discount.isActive || false,
        startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
        endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [offer, product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate discount value
    if (formData.value <= 0) {
      newErrors.value = 'Discount value must be greater than 0';
    }
    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage discount cannot exceed 100%';
    }

    // Validate dates if provided
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare the data for the API
    const productId = offer?._id || product?._id;
    const discountData = {
      productId: productId,
      discount: {
        type: formData.type,
        value: parseFloat(formData.value),
        isActive: formData.isActive,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      }
    };

    onSubmit(discountData);
  };

  // Get the product name for display
  const productName = offer?.name || product?.name || 'Product';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Discount</h3>
              <p className="text-sm text-gray-500 mt-1">
                Managing discount for: <span className="font-medium text-gray-700">{productName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.value ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.type === 'percentage' 
                    ? 'Enter percentage (0-100)' 
                    : 'Enter fixed amount in INR'}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Activate this discount
                </label>
              </div>

              {/* Current Status Info */}
              {offer?.discount && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Current Discount Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    <div>
                      <span className="font-medium">Type:</span> {offer.discount.type || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Value:</span> {offer.discount.value || 0}
                      {offer.discount.type === 'percentage' ? '%' : ' INR'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 ${offer.discount.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {offer.discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {offer.discount.startDate && (
                      <div>
                        <span className="font-medium">Start:</span> {new Date(offer.discount.startDate).toLocaleDateString()}
                      </div>
                    )}
                    {offer.discount.endDate && (
                      <div>
                        <span className="font-medium">End:</span> {new Date(offer.discount.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Discount'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOfferModal;