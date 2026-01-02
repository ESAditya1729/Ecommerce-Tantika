// components/Admin/User-Management/ViewProfileModal.jsx
import React from 'react';
import { 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  Edit,
  XCircle as XIcon
} from "lucide-react";

const ViewProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getUserDisplayName = () => {
    return user.name || user.username || user.email || 'Unknown User';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Profile
                </h3>
                <p className="text-sm text-gray-500">
                  Viewing details for {getUserDisplayName()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* User Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getUserDisplayName()}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-gray-400 mr-1" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
                <div className="flex items-center">
                  {user.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  ID: {user.id ? `#${user.id.toString().padStart(6, '0')}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Grid of User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Email Address</label>
                  <p className="text-sm font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone Number</label>
                  <p className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {user.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Location</label>
                  <p className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {user.location || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-purple-500" />
                Account Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Account Created</label>
                  <p className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(user.createdAt || user.joined)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last Active</label>
                  <p className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Total Orders</label>
                  <p className="text-sm font-medium flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    {user.orders || 0} orders placed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(user.username || user.bio || user.notes) && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {user.username && user.username !== user.name && (
                    <div>
                      <label className="text-xs text-gray-500">Username</label>
                      <p className="text-sm font-medium">@{user.username}</p>
                    </div>
                  )}
                  {user.bio && (
                    <div>
                      <label className="text-xs text-gray-500">Bio</label>
                      <p className="text-sm font-medium">{user.bio}</p>
                    </div>
                  )}
                  {user.notes && (
                    <div>
                      <label className="text-xs text-gray-500">Admin Notes</label>
                      <p className="text-sm font-medium italic text-gray-600">{user.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = `mailto:${user.email}`;
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XIcon className="w-4 h-4 mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileModal;