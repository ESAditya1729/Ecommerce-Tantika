// routes/artisanRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Artisan = require('../models/Artisan');

// Import controllers
const artisanController = require('../controllers/artisanController');
const artisanAnalyticsController = require('../controllers/artisanAnalyticsController');
const orderController = require('../controllers/OrderController');

// All routes require authentication
router.use(protect);

// ==================== DASHBOARD & ANALYTICS (Analytics Controller) ====================
if (artisanAnalyticsController.getDashboard) {
  router.get('/dashboard', authorize('artisan'), artisanAnalyticsController.getDashboard);
}

if (artisanAnalyticsController.getAnalytics) {
  router.get('/analytics', authorize('artisan'), artisanAnalyticsController.getAnalytics);
}

if (artisanAnalyticsController.getEarnings) {
  router.get('/earnings', authorize('artisan'), artisanAnalyticsController.getEarnings);
}

// ==================== PRODUCTS ====================
if (artisanAnalyticsController.getProducts) {
  router.get('/products', authorize('artisan', 'pending_artisan'), artisanAnalyticsController.getProducts);
}

// CRUD operations for products
if (artisanController.createProductArtisan) {
  router.post('/products', authorize('artisan'), artisanController.createProductArtisan);
}

if (artisanController.updateProduct) {
  router.put('/products/:id', authorize('artisan'), artisanController.updateProduct);
}

if (artisanController.deleteProduct) {
  router.delete('/products/:id', authorize('artisan'), artisanController.deleteProduct);
}

// ==================== ORDERS ====================
if (artisanAnalyticsController.getOrders) {
  router.get('/orders', authorize('artisan'), artisanAnalyticsController.getOrders);
}

if (artisanController.getOrderDetails) {
  router.get('/orders/:orderId', authorize('artisan'), artisanController.getOrderDetails);
}

if (artisanController.updateOrderStatus) {
  router.put('/orders/:orderId/status', authorize('artisan'), artisanController.updateOrderStatus);
}

// Add note to order
router.post('/orders/:orderId/notes', authorize('artisan'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }
    
    // Check if order exists and belongs to artisan
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }
    
    const order = await Order.findOne({ 
      _id: orderId, 
      'items.artisan': artisan._id 
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Add note directly
    await order.addNote(note, req.user.id, 'artisan_note', false);
    
    res.json({ success: true, message: 'Note added successfully' });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Failed to add note' });
  }
});

// Order statistics summary
router.get('/orders/stats/summary', authorize('artisan'), async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }
    
    const stats = await Order.aggregate([
      { $match: { 'items.artisan': artisan._id } },
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          processingOrders: { 
            $sum: { $cond: [{ $in: ['$status', ['confirmed', 'processing', 'ready_to_ship']] }, 1, 0] } 
          },
          cancelledOrders: { 
            $sum: { $cond: [{ $in: ['$status', ['cancelled', 'refunded']] }, 1, 0] } 
          }
        }
      }
    ]);
    
    res.json({ success: true, data: stats[0] || {
      totalOrders: 0, totalRevenue: 0, pendingOrders: 0,
      deliveredOrders: 0, processingOrders: 0, cancelledOrders: 0
    }});
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Export orders as CSV
router.get('/orders/export/csv', authorize('artisan'), async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }
    
    const matchFilter = { 'items.artisan': artisan._id };
    if (status && status !== 'all') matchFilter.status = status;
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }
    
    const orders = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      {
        $project: {
          orderNumber: 1,
          status: 1,
          createdAt: 1,
          'customer.name': 1,
          'customer.email': 1,
          'customer.phone': 1,
          'items.name': 1,
          'items.quantity': 1,
          'items.price': 1,
          'items.totalPrice': 1
        }
      }
    ]);
    
    // Generate CSV
    const csvHeader = 'Order Number,Date,Customer Name,Customer Email,Customer Phone,Product,Quantity,Price,Total,Status\n';
    const csvRows = orders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString('en-IN'),
      `"${order.customer?.name || ''}"`,
      order.customer?.email || '',
      order.customer?.phone || '',
      `"${order.items?.name || ''}"`,
      order.items?.quantity || 0,
      order.items?.price || 0,
      order.items?.totalPrice || 0,
      order.status
    ].join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export orders' });
  }
});

// ==================== PROFILE & SETTINGS ====================
if (artisanController.getProfile) {
  router.get('/profile', authorize('artisan', 'pending_artisan'), artisanController.getProfile);
}

if (artisanController.updateProfile) {
  router.put('/profile', authorize('artisan', 'pending_artisan'), artisanController.updateProfile);
}

if (artisanController.updateBankDetails) {
  router.put('/bank-details', authorize('artisan'), artisanController.updateBankDetails);
}

if (artisanController.getPendingStatus) {
  router.get('/pending-status', authorize('pending_artisan'), artisanController.getPendingStatus);
}

// ==================== NOTIFICATIONS ====================
if (artisanController.getNotifications) {
  router.get('/notifications', authorize('artisan'), artisanController.getNotifications);
}

if (artisanController.markNotificationAsRead) {
  router.put('/notifications/:id/read', authorize('artisan'), artisanController.markNotificationAsRead);
}

// ==================== PAYOUTS ====================
if (artisanController.requestPayout) {
  router.post('/payouts/request', authorize('artisan'), artisanController.requestPayout);
}

if (artisanController.getPayoutHistory) {
  router.get('/payouts', authorize('artisan'), artisanController.getPayoutHistory);
}

// Debug: Log registered routes
if (process.env.NODE_ENV !== 'production') {
  console.log('\n=== Artisan Routes Registered ===');
  router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${layer.route.path}`);
    }
  });
  console.log('================================\n');
}

module.exports = router;