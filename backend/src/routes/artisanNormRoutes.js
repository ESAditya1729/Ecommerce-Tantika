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

// ==================== ORDERS (Combined from both controllers) ====================
// GET orders with filtering/analytics - Analytics Controller
router.get('/orders', authorize('artisan'), artisanAnalyticsController.getOrders);

// Get single order details - Main Controller (new)
router.get('/orders/:orderId', authorize('artisan'), artisanController.getOrderDetails);

// Update order status - Main Controller
router.put('/orders/:orderId/status', authorize('artisan'), artisanController.updateOrderStatus);

// Add note to order - Main Controller (uses the note method from OrderController)
router.post('/orders/:orderId/notes', authorize('artisan'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }
    
    // Forward to OrderController's addOrderNote method
    const OrderController = require('./controllers/orderController');
    req.params.id = orderId; // Map orderId to id expected by OrderController
    return OrderController.addOrderNote(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
});

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
router.get('/payouts', authorize('artisan'), artisanController.getPayoutHistory);

// ==================== ORDER STATISTICS & REPORTS (New routes) ====================
// Get order statistics summary
router.get('/orders/stats/summary', authorize('artisan'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Artisan = require('../models/Artisan');
    
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
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
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { 
              $cond: [{ $in: ['$status', ['confirmed', 'processing', 'ready_to_ship']] }, 1, 0] 
            }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ['$status', ['cancelled', 'refunded']] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        processingOrders: 0,
        cancelledOrders: 0
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// Export orders as CSV
router.get('/orders/export/csv', authorize('artisan'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Artisan = require('../models/Artisan');
    const { startDate, endDate, status } = req.query;
    
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }
    
    let matchFilter = { 'items.artisan': artisan._id };
    
    if (status && status !== 'all') {
      matchFilter.status = status;
    }
    
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
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
    const csvRows = orders.map(order => {
      return [
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
      ].join(',');
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvHeader + csvRows);
    
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders'
    });
  }
});

module.exports = router;