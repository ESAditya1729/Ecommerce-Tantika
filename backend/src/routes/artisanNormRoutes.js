// routes/artisanRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import both controllers
const artisanController = require('../controllers/artisanController');
const artisanAnalyticsController = require('../controllers/artisanAnalyticsController');

// All routes require authentication
router.use(protect);

// ==================== DASHBOARD & ANALYTICS (Analytics Controller) ====================
router.get('/dashboard', authorize('artisan'), artisanAnalyticsController.getDashboard);
router.get('/analytics', authorize('artisan'), artisanAnalyticsController.getAnalytics);
router.get('/earnings', authorize('artisan'), artisanAnalyticsController.getEarnings);

// ==================== PRODUCTS (Split between both controllers) ====================
// GET products with analytics/query features - Analytics Controller
router.get('/products', authorize('artisan', 'pending_artisan'), artisanAnalyticsController.getProducts);

// CRUD operations for products - Main Controller
router.post('/products', authorize('artisan'), artisanController.createProductArtisan);
router.put('/products/:id', authorize('artisan'), artisanController.updateProduct);
router.delete('/products/:id', authorize('artisan'), artisanController.deleteProduct);

// ==================== ORDERS (Split between both controllers) ====================
// GET orders with filtering/analytics - Analytics Controller
router.get('/orders', authorize('artisan'), artisanAnalyticsController.getOrders);

// Update order status - Main Controller
router.put('/orders/:id/status', authorize('artisan'), artisanController.updateOrderStatus);

// ==================== PROFILE & SETTINGS (Main Controller) ====================
router.get('/profile', authorize('artisan', 'pending_artisan'), artisanController.getProfile);
router.put('/profile', authorize('artisan', 'pending_artisan'), artisanController.updateProfile);
router.put('/bank-details', authorize('artisan'), artisanController.updateBankDetails);
router.get('/pending-status', authorize('pending_artisan'), artisanController.getPendingStatus);

// ==================== NOTIFICATIONS (Main Controller) ====================
router.get('/notifications', authorize('artisan'), artisanController.getNotifications);
router.put('/notifications/:id/read', authorize('artisan'), artisanController.markNotificationAsRead);

// ==================== PAYOUTS (Main Controller) ====================
router.post('/payouts/request', authorize('artisan'), artisanController.requestPayout);

module.exports = router;