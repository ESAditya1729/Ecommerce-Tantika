// src/controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const mongoose = require('mongoose');

// ==================== HELPER FUNCTION: Update Average Rating ====================
/**
 * Calculates and updates the average rating for a target (Product or Artisan)
 * Formula: (sum of all ratings) / (total number of reviews)
 */
const updateTargetAverageRating = async (targetType, targetId) => {
  try {
    // Get all approved reviews for this target
    const reviews = await Review.find({
      targetType,
      targetId,
      status: 'approved'
    });

    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      // No reviews, set rating to 0
      if (targetType === 'Product') {
        await Product.findByIdAndUpdate(targetId, {
          rating: 0,
          reviewCount: 0
        });
      } else if (targetType === 'Artisan') {
        await Artisan.findByIdAndUpdate(targetId, {
          rating: 0,
          reviewCount: 0
        });
      }
      return;
    }

    // Calculate sum of all ratings
    const sumOfRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    
    // Calculate average (rounded to 1 decimal place)
    const averageRating = Math.round((sumOfRatings / totalReviews) * 10) / 10;

    console.log(`Updating ${targetType} ${targetId}:`, {
      totalReviews,
      sumOfRatings,
      averageRating
    });

    // Update the target with new average and count
    if (targetType === 'Product') {
      await Product.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewCount: totalReviews
      });
    } else if (targetType === 'Artisan') {
      await Artisan.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewCount: totalReviews
      });
    }

  } catch (error) {
    console.error('Error updating average rating:', error);
    throw error;
  }
};

// ==================== CREATE REVIEW ====================
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment, title } = req.body;
    const userId = req.user.id;

    // Validate target type
    if (!['Product', 'Artisan'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be either Product or Artisan'
      });
    }

    // Check if target exists
    const Target = mongoose.model(targetType);
    const target = await Target.findById(targetId);
    
    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // Check if user already reviewed this target
    const existingReview = await Review.findOne({
      user: userId,
      targetType,
      targetId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create review with approved status (since no moderation needed)
    const reviewData = {
      user: userId,
      targetType,
      targetId,
      rating,
      comment,
      title: title || '',
      status: 'approved', // Set to approved immediately
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // If reviewing a product, add artisan reference
    if (targetType === 'Product' && target.artisan) {
      reviewData.artisan = target.artisan;
    }

    // Create the review
    const review = await Review.create(reviewData);

    // Calculate and update the average rating for the target
    await updateTargetAverageRating(targetType, targetId);

    // Populate user details
    await review.populate('user', 'username profilePicture');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully!'
    });

  } catch (error) {
    console.error('Create review error:', error);
    
    // Handle duplicate key error (user already reviewed)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// ==================== GET REVIEWS FOR TARGET ====================
exports.getTargetReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Validate target type
    if (!['Product', 'Artisan'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type'
      });
    }

    // Check if target exists
    const Target = mongoose.model(targetType);
    const target = await Target.findById(targetId);
    
    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // Build query
    const query = {
      targetType,
      targetId,
      status: 'approved'
    };

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews
    const reviews = await Review.find(query)
      .populate('user', 'username profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const distribution = await getRatingDistribution(targetType, targetId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        distribution,
        targetInfo: {
          name: target.name || target.businessName,
          rating: target.rating,
          reviewCount: target.reviewCount
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// ==================== HELPER FUNCTION: Get Rating Distribution ====================
const getRatingDistribution = async (targetType, targetId) => {
  const distribution = await Review.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Format distribution (1-5 stars)
  const formatted = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  distribution.forEach(item => {
    formatted[item._id] = item.count;
  });

  return formatted;
};

// ==================== GET SINGLE REVIEW ====================
exports.getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'username profilePicture')
      .populate('targetId', 'name businessName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// ==================== UPDATE REVIEW ====================
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review'
      });
    }

    // Store old values for recalculation
    const oldRating = review.rating;
    
    // Update review
    review.rating = rating;
    review.comment = comment;
    review.title = title || '';
    
    await review.save();

    // Recalculate average rating
    await updateTargetAverageRating(review.targetType, review.targetId);

    await review.populate('user', 'username profilePicture');

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// ==================== DELETE REVIEW ====================
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    const { targetType, targetId } = review;
    
    await review.deleteOne();

    // Recalculate average rating after deletion
    await updateTargetAverageRating(targetType, targetId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// ==================== MARK REVIEW AS HELPFUL ====================
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Don't allow marking own review as helpful
    if (review.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot mark your own review as helpful'
      });
    }

    await review.markHelpful(userId);

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: review.helpfulCount
    });

  } catch (error) {
    if (error.message === 'User has already marked this review as helpful') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};

// ==================== REPORT REVIEW ====================
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comment } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Don't allow reporting own review
    if (review.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own review'
      });
    }

    await review.report(userId, reason, comment);

    res.status(200).json({
      success: true,
      message: 'Review reported successfully. Our team will review it.'
    });

  } catch (error) {
    if (error.message === 'You have already reported this review') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting review',
      error: error.message
    });
  }
};

// ==================== GET USER REVIEWS ====================
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId, status: 'approved' })
      .populate('targetId', 'name businessName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: userId, status: 'approved' });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: error.message
    });
  }
};

// ==================== ADMIN: APPROVE REVIEW ====================
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.approve(adminId);

    res.status(200).json({
      success: true,
      message: 'Review approved successfully'
    });

  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving review',
      error: error.message
    });
  }
};

// ==================== ADMIN: REJECT REVIEW ====================
exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.reject(adminId, reason);

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully'
    });

  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting review',
      error: error.message
    });
  }
};

// ==================== ADMIN: GET PENDING REVIEWS ====================
exports.getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, targetType } = req.query;

    const query = { status: 'pending' };
    if (targetType) {
      query.targetType = targetType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('user', 'username email')
      .populate('targetId', 'name businessName')
      .sort({ submittedAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending reviews',
      error: error.message
    });
  }
};

// ==================== ADMIN: BULK APPROVE ====================
exports.bulkApproveReviews = async (req, res) => {
  try {
    const { reviewIds } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of review IDs'
      });
    }

    const result = await Review.updateMany(
      { _id: { $in: reviewIds }, status: 'pending' },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId
        }
      }
    );

    // Update ratings for affected targets
    const reviews = await Review.find({ _id: { $in: reviewIds } });
    const targetUpdates = new Set();
    
    reviews.forEach(review => {
      targetUpdates.add(`${review.targetType}-${review.targetId}`);
    });

    // Update each target's rating
    for (const targetKey of targetUpdates) {
      const [targetType, targetId] = targetKey.split('-');
      await updateTargetAverageRating(targetType, targetId);
    }

    res.status(200).json({
      success: true,
      message: `Approved ${result.modifiedCount} reviews`,
      data: result
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk approving reviews',
      error: error.message
    });
  }
};