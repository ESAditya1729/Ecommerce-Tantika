const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers from both files
const artisanController = require('../controllers/artisanController');
const artisanAnalyticsController = require('../controllers/artisanAnalyticsController');

// All routes require authentication
router.use(protect);

// Dashboard routes (from analytics controller)
router.get('/dashboard', authorize('artisan'), artisanAnalyticsController.getDashboard);
router.get('/pending-status', authorize('pending_artisan'), artisanController.getPendingStatus);

// Profile routes (from CRUD controller)
router.get('/profile', authorize('artisan', 'pending_artisan'), artisanController.getProfile);
router.put('/profile', authorize('artisan', 'pending_artisan'), artisanController.updateProfile);
router.put('/bank-details', authorize('artisan'), artisanController.updateBankDetails);

// Product management routes (split between both controllers)
router.get('/products', authorize('artisan', 'pending_artisan'), artisanAnalyticsController.getProducts); // Query operation
router.post('/products', authorize('artisan'), artisanController.createProductArtisan); // CRUD operation
router.put('/products/:id', authorize('artisan'), artisanController.updateProduct); // CRUD operation
router.delete('/products/:id', authorize('artisan'), artisanController.deleteProduct); // CRUD operation

// Order management routes (split between both controllers)
router.get('/orders', authorize('artisan'), artisanAnalyticsController.getOrders); // Query operation
router.put('/orders/:id/status', authorize('artisan'), artisanController.updateOrderStatus); // CRUD operation

// Analytics routes (from analytics controller)
router.get('/analytics', authorize('artisan'), artisanAnalyticsController.getAnalytics);

// Notification routes (from CRUD controller)
router.get('/notifications', authorize('artisan'), artisanController.getNotifications);
router.put('/notifications/:id/read', authorize('artisan'), artisanController.markNotificationAsRead);

// Earnings & Payout routes (split between both controllers)
router.get('/earnings', authorize('artisan'), artisanAnalyticsController.getEarnings); // Query operation
router.post('/payouts/request', authorize('artisan'), artisanController.requestPayout); // CRUD operation

module.exports = router;