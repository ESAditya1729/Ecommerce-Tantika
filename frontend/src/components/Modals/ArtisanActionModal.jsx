import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, CreditCard, Info } from 'lucide-react';

const ActionModal = ({ 
  type, 
  artisan, 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const modalConfigs = {
    approve: {
      title: 'Approve Artisan',
      description: 'Are you sure you want to approve this artisan?',
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      color: 'green',
      placeholder: 'Add optional notes for the artisan (e.g., welcome message, recommendations)...',
      buttonText: 'Approve',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      requireReason: false
    },
    reject: {
      title: 'Reject Artisan Application',
      description: 'Please provide a detailed reason for rejection. This will be shared with the artisan.',
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      color: 'red',
      placeholder: 'Enter detailed rejection reason...',
      buttonText: 'Reject Application',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      requireReason: true
    },
    suspend: {
      title: 'Suspend Artisan Account',
      description: 'Please provide a reason for suspension. The artisan will be notified.',
      icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      color: 'orange',
      placeholder: 'Enter suspension reason (e.g., policy violation, quality issues)...',
      buttonText: 'Suspend Account',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      requireReason: true
    },
    verifyBank: {
      title: 'Verify Bank Details',
      description: 'Verify the bank details for this artisan. This will enable payout processing.',
      icon: <CreditCard className="w-12 h-12 text-blue-500" />,
      color: 'blue',
      placeholder: 'Add verification notes (optional)...',
      buttonText: 'Verify Bank Details',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      requireReason: false
    }
  };

  const config = modalConfigs[type] || modalConfigs.approve;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (config.requireReason && !reason.trim()) {
      alert('Reason is required');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason: reason.trim(),
        notes: notes.trim()
      });
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {config.icon}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-gray-600">
                    {artisan?.businessName || artisan?.fullName || 'Artisan'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Artisan Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                {artisan?.businessName?.charAt(0) || artisan?.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium">{artisan?.businessName || 'No Business Name'}</p>
                <p className="text-sm text-gray-600">{artisan?.fullName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">{config.description}</p>

          <form onSubmit={handleSubmit}>
            {/* Reason/Notes Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.requireReason ? 'Reason *' : 'Notes (Optional)'}
              </label>
              <textarea
                value={config.requireReason ? reason : notes}
                onChange={(e) => config.requireReason ? setReason(e.target.value) : setNotes(e.target.value)}
                placeholder={config.placeholder}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required={config.requireReason}
                disabled={loading}
              />
              {config.requireReason && (
                <p className="mt-2 text-sm text-gray-500">
                  This information will be shared with the artisan
                </p>
              )}
            </div>

            {/* Warning Messages */}
            {type === 'reject' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Important</p>
                    <p className="text-sm text-red-700 mt-1">
                      Rejecting an application will:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Remove artisan privileges from the user account</li>
                      <li>Send a rejection email to the applicant</li>
                      <li>Prevent them from reapplying with the same email</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {type === 'suspend' && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Note</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Suspending an account will:
                    </p>
                    <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Deactivate the user's account temporarily</li>
                      <li>Hide all their products from the marketplace</li>
                      <li>Prevent them from receiving new orders</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
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
                disabled={loading || (config.requireReason && !reason.trim())}
                className={`flex-1 px-4 py-3 text-white rounded-lg disabled:opacity-50 transition-colors ${config.buttonColor}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  config.buttonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;