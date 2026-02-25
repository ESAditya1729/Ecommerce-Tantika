import React, { useState } from 'react';
import {
  Package, User, MapPin, Calendar, DollarSign,
  Clock, MessageSquare, Phone, Mail, X,
  ChevronRight, AlertCircle, Info, Truck,
  CheckCircle, Award, Edit3, FileText
} from 'lucide-react';

const ArtisanOrderViewModal = ({ order, onClose, onUpdateStatus, onAddNote }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;

  // Status configuration (simplified for artisan)
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      next: ['confirmed', 'cancelled']
    },
    confirmed: { 
      label: 'Confirmed', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      next: ['processing', 'cancelled']
    },
    processing: { 
      label: 'Processing', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Package,
      next: ['ready_to_ship', 'cancelled']
    },
    ready_to_ship: { 
      label: 'Ready to Ship', 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Package,
      next: ['shipped', 'cancelled']
    },
    shipped: { 
      label: 'Shipped', 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Truck,
      next: []
    },
    delivered: { 
      label: 'Delivered', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      next: []
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: X,
      next: []
    },
    refunded: { 
      label: 'Refunded', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle,
      next: []
    }
  };

  // Payment status config
  const paymentConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const config = paymentConfig[status] || paymentConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAvailableStatuses = () => {
    const currentConfig = statusConfig[order.status];
    if (!currentConfig || !currentConfig.next) return [];
    
    return currentConfig.next.map(status => ({
      value: status,
      label: statusConfig[status]?.label || status
    }));
  };

  const calculateArtisanTotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => {
      return sum + (item.totalPrice || (item.price * item.quantity) || 0);
    }, 0);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this order as ${statusConfig[newStatus]?.label}?`)) {
      return;
    }

    setUpdatingStatus(true);
    setError('');
    
    try {
      await onUpdateStatus(order._id, newStatus);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    setError('');
    
    try {
      await onAddNote(order._id, newNote);
      setNewNote('');
    } catch (err) {
      setError(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const getCustomerInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const availableStatuses = getAvailableStatuses();

  // Products Tab
  const renderProductsTab = () => (
    <div className="space-y-6">
      {/* Products List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-600" />
            Your Products in this Order
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {order.items?.map((item, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center">
                      <Package className="h-8 w-8 text-amber-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-gray-500 mt-0.5">Variant: {item.variant}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.totalPrice || (item.price * item.quantity))}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Product Specifications */}
                  {item.specifications && Object.keys(item.specifications).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <span key={key} className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Items:</span>
            <span className="font-medium text-gray-900">{order.items?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Your Subtotal:</span>
            <span className="font-bold text-lg text-amber-600">{formatCurrency(calculateArtisanTotal())}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About this order</p>
            <p>This order shows only your products. The customer may have ordered items from other artisans as well.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Customer Tab
  const renderCustomerTab = () => (
    <div className="space-y-6">
      {/* Customer Profile Card */}
      <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-700">
              {getCustomerInitials(order.customer?.name)}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{order.customer?.name || 'Customer'}</h3>
            <p className="text-sm text-gray-500 mt-1">Customer since {formatDate(order.customer?.createdAt).split(',')[0]}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-600" />
            Contact Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {order.customer?.email && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href={`mailto:${order.customer.email}`} className="text-sm font-medium text-gray-900 hover:text-amber-600">
                  {order.customer.email}
                </a>
              </div>
            </div>
          )}
          
          {order.customer?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <a href={`tel:${order.customer.phone}`} className="text-sm font-medium text-gray-900 hover:text-amber-600">
                  {order.customer.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            Shipping Address
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-900 font-medium">{order.customer?.shippingAddress?.street}</p>
          <p className="text-gray-600 mt-1">
            {order.customer?.shippingAddress?.city}, {order.customer?.shippingAddress?.state} - {order.customer?.shippingAddress?.postalCode}
          </p>
          <p className="text-gray-600">{order.customer?.shippingAddress?.country || 'India'}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {order.customer?.phone && (
            <a
              href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer?.name}, regarding your order ${order.orderNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {order.customer?.phone && (
            <a
              href={`tel:${order.customer.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          {order.customer?.email && (
            <a
              href={`mailto:${order.customer.email}?subject=Regarding your order ${order.orderNumber}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // Details Tab
  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Order Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Order Status
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <div className="mt-2">{getStatusBadge(order.status)}</div>
            </div>
            {order.payment?.status && (
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="mt-2">{getPaymentBadge(order.payment.status)}</div>
              </div>
            )}
          </div>

          {/* Status Update */}
          {availableStatuses.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={updatingStatus}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      status.value === 'cancelled'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : statusConfig[status.value]?.color.replace('text-', 'text-white bg-').replace('border-', '')
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            Order Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Order Number</p>
              <p className="font-medium text-gray-900 mt-1">{order.orderNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900 mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900 mt-1 uppercase">
                {order.payment?.method === 'cod' ? 'Cash on Delivery' : order.payment?.method || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="font-bold text-lg text-amber-600 mt-1">{formatCurrency(order.total || calculateArtisanTotal())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Order Timeline
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order Placed</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            
            {order.statusHistory?.map((history, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-3 w-3 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{history.status}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(history.changedAt)}</p>
                </div>
              </div>
            ))}
            
            {order.shipping?.shippedAt && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="h-3 w-3 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Shipped</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.shipping.shippedAt)}</p>
                </div>
              </div>
            )}
            
            {order.shipping?.deliveredAt && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivered</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.shipping.deliveredAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Notes Tab
  const renderNotesTab = () => (
    <div className="space-y-6">
      {/* Notes List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            Order Notes
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {order.notes?.length > 0 ? (
            order.notes.map((note, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{note.note}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="capitalize">{note.type?.replace(/_/g, ' ') || 'Note'}</span>
                      <span>•</span>
                      <span>{formatDate(note.createdAt)}</span>
                      {note.addedBy && (
                        <>
                          <span>•</span>
                          <span>By: {note.addedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-gray-600">No notes yet for this order</p>
              <p className="text-sm text-gray-400 mt-1">Add a note to keep track of important information</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Note */}
      {!['delivered', 'cancelled', 'refunded'].includes(order.status) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Add a Note</h3>
          <div className="space-y-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here... (e.g., customer requested changes, special instructions, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {addingNote ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Add Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProductsTab();
      case 'customer':
        return renderCustomerTab();
      case 'details':
        return renderDetailsTab();
      case 'notes':
        return renderNotesTab();
      default:
        return renderProductsTab();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-medium">{order.orderNumber}</span>
              <span>•</span>
              <span>{formatDate(order.createdAt)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-8 mt-2">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'customer'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Customer
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Notes
              {order.notes?.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                  {order.notes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtisanOrderViewModal;