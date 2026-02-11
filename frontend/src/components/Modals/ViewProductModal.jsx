// src/components/Modals/ViewProductModal.jsx
import React from 'react';
import { X, Star, Package, DollarSign, TrendingUp, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ViewProductModal = ({ showViewModal, setShowViewModal, selectedProduct }) => {
  if (!showViewModal || !selectedProduct) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      out_of_stock: { color: 'red', label: 'Out of Stock' },
      low_stock: { color: 'yellow', label: 'Low Stock' },
      draft: { color: 'gray', label: 'Draft' },
      archived: { color: 'gray', label: 'Archived' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  const getApprovalStatusBadge = (status) => {
    const approvalConfig = {
      approved: { 
        color: 'green', 
        label: 'Approved',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      },
      pending: { 
        color: 'yellow', 
        label: 'Pending Approval',
        icon: <Clock className="w-4 h-4 mr-1" />
      },
      rejected: { 
        color: 'red', 
        label: 'Rejected',
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      },
      under_review: { 
        color: 'blue', 
        label: 'Under Review',
        icon: <Clock className="w-4 h-4 mr-1" />
      },
      draft: { 
        color: 'gray', 
        label: 'Draft',
        icon: <Clock className="w-4 h-4 mr-1" />
      }
    };
    const config = approvalConfig[status] || approvalConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              
              {/* Specifications */}
              {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Specifications</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedProduct.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between border-b border-gray-200 pb-2 last:border-0">
                          <span className="text-sm text-gray-600 font-medium">{spec.key}:</span>
                          <span className="text-sm text-gray-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Header with Statuses */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedProduct.category}
                  </span>
                  {getStatusBadge(selectedProduct.status)}
                  {selectedProduct.approvalStatus && getApprovalStatusBadge(selectedProduct.approvalStatus)}
                </div>
                
                {/* SKU */}
                {selectedProduct.sku && (
                  <div className="text-sm text-gray-500 mt-2">
                    SKU: <span className="font-mono font-medium">{selectedProduct.sku}</span>
                  </div>
                )}
              </div>

              {/* Artisan Information */}
              {selectedProduct.artisan && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">Artisan Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {selectedProduct.artisanName?.charAt(0) || 
                           selectedProduct.artisan?.businessName?.charAt(0) || 
                           selectedProduct.artisan?.fullName?.charAt(0) || 
                           'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedProduct.artisanName || 
                           selectedProduct.artisan?.businessName || 
                           selectedProduct.artisan?.fullName || 
                           'Artisan'}
                        </p>
                        {selectedProduct.artisan?.email && (
                          <p className="text-sm text-gray-500">{selectedProduct.artisan.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Additional Artisan Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedProduct.artisan?.specialization && (
                        <div>
                          <span className="text-gray-600">Specialization: </span>
                          <span className="font-medium text-gray-800">
                            {selectedProduct.artisan.specialization.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {selectedProduct.artisan?.yearsOfExperience !== undefined && (
                        <div>
                          <span className="text-gray-600">Experience: </span>
                          <span className="font-medium text-gray-800">
                            {selectedProduct.artisan.yearsOfExperience} years
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    {selectedProduct.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
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

              {/* Variants */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Product Variants</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedProduct.variants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                          <div>
                            <span className="font-medium text-gray-900">{variant.name}</span>
                            {variant.price && (
                              <span className="ml-2 text-sm text-green-600">₹{variant.price}</span>
                            )}
                          </div>
                          {variant.stock !== undefined && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              variant.stock > 10 ? 'bg-green-100 text-green-800' :
                              variant.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {variant.stock} in stock
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dates and IDs */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Product ID</h4>
                  <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    {selectedProduct._id || 'N/A'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {selectedProduct.createdAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                      <p className="text-sm text-gray-500">{formatDate(selectedProduct.createdAt)}</p>
                    </div>
                  )}
                  
                  {selectedProduct.updatedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h4>
                      <p className="text-sm text-gray-500">{formatDate(selectedProduct.updatedAt)}</p>
                    </div>
                  )}
                  
                  {selectedProduct.submittedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Submitted for Approval</h4>
                      <p className="text-sm text-gray-500">{formatDate(selectedProduct.submittedAt)}</p>
                    </div>
                  )}
                  
                  {selectedProduct.approvedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Approved On</h4>
                      <p className="text-sm text-gray-500">{formatDate(selectedProduct.approvedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;