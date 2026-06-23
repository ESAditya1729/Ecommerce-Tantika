// src/components/Admin/Offer-Management/DeleteConfirmationModal.jsx
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  offer, 
  loading 
}) => {
  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Offer
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-gray-700">
                Are you sure you want to delete the following offer?
              </p>
            </div>

            {/* Offer Details */}
            {offer && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {offer.name}
                    </p>
                    {offer.offerCode && (
                      <p className="text-sm text-gray-500 font-mono">
                        Code: {offer.offerCode}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="capitalize">
                        Type: {offer.offerType}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>
                        Status: <span className={`font-medium ${
                          offer.status === 'active' ? 'text-green-600' :
                          offer.status === 'draft' ? 'text-gray-600' :
                          offer.status === 'expired' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discount Info */}
                {offer.rules && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Discount:</span>
                      <span className="text-blue-600 font-semibold">
                        {offer.rules.discountType === 'percentage' 
                          ? `${offer.rules.discountValue}% OFF`
                          : offer.rules.discountType === 'fixed_amount'
                          ? `₹${offer.rules.discountValue} OFF`
                          : offer.rules.discountType?.replace('_', ' ') || 'Special Offer'
                        }
                      </span>
                    </div>
                    {offer.usageStats && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>Used: {offer.usageStats.totalUses || 0} times</span>
                        <span className="text-gray-300">|</span>
                        <span>Revenue: ₹{(offer.usageStats.totalRevenue || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Warning Message */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p className="mt-0.5">
                  Deleting this offer will permanently remove it from the system. 
                  This action cannot be undone and may affect existing orders or 
                  promotions that are currently using this offer.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export as default for convenience
export default DeleteConfirmationModal;