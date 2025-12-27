// src/components/Modals/ViewProductModal.jsx
import React from 'react';
import { X, Star, Package, DollarSign, TrendingUp } from 'lucide-react';

const ViewProductModal = ({ showViewModal, setShowViewModal, selectedProduct }) => {
  if (!showViewModal || !selectedProduct) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      out_of_stock: { color: 'red', label: 'Out of Stock' },
      low_stock: { color: 'yellow', label: 'Low Stock' },
      draft: { color: 'gray', label: 'Draft' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Product Images</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(selectedProduct.images && selectedProduct.images.length > 0) ? (
                    selectedProduct.images.map((img, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={img}
                          alt={`${selectedProduct.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))
                  ) : selectedProduct.image ? (
                    <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border border-gray-200 flex items-center justify-center bg-gray-100">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedProduct.category}
                  </span>
                  {getStatusBadge(selectedProduct.status)}
                </div>
              </div>

              <div>
                <p className="text-gray-600 mb-4">{selectedProduct.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedProduct.price?.toLocaleString()}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Package className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Stock</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock || 0} units</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Rating</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-2">
                      {selectedProduct.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500">/5.0</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Total Sales</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedProduct.sales || 0} units</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Product ID</h4>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  {selectedProduct._id || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;