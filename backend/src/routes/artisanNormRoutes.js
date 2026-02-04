const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getProfile,
  updateProfile,
  updateBankDetails,
  getPendingStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getAnalytics,
  getNotifications,
  markNotificationAsRead,
  getEarnings,
  requestPayout
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
router.post('/products', authorize('artisan'), createProduct);
router.put('/products/:id', authorize('artisan'), updateProduct);
router.delete('/products/:id', authorize('artisan'), deleteProduct);

// Order management routes
router.get('/orders', authorize('artisan'), getOrders);
router.put('/orders/:id/status', authorize('artisan'), updateOrderStatus);

// Analytics routes
router.get('/analytics', authorize('artisan'), getAnalytics);

// Notification routes
router.get('/notifications', authorize('artisan'), getNotifications);
router.put('/notifications/:id/read', authorize('artisan'), markNotificationAsRead);

// Earnings & Payout routes
router.get('/earnings', authorize('artisan'), getEarnings);
router.post('/payouts/request', authorize('artisan'), requestPayout);

module.exports = router;