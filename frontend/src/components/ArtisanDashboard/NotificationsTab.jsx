// components/ArtisanDashboard/NotificationsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  X,
  Loader,
  AlertCircle,
  Clock,
  MessageSquare,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      let url = `${API_BASE_URL}/notifications/artisan?page=${page}&limit=20`;
      
      if (filter === 'read') {
        url += '&read=true';
      } else if (filter === 'unread') {
        url += '&read=false';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
        setUnreadCount(data.unreadCount || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (templateId) => {
    const icons = {
      'order_placed': <ShoppingBag className="w-5 h-5 text-blue-500" />,
      'order_status_update': <Truck className="w-5 h-5 text-purple-500" />,
      'order_cancelled': <X className="w-5 h-5 text-red-500" />,
      'product_approved': <CheckCircle className="w-5 h-5 text-green-500" />,
      'product_rejected': <AlertCircle className="w-5 h-5 text-red-500" />,
      'product_submitted': <Package className="w-5 h-5 text-yellow-500" />,
      'low_stock_alert': <AlertCircle className="w-5 h-5 text-orange-500" />,
      'payout_processed': <CheckCircle className="w-5 h-5 text-green-500" />,
      'payout_failed': <AlertCircle className="w-5 h-5 text-red-500" />,
      'account_approved': <CheckCircle className="w-5 h-5 text-green-500" />,
      'account_rejected': <AlertCircle className="w-5 h-5 text-red-500" />,
      'system_announcement': <Bell className="w-5 h-5 text-amber-500" />,
      'new_message': <MessageSquare className="w-5 h-5 text-blue-500" />
    };
    return icons[templateId] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-yellow-100 text-yellow-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return labels[priority] || priority;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // ============================================================
  // Notification Detail Modal (without quick replies)
  // ============================================================
  const renderDetailModal = () => {
    if (!selectedNotification) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              Notification Details
            </h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedNotification.priority)}`}>
                {getPriorityLabel(selectedNotification.priority)}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedNotification.read ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                {selectedNotification.read ? 'Read' : 'Unread'}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(selectedNotification.createdAt)}
              </span>
            </div>

            {/* Type & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {selectedNotification.type?.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mt-1">{selectedNotification.title}</h4>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Message</p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>
            </div>

            {/* Reply Status */}
            {selectedNotification.reply?.status === 'replied' && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Your Reply</p>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-800">{selectedNotification.reply.content}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{formatTime(selectedNotification.reply.at)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            {selectedNotification.data?.orderNumber && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Order Details</p>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between py-1 border-b border-amber-100 last:border-0">
                    <span className="text-sm text-gray-600">Order #</span>
                    <span className="text-sm font-medium">{selectedNotification.data.orderNumber}</span>
                  </div>
                  {selectedNotification.data.amount && (
                    <div className="flex justify-between py-1 border-b border-amber-100 last:border-0">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-sm font-medium">₹{selectedNotification.data.amount}</span>
                    </div>
                  )}
                  {selectedNotification.data.customerName && (
                    <div className="flex justify-between py-1 border-b border-amber-100 last:border-0">
                      <span className="text-sm text-gray-600">Customer</span>
                      <span className="text-sm font-medium">{selectedNotification.data.customerName}</span>
                    </div>
                  )}
                  {selectedNotification.data.productName && (
                    <div className="flex justify-between py-1 border-b border-amber-100 last:border-0">
                      <span className="text-sm text-gray-600">Product</span>
                      <span className="text-sm font-medium">{selectedNotification.data.productName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-600" />
            Notifications
            <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
              {totalCount}
            </span>
          </h2>
          <p className="text-gray-600 mt-1">Stay updated with your orders, products, and account activity</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {markingAll ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Mark all as read
            </button>
          )}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
              setPage(1);
              fetchNotifications();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex justify-center items-center py-16 bg-white rounded-xl border border-gray-200">
          <Loader className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm || filter !== 'all' 
              ? 'No notifications match your filters' 
              : 'You\'re all caught up! New notifications will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-200' 
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-2 rounded-lg ${
                      notification.read ? 'bg-gray-100' : 'bg-amber-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                              New
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                            {getPriorityLabel(notification.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.reply?.status === 'replied' && (
                            <span className="text-green-600 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
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
            <div className="flex justify-center items-center gap-4 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
            Showing {filteredNotifications.length} of {totalCount} notifications
            {searchTerm && ` (filtered by "${searchTerm}")`}
            {filter !== 'all' && ` (${filter})`}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
    </div>
  );
};

export default NotificationsTab;