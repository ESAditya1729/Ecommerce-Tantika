import React, { useState } from 'react';
import { 
  CheckCircle, MessageSquare, Mail, Phone, Printer, 
  MapPin, ExternalLink 
} from 'lucide-react';
import StatusBadge from '../Admin/Order-Management/StatusBadge';
import PaymentBadge from '../Admin/Order-Management/PaymentBadge';
import { STATUS_CONFIG, STATUS_FLOW } from '../Admin/Order-Management/constants';

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await onStatusUpdate(order._id, newStatus, notes);
      setNotes('');
      alert(`Order status updated to ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleContactWhatsApp = () => {
    const message = `Hello ${order.customerDetails.name}, this is তন্তিকা regarding your order ${order.orderNumber}`;
    const phoneNumber = order.customerDetails.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContactEmail = () => {
    const subject = `Regarding your order ${order.orderNumber}`;
    const body = `Hello ${order.customerDetails.name},\n\nThis is regarding your order ${order.orderNumber} for ${order.productName}.\n\nBest regards,\nতন্তিকা Team`;
    window.open(`mailto:${order.customerDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleCallCustomer = () => {
    window.open(`tel:${order.customerDetails.phone}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'customer':
        return renderCustomerTab();
      case 'history':
        return renderHistoryTab();
      default:
        return renderDetailsTab();
    }
  };

  const renderDetailsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Order Info */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Order Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <PaymentBadge method={order.paymentMethod} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium capitalize">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Product Information</h4>
          <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
            {order.productImage && (
              <img 
                src={order.productImage} 
                alt={order.productName}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <p className="font-medium">{order.productName}</p>
              <p className="text-sm text-gray-600">Artisan: {order.artisan}</p>
              <p className="text-sm text-gray-600">Location: {order.productLocation}</p>
              <p className="font-bold text-lg">₹{order.productPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {order.adminNotes && order.adminNotes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Admin Notes</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {order.adminNotes.map((note, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {note.addedBy} • {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Message & Status Update */}
      <div>
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">Customer Message</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{order.customerDetails.message || 'No message provided'}</p>
          </div>
        </div>

        {/* Status Update Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Update Order Status</h4>
          <div className="space-y-3">
            {STATUS_FLOW[order.status]?.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={loading}
                className={`w-full px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center ${STATUS_CONFIG[nextStatus]?.bgColor.replace('bg-', 'bg-').replace('-100', '-600')}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as {STATUS_CONFIG[nextStatus]?.label}
              </button>
            ))}
          </div>

          {/* Notes Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Note (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerTab = () => (
    <div className="space-y-6">
      {/* Customer Details */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Customer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-medium">{order.customerDetails.name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{order.customerDetails.email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{order.customerDetails.phone}</p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Shipping Address
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">{order.customerDetails.address}</p>
          <p className="text-gray-600">
            {order.customerDetails.city}, {order.customerDetails.state} - {order.customerDetails.pincode}
          </p>
        </div>
      </div>

      {/* Contact Actions */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Quick Contact</h4>
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
    </div>
  );

  const renderHistoryTab = () => (
    <div>
      <h4 className="font-medium text-gray-700 mb-2">Contact History</h4>
      {order.contactHistory && order.contactHistory.length > 0 ? (
        <div className="space-y-3">
          {order.contactHistory.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">{contact.method}</p>
                  <p className="text-gray-600 text-sm mt-1">{contact.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(contact.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">By {contact.contactedBy}</p>
                </div>
              </div>
              {contact.nextFollowUp && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    Next follow-up: {new Date(contact.nextFollowUp).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No contact history yet</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-600">{order.orderNumber}</p>
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
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'customer' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Customer Info
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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