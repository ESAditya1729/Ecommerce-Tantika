// D:\My-Projects\ECommerce\Ecommerce-Tantika\frontend\src\components\ReviewPage\ReviewCard.jsx

import React, { useState } from 'react';
import { Star, MoreVertical, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { reviewService } from '../../services/reviewService';

const ReviewCard = ({ review, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData;
    } catch (error) {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isOwner = currentUser && currentUser.id === review.user?._id;
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await reviewService.deleteReview(review._id);
      onDelete(review._id);
      setShowDeleteModal(false);
      alert('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get product image from review (if available)
  const getProductImage = () => {
    // Check if review has targetId with image
    if (review.targetId?.image) {
      return review.targetId.image;
    }
    if (review.targetId?.images?.length > 0) {
      return review.targetId.images[0];
    }
    return null;
  };

  const productImage = getProductImage();
  const productName = review.targetId?.name || 'Product';

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-xl transition-shadow">
        {/* Header with Product Image and User Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            {/* Product Image */}
            {productImage && (
              <div className="flex-shrink-0">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/48x48/4b5563/9ca3af?text=Product';
                  }}
                />
              </div>
            )}
            
            {/* User Avatar and Info */}
            <div className="flex items-start space-x-3">
              <img
                src={review.user?.profilePicture || 'https://thumbs.dreamstime.com/b/vector-illustration-isolated-white-background-user-profile-avatar-black-line-icon-user-profile-avatar-black-solid-icon-121102166.jpg'}
                alt={review.user?.username || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-white">{review.user?.username || 'Anonymous User'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <span className="text-sm font-medium text-gray-300">
                      {review.title}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(review.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu */}
          {(isOwner || isAdmin) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-700 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          // Handle edit - navigate to edit review page
                          alert('Edit functionality coming soon');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2 text-gray-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Review
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Review
                      </button>
                    </>
                  )}
                  {isAdmin && !isOwner && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete (Admin)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment */}
        <p className="text-gray-300 mb-4 whitespace-pre-wrap ml-0 sm:ml-14">
          {review.comment}
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Delete Review</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center py-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white mb-2">
                Are you sure you want to delete this review?
              </p>
              <p className="text-gray-400 text-sm">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;