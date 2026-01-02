import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, Printer, RefreshCw, AlertCircle, 
  ShoppingBag, MessageSquare, Truck, Eye, Package
} from 'lucide-react';
import axios from 'axios';
import OrderDetailsModal from '../Modals/OrderDetailsModal';
import QuickStats from './Order-Management/QuickStats';
import OrderFilters from './Order-Management/OrderFilters';
import OrderTable from './Order-Management/OrderTable';
import { API_BASE_URL } from './Order-Management/constants';

// Custom hooks (you can move these to separate files if they grow)
const useOrderData = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return {
    orders,
    setOrders,
    filteredOrders,
    setFilteredOrders,
    loading,
    setLoading,
    error,
    setError
  };
};

const OrderManagement = () => {
  // State
  const {
    orders,
    setOrders,
    filteredOrders,
    setFilteredOrders,
    loading,
    setLoading,
    error,
    setError
  } = useOrderData();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      // Apply date range
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

    // Apply search filter
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

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priceHigh':
          return b.productPrice - a.productPrice;
        case 'priceLow':
          return a.productPrice - b.productPrice;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, sortBy]);

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
        fetchOrders();
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
        order.status,
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
                  <td>${order.status}</td>
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

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange('all');
    setSortBy('newest');
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
            sortBy={sortBy}
            onSortChange={(e) => setSortBy(e.target.value)}
            loading={loading}
          />

          {/* Quick Stats */}
          <QuickStats
            orders={orders}
            onStatusFilter={setFilterStatus}
            loading={loading}
          />

          {/* Orders Table */}
          <OrderTable
            orders={filteredOrders}
            onViewDetails={setSelectedOrder}
            onContactCustomer={handleContactCustomer}
            onCancelOrder={handleCancelOrder}
            loading={loading}
          />

          {/* Clear Filters Button */}
          {filteredOrders.length === 0 && orders.length > 0 && (
            <div className="text-center mb-6">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Dashboard Cards */}
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

            {/* Quick Actions */}
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

            {/* Shipping Status */}
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