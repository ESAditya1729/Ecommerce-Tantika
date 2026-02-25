import React, { useState } from 'react';
import { 
  CheckCircle, MessageSquare, Mail, Phone, Printer, 
  MapPin, ExternalLink, Package, User, Clock, FileText,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../Admin/Order-Management/StatusBadge';
import PaymentBadge from '../Admin/Order-Management/PaymentBadge';

// Status configuration
const STATUS_CONFIG = {
  pending: { label: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', next: ['contacted', 'confirmed', 'cancelled'] },
  contacted: { label: 'Contacted', bgColor: 'bg-blue-100', textColor: 'text-blue-800', next: ['confirmed', 'processing', 'cancelled'] },
  confirmed: { label: 'Confirmed', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', next: ['processing', 'cancelled'] },
  processing: { label: 'Processing', bgColor: 'bg-purple-100', textColor: 'text-purple-800', next: ['shipped', 'cancelled'] },
  shipped: { label: 'Shipped', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', next: ['delivered', 'cancelled'] },
  delivered: { label: 'Delivered', bgColor: 'bg-green-100', textColor: 'text-green-800', next: [] },
  cancelled: { label: 'Cancelled', bgColor: 'bg-red-100', textColor: 'text-red-800', next: [] },
  refunded: { label: 'Refunded', bgColor: 'bg-orange-100', textColor: 'text-orange-800', next: [] },
};

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, onAddContact, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [contactNote, setContactNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  if (!order) return null;

  // Safe data access helpers
  const getCustomerName = () => {
    return order.customerName || 
           order.customerDetails?.name || 
           order.customer?.name || 
           'N/A';
  };

  const getCustomerEmail = () => {
    return order.customerEmail || 
           order.customerDetails?.email || 
           order.customer?.email || 
           'N/A';
  };

  const getCustomerPhone = () => {
    return order.customerPhone || 
           order.customerDetails?.phone || 
           order.customer?.phone || 
           'N/A';
  };

  const getCustomerAddress = () => {
    const address = order.customerAddress || 
                   order.customerDetails?.address || 
                   order.customer?.shippingAddress || 
                   order.customer?.address;
    
    if (!address) return 'No address provided';
    
    if (typeof address === 'string') return address;
    
    return `${address.street || ''}, ${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}, ${address.country || 'India'}`
      .replace(/, ,/g, ',')
      .replace(/^, |, $/g, '')
      .trim() || 'No address provided';
  };

  const getCustomerMessage = () => {
    return order.customerDetails?.message || 
           order.customer?.message || 
           order.message || 
           'No special instructions';
  };

  const getProductName = () => {
    if (order.items && order.items.length > 0) {
      if (order.items.length === 1) {
        return order.items[0].name || 'Product';
      }
      return `${order.items.length} Items`;
    }
    return order.productName || 'Product';
  };

  const getProductPrice = () => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    }
    return order.total || order.productPrice || 0;
  };

  const getArtisanName = () => {
    if (order.items && order.items.length > 0) {
      return order.items[0].artisanName || 'Unknown';
    }
    return order.artisanName || order.artisan || 'Unknown';
  };

  const getPaymentMethod = () => {
    return order.paymentMethod || order.payment?.method || 'cod';
  };

  const getPaymentStatus = () => {
    return order.paymentStatus || order.payment?.status || 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
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
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await onStatusUpdate(order._id, newStatus, notes);
      setNotes('');
      alert(`Order status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactNote) {
      alert('Please add a contact note');
      return;
    }

    try {
      setLoading(true);
      await onAddContact(order._id, {
        method: contactMethod,
        notes: contactNote,
        contactedAt: new Date().toISOString()
      });
      setContactNote('');
      alert('Contact record added successfully');
    } catch (error) {
      alert('Failed to add contact record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason) {
      alert('Please provide a cancellation reason');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setLoading(true);
      await onCancel(order._id, cancellationReason);
      onClose();
    } catch (error) {
      alert('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleContactWhatsApp = () => {
    const phone = getCustomerPhone();
    const name = getCustomerName();
    if (!phone || phone === 'N/A') {
      alert('Customer phone number not available');
      return;
    }
    
    const message = `Hello ${name}, this is তন্তিকা regarding your order ${order.orderNumber}. How can we help you today?`;
    const phoneNumber = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Auto-add contact record
    onAddContact(order._id, {
      method: 'whatsapp',
      notes: 'Contacted via WhatsApp',
    }).catch(() => {});
  };

  const handleContactEmail = () => {
    const email = getCustomerEmail();
    const name = getCustomerName();
    if (!email || email === 'N/A') {
      alert('Customer email not available');
      return;
    }

    const subject = `Regarding your order ${order.orderNumber}`;
    const body = `Hello ${name},\n\nThis is regarding your order ${order.orderNumber}.\n\nBest regards,\nতন্তিকা Team`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    
    // Auto-add contact record
    onAddContact(order._id, {
      method: 'email',
      notes: 'Contacted via Email',
    }).catch(() => {});
  };

  const handleCallCustomer = () => {
    const phone = getCustomerPhone();
    if (!phone || phone === 'N/A') {
      alert('Customer phone number not available');
      return;
    }
    window.open(`tel:${phone}`);
    
    // Auto-add contact record
    onAddContact(order._id, {
      method: 'phone',
      notes: 'Called customer',
    }).catch(() => {});
  };

  const renderDetailsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Info */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Order Information
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.orderNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={order.status || 'pending'} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <PaymentBadge method={getPaymentMethod()} status={getPaymentStatus()} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium capitalize">{getPaymentStatus()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-green-600">{formatCurrency(order.total || getProductPrice())}</span>
            </div>
          </div>
        </div>

        {/* Customer Message */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Customer Message</h4>
          <div className="p-3 bg-white rounded border">
            <p className="text-gray-700">{getCustomerMessage()}</p>
          </div>
        </div>
      </div>

      {/* Product Info & Status Update */}
      <div className="space-y-4">
        {/* Product Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Product Information
          </h4>
          <div className="flex items-start space-x-4">
            {order.productImage && (
              <img 
                src={order.productImage} 
                alt={getProductName()}
                className="w-20 h-20 object-cover rounded border"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{getProductName()}</p>
              <p className="text-sm text-gray-600">Artisan: {getArtisanName()}</p>
              {order.items && order.items.length > 1 && (
                <p className="text-sm text-gray-600">Items: {order.items.length}</p>
              )}
              <p className="font-bold text-lg mt-2">{formatCurrency(order.total || getProductPrice())}</p>
            </div>
          </div>

          {/* Items List for multiple items */}
          {order.items && order.items.length > 1 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium mb-2">Items:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Update Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Update Order Status</h4>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_CONFIG[order.status]?.next?.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center ${STATUS_CONFIG[nextStatus]?.bgColor.replace('bg-', 'bg-').replace('-100', '-600') || 'bg-blue-600'}`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as {STATUS_CONFIG[nextStatus]?.label || nextStatus}
                </button>
              ))}
              {(!STATUS_CONFIG[order.status]?.next || STATUS_CONFIG[order.status].next.length === 0) && (
                <p className="text-sm text-gray-500">No further status updates available</p>
              )}
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Note (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Cancellation Section - Only for non-cancelled orders */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </h4>
            <div className="space-y-3">
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="2"
              />
              <button
                onClick={handleCancelOrder}
                disabled={loading || !cancellationReason}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomerTab = () => (
    <div className="space-y-6">
      {/* Customer Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Customer Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded border">
            <p className="text-xs text-gray-500">Full Name</p>
            <p className="font-medium">{getCustomerName()}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium break-all">{getCustomerEmail()}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-xs text-gray-500">Phone</p>
            <p className="font-medium">{getCustomerPhone()}</p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Shipping Address
        </h4>
        <div className="p-3 bg-white rounded border">
          <p className="font-medium">{getCustomerAddress()}</p>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Quick Contact</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleContactWhatsApp}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </button>
          <button
            onClick={handleContactEmail}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </button>
          <button
            onClick={handleCallCustomer}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </button>
        </div>
      </div>

      {/* Add Contact Record */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Add Contact Record</h4>
        <div className="space-y-3">
          <select
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="in_person">In Person</option>
          </select>
          <textarea
            value={contactNote}
            onChange={(e) => setContactNote(e.target.value)}
            placeholder="Contact notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <button
            onClick={handleAddContact}
            disabled={loading || !contactNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add Contact Record
          </button>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div>
      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Contact History
      </h4>
      {order.contactHistory && order.contactHistory.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {order.contactHistory.map((contact, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                    {contact.method || 'Unknown'}
                  </span>
                  <p className="text-gray-700">{contact.notes || 'No notes'}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{contact.createdAt ? formatDate(contact.createdAt) : 'N/A'}</p>
                  {contact.contactedBy && (
                    <p className="text-xs">By: {contact.contactedBy}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No contact history yet</p>
        </div>
      )}
    </div>
  );

  const renderItemsTab = () => (
    <div>
      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
        <Package className="w-4 h-4 mr-2" />
        Order Items
      </h4>
      {order.items && order.items.length > 0 ? (
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border flex items-start space-x-4">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Artisan: {item.artisanName || 'Unknown'}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm">Quantity: {item.quantity || 1}</p>
                  <p className="font-bold">{formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                </div>
                {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}
              </div>
            </div>
          ))}
          
          {/* Order Summary */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h5 className="font-medium mb-2">Order Summary</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(order.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No items found</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'customer':
        return renderCustomerTab();
      case 'history':
        return renderHistoryTab();
      case 'items':
        return renderItemsTab();
      default:
        return renderDetailsTab();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-600">{order.orderNumber || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'customer' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Customer Info
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'items' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Contact History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}

          {/* Action Buttons */}
          <div className="border-t pt-6 mt-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;