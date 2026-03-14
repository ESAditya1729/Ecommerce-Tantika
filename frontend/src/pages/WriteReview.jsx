// src/pages/WriteReview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Store,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const WriteReview = () => {
  const { targetType, targetId } = useParams();
  const navigate = useNavigate();
  
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const API_URL = process.env.REACT_APP_API_URL ||"http://localhost:5000/api";

  useEffect(() => {
    if (targetId && targetType) {
      fetchTargetDetails();
    }
  }, [targetId, targetType]);

  const fetchTargetDetails = async () => {
    try {
      setLoading(true);
      
      const endpoint = targetType === 'product' ? 'products' : 'artisans';
      const response = await fetch(`${API_URL}/${endpoint}/${targetId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${targetType} details`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTarget(data.data);
      } else {
        throw new Error(data.message || 'Failed to load details');
      }
    } catch (err) {
      console.error('Error fetching target:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    const token = localStorage.getItem('tantika_token');
    if (!token) {
      navigate('/login', {
        state: {
          from: 'write-review',
          targetType,
          targetId
        }
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        targetType: targetType === 'product' ? 'Product' : 'Artisan',
        targetId,
        rating,
        title,
        comment
      };

      const response = await fetch(`${API_URL}/myreviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/product/${targetId}`);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !target) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || 'Item not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            We couldn't find what you're looking for.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center"
      >
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Thank You!
          </h2>
          <p className="text-gray-300 mb-6">
            Your review has been submitted successfully. It will be visible after moderation.
          </p>
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Redirecting you back...</p>
        </div>
      </motion.div>
    );
  }

  const targetName = targetType === 'product' ? target.name : target.businessName;
  const targetImage = targetType === 'product' 
    ? target.image || target.images?.[0]
    : target.profilePicture?.url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 py-8"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Write a Review</h1>
            <p className="text-gray-400 mt-1">
              Share your experience with this {targetType}
            </p>
          </div>

          {/* Target Info */}
          <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-700 shadow-md overflow-hidden flex-shrink-0 border border-gray-600">
                {targetImage ? (
                  <img
                    src={targetImage}
                    alt={targetName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100x100/374151/9ca3af?text=Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    {targetType === 'product' ? (
                      <Package className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Store className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {targetName}
                </h2>
                <p className="text-sm text-gray-400">
                  {targetType === 'product' 
                    ? `by ${target.artisan?.businessName || 'Tantika Exclusive'}`
                    : target.specialization?.join(', ') || 'Artisan'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          {/* Rating Selection */}
          <div className="p-6 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transform hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-lg font-medium text-gray-300">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>
          </div>

          {/* Review Title */}
          <div className="p-6 border-b border-gray-700">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Review Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              maxLength={100}
            />
          </div>

          {/* Review Comment */}
          <div className="p-6 border-b border-gray-700">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? What was your experience like?"
              rows={5}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-white placeholder-gray-400"
              minLength={10}
              maxLength={1000}
              required
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className={comment.length < 10 ? 'text-red-400' : 'text-green-400'}>
                {comment.length < 10 
                  ? `Need at least ${10 - comment.length} more characters`
                  : 'Minimum length reached'
                }
              </span>
              <span className="text-gray-400">{comment.length}/1000</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-900/50">
            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-xl flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.length < 10}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                submitting || rating === 0 || comment.length < 10
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-600/20 active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting Review...
                </>
              ) : (
                'Submit Review'
              )}
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
              Your review will be published after moderation to ensure quality content.
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default WriteReview;