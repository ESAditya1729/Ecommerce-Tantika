import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, Truck, Package, 
  CheckCircle, XCircle, Printer, MessageSquare, RefreshCw,
  AlertCircle, Calendar, Clock, MapPin, ShoppingBag, CreditCard,
  ExternalLink, Phone, Mail
} from 'lucide-react';
import axios from 'axios';

// API configuration - Match with your backend routes
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Status configuration based on your backend
const STATUS_CONFIG = {
  pending: { 
    color: 'yellow', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-800',
    icon: '⏳', 
    label: 'Pending'
  },
  contacted: { 
    color: 'blue', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    icon: '📞', 
    label: 'Contacted'
  },
  confirmed: { 
    color: 'green', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    icon: '✓', 
    label: 'Confirmed'
  },
  processing: { 
    color: 'purple', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-800',
    icon: '🔄', 
    label: 'Processing'
  },
  shipped: { 
    color: 'indigo', 
    bgColor: 'bg-indigo-100', 
    textColor: 'text-indigo-800',
    icon: '🚚', 
    label: 'Shipped'
  },
  delivered: { 
    color: 'green', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    icon: '🎁', 
    label: 'Delivered'
  },
  cancelled: { 
    color: 'red', 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    icon: '✗', 
    label: 'Cancelled'
  },
};

// Status flow based on your backend
const STATUS_FLOW = {
  pending: ['contacted', 'cancelled'],
  contacted: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// Payment method configuration based on your backend
const PAYMENT_CONFIG = {
  cod: { color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800', label: 'COD' },
  card: { color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', label: 'Card' },
  upi: { color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800', label: 'UPI' },
  netbanking: { color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800', label: 'Net Banking' },
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Payment Badge Component
const PaymentBadge = ({ method }) => {
  const config = PAYMENT_CONFIG[method?.toLowerCase()] || PAYMENT_CONFIG.cod;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const config = STATUS_CONFIG[order.status];

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
          {activeTab === 'details' && (
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

              {/* Customer Message */}
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
          )}

          {activeTab === 'customer' && (
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
          )}

          {activeTab === 'history' && (
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
          )}

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

// Quick Stats Component
const QuickStats = ({ orders, onStatusFilter, loading }) => {
  const stats = [
    { status: 'pending', label: 'Pending' },
    { status: 'contacted', label: 'Contacted' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
    { status: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
      {stats.map((stat) => {
        const config = STATUS_CONFIG[stat.status];
        const count = orders.filter(o => o.status === stat.status).length;
        
        return (
          <button
            key={stat.status}
            onClick={() => onStatusFilter(stat.status)}
            disabled={loading}
            className={`p-4 border rounded-xl hover:opacity-90 transition-all disabled:opacity-50 ${config.bgColor}`}
          >
            <div className="text-2xl mb-2">{config.icon}</div>
            <p className="font-medium text-gray-900 text-sm">{stat.label}</p>
            <p className="text-xs text-gray-600">{count} orders</p>
          </button>
        );
      })}
    </div>
  );
};

// Order Filters Component
const OrderFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onStatusFilter, 
  dateRange, 
  onDateRangeChange,
  loading 
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Orders
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search by order number, customer, email..."
              value={searchTerm}
              onChange={onSearchChange}
              disabled={loading}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={onStatusFilter}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={onDateRangeChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
        
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="priceLow">Price: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main OrderManagement Component
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters based on your backend's getAllOrders method
      const params = {
        limit: 100, // Fetch more orders for filtering
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // If we have a specific status filter, apply it
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // If we have a search term, apply it
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // If we have a date range, apply it
      if (dateRange !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            params.startDate = startDate.toISOString();
            params.endDate = now.toISOString();
            break;
          case 'lastMonth':
            const lastMonthStart = new Date();
            lastMonthStart.setMonth(now.getMonth() - 2);
            const lastMonthEnd = new Date();
            lastMonthEnd.setMonth(now.getMonth() - 1);
            params.startDate = lastMonthStart.toISOString();
            params.endDate = lastMonthEnd.toISOString();
            break;
        }
      }
      
      const response = await axios.get(`${API_BASE_URL}/orders`, { params });
      
      if (response.data.success) {
        setOrders(response.data.data?.orders || response.data.orders || []);
      } else {
        setError(response.data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to connect to server. Please check your connection.');
      
      // Fallback to mock data for demo
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        setOrders([
          {
            _id: '1',
            orderNumber: 'ORD20240115001',
            productName: 'Handwoven Silk Saree',
            productPrice: 4500,
            artisan: 'Rekha Devi',
            productLocation: 'Varanasi, UP',
            customerDetails: {
              name: 'Priya Sharma',
              email: 'priya@example.com',
              phone: '+91 9876543210',
              address: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              message: 'Please send product images before shipping'
            },
            status: 'pending',
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            orderNumber: 'ORD20240114001',
            productName: 'Handcrafted Pottery Set',
            productPrice: 2500,
            artisan: 'Raj Kumar',
            productLocation: 'Khurja, UP',
            customerDetails: {
              name: 'Amit Patel',
              email: 'amit@example.com',
              phone: '+91 9876543211',
              address: '456 Park Avenue',
              city: 'Delhi',
              state: 'Delhi',
              pincode: '110001',
              message: 'Interested in bulk purchase'
            },
            status: 'contacted',
            paymentMethod: 'upi',
            paymentStatus: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, dateRange]);

  // Filter orders based on criteria
  useEffect(() => {
    let result = orders;

    // Apply search filter (additional client-side filtering)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerDetails.name.toLowerCase().includes(term) ||
        order.customerDetails.email.toLowerCase().includes(term) ||
        order.customerDetails.phone.includes(term) ||
        order.productName.toLowerCase().includes(term)
      );
    }

    // Apply status filter (additional client-side filtering)
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus, notes = '') => {
    try {
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus,
        adminNote: notes
      });

      if (response.data.success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Failed to update order status: ${error.message}`);
      throw error;
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        cancellationReason: 'Cancelled by admin',
        refundRequired: false
      });

      if (response.data.success) {
        fetchOrders(); // Refresh orders
        alert('Order cancelled successfully');
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  // Contact customer via WhatsApp
  const handleContactCustomer = (order) => {
    const message = `Hello ${order.customerDetails.name}, this is তন্তিকা regarding your order ${order.orderNumber}`;
    const phoneNumber = order.customerDetails.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Export orders to CSV
  const handleExportOrders = () => {
    try {
      const headers = ['Order Number', 'Customer', 'Email', 'Phone', 'Product', 'Amount', 'Status', 'Date'];
      const csvData = filteredOrders.map(order => [
        order.orderNumber,
        order.customerDetails.name,
        order.customerDetails.email,
        order.customerDetails.phone,
        order.productName,
        `₹${order.productPrice.toLocaleString()}`,
        STATUS_CONFIG[order.status]?.label || order.status,
        new Date(order.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders');
    }
  };

  // Print orders
  const handlePrintOrders = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Orders Report - তন্তিকা</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>তন্তিকা - Orders Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.customerDetails.name}</td>
                  <td>${order.productName}</td>
                  <td>₹${order.productPrice.toLocaleString()}</td>
                  <td>
                    <span class="status" style="background-color: ${STATUS_CONFIG[order.status]?.bgColor || '#f5f5f5'}; color: ${STATUS_CONFIG[order.status]?.textColor || '#333'}">
                      ${STATUS_CONFIG[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Orders: ${filteredOrders.length}<br>
            Total Value: ₹${filteredOrders.reduce((sum, order) => sum + order.productPrice, 0).toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Refresh data
  const handleRefresh = () => {
    fetchOrders();
    alert('Refreshing orders...');
  };

  // Calculate dashboard metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.productPrice, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-600">Manage customer orders and track status</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrintOrders}
            disabled={loading || filteredOrders.length === 0}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Orders
          </button>
          <button
            onClick={handleExportOrders}
            disabled={loading || filteredOrders.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">Error loading orders</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Filters */}
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filterStatus={filterStatus}
            onStatusFilter={(e) => setFilterStatus(e.target.value)}
            dateRange={dateRange}
            onDateRangeChange={(e) => setDateRange(e.target.value)}
            loading={loading}
          />

          {/* Quick Stats */}
          <QuickStats
            orders={orders}
            onStatusFilter={setFilterStatus}
            loading={loading}
          />

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerDetails.name}</div>
                      <div className="text-sm text-gray-500">{order.customerDetails.email}</div>
                      <div className="text-xs text-gray-500">{order.customerDetails.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                      <div className="text-sm text-gray-500">{order.artisan}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{order.productPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentBadge method={order.paymentMethod} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleContactCustomer(order)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                          title="Contact Customer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">No orders match your current filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setDateRange('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-bold">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-bold text-yellow-600">{pendingOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered Orders</span>
                  <span className="font-bold text-green-600">{deliveredOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold">₹{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Order Value</span>
                  <span className="font-bold">₹{avgOrderValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Communication */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const pending = orders.filter(o => o.status === 'pending');
                    if (pending.length > 0) {
                      alert(`Sending confirmations to ${pending.length} customers`);
                    } else {
                      alert('No pending orders to confirm');
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Order Confirmations
                </button>
                <button
                  onClick={() => {
                    const shipped = orders.filter(o => o.status === 'shipped');
                    if (shipped.length > 0) {
                      alert(`Sending tracking updates to ${shipped.length} customers`);
                    } else {
                      alert('No shipped orders to update');
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Send Tracking Updates
                </button>
                <button
                  onClick={() => {
                    const recent = orders.slice(0, 5);
                    alert(`Viewing ${recent.length} recent orders`);
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Recent Orders
                </button>
              </div>
            </div>

            {/* Shipping Management */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ready to Ship</span>
                  <span className="font-bold">
                    {orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Transit</span>
                  <span className="font-bold">
                    {orders.filter(o => o.status === 'shipped').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Pending</span>
                  <span className="font-bold">
                    {orders.filter(o => o.status === 'shipped').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default OrderManagement;