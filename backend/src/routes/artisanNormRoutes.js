const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getProfile,
  updateProfile,
  updateBankDetails,
  getPendingStatus,
  getProducts,
  getOrders,
  getAnalytics
} = require('../controllers/artisanController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Dashboard routes
router.get('/dashboard', authorize('artisan'), getDashboard);
router.get('/pending-status', authorize('pending_artisan'), getPendingStatus);

// Profile routes
router.get('/profile', authorize('artisan', 'pending_artisan'), getProfile);
router.put('/profile', authorize('artisan', 'pending_artisan'), updateProfile);
router.put('/bank-details', authorize('artisan'), updateBankDetails);

// Product management routes
router.get('/products', authorize('artisan', 'pending_artisan'), getProducts);

// Order routes
router.get('/orders', authorize('artisan'), getOrders);

// Analytics routes
router.get('/analytics', authorize('artisan'), getAnalytics);

module.exports = router;