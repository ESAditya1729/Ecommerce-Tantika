import { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ExternalLink, 
  Loader2,
  Filter,
  Search,
  AlertCircle,
  MessageSquare,
  MapPin,
  Calendar
} from 'lucide-react';
import { ModalContainer } from './ModalContainer';
import { Link } from 'react-router-dom';

const OrderHistoryModal = ({ 
  isOpen, 
  onClose,
  userId
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen && userId) {
      fetchOrders();
    }
  }, [isOpen, userId, filter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filter !== 'all' && { status: filter })
      });

      const response = await fetch(
        `${API_BASE_URL}/usernorms/orders?${params}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error(data.message || 'Failed to load orders');
      }
      
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/usernorms/orders/${orderId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderDetails(true);
      } else {
        throw new Error(data.message || 'Failed to load order details');
      }
      
    } catch (err) {
      console.error('Order details error:', err);
      setError(err.message || 'Failed to load order details');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/usernorms/orders/${orderId}/cancel`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: 'Cancelled by customer from dashboard'
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders list
        fetchOrders();
        // Close details if open
        setShowOrderDetails(false);
        setSelectedOrder(null);
        
        alert('Order cancelled successfully!');
      } else {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.message || 'Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing': 
      case 'confirmed':
      case 'contacted': return <Package className="w-5 h-5 text-purple-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': 
      case 'confirmed':
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'confirmed': return 'Confirmed';
      case 'contacted': return 'Contacted';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.productName?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.artisan?.toLowerCase().includes(searchLower)
    );
  });

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const isCancellable = ['pending', 'contacted', 'confirmed'].includes(selectedOrder.status);

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
              <p className="text-gray-600">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                {getStatusText(selectedOrder.status)}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedOrder.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h4>
          <div className="flex items-start space-x-4">
            {selectedOrder.productImage ? (
              <img 
                src={selectedOrder.productImage} 
                alt={selectedOrder.productName}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/80?text=${encodeURIComponent(selectedOrder.productName?.charAt(0) || 'P')}`;
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h5 className="font-bold text-gray-900">{selectedOrder.productName}</h5>
              <p className="text-gray-600 mt-1">Artisan: {selectedOrder.artisan || 'Unknown Artisan'}</p>
              <p className="text-gray-600">Location: {selectedOrder.productLocation || 'Not specified'}</p>
              <div className="mt-3 text-2xl font-bold text-gray-900">
                ₹{selectedOrder.productPrice?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            Delivery Details
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium text-gray-900">{selectedOrder.customerDetails?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">{selectedOrder.customerDetails?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{selectedOrder.customerDetails?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{selectedOrder.customerFullAddress || 
                `${selectedOrder.customerDetails?.address || ''}, ${selectedOrder.customerDetails?.city || ''}, ${selectedOrder.customerDetails?.state || ''} - ${selectedOrder.customerDetails?.pincode || ''}`}
              </p>
            </div>
            {selectedOrder.customerDetails?.message && (
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Customer Message
                </p>
                <p className="font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedOrder.customerDetails.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
            Order Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price</span>
              <span className="font-medium">₹{selectedOrder.productPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">₹{selectedOrder.summary?.shipping || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{selectedOrder.summary?.tax || 0}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total Amount</span>
              <span>₹{selectedOrder.summary?.total || selectedOrder.productPrice}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{selectedOrder.paymentMethod || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {selectedOrder.adminNotes && selectedOrder.adminNotes.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h4>
            <div className="space-y-3">
              {selectedOrder.adminNotes.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{note.note}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>By: {note.addedBy}</span>
                    <span>{formatDateTime(note.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          {isCancellable && (
            <button
              onClick={() => handleCancelOrder(selectedOrder.id)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          )}
          
          <Link
            to={`/orders/${selectedOrder.id}`}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-center"
          >
            View Full Details
          </Link>
        </div>
      </div>
    );
  };

  const renderOrderList = () => {
    return (
      <>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order #, product, or artisan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {filter !== 'all' 
                ? `No ${getStatusText(filter)} orders found` 
                : 'Start shopping to see your orders here!'}
            </p>
            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <span>Browse Shop</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {order.productName}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center">
                              <span className="font-medium mr-2">Order #:</span>
                              {order.orderNumber}
                            </p>
                            <p className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(order.createdAt)}
                            </p>
                            <p className="flex items-center">
                              <span className="font-medium mr-2">Artisan:</span>
                              {order.artisan || 'Unknown Artisan'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Price & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right mb-3">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{order.price?.toLocaleString()}
                        </div>
                        <div className={`text-sm mt-1 ${
                          order.paymentStatus === 'paid' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : 'Payment Pending'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchOrderDetails(order.id);
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center text-sm"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Details
                        </button>
                        
                        {['pending', 'contacted', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Cancel this order?')) {
                                handleCancelOrder(order.id);
                              }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 mt-6">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing {filteredOrders.length} of {orders.length} orders
                {filter !== 'all' && ` (${getStatusText(filter)})`}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  View All Orders
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={() => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
        setSearchTerm('');
        setFilter('all');
        setPage(1);
        onClose();
      }}
      title={showOrderDetails ? "Order Details" : "Order History"}
      size={showOrderDetails ? "xl" : "full"}
    >
      <div className="space-y-4">
        {showOrderDetails ? renderOrderDetails() : renderOrderList()}
      </div>
    </ModalContainer>
  );
};

export default OrderHistoryModal;