// src/components/ReviewButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';

const ReviewButton = ({ targetId, targetType, reviewCount, averageRating, className = '' }) => {
  const navigate = useNavigate();

  const handleReviewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to review page with target info
    navigate(`/review/${targetType.toLowerCase()}/${targetId}`, {
      state: {
        targetType,
        targetId,
        from: 'product-details'
      }
    });
  };

  const handleViewReviews = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to all reviews page
    navigate(`/reviews/${targetType.toLowerCase()}/${targetId}`);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Rating Display */}
      <button
        onClick={handleViewReviews}
        className="flex items-center gap-2 group"
        aria-label="View all reviews"
      >
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(averageRating || 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              } group-hover:scale-110 transition-transform`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {averageRating?.toFixed(1) || '0.0'}
        </span>
        {reviewCount > 0 && (
          <span className="text-sm text-gray-500">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </button>

      {/* Write Review Button */}
      <button
        onClick={handleReviewClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">Write a Review</span>
      </button>
    </div>
  );
};

export default ReviewButton;