// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============= PUBLIC ROUTES (No authentication required) =============
// Customer order creation and tracking routes

// Create a new order (Express Interest) - Public
router.post('/express-interest', OrderController.createOrder);

// Track order by order number - Public
router.get('/track/:orderNumber', OrderController.getOrderByNumber);

// Get customer orders by email - Public (for customers to view their orders)
router.get('/customer/:email', OrderController.getOrdersByCustomer);

// Cancel order - Public (with email verification)
router.put('/:id/cancel', OrderController.cancelOrder);


// ============= ADMIN ROUTES (Authentication + Admin role required) =============
// All routes below this middleware will require admin authentication

// Apply protect and admin middleware to all admin routes
router.use(protect);
router.use(admin);

// Dashboard summary - Admin only
router.get('/summary/dashboard', OrderController.getOrdersSummary);

// Get all orders with filters - Admin only
router.get('/', OrderController.getAllOrders);

// Get single order by ID - Admin only
router.get('/:id', OrderController.getOrderById);

// Update order status - Admin only
router.put('/:id/status', OrderController.updateOrderStatus);

// Add contact history - Admin only
router.post('/:id/contact', OrderController.addContactHistory);

// Bulk update orders - Admin only
router.post('/bulk/update', OrderController.bulkUpdateOrders);

// Export orders - Admin only
router.get('/export/all', OrderController.exportOrders);

module.exports = router;