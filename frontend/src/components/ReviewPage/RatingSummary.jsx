// D:\My-Projects\ECommerce\Ecommerce-Tantika\frontend\src\components\ReviewPage\RatingSummary.jsx

import React from 'react';
import { Star } from 'lucide-react';

const RatingSummary = ({ rating, reviewCount, distribution, className = '' }) => {
  const totalReviews = reviewCount || 0;
  
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  const stars = [5, 4, 3, 2, 1];

  return (
    <div className={`bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Overall Rating */}
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="text-5xl font-bold text-white">
            {rating > 0 ? rating.toFixed(1) : 'No'}
          </div>
          <div className="flex items-center justify-center md:justify-start mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-gray-400 mt-2">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 md:ml-8">
          {stars.map((star) => (
            <div key={star} className="flex items-center gap-3 mb-2">
              <div className="w-12 text-sm text-gray-400">
                {star} {star === 1 ? 'star' : 'stars'}
              </div>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${getPercentage(distribution[star] || 0)}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-400">
                {distribution[star] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;