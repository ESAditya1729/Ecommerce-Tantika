// src/models/Review.js (Fixed Version)

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // ==================== BASIC INFORMATION ====================
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: ''
  },
  
  // ==================== REFERENCES ====================
  // Who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // What is being reviewed (Product or Artisan)
  targetType: {
    type: String,
    enum: ['Product', 'Artisan'],
    required: [true, 'Target type is required'],
    index: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType', // Dynamic referencing
    index: true
  },
  
  // Optional: Track if this review is for a product by a specific artisan
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    index: true
  },
  
  // ==================== REVIEW STATUS ====================
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'hidden'],
    default: 'pending'
  },
  
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Users who found this review helpful
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reports on this review
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
      required: true
    },
    comment: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending'
    }
  }],
  
  // Admin responses
  adminResponse: {
    comment: {
      type: String,
      trim: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  
  // ==================== EDIT HISTORY ====================
  editHistory: [{
    rating: Number,
    comment: String,
    title: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ==================== METADATA ====================
  ipAddress: {
    type: String
  },
  
  userAgent: {
    type: String
  },
  
  // ==================== TIMESTAMPS ====================
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  approvedAt: {
    type: Date
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// ==================== COMPOUND INDEXES ====================
// Ensure one review per user per target
reviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// For efficient queries
reviewSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ targetType: 1, targetId: 1, rating: -1 });
reviewSchema.index({ targetType: 1, targetId: 1, helpfulCount: -1 });
reviewSchema.index({ artisan: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// ==================== VIRTUAL FIELDS ====================
reviewSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

reviewSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

reviewSchema.virtual('canBeEdited').get(function() {
  // Can edit within 30 days of submission if not approved yet
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.status === 'pending' && this.submittedAt > thirtyDaysAgo;
});

// ==================== STATIC METHODS ====================

/**
 * Calculate and update average rating for a target
 */
reviewSchema.statics.updateTargetRating = async function(targetType, targetId) {
  try {
    const Review = this;
    const Target = mongoose.model(targetType);
    
    // Calculate new average rating and count
    const result = await Review.aggregate([
      {
        $match: {
          targetType,
          targetId: new mongoose.Types.ObjectId(targetId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    
    const updateData = {
      rating: result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0,
      reviewCount: result.length > 0 ? result[0].reviewCount : 0
    };
    
    // Update the target (Product or Artisan)
    await Target.findByIdAndUpdate(targetId, updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error updating target rating:', error);
    throw error;
  }
};

/**
 * Get reviews for a target with pagination and sorting
 */
reviewSchema.statics.getTargetReviews = async function(targetType, targetId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'approved',
    minRating,
    maxRating,
    verifiedOnly = false
  } = options;
  
  const query = {
    targetType,
    targetId: new mongoose.Types.ObjectId(targetId),
    status
  };
  
  if (minRating || maxRating) {
    query.rating = {};
    if (minRating) query.rating.$gte = minRating;
    if (maxRating) query.rating.$lte = maxRating;
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    this.find(query)
      .populate('user', 'username profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get rating distribution for a target
 */
reviewSchema.statics.getRatingDistribution = async function(targetType, targetId) {
  const distribution = await this.aggregate([
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

// ==================== INSTANCE METHODS ====================

/**
 * Mark review as helpful by a user
 */
reviewSchema.methods.markHelpful = async function(userId) {
  // Check if user already voted
  const alreadyVoted = this.helpfulVotes.some(
    vote => vote.user.toString() === userId.toString()
  );
  
  if (alreadyVoted) {
    throw new Error('User has already marked this review as helpful');
  }
  
  this.helpfulVotes.push({ user: userId, votedAt: new Date() });
  this.helpfulCount = this.helpfulVotes.length;
  
  return this.save();
};

/**
 * Report a review
 */
reviewSchema.methods.report = async function(userId, reason, comment = '') {
  // Check if user already reported
  const alreadyReported = this.reports.some(
    report => report.user.toString() === userId.toString() && report.status === 'pending'
  );
  
  if (alreadyReported) {
    throw new Error('You have already reported this review');
  }
  
  this.reports.push({
    user: userId,
    reason,
    comment,
    reportedAt: new Date()
  });
  
  this.reportCount = this.reports.length;
  
  // Auto-flag if multiple reports
  if (this.reportCount >= 5) {
    this.status = 'flagged';
  }
  
  return this.save();
};

/**
 * Edit review
 */
reviewSchema.methods.editReview = async function(rating, comment, title = '') {
  // Save current version to history
  this.editHistory.push({
    rating: this.rating,
    comment: this.comment,
    title: this.title,
    editedAt: new Date()
  });
  
  // Update with new values
  this.rating = rating;
  this.comment = comment;
  this.title = title;
  
  // Reset status to pending for moderation
  this.status = 'pending';
  
  return this.save();
};

/**
 * Approve review (admin only)
 */
reviewSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  
  await this.save();
  
  // Update target rating
  await this.constructor.updateTargetRating(this.targetType, this.targetId);
  
  return this;
};

/**
 * Reject review (admin only)
 */
reviewSchema.methods.reject = async function(adminId, reason = '') {
  this.status = 'rejected';
  this.adminResponse = {
    comment: reason,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  
  return this.save();
};

// ==================== PRE-SAVE MIDDLEWARE ====================
// FIXED: Removed the 'next' parameter and just use the function without callback
reviewSchema.pre('save', function() {
  // Update helpful count based on helpfulVotes array length
  if (this.isModified('helpfulVotes')) {
    this.helpfulCount = this.helpfulVotes.length;
  }
  
  // Update report count based on reports array length
  if (this.isModified('reports')) {
    this.reportCount = this.reports.length;
  }
  
  // No need to call next() - Mongoose handles it automatically
});

// ==================== POST-SAVE MIDDLEWARE ====================
// FIXED: Using function with proper error handling
reviewSchema.post('save', async function(doc) {
  try {
    // Update target rating when a review is approved
    if (doc.status === 'approved' && doc.isNew) {
      await doc.constructor.updateTargetRating(doc.targetType, doc.targetId);
    }
  } catch (error) {
    console.error('Error in post-save middleware:', error);
  }
});

// FIXED: Using function with proper error handling
reviewSchema.post('findOneAndUpdate', async function(doc) {
  try {
    // Update target rating when review status changes
    if (doc && doc.status === 'approved') {
      await doc.constructor.updateTargetRating(doc.targetType, doc.targetId);
    }
  } catch (error) {
    console.error('Error in findOneAndUpdate middleware:', error);
  }
});

// FIXED: post-delete middleware
reviewSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    if (doc) {
      await doc.constructor.updateTargetRating(doc.targetType, doc.targetId);
    }
  } catch (error) {
    console.error('Error in deleteOne middleware:', error);
  }
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc) {
      await doc.constructor.updateTargetRating(doc.targetType, doc.targetId);
    }
  } catch (error) {
    console.error('Error in findOneAndDelete middleware:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);