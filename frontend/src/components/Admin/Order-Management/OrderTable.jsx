import React from 'react';
import { Eye, MessageSquare, XCircle, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PaymentBadge from './PaymentBadge';

const OrderTable = ({ 
  orders, 
  onViewDetails, 
  onContactCustomer, 
  onCancelOrder, 
  loading,
  selectedOrders,
  onToggleSelect 
}) => {
  // Add loading check
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  // Check if orders is undefined or null
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-500">No orders match your current filters</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    // Format: +91 XXXXX-XXXXX or similar
    const phoneStr = String(phone);
    return phoneStr.length > 10 
      ? `${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 7)}-${phoneStr.slice(7)}`
      : phoneStr;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onToggleSelect && (
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedOrders?.length === orders.length && orders.length > 0}
                  onChange={() => onToggleSelect('all')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
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
              Artisan
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
          {orders.map((order) => (
            <tr key={order._id || order.id} className="hover:bg-gray-50">
              {onToggleSelect && (
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders?.includes(order._id)}
                    onChange={() => onToggleSelect(order._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600">{order.orderNumber || 'N/A'}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.customerName || order.customer?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-[200px]">
                  {order.customerEmail || order.customer?.email || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPhoneNumber(order.customerPhone || order.customer?.phone)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {order.productName || 'N/A'}
                </div>
                {(order.itemsCount > 1 || order.totalQuantity > 1) && (
                  <div className="text-xs text-blue-600">
                    +{Math.max(order.itemsCount - 1, order.totalQuantity - 1, 0)} more item(s)
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {order.artisanName || order.artisan || 'Unknown'}
                </div>
                {order.artisanId && (
                  <div className="text-xs text-gray-500">
                    ID: {order.artisanId.toString().substring(0, 8)}...
                  </div>
                )}
                {order.itemsCount > 1 && (
                  <div className="text-xs text-purple-600 mt-1">
                    Multiple artisans possible
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-lg font-bold text-gray-900">
                  ₹{(order.total || 0).toLocaleString('en-IN')}
                </div>
                {order.itemsCount > 1 && (
                  <div className="text-xs text-gray-500">
                    (Includes {order.itemsCount} items)
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={order.status || 'pending'} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PaymentBadge 
                  method={order.paymentMethod || 'cod'} 
                  status={order.paymentStatus || order.payment?.status}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onContactCustomer(order)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Contact Customer"
                    disabled={!order.customerPhone && !order.customer?.phone}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => onCancelOrder(order._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
};

export default OrderTable;