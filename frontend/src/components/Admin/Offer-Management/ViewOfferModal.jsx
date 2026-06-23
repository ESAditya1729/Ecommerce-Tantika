// src/components/Modals/ViewOfferModal.jsx
import React from 'react';
import { X, Calendar, Clock, Tag, Percent, Gift, ShoppingBag } from 'lucide-react';

const ViewOfferModal = ({ isOpen, onClose, offer }) => {
  if (!isOpen || !offer) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDiscountedPrice = () => {
    if (!offer?.discount?.isActive || !offer?.discount?.value) {
      return null;
    }

    const { type, value } = offer.discount;
    if (type === 'percentage') {
      return offer.price - (offer.price * value / 100);
    } else if (type === 'fixed') {
      return Math.max(0, offer.price - value);
    }
    return null;
  };

  const getDiscountDisplay = () => {
    if (!offer?.discount) return 'No discount';
    
    const { type, value } = offer.discount;
    if (type === 'percentage') {
      return `${value}% OFF`;
    } else if (type === 'fixed') {
      return `₹${value} OFF`;
    }
    return 'Special Offer';
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasActiveDiscount = offer?.discount?.isActive && offer?.discount?.value > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Discount Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Product Info */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                {offer.images && offer.images.length > 0 && (
                  <img
                    src={offer.images[0]}
                    alt={offer.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{offer.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {offer.category || 'Uncategorized'}
                  </p>
                  {offer.artisan && (
                    <p className="text-sm text-gray-500">
                      By: {typeof offer.artisan === 'object' ? offer.artisan.businessName || offer.artisan.name : offer.artisan}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Discount Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Discount Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Discount Type</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {offer.discount?.type || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Discount Value</div>
                  <div className="font-medium text-gray-900">
                    {getDiscountDisplay()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className={`font-medium ${hasActiveDiscount ? 'text-green-600' : 'text-red-600'}`}>
                    {hasActiveDiscount ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Original Price</div>
                  <div className="font-medium text-gray-900">
                    ₹{offer.price?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>

              {hasActiveDiscount && discountedPrice !== null && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-600">Discounted Price</div>
                      <div className="text-2xl font-bold text-green-700">
                        ₹{discountedPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-600">You Save</div>
                      <div className="text-lg font-bold text-green-700">
                        ₹{(offer.price - discountedPrice).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600">
                        ({((offer.price - discountedPrice) / offer.price * 100).toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Validity Period</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Start Date</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(offer.discount?.startDate)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>End Date</span>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatDate(offer.discount?.endDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xs text-blue-600 mb-1">Stock</div>
                <div className="text-lg font-bold text-gray-900">{offer.stock || 0}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-xs text-purple-600 mb-1">Sales</div>
                <div className="text-lg font-bold text-gray-900">{offer.sales || 0}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-xs text-amber-600 mb-1">Rating</div>
                <div className="text-lg font-bold text-gray-900">{offer.rating?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferModal;