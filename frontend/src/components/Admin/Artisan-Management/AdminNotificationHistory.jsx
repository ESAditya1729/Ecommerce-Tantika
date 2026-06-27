// components/Admin/Artisan-Management/AdminNotificationHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  X,
  Eye,
  Trash2,
  RefreshCw,
  Loader,
  AlertCircle,
  Clock,
  MessageSquare,
  User,
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Send,
  Inbox
} from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api"; //process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminNotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch broadcast history (notifications sent by admin)
      const broadcastUrl = `${API_BASE_URL}/notifications/admin/broadcast-history?page=${page}&limit=20`;

      const broadcastResponse = await fetch(broadcastUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const broadcastData = await broadcastResponse.json();

      let allNotifications = [];

      if (broadcastData.success && broadcastData.data) {
        allNotifications = broadcastData.data.map(n => ({
          ...n,
          // ========== FIXED: Mark as sent by admin ==========
          direction: 'sent',
          directionLabel: '📤 Sent',
          // ========== FIXED: Get artisan name from data ==========
          recipientName: n.data?.artisanName || 'Artisan'
        }));
      }

      setNotifications(allNotifications);
      setTotalCount(allNotifications.length);
      setTotalPages(Math.ceil(allNotifications.length / 20));

    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotalCount(prev => prev - 1);
        if (selectedNotification?.id === id) {
          setShowDetailModal(false);
          setSelectedNotification(null);
        }
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert(error.message || 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('tantika_token');
      
      for (const notification of notifications) {
        await fetch(`${API_BASE_URL}/notifications/admin/${notification.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      setNotifications([]);
      setTotalCount(0);
      alert('All notifications deleted successfully');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert('Failed to delete all notifications');
    } finally {
      setDeleting(false);
    }
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

  const getStatusBadge = (read) => {
    return read 
      ? 'bg-gray-100 text-gray-600' 
      : 'bg-green-100 text-green-600';
  };

  const getStatusText = (read) => {
    return read ? 'Read' : 'Unread';
  };

  // ========== FIXED: Direction badge ==========
  const getDirectionBadge = (direction) => {
    if (direction === 'sent') {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-purple-100 text-purple-700';
  };

  const getDirectionLabel = (direction) => {
    if (direction === 'sent') {
      return '📤 Sent';
    }
    return '📥 Received';
  };

  const getDirectionIcon = (direction) => {
    if (direction === 'sent') {
      return <Send className="w-3 h-3" />;
    }
    return <Inbox className="w-3 h-3" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateLabel = (templateId) => {
    const labels = {
      'order_placed': '📦 New Order',
      'order_status_update': '📦 Order Update',
      'order_cancelled': '❌ Order Cancelled',
      'product_approved': '✅ Product Approved',
      'product_rejected': '⚠️ Product Rejected',
      'product_submitted': '📤 Product Submitted',
      'low_stock_alert': '⚠️ Low Stock',
      'payout_processed': '💰 Payout',
      'payout_failed': '❌ Payout Failed',
      'account_approved': '✅ Account Approved',
      'account_rejected': '⚠️ Account Rejected',
      'system_announcement': '📢 Announcement',
      'new_message': '💬 New Message'
    };
    return labels[templateId] || templateId;
  };

  const getTemplateIcon = (templateId) => {
    const icons = {
      'order_placed': <ShoppingBag className="w-4 h-4" />,
      'order_status_update': <Clock className="w-4 h-4" />,
      'order_cancelled': <X className="w-4 h-4" />,
      'product_approved': <CheckCircle className="w-4 h-4" />,
      'product_rejected': <AlertCircle className="w-4 h-4" />,
      'product_submitted': <Package className="w-4 h-4" />,
      'low_stock_alert': <AlertCircle className="w-4 h-4" />,
      'payout_processed': <DollarSign className="w-4 h-4" />,
      'payout_failed': <AlertCircle className="w-4 h-4" />,
      'account_approved': <CheckCircle className="w-4 h-4" />,
      'account_rejected': <AlertCircle className="w-4 h-4" />,
      'system_announcement': <Bell className="w-4 h-4" />,
      'new_message': <MessageSquare className="w-4 h-4" />
    };
    return icons[templateId] || <Bell className="w-4 h-4" />;
  };

  // ========== FIXED: Get recipient name ==========
  const getRecipientName = (notification) => {
    // Use the stored recipientName from data
    if (notification.recipientName) {
      return notification.recipientName;
    }
    
    // Check if data has artisanName
    if (notification.data?.artisanName) {
      return notification.data.artisanName;
    }
    
    return 'Artisan';
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  // ========== FIXED: Filter notifications ==========
  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const recipientName = getRecipientName(notification).toLowerCase();
      const matchesSearch = 
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower) ||
        recipientName.includes(searchLower) ||
        notification.templateId?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Direction filter (Sent / Received)
    if (filter === 'sent' && notification.direction !== 'sent') return false;
    if (filter === 'received' && notification.direction !== 'received') return false;
    
    // Read/Unread filter
    if (filter === 'read' && !notification.read) return false;
    if (filter === 'unread' && notification.read) return false;

    return true;
  });

  // ========== FIXED: Render notification detail ==========
  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;

    const recipientName = getRecipientName(selectedNotification);
    const templateLabel = getTemplateLabel(selectedNotification.templateId);
    const templateIcon = getTemplateIcon(selectedNotification.templateId);
    const priorityLabel = getPriorityLabel(selectedNotification.priority);
    const statusLabel = getStatusText(selectedNotification.read);
    const directionLabel = getDirectionLabel(selectedNotification.direction);
    const directionBadge = getDirectionBadge(selectedNotification.direction);

    // Get initials for avatar
    const getInitials = (name) => {
      if (!name || name === 'Artisan' || name === 'Unknown') return 'A';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notification Details
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(selectedNotification.id)}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedNotification.priority)}`}>
                {priorityLabel}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedNotification.read)}`}>
                {statusLabel}
              </span>
              {/* ========== FIXED: Direction badge ========== */}
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${directionBadge} flex items-center gap-1`}>
                {getDirectionIcon(selectedNotification.direction)}
                {directionLabel}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(selectedNotification.createdAt)}
              </span>
            </div>

            {/* Type & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  {templateIcon}
                </div>
                <span className="text-xs text-gray-500 font-medium">{templateLabel}</span>
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

            {/* ========== FIXED: Recipient Info - No Unknown text ========== */}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                {selectedNotification.direction === 'sent' ? 'Sent To' : 'Received From'}
              </p>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {getInitials(recipientName)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{recipientName}</p>
                  <p className="text-xs text-gray-500">Artisan</p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {selectedNotification.data?.orderNumber && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Order Details</p>
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-xs text-gray-500">Order Number</p>
                    <p className="font-semibold text-gray-900">{selectedNotification.data.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">₹{selectedNotification.data.amount}</p>
                  </div>
                  {selectedNotification.data.customerName && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-semibold text-gray-900">{selectedNotification.data.customerName}</p>
                    </div>
                  )}
                  {selectedNotification.data.productName && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="font-semibold text-gray-900">{selectedNotification.data.productName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Artisan Reply */}
            {selectedNotification.reply?.status === 'replied' && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Artisan Reply</p>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-800">{selectedNotification.reply.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(selectedNotification.reply.at)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notification History
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {totalCount}
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            View all notifications sent to artisans
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ========== FIXED: Filters with Sent/Received options ========== */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, message, or artisan name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="sent">📤 Sent</option>
            <option value="received">📥 Received</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'No notifications match your filters' 
                : 'No notifications have been sent yet'}
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const recipientName = getRecipientName(notification);
                const templateIcon = getTemplateIcon(notification.templateId);
                const priorityLabel = getPriorityLabel(notification.priority);
                const directionLabel = getDirectionLabel(notification.direction);
                const directionBadge = getDirectionBadge(notification.direction);
                
                return (
                  <div
                    key={notification.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowDetailModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                            {priorityLabel}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(notification.read)}`}>
                            {getStatusText(notification.read)}
                          </span>
                          {/* ========== FIXED: Direction badge in list ========== */}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${directionBadge} flex items-center gap-1`}>
                            {getDirectionIcon(notification.direction)}
                            {directionLabel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTemplateLabel(notification.templateId)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 truncate">{notification.title}</h5>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            To: {recipientName}
                          </span>
                          {notification.reply?.status === 'replied' && (
                            <span className="text-green-600 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification(notification);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          disabled={deleting}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
              Showing {filteredNotifications.length} of {totalCount} notifications
              {searchTerm && ` (filtered by "${searchTerm}")`}
              {filter !== 'all' && ` (${filter})`}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && renderNotificationDetail()}
    </div>
  );
};

export default AdminNotificationHistory;