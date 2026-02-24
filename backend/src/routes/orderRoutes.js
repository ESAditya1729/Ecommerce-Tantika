// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('./controllers/orderController');
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
router.get('/artisan/me/orders', protect, artisan, (req, res) => {
  // Redirect to the artisan orders endpoint with the user's artisan ID
  req.params.artisanId = req.user.artisanId || req.user._id;
  OrderController.getArtisanOrders(req, res);
});

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

// Delete order (soft delete by updating status) - SuperAdmin only
router.delete('/admin/:id', protect, superAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent === 'true') {
      // For permanent deletion, use bulk update with delete action
      req.body = {
        orderIds: [id],
        action: 'delete',
        value: 'permanent'
      };
      return OrderController.bulkUpdateOrders(req, res);
    } else {
      // Soft delete by updating status to cancelled
      req.body = {
        status: 'cancelled',
        reason: 'Order deleted by super admin',
        notes: 'Order has been deleted from the system'
      };
      return OrderController.updateOrderStatus(req, res);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
});

// Bulk delete orders - SuperAdmin only
router.post('/admin/bulk/delete', protect, superAdmin, async (req, res) => {
  try {
    const { orderIds, permanent = false } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs are required'
      });
    }
    
    if (permanent) {
      // Permanent deletion
      req.body = {
        orderIds,
        action: 'delete',
        value: 'permanent'
      };
    } else {
      // Soft delete by updating status
      req.body = {
        orderIds,
        action: 'status',
        value: 'cancelled',
        reason: 'Bulk deletion by super admin'
      };
    }
    
    return OrderController.bulkUpdateOrders(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete orders'
    });
  }
});


// ============= LEGACY ROUTES (Maintained for backward compatibility) =============

// Legacy: Create order via express-interest (now requires authentication)
router.post('/express-interest', protect, OrderController.createOrder);

// Legacy: Get customer orders by email (redirects to authenticated version)
router.get('/customer/:email', protect, OrderController.getOrdersByCustomer);

module.exports = router;