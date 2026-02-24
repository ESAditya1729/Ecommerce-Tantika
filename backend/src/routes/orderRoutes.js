// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { protect, admin, superAdmin, artisan } = require('../middleware/authMiddleware');
const Order = require('../models/Order'); // Add this import at the top

// ============= PUBLIC ROUTES =============
// Track order by order number - Public
router.get('/track/:orderNumber', orderController.getOrderByNumber);

// ============= AUTHENTICATED USER ROUTES =============
// Create a new order
router.post('/', protect, orderController.createOrder);

// Get logged-in user's orders
router.get('/my-orders', protect, orderController.getMyOrders);

// Get specific order by ID
router.get('/:id', protect, orderController.getOrderById);

// Cancel order
router.put('/:id/cancel', protect, orderController.cancelOrder);

// ============= ARTISAN ROUTES =============
// Get logged-in artisan's orders
router.get('/artisan/me/orders', protect, artisan, orderController.getArtisanOrders);

// ============= ADMIN ROUTES =============
// Get all orders with filters
router.get('/admin/all', protect, admin, orderController.getAllOrders);

// Update order status
router.put('/admin/:id/status', protect, admin, orderController.updateOrderStatus);

// ============= SUPER ADMIN ONLY ROUTES =============
// Delete order permanently (SuperAdmin only)
// router.delete('/admin/:id', protect, superAdmin, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, error: 'Order not found' });
//     }
//     await order.deleteOne();
//     res.json({ success: true, message: 'Order deleted permanently' });
//   } catch (error) {
//     console.error('Delete order error:', error);
//     res.status(500).json({ success: false, error: 'Failed to delete order' });
//   }
// });

// ============= LEGACY ROUTES (for backward compatibility) =============
router.post('/express-interest', protect, orderController.createOrder);

// Debug route info
if (process.env.NODE_ENV !== 'production') {
  console.log('\n=== Order Routes Registered ===');
  router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${layer.route.path}`);
    }
  });
  console.log('================================\n');
}

module.exports = router;