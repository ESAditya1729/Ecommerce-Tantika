const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { protect, admin } = require('../middleware/authMiddleware'); // Remove superAdmin from here if it doesn't exist
const Order = require('../models/Order');

// Custom middleware for artisan access
const artisanOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'artisan' || req.user.role === 'admin' || req.user.role === 'superAdmin')) {
    if (req.user.role === 'artisan' && !req.user.artisanId) {
      req.user.artisanId = req.user._id;
    }
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: 'Access denied. Artisan or admin privileges required.' 
  });
};

// Custom middleware for super admin
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superAdmin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: 'Access denied. Super Admin privileges required.' 
  });
};

// ============= PUBLIC ROUTES =============
router.get('/track/:orderNumber', OrderController.getOrderByNumber);

// ============= AUTHENTICATED USER ROUTES =============
router.post('/', protect, OrderController.createOrder);
router.get('/my-orders', protect, OrderController.getMyOrders);
router.get('/:id', protect, OrderController.getOrderById);
router.put('/:id/cancel', protect, OrderController.cancelOrder);

// ============= ARTISAN ROUTES =============
router.get('/artisan/me/orders', protect, artisanOrAdmin, OrderController.getArtisanOrders);

// ============= ADMIN ROUTES =============
// IMPORTANT: All admin routes must be prefixed with /admin
router.get('/admin/all', protect, admin, OrderController.getAllOrders);

// Dashboard summary
router.get('/admin/summary/dashboard', protect, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      contactedOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'contacted' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        pendingOrders,
        contactedOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary' });
  }
});

// Update order status
router.put('/admin/:id/status', protect, admin, OrderController.updateOrderStatus);

// Bulk update orders
router.post('/admin/bulk/update', protect, admin, async (req, res) => {
  try {
    const { orderIds, action, value } = req.body;
    
    if (!orderIds || !orderIds.length || action !== 'status' || !value) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    const validStatuses = ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(value)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: { status: value },
        $push: {
          statusHistory: {
            status: value,
            changedBy: req.user._id,
            reason: `Bulk status update to ${value}`,
            changedAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk update orders' });
  }
});

// Export orders
router.get('/admin/export/all', protect, admin, async (req, res) => {
  try {
    const { format = 'json', status, search } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { 'customer.name': new RegExp(search, 'i') },
        { 'customer.email': new RegExp(search, 'i') },
        { orderNumber: new RegExp(search, 'i') }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer.userId', 'email')
      .populate('items.artisan', 'businessName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = orders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer Name': order.customer?.name || '',
        'Customer Email': order.customer?.email || '',
        'Customer Phone': order.customer?.phone || '',
        'Status': order.status,
        'Total': order.total,
        'Payment Method': order.payment?.method || '',
        'Payment Status': order.payment?.status || '',
        'Created At': order.createdAt?.toISOString(),
        'Items Count': order.items?.length || 0
      }));

      const csv = require('csv-stringify');
      csv.stringify(csvData, { header: true }, (err, output) => {
        if (err) throw err;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
        res.send(output);
      });
    } else {
      res.json({
        success: true,
        data: orders
      });
    }
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to export orders' });
  }
});

// Add contact history
router.post('/admin/:id/contact', protect, admin, async (req, res) => {
  try {
    const { method, notes } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.contactHistory) {
      order.contactHistory = [];
    }

    order.contactHistory.push({
      method: method || 'whatsapp',
      notes: notes || 'Contacted via WhatsApp',
      contactedBy: req.user._id,
      contactedAt: new Date()
    });

    if (order.status === 'pending') {
      order.status = 'contacted';
      order.statusHistory.push({
        status: 'contacted',
        changedBy: req.user._id,
        reason: 'Contacted customer',
        changedAt: new Date()
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Contact history added',
      data: order
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to add contact history' });
  }
});

// ============= SUPER ADMIN ONLY ROUTES =============
router.delete('/admin/:id', protect, superAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted permanently' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

// Debug route info
if (process.env.NODE_ENV !== 'production') {
  console.log('\n=== Order Routes Registered ===');
  router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} /api/orders${layer.route.path}`);
    }
  });
  console.log('================================\n');
}

module.exports = router;