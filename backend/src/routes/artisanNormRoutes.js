// routes/artisanRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize, artisan } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// Import controllers
const artisanController = require('../controllers/artisanAnalyticsController');
const artisanNormController = require('../controllers/artisanController');

// All routes require authentication
router.use(protect);

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('artisan'), artisanController.getDashboard);

// ==================== PRODUCTS ====================
router.get('/products', authorize('artisan', 'pending_artisan'), artisanController.getProducts);

// ==================== ORDERS ====================
router.get('/orders', authorize('artisan'), artisanController.getOrders);
router.get('/orders/:orderId', authorize('artisan'), artisanController.getOrderDetails);
router.put('/orders/:orderId/status', authorize('artisan'), artisanController.updateOrderStatus);
router.post('/orders/:orderId/notes', authorize('artisan'), artisanController.addOrderNote);
router.get('/orders/stats/summary', authorize('artisan'), artisanController.getOrderStats);
router.get('/orders/export/csv', authorize('artisan'), artisanController.exportOrdersCSV);

// ==================== EARNINGS & PAYOUTS ====================
router.get('/earnings', authorize('artisan'), artisanController.getEarnings);
router.post('/payouts/request', authorize('artisan'), artisanController.requestPayout);
router.get('/payouts', authorize('artisan'), artisanController.getPayoutHistory);

// ==================== PROFILE & SETTINGS (NEW) ====================
// Profile routes
router.get('/profile', authorize('artisan'), artisanNormController.getProfile);
router.put('/profile', authorize('artisan'), artisanNormController.updateProfile);

// Bank details (optional)
router.put('/bank-details', authorize('artisan'), artisanNormController.updateBankDetails);

// Settings
router.put('/notification-settings', authorize('artisan'), artisanNormController.updateNotificationSettings);
router.put('/payout-settings', authorize('artisan'), artisanNormController.updatePayoutSettings);

// Read-only info
router.get('/id-proof', authorize('artisan'), artisanNormController.getIdProof);
router.get('/metrics', authorize('artisan'), artisanNormController.getMetrics);

// Activity tracking
router.post('/heartbeat', authorize('artisan'), artisanNormController.updateHeartbeat);

module.exports = router;