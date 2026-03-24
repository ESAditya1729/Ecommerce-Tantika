// D:\My-Projects\ECommerce\Ecommerce-Tantika\frontend\src\pages\ReviewsPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  PenSquare,
  AlertCircle,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { reviewService } from "../services/reviewService";
import { LoadingSpinner } from "../components/LoadingSpinner";
import RatingSummary from "../components/ReviewPage/RatingSummary";
import ReviewCard from "../components/ReviewPage/ReviewCard";
import ReviewFilters from "../components/ReviewPage/ReviewFilters";

const ReviewsPage = () => {
  const { targetType, targetId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [distribution, setDistribution] = useState({});
  const [targetInfo, setTargetInfo] = useState(null);
  const [targetImage, setTargetImage] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get target name from location state or from API response
  const targetName =
    location.state?.targetName || targetInfo?.name || "this product";

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewService.getTargetReviews(
        targetType,
        targetId,
        filters,
      );

      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setPagination(response.data.data.pagination);
        setDistribution(response.data.data.distribution);
        setTargetInfo(response.data.data.targetInfo);

        // Fetch product image from API if not available in targetInfo
        if (!targetImage && response.data.data.targetInfo) {
          await fetchTargetImage();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetImage = async () => {
    try {
      const API_URL =
        process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const endpoint = targetType === "Product" ? "products" : "artisans";
      const response = await fetch(`${API_URL}/${endpoint}/${targetId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const image =
            targetType === "Product"
              ? data.data.image || data.data.images?.[0]
              : data.data.profilePicture?.url;
          setTargetImage(image);
        }
      }
    } catch (err) {
      console.error("Error fetching target image:", err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWriteReview = () => {
    // Navigate to write review page with correct route path
    // Use the targetType from URL params (which could be "Product" or "Artisan")
    // Convert to lowercase for the route
    navigate(`/review/${targetType.toLowerCase()}/${targetId}`, {
      state: {
        targetName: targetName,
        targetId: targetId,
        targetType: targetType.toLowerCase(), // Pass as 'product' or 'artisan'
      },
    });
  };

  const handleReviewUpdate = (updatedReview) => {
    setReviews(
      reviews.map((review) =>
        review._id === updatedReview._id ? updatedReview : review,
      ),
    );
    // Refresh to update ratings
    fetchReviews();
  };

  const handleReviewDelete = async (deletedReviewId) => {
    setReviews(reviews.filter((review) => review._id !== deletedReviewId));
    // Refresh to update ratings and pagination
    fetchReviews();
  };

  // In ReviewsPage.jsx, update the loading section:

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900"
    >
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-white">
              Customer Reviews
            </h1>
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Product Image */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {targetImage ? (
                  <img
                    src={targetImage}
                    alt={targetName}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/80x80/ffffff/9ca3af?text=Product";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white shadow-lg">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {targetName}
                </h2>
                <p className="text-purple-100">
                  See what customers are saying about this product
                </p>
              </div>
            </div>

            <button
              onClick={handleWriteReview}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <PenSquare className="w-5 h-5" />
              Write a Review
            </button>
          </div>
        </div>

        {/* Rating Summary */}
        {targetInfo && (
          <RatingSummary
            rating={targetInfo.rating}
            reviewCount={targetInfo.reviewCount}
            distribution={distribution}
            className="mb-8"
          />
        )}

        {/* No Reviews State */}
        {reviews.length === 0 && !loading && (
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-12 text-center">
            <MessageSquare className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Be the first to share your experience with this product and help
              others make informed decisions.
            </p>
            <button
              onClick={handleWriteReview}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Star className="w-5 h-5" />
              Write the First Review
            </button>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <>
            {/* Filter Bar */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-gray-300"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter</span>
                  </button>

                  <div className="hidden sm:block">
                    <select
                      value={`${filters.sortBy}_${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split("_");
                        handleFilterChange({ sortBy, sortOrder });
                      }}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    >
                      <option value="createdAt_desc">Most Recent</option>
                      <option value="createdAt_asc">Oldest First</option>
                      <option value="rating_desc">Highest Rating</option>
                      <option value="rating_asc">Lowest Rating</option>
                      <option value="helpfulCount_desc">Most Helpful</option>
                    </select>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {reviews.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {pagination.total}
                  </span>{" "}
                  reviews
                </div>
              </div>

              {/* Mobile Sort */}
              <div className="sm:hidden mt-3">
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("_");
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="createdAt_desc">Most Recent</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="rating_desc">Highest Rating</option>
                  <option value="rating_asc">Lowest Rating</option>
                  <option value="helpfulCount_desc">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* Filters Sidebar - Conditional */}
            {showFilters && (
              <div className="mb-6">
                <ReviewFilters
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onUpdate={handleReviewUpdate}
                  onDelete={handleReviewDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                              : "border-gray-600 hover:bg-gray-700 text-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewsPage;
