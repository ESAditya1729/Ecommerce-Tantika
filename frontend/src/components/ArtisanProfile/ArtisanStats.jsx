import React from 'react';
import { motion } from 'framer-motion';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingBag,
  FaEye,
  FaChartLine,
  FaTags,
  FaAward,
  FaCalendarAlt
} from 'react-icons/fa';

const ArtisanStats = ({ stats, artisan }) => {
  // Safely format numbers with fallbacks
  const formatRating = (rating) => {
    if (!rating && rating !== 0) return '0.0';
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    const numValue = typeof num === 'string' ? parseInt(num) : num;
    return isNaN(numValue) ? '0' : numValue.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '₹0' : `₹${numAmount.toLocaleString()}`;
  };

  // Safely access stats with defaults
  const safeStats = {
    totalProducts: stats?.overview?.totalProducts || stats?.totalProducts || 0,
    averageRating: stats?.overview?.averageRating || stats?.averageRating || 0,
    totalReviews: stats?.overview?.totalReviews || stats?.totalReviews || 10,
    totalViews: stats?.totalViews ?? 0,
    categories: stats?.overview?.categories || stats?.categories || [],
    priceRange: stats?.overview?.priceRange || stats?.priceRange || { min: 0, max: 0 },
    categoryBreakdown: stats?.categoryBreakdown || [],
    monthlyTrend: stats?.monthlyTrend || []
  };

  const statsCards = [
    {
      icon: <FaShoppingBag className="text-2xl" />,
      label: 'Total Products',
      value: formatNumber(safeStats.totalProducts),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: <FaEye className="text-2xl" />,
      label: 'Total Views',
      value: safeStats.totalViews,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: <FaStar className="text-2xl" />,
      label: 'Average Rating',
      value: formatRating(safeStats.averageRating),
      subValue: `(${formatNumber(safeStats.totalReviews)} reviews)`,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      label: 'Member Since',
      value: artisan?.joinedAt ? new Date(artisan.joinedAt).getFullYear() : 'N/A',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  // Render stars for rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className={`${stat.bgColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </div>
              <div className={`${stat.color} text-white p-3 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rating Distribution */}
      {safeStats.averageRating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaAward className="text-orange-500" />
            Rating Overview
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-800">
              {formatRating(safeStats.averageRating)}
            </div>
            <div>
              <div className="flex gap-1 text-xl">
                {renderRatingStars(safeStats.averageRating)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Based on {formatNumber(safeStats.totalReviews)} reviews
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {safeStats.categoryBreakdown && safeStats.categoryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaTags className="text-orange-500" />
            Category Performance
          </h3>
          <div className="space-y-3">
            {safeStats.categoryBreakdown.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{cat.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{cat.count} products</span>
                  {cat.averageRating > 0 && (
                    <span className="flex items-center gap-1 text-sm">
                      <FaStar className="text-yellow-400 text-xs" />
                      {cat.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Price Range */}
      {safeStats.priceRange && (safeStats.priceRange.min > 0 || safeStats.priceRange.max > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-orange-500" />
            Price Range
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm text-gray-500">Minimum</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(safeStats.priceRange.min)}
              </p>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Maximum</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(safeStats.priceRange.max)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monthly Trend */}
      {safeStats.monthlyTrend && safeStats.monthlyTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-orange-500" />
            Monthly Products Added
          </h3>
          <div className="space-y-2">
            {safeStats.monthlyTrend.map((month, index) => {
              const monthName = new Date(month.year, month.month - 1).toLocaleString('default', { month: 'short' });
              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20">{monthName} {month.year}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (month.productsAdded / 10) * 100)}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {month.productsAdded}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtisanStats;