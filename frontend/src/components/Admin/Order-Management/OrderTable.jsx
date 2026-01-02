import React from 'react';
import { Eye, MessageSquare, XCircle, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PaymentBadge from './PaymentBadge';

const OrderTable = ({ 
  orders, 
  onViewDetails, 
  onContactCustomer, 
  onCancelOrder, 
  loading 
}) => {
  if (orders.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-500">No orders match your current filters</p>
      </div>
    );
  }

  return (
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
          {orders.map((order) => (
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
                    onClick={() => onViewDetails(order)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onContactCustomer(order)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                    title="Contact Customer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => onCancelOrder(order._id)}
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
    </div>
  );
};

export default OrderTable;