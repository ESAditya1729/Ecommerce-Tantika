// frontend\src\components\ArtisanDashboard\OrdersTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Edit3,
  RefreshCw,
  MessageSquare,
  Download,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  Ban,
  Loader
} from 'lucide-react';
import ArtisanOrderViewModal from './OrderDetailsModal';

// Custom date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    return 'N/A';
  }
};

// Format date for display (without time)
const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'N/A';
  }
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
    cancelledOrders: 0
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use environment variable with fallback
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Order status options (matching the schema)
  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
    { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Ban }
  ];

  // Artisan allowed statuses (from controller)
  const artisanAllowedStatuses = ['confirmed', 'processing', 'ready_to_ship', 'cancelled'];

  // Payment status options
  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
  ];

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('tantika_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch orders with filters
  const fetchOrders = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (dateRange.from) params.append('dateFrom', dateRange.from);
      if (dateRange.to) params.append('dateTo', dateRange.to);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/artisan/orders?${params}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication failed. Please login again.');
        if (response.status === 403) throw new Error('Access denied. Artisan role required.');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
        setFilteredOrders(result.data.orders);
        setTotalPages(result.data.pagination.pages);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, dateRange, searchTerm, currentPage, itemsPerPage, API_BASE_URL]);

  // Fetch order statistics
  const fetchOrderStats = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/artisan/orders/stats/summary`, { headers });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE_URL]);

  // Initial fetch
  useEffect(() => {
    fetchOrders(1);
    fetchOrderStats();
    setCurrentPage(1);
  }, []); // Remove dependencies to prevent infinite loops

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchOrders(newPage);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setUpdatingOrderId(orderId);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/artisan/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          status: newStatus,
          notes: `Status updated to ${newStatus} by artisan`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      if (result.success) {
        // Refresh orders to get updated data
        await fetchOrders(currentPage);
        await fetchOrderStats();
        
        if (selectedOrder?._id === orderId) {
          // Find the updated order
          const updatedOrder = orders.find(o => o._id === orderId);
          if (updatedOrder) {
            setSelectedOrder({ ...updatedOrder, status: newStatus });
          }
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    } finally {
      setUpdatingStatus(false);
      setUpdatingOrderId(null);
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedOrder) return;

    setAddingNote(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/artisan/orders/${selectedOrder._id}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note: newNote })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add note');
      }

      if (result.success) {
        setNewNote('');
        // Refresh orders to get updated notes
        await fetchOrders(currentPage);
        
        // Update selected order with new data
        const updatedOrder = orders.find(o => o._id === selectedOrder._id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setError(error.message);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle export as CSV
  const handleExport = async () => {
    try {
      const headers = getAuthHeaders();
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (dateRange.from) params.append('startDate', dateRange.from);
      if (dateRange.to) params.append('endDate', dateRange.to);
      
      const response = await fetch(`${API_BASE_URL}/artisan/orders/export/csv?${params}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setError(error.message);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    setShowDatePicker(false);
    fetchOrders(1);
  };

  // Check if status can be updated by artisan
  const canUpdateStatus = (currentStatus) => {
    return artisanAllowedStatuses.includes(currentStatus) || currentStatus === 'pending';
  };

  // Get available status options for dropdown
  const getAvailableStatusOptions = (currentStatus) => {
    if (currentStatus === 'pending') {
      return orderStatuses.filter(s => ['confirmed', 'cancelled'].includes(s.value));
    }
    if (currentStatus === 'confirmed') {
      return orderStatuses.filter(s => ['processing', 'cancelled'].includes(s.value));
    }
    if (currentStatus === 'processing') {
      return orderStatuses.filter(s => ['ready_to_ship', 'cancelled'].includes(s.value));
    }
    if (currentStatus === 'ready_to_ship') {
      return orderStatuses.filter(s => ['shipped', 'cancelled'].includes(s.value));
    }
    return [];
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status) || orderStatuses[0];
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    const paymentConfig = paymentStatuses.find(s => s.value === status) || paymentStatuses[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentConfig.color}`}>
        {paymentConfig.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate order total from items
  const calculateOrderTotal = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity || 0), 0);
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading && !orders.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="h-8 w-8 text-amber-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-slideDown">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatsCard
          icon={CheckCircle}
          label="Delivered"
          value={stats.deliveredOrders}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Orders Management</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your orders in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(currentPage)}
              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm hover:shadow"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {(statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to) && (
                <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {(statusFilter !== 'all' ? 1 : 0) + 
                   (paymentFilter !== 'all' ? 1 : 0) + 
                   (dateRange.from || dateRange.to ? 1 : 0)}
                </span>
              )}
            </button>
            {(statusFilter !== 'all' || paymentFilter !== 'all' || searchTerm || dateRange.from || dateRange.to) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg animate-slideDown">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">All Payments</option>
                  {paymentStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-amber-50 inline-flex p-4 rounded-full mb-4">
              <ShoppingBag className="h-12 w-12 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to
                ? 'No orders match your current filters. Try adjusting your search criteria.'
                : 'Orders will appear here when customers place orders for your products.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0];
              const productName = firstItem?.name || 'Product';
              const totalAmount = calculateOrderTotal(order);
              const itemCount = order.items?.length || 0;
              
              return (
                <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          {order.orderNumber || 'N/A'}
                        </span>
                        {getStatusBadge(order.status)}
                        {order.payment?.status && getPaymentBadge(order.payment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-medium">{productName}</span>
                          {itemCount > 1 && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              +{itemCount - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{formatDateShort(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>

                      {/* Customer Contact */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                        {order.customer?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {order.customer.email}
                          </span>
                        )}
                        {order.customer?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      {/* Quick Status Update - Only show if artisan can update */}
                      {canUpdateStatus(order.status) && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus && updatingOrderId === order._id}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 min-w-[140px]"
                        >
                          <option value={order.status}>Current: {order.status}</option>
                          <option disabled>──────────</option>
                          {getAvailableStatusOptions(order.status).map(status => (
                            <option key={status.value} value={status.value}>
                              Set as {status.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-600 hover:bg-amber-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

{showOrderDetails && selectedOrder && (
  <ArtisanOrderViewModal
    order={selectedOrder}
    onClose={() => {
      setShowOrderDetails(false);
      setSelectedOrder(null);
    }}
    onUpdateStatus={handleStatusUpdate}
    onAddNote={async (orderId, note) => {
      setAddingNote(true);
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/artisan/orders/${orderId}/notes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ note })
        });

        if (!response.ok) throw new Error('Failed to add note');
        
        const result = await response.json();
        if (result.success) {
          // Refresh orders to get updated notes
          await fetchOrders(currentPage);
          // Update selected order
          const updatedOrder = orders.find(o => o._id === orderId);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } catch (error) {
        throw error;
      } finally {
        setAddingNote(false);
      }
    }}
  />
)}
    </div>
  );
};

export default OrdersTab;