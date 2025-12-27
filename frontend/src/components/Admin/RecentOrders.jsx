import React, { useState } from 'react';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Truck, Package, Download, Filter } from 'lucide-react';

const RecentOrders = ({ orders, onDelete, onUpdateStatus }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-blue-800">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Mark as Processing
                </button>
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  Mark as Shipped
                </button>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                  Cancel Orders
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{order.id}</div>
                  <div className="text-sm text-gray-500">{order.items} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                  <div className="text-sm text-gray-500">Customer ID: C{order.id.split('-')[1]}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{new Date(order.date).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">₹{order.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Paid via UPI</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => console.log('View order:', order.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => console.log('Edit order:', order.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                      title="Edit Order"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(order.id, 'shipped')}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                      title="Mark as Shipped"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
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
            <p className="text-gray-500">No orders match your current filter</p>
          </div>
        )}
      </div>

      {/* Order Status Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => console.log('Process all pending')}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => console.log('Process all processing')}
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Processing</p>
              <p className="text-2xl font-bold text-blue-900">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-xl">🔄</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => console.log('Process all shipped')}
          className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Ready to Ship</p>
              <p className="text-2xl font-bold text-purple-900">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => console.log('View all delivered')}
          className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Delivered</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RecentOrders;