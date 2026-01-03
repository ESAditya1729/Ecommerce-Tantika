// routes/userNormRoutes.js (RENAME THIS FILE!)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userNormController = require('../controllers/userNormController');

// Profile routes
router.get('/profile', protect, userNormController.getUserProfile);
router.put('/profile', protect, userNormController.updateUserProfile);
router.put('/change-password', protect, userNormController.changePassword);

// Dashboard routes
router.get('/dashboard/stats', protect, userNormController.getDashboardStats);
router.get('/dashboard/summary', protect, userNormController.getDashboardSummary);
router.get('/recent-activity', protect, userNormController.getRecentActivity);

// Order routes
router.get('/orders', protect, userNormController.getUserOrders);
router.get('/orders/:id', protect, userNormController.getOrderById);
router.put('/orders/:id/cancel', protect, userNormController.cancelOrder);

// Wishlist routes - ADD THESE!
router.get('/wishlist', protect, userNormController.getWishlist);
router.post('/wishlist', protect, userNormController.addToWishlist);
router.delete('/wishlist/:productId', protect, userNormController.removeFromWishlist);
router.delete('/wishlist', protect, userNormController.clearWishlist);
router.get('/wishlist/check/:productId', protect, userNormController.checkWishlistStatus);
router.get('/wishlist/count', protect, userNormController.getWishlistCount);
router.put('/wishlist/availability/:productId', protect, userNormController.updateItemAvailability);

// Account management
router.put('/deactivate', protect, userNormController.deactivateAccount);
router.put('/reactivate', userNormController.reactivateAccount);

module.exports = router;