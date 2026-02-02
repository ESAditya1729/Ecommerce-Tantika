import React from 'react';
import { Check, X } from 'lucide-react';

const BulkActions = ({ 
  selectedCount, 
  onBulkApprove, 
  onBulkReject, 
  onClearSelection 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{selectedCount} artisan(s) selected</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBulkApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve Selected
          </button>
          <button
            onClick={onBulkReject}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject Selected
          </button>
          <button
            onClick={onClearSelection}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;