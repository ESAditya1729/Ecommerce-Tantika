// components/users/ConfirmationModal.jsx
import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  UserX, 
  UserCheck,
  Trash2,
  Star,
  Mail,
  Eye,
  Edit,
  Lock,
  Unlock,
  Ban,
  Check
} from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // "delete", "status", "admin", "email", "view", "edit", "warning", "success", "info"
  severity = "medium", // "low", "medium", "high"
  isLoading = false,
  user = null,
  icon: CustomIcon = null,
  confirmButtonColor = "blue",
  showCancelButton = true,
  showCloseButton = true,
  size = "md" // "sm", "md", "lg"
}) => {
  if (!isOpen) return null;

  // Get icon based on type
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-8 h-8" />;
    
    switch (type) {
      case 'delete':
        return <Trash2 className="w-8 h-8 text-red-600" />;
      case 'status':
        const isActivating = user?.status === 'inactive';
        return isActivating ? 
          <UserCheck className="w-8 h-8 text-green-600" /> : 
          <UserX className="w-8 h-8 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-8 h-8 text-purple-600" />;
      case 'email':
        return <Mail className="w-8 h-8 text-blue-600" />;
      case 'view':
        return <Eye className="w-8 h-8 text-green-600" />;
      case 'edit':
        return <Edit className="w-8 h-8 text-yellow-600" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'info':
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
      case 'ban':
        return <Ban className="w-8 h-8 text-red-600" />;
      case 'unlock':
        return <Unlock className="w-8 h-8 text-green-600" />;
      case 'lock':
        return <Lock className="w-8 h-8 text-red-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
    }
  };

  // Get button color classes
  const getButtonColorClasses = () => {
    switch (confirmButtonColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'gray':
        return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  // Get modal size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'md':
      default:
        return 'max-w-md';
    }
  };

  // Get severity background color
  const getSeverityClasses = () => {
    switch (severity) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-blue-500';
      default:
        return '';
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.username || user.email || 'User';
  };

  // Format message with user info if available
  const getFormattedMessage = () => {
    if (!message) return '';
    
    let formatted = message;
    if (user) {
      formatted = formatted.replace(/{user}/g, getUserDisplayName());
      formatted = formatted.replace(/{email}/g, user.email || 'N/A');
      formatted = formatted.replace(/{role}/g, user.role || 'user');
      formatted = formatted.replace(/{status}/g, user.status || 'active');
    }
    return formatted;
  };

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Re-enable body scroll
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className={`bg-white rounded-lg shadow-xl ${getSizeClasses()} w-full mx-auto animate-fadeIn ${getSeverityClasses()}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getIcon()}
                </div>
                <div className="flex-1">
                  <h3 
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h3>
                  {user && (
                    <div className="mt-1">
                      <div className="text-sm font-medium text-gray-700">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.email && <span>{user.email} • </span>}
                        <span className="capitalize">{user.role || 'user'}</span>
                        {user.status && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto flex-shrink-0 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                    aria-label="Close modal"
                  >
                    <span className="sr-only">Close</span>
                    <XCircle className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="text-sm text-gray-600">
                <p>{getFormattedMessage()}</p>
              </div>
              
              {/* Additional Info if user exists */}
              {user && type === 'delete' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <div className="text-sm text-red-700">
                    <p className="font-medium">⚠️ This action cannot be undone</p>
                    <ul className="mt-1 ml-5 list-disc">
                      <li>User account will be permanently removed</li>
                      <li>All user data will be deleted</li>
                      <li>User will lose access immediately</li>
                    </ul>
                  </div>
                </div>
              )}

              {user && type === 'admin' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-md">
                  <div className="text-sm text-purple-700">
                    <p className="font-medium">🔒 Administrator privileges include:</p>
                    <ul className="mt-1 ml-5 list-disc">
                      <li>Full access to all system features</li>
                      <li>Ability to manage other users</li>
                      <li>Access to system settings and reports</li>
                      <li>Permission to modify critical data</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col sm:flex-row-reverse sm:justify-start sm:space-x-reverse sm:space-x-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColorClasses()} disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3 sm:mb-0`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {type === 'success' && <Check className="w-4 h-4 mr-2" />}
                      {confirmText}
                    </>
                  )}
                </button>
                
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
              
              {/* Additional Warning for high severity actions */}
              {severity === 'high' && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  <AlertCircle className="inline w-3 h-3 mr-1" />
                  This is a sensitive action. Please double-check before confirming.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
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

// Props validation
ConfirmationModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onConfirm: () => {},
  title: 'Confirm Action',
  message: 'Are you sure you want to perform this action?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'default',
  severity: 'medium',
  isLoading: false,
  user: null,
  icon: null,
  confirmButtonColor: 'blue',
  showCancelButton: true,
  showCloseButton: true,
  size: 'md'
};

export default React.memo(ConfirmationModal);