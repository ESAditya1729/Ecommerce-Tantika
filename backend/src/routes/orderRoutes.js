// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { protect, admin, superAdmin, artisan, optionalAuth } = require('../middleware/authMiddleware');

// ============= PUBLIC ROUTES (Limited information, no auth required) =============

// Track order by order number - Public (limited info)
router.get('/track/:orderNumber', OrderController.getOrderByNumber);


// ============= AUTHENTICATED USER ROUTES (Any logged-in user) =============

// Create a new order - Requires authentication (user, admin, superAdmin)
router.post('/', protect, OrderController.createOrder);

// Get logged-in user's orders - User only
router.get('/my-orders', protect, OrderController.getMyOrders);

// Get specific order by ID - Role-based access
router.get('/:id', protect, OrderController.getOrderById);

// Cancel order - Role-based (users cancel own orders, admins cancel any)
router.put('/:id/cancel', protect, OrderController.cancelOrder);

// Add note to order - Role-based
router.post('/:id/notes', protect, OrderController.addOrderNote);


// ============= ARTISAN ROUTES (Artisan, Admin, SuperAdmin) =============

// Get orders for a specific artisan - Artisan/Admin/SuperAdmin only
router.get('/artisan/:artisanId', protect, artisan, OrderController.getArtisanOrders);

// Get logged-in artisan's orders - Artisan only
router.get('/artisan/me/orders', protect, artisan, OrderController.getArtisanOrders);

// Update order status for artisan items - Artisan/Admin/SuperAdmin only
router.put('/:orderId/artisan-status', protect, artisan, OrderController.updateArtisanOrderStatus);


// ============= ADMIN ROUTES (Admin or SuperAdmin only) =============

// Dashboard summary - Admin/SuperAdmin only
router.get('/admin/summary/dashboard', protect, admin, OrderController.getOrdersSummary);

// Get all orders with filters - Admin/SuperAdmin only
router.get('/admin/all', protect, admin, OrderController.getAllOrders);

// Get orders by customer email/ID - Admin/SuperAdmin only
router.get('/admin/customer/:email', protect, admin, OrderController.getOrdersByCustomer);
router.get('/admin/customer/user/:userId', protect, admin, OrderController.getOrdersByCustomer);

// Update order status - Admin/SuperAdmin only
router.put('/admin/:id/status', protect, admin, OrderController.updateOrderStatus);

// Add contact history - Admin/SuperAdmin only
router.post('/admin/:id/contact', protect, admin, OrderController.addContactHistory);

// Bulk update orders - Admin/SuperAdmin only
router.post('/admin/bulk/update', protect, admin, OrderController.bulkUpdateOrders);

// Export orders - Admin/SuperAdmin only
router.get('/admin/export', protect, admin, OrderController.exportOrders);

// Get single order by ID (admin detailed view) - Admin/SuperAdmin only
router.get('/admin/:id', protect, admin, OrderController.getOrderById);


// ============= SUPER ADMIN ONLY ROUTES =============

// Delete order (hard delete) - SuperAdmin only
router.delete('/admin/:id', protect, superAdmin, OrderController.deleteOrder);

// Bulk delete orders - SuperAdmin only
router.post('/admin/bulk/delete', protect, superAdmin, OrderController.bulkUpdateOrders);


// ============= LEGACY ROUTES (Maintained for backward compatibility) =============

// Legacy: Create order via express-interest (now redirects to main create)
router.post('/express-interest', protect, OrderController.createOrder);

// Legacy: Get customer orders by email (redirects to authenticated version)
router.get('/customer/:email', protect, OrderController.getOrdersByCustomer);

module.exports = router;