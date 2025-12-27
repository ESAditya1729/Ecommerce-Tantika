// components/DeleteConfirmationModal.jsx
import React from 'react';
import { AlertCircle, Loader } from 'lucide-react';

const DeleteConfirmationModal = ({
  showDeleteModal,
  setShowDeleteModal,
  selectedProduct,
  actionLoading,
  handleDeleteProduct
}) => {
  if (!showDeleteModal || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{selectedProduct.name}</span>? 
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProduct}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {actionLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;