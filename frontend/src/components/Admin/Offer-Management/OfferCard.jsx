// src/components/Admin/Offer-Management/OfferCard.jsx
import React, { useState, useEffect } from 'react';
import {
  Percent,
  Clock,
  Gift,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Tag,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
} from 'lucide-react';

const OfferCard = ({ offer, onEdit, onDelete, onView, onToggle, actionLoading }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    // Check if we have discount data with endDate
    const endDate = offer?.discount?.endDate;
    const isActive = offer?.discount?.isActive;
    
    if (endDate && isActive) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining({ days, hours, minutes, total: diff });
        } else {
          setTimeRemaining(null);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, [offer?.discount?.endDate, offer?.discount?.isActive]);

  // Get status from discount
  const getStatus = () => {
    if (!offer?.discount) return 'no_discount';
    if (!offer.discount.isActive) return 'inactive';
    
    const now = new Date();
    const startDate = offer.discount.startDate ? new Date(offer.discount.startDate) : null;
    const endDate = offer.discount.endDate ? new Date(offer.discount.endDate) : null;
    
    if (startDate && now < startDate) return 'scheduled';
    if (endDate && now > endDate) return 'expired';
    if (offer.discount.isActive) return 'active';
    return 'inactive';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'scheduled': return 'Scheduled';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'No Discount';
    }
  };

  const getDiscountDisplay = () => {
    if (!offer?.discount) return 'No Discount';
    
    const { type, value } = offer.discount;
    if (type === 'percentage') {
      return `${value}% OFF`;
    } else if (type === 'fixed') {
      return `₹${value} OFF`;
    }
    return 'Special Offer';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    const { days, hours, minutes } = timeRemaining;
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const status = getStatus();
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusLabel = getStatusLabel(status);
  const hasDiscount = offer?.discount && offer.discount.value > 0;
  const isActive = offer?.discount?.isActive || false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate pr-2">
              {offer.name || 'Unnamed Product'}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor} inline-flex items-center gap-1`}>
                {statusIcon}
                {statusLabel}
              </span>
              {hasDiscount && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  {getDiscountDisplay()}
                </span>
              )}
              {offer.sku && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  SKU: {offer.sku}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              disabled={actionLoading || !hasDiscount}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={hasDiscount ? (isActive ? 'Deactivate' : 'Activate') : 'No discount to toggle'}
            >
              {isActive ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Product Info */}
        <div className="flex items-start gap-2">
          {offer.image && (
            <img 
              src={offer.image} 
              alt={offer.name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Tag className="w-3 h-3" />
              <span>{offer.category || 'Uncategorized'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Package className="w-3 h-3" />
              <span>Stock: {offer.stock || 0}</span>
              {offer.sales !== undefined && (
                <span className="ml-2">Sales: {offer.sales || 0}</span>
              )}
            </div>
          </div>
        </div>

        {/* Discount Details - Always show if has discount */}
        {hasDiscount && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Discount:</span>
              <span className={`font-bold ${isActive ? 'text-red-600' : 'text-gray-500'}`}>
                {getDiscountDisplay()}
              </span>
              {!isActive && (
                <span className="text-xs text-gray-400">(Inactive)</span>
              )}
            </div>
            
            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Start:</span> {formatDate(offer.discount.startDate)}
              </div>
              <div>
                <span className="font-medium">End:</span> {formatDate(offer.discount.endDate)}
              </div>
            </div>

            {/* Price Info */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 line-through">₹{offer.price?.toLocaleString() || 0}</span>
              <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                ₹{offer.discount.type === 'percentage' 
                  ? (offer.price - (offer.price * offer.discount.value / 100)).toFixed(0)
                  : Math.max(0, offer.price - offer.discount.value)
                }
              </span>
              {isActive && offer.discount.type === 'percentage' && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  Save {offer.discount.value}%
                </span>
              )}
            </div>

            {/* Time Remaining - Only show if active */}
            {isActive && status === 'active' && timeRemaining && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">Ends in: {formatTimeRemaining()}</span>
              </div>
            )}

            {/* Inactive message */}
            {!isActive && (
              <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                This discount is currently inactive. Click the toggle button to activate it.
              </div>
            )}
          </>
        )}

        {!hasDiscount && (
          <div className="text-center py-2 text-sm text-gray-400">
            No discount configured
          </div>
        )}
      </div>

      {/* Actions - Always show Edit/Remove if has discount, even if inactive */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 flex items-center justify-between">
        <button
          onClick={onView}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            disabled={!hasDiscount}
            className={`flex items-center gap-1 text-sm transition-colors p-1.5 rounded-lg ${
              hasDiscount 
                ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={hasDiscount ? 'Edit discount' : 'No discount to edit'}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={!hasDiscount}
            className={`flex items-center gap-1 text-sm transition-colors p-1.5 rounded-lg ${
              hasDiscount 
                ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={hasDiscount ? 'Remove discount' : 'No discount to remove'}
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;