// routes/artisanRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers
const artisanController = require('../controllers/artisanAnalyticsController');

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

module.exports = router;