// D:\My-Projects\ECommerce\Ecommerce-Tantika\frontend\src\components\ReviewPage\ReviewFilters.jsx

import React from 'react';
import { X } from 'lucide-react';

const ReviewFilters = ({ currentFilters, onFilterChange, onClose }) => {
  const sortOptions = [
    { value: 'createdAt_desc', label: 'Most Recent' },
    { value: 'createdAt_asc', label: 'Oldest First' },
    { value: 'rating_desc', label: 'Highest Rating' },
    { value: 'rating_asc', label: 'Lowest Rating' },
    { value: 'helpfulCount_desc', label: 'Most Helpful' },
  ];

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('_');
    onFilterChange({ sortBy, sortOrder });
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">Filter Reviews</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={`${currentFilters.sortBy}_${currentFilters.sortOrder}`}
            onChange={handleSortChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reviews Per Page
          </label>
          <select
            value={currentFilters.limit}
            onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value={5}>5 reviews</option>
            <option value={10}>10 reviews</option>
            <option value={20}>20 reviews</option>
            <option value={50}>50 reviews</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;