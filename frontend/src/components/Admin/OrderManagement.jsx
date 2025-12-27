import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Truck, Package, CheckCircle, XCircle, Printer, MessageSquare } from 'lucide-react';

const OrderManagement = () => {
  const [orders] = useState([
    {
      id: 'TNT-2456',
      customer: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9876543210',
      items: 2,
      amount: 2450,
      status: 'pending',
      date: '2024-01-15',
      payment: 'UPI',
      shipping: 'Standard',
      address: 'Kolkata, West Bengal'
    },
    {
      id: 'TNT-2455',
      customer: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 9876543211',
      items: 3,
      amount: 3899,
      status: 'processing',
      date: '2024-01-14',
      payment: 'Card',
      shipping: 'Express',
      address: 'Mumbai, Maharashtra'
    },
    {
      id: 'TNT-2454',
      customer: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '+91 9876543212',
      items: 1,
      amount: 1299,
      status: 'shipped',
      date: '2024-01-14',
      payment: 'UPI',
      shipping: 'Standard',
      address: 'Delhi, NCR'
    },
    {
      id: 'TNT-2453',
      customer: 'Sneha Roy',
      email: 'sneha@example.com',
      phone: '+91 9876543213',
      items: 4,
      amount: 4599,
      status: 'delivered',
      date: '2024-01-13',
      payment: 'COD',
      shipping: 'Express',
      address: 'Kolkata, West Bengal'
    },
    {
      id: 'TNT-2452',
      customer: 'Rajesh Mehta',
      email: 'rajesh@example.com',
      phone: '+91 9876543214',
      items: 1,
      amount: 899,
      status: 'cancelled',
      date: '2024-01-12',
      payment: 'UPI',
      shipping: 'Standard',
      address: 'Chennai, Tamil Nadu'
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: '⏳', label: 'Pending' },
      processing: { color: 'blue', icon: '🔄', label: 'Processing' },
      shipped: { color: 'purple', icon: '🚚', label: 'Shipped' },
      delivered: { color: 'green', icon: '✓', label: 'Delivered' },
      cancelled: { color: 'red', icon: '✗', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (payment) => {
    const paymentConfig = {
      UPI: { color: 'blue', label: 'UPI' },
      Card: { color: 'green', label: 'Card' },
      COD: { color: 'orange', label: 'COD' },
    };

    const config = paymentConfig[payment] || paymentConfig.UPI;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // API call would go here
  };

  const handleContactCustomer = (order) => {
    const message = `Hello ${order.customer}, this is তন্তিকা regarding your order ${order.id}`;
    const phoneNumber = order.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage and process customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Printer className="w-5 h-5 mr-2" />
            Print Orders
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search by ID, customer, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">COD</option>
            </select>
          </div>
        </div>
      </div>

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
                Date
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
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{order.id}</div>
                  <div className="text-sm text-gray-500">{order.items} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                  <div className="text-sm text-gray-500">{order.email}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{order.shipping}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">₹{order.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{order.payment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentBadge(order.payment)}
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
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                      title="Mark as Shipped"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                      title="Mark as Delivered"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filters</p>
          </div>
        )}
      </div>

      {/* Order Status Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => setFilterStatus('pending')}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors text-center"
        >
          <div className="text-2xl mb-2">⏳</div>
          <p className="font-medium text-gray-900">Pending</p>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.status === 'pending').length} orders
          </p>
        </button>

        <button
          onClick={() => setFilterStatus('processing')}
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-center"
        >
          <div className="text-2xl mb-2">🔄</div>
          <p className="font-medium text-gray-900">Processing</p>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.status === 'processing').length} orders
          </p>
        </button>

        <button
          onClick={() => setFilterStatus('shipped')}
          className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-center"
        >
          <div className="text-2xl mb-2">🚚</div>
          <p className="font-medium text-gray-900">Shipped</p>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.status === 'shipped').length} orders
          </p>
        </button>

        <button
          onClick={() => setFilterStatus('delivered')}
          className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-center"
        >
          <div className="text-2xl mb-2">✓</div>
          <p className="font-medium text-gray-900">Delivered</p>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.status === 'delivered').length} orders
          </p>
        </button>

        <button
          onClick={() => setFilterStatus('cancelled')}
          className="p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-center"
        >
          <div className="text-2xl mb-2">✗</div>
          <p className="font-medium text-gray-900">Cancelled</p>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.status === 'cancelled').length} orders
          </p>
        </button>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold">{orders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold">₹{orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Order Value</span>
              <span className="font-bold">₹{Math.round(orders.reduce((sum, o) => sum + o.amount, 0) / orders.length).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Customer Communication</h3>
          <p className="text-sm text-gray-600 mb-4">
            Quick contact options for order confirmation
          </p>
          <div className="space-y-3">
            <button
              onClick={() => console.log('Send bulk confirmation')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Send Order Confirmations
            </button>
            <button
              onClick={() => console.log('Send tracking updates')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Send Tracking Updates
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Shipping Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate shipping labels and track packages
          </p>
          <div className="space-y-3">
            <button
              onClick={() => console.log('Generate labels')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Generate Shipping Labels
            </button>
            <button
              onClick={() => console.log('Track shipments')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Track Shipments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;