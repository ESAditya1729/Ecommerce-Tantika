// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES ====================

// Get reviews for a specific target (product or artisan)
router.get('/target/:targetType/:targetId', reviewController.getTargetReviews);

// Get a single review
router.get('/:id', reviewController.getReview);

// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================

// Create a new review
router.post('/', protect, reviewController.createReview);

// Update a review
router.put('/:id', protect, reviewController.updateReview);

// Delete a review
router.delete('/:id', protect, reviewController.deleteReview);

// Mark a review as helpful
router.post('/:id/helpful', protect, reviewController.markHelpful);

// Report a review
router.post('/:id/report', protect, reviewController.reportReview);

// Get current user's reviews
router.get('/user/me', protect, reviewController.getUserReviews);

// Get specific user's reviews (public)
router.get('/user/:userId', reviewController.getUserReviews);

// ==================== ADMIN ONLY ROUTES ====================

// Get all pending reviews
router.get(
  '/admin/pending',
  protect,
  authorize('admin'),
  reviewController.getPendingReviews
);

// Approve a review
router.put(
  '/admin/:id/approve',
  protect,
  authorize('admin'),
  reviewController.approveReview
);

// Reject a review
router.put(
  '/admin/:id/reject',
  protect,
  authorize('admin'),
  reviewController.rejectReview
);

// Bulk approve reviews
router.post(
  '/admin/bulk-approve',
  protect,
  authorize('admin'),
  reviewController.bulkApproveReviews
);

module.exports = router;