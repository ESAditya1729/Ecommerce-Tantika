// components/users/UserActions.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Eye, 
  Star, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Shield,
  AlertCircle,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';

// Built-in Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
  isLoading = false,
  user = null
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-8 h-8 text-red-600" />;
      case 'status':
        return user?.status === 'active' ? 
          <UserX className="w-8 h-8 text-yellow-600" /> : 
          <UserCheck className="w-8 h-8 text-green-600" />;
      case 'admin':
        return <Shield className="w-8 h-8 text-purple-600" />;
      case 'view':
        return <Eye className="w-8 h-8 text-green-600" />;
      case 'edit':
        return <Edit className="w-8 h-8 text-yellow-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'status':
        return user?.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700';
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500';
      case 'view':
      case 'edit':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.username || user.email || 'User';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {user && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-700">
                    {getUserDisplayName()}
                  </div>
                  {user.email && (
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
                disabled={isLoading}
              >
                <XCircle className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="text-sm text-gray-600">
            {message}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            {cancelText && !isLoading && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Details Modal for View Profile
const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
              className="text-gray-400 hover:text-gray-500"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* User Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Full Name</label>
                <p className="text-sm font-medium">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Username</label>
                <p className="text-sm font-medium">{user.username || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email Address</label>
                <p className="text-sm font-medium">{user.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone Number</label>
                <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">User Role</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Account Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Location</label>
                <p className="text-sm font-medium">{user.location || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">User ID</label>
                <p className="text-sm font-medium font-mono">{user.id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Activity Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Orders Placed</label>
                <p className="text-sm font-medium">{user.orders || 0}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Account Created</label>
                <p className="text-sm font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                   user.joined ? new Date(user.joined).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              {user.lastActive && (
                <div>
                  <label className="text-xs text-gray-500">Last Active</label>
                  <p className="text-sm font-medium">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main UserActions Component
const UserActions = ({ 
  user, 
  onEdit, 
  onDelete, 
  onView, 
  onSendEmail, 
  onToggleStatus,
  onMakeAdmin,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle immediate actions
  const handleImmediateAction = async (actionName, actionFunction) => {
    if (!actionFunction) {
      setError(`${actionName} handler is not available`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      await actionFunction(user);
    } catch (err) {
      console.error(`${actionName} error:`, err);
      setError(`Failed to ${actionName.toLowerCase()}: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  // Handle confirmation actions
  const handleConfirmAction = async (actionType, actionFunction) => {
    if (!actionFunction) {
      setError(`${actionType} handler is not available`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      await actionFunction(user);
      
      // Close the appropriate modal
      if (actionType === 'delete') setShowDeleteConfirm(false);
      if (actionType === 'status') setShowStatusConfirm(false);
      if (actionType === 'admin') setShowAdminConfirm(false);
    } catch (err) {
      console.error(`${actionType} error:`, err);
      setError(`Failed to ${actionType.toLowerCase()}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    if (onView) {
      onView(user);
    } else {
      // Use built-in view modal if no handler provided
      setShowViewModal(true);
    }
    setShowDropdown(false);
  };

  // Handle edit user
  const handleEditUser = () => {
    if (onEdit) {
      onEdit(user);
    } else {
      // Use built-in edit functionality or show message
      alert(`Edit functionality for ${user.name || user.email} would open here.`);
      console.log('Edit user:', user);
    }
    setShowDropdown(false);
  };

  const getUserDisplayName = () => {
    return user?.name || user?.username || user?.email || 'User';
  };

  // Close all modals
  const closeAllModals = () => {
    setShowDeleteConfirm(false);
    setShowStatusConfirm(false);
    setShowAdminConfirm(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDropdown(false);
  };

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center animate-fadeIn">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Desktop View */}
      <div className={`hidden md:flex items-center space-x-1 ${className}`}>
        {/* Send Email */}
        <button
          onClick={() => handleImmediateAction('Send Email', onSendEmail)}
          disabled={loading}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Send Email"
        >
          <Mail className="w-4 h-4" />
        </button>
        
        {/* View Profile */}
        <button
          onClick={handleViewProfile}
          disabled={loading}
          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
          title="View Profile"
        >
          <Eye className="w-4 h-4" />
        </button>
        
        {/* Make Admin (only for regular users) */}
        {user?.role === 'user' && (
          <button
            onClick={() => setShowAdminConfirm(true)}
            disabled={loading}
            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="Make Admin"
          >
            <Star className="w-4 h-4" />
          </button>
        )}
        
        {/* Toggle Status */}
        <button
          onClick={() => setShowStatusConfirm(true)}
          disabled={loading}
          className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
          title={user?.status === 'active' ? 'Deactivate User' : 'Activate User'}
        >
          {user?.status === 'active' ? (
            <UserX className="w-4 h-4" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
        </button>
        
        {/* Edit User */}
        <button
          onClick={handleEditUser}
          disabled={loading}
          className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
          title="Edit User"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        {/* Delete User */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete User"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile View */}
      <div className="md:hidden relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="More Actions"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-30"
              onClick={() => setShowDropdown(false)}
            />
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40 py-1">
              <button
                onClick={() => handleImmediateAction('Send Email', onSendEmail)}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </button>
              
              <button
                onClick={handleViewProfile}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </button>
              
              {user?.role === 'user' && (
                <button
                  onClick={() => setShowAdminConfirm(true)}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Make Admin
                </button>
              )}
              
              <button
                onClick={() => setShowStatusConfirm(true)}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
              >
                {user?.status === 'active' ? (
                  <UserX className="w-4 h-4 mr-2" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                {user?.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={handleEditUser}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => !loading && setShowDeleteConfirm(false)}
        onConfirm={() => handleConfirmAction('delete', onDelete)}
        title="Delete User"
        message={`Are you sure you want to delete ${getUserDisplayName()}? This action cannot be undone.`}
        type="delete"
        isLoading={loading}
        user={user}
        confirmText="Delete User"
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusConfirm}
        onClose={() => !loading && setShowStatusConfirm(false)}
        onConfirm={() => handleConfirmAction('status', onToggleStatus)}
        title={user?.status === 'active' ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${user?.status === 'active' ? 'deactivate' : 'activate'} ${getUserDisplayName()}?`}
        type="status"
        isLoading={loading}
        user={user}
        confirmText={user?.status === 'active' ? 'Deactivate' : 'Activate'}
      />

      {/* Make Admin Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAdminConfirm}
        onClose={() => !loading && setShowAdminConfirm(false)}
        onConfirm={() => handleConfirmAction('admin', onMakeAdmin)}
        title="Make Admin"
        message={`Are you sure you want to make ${getUserDisplayName()} an administrator? They will have full access to the system.`}
        type="admin"
        isLoading={loading}
        user={user}
        confirmText="Make Admin"
      />

      {/* View Profile Modal (built-in) */}
      <UserDetailsModal
        user={user}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

// Set default props to avoid undefined errors
UserActions.defaultProps = {
  user: {},
  onEdit: null,
  onDelete: null,
  onView: null,
  onSendEmail: null,
  onToggleStatus: null,
  onMakeAdmin: null,
  className: ''
};

export default React.memo(UserActions);