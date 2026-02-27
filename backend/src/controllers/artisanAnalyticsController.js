// src/controllers/artisanController.js
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');
const mongoose = require('mongoose');

// Helper function to get artisan from user
const getArtisanFromUser = async (userId) => {
  const artisan = await Artisan.findOne({ userId });
  if (!artisan) throw new Error('Artisan profile not found');
  return artisan;
};

// @desc    Get artisan dashboard data
exports.getDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    if (artisan.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Account not approved' });
    }

    const [
      products,
      productCounts,
      recentOrders,
      orderStats,
      pendingPayouts
    ] = await Promise.all([
      Product.find({ artisan: artisan._id })
        .select('name price stock status approvalStatus image sales rating')
        .sort({ createdAt: -1 })
        .limit(10),
      
      Product.aggregate([
        { $match: { artisan: artisan._id } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] } }
        }}
      ]),
      
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        { $project: {
          orderNumber: 1,
          status: 1,
          createdAt: 1,
          customer: 1,
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: { $eq: ['$$item.artisan', artisan._id] }
            }
          }
        }}
      ]),
      
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id } },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }}
      ]),
      
      Order.aggregate([
        { $match: { 
          'items.artisan': artisan._id, 
          status: 'delivered', 
          'payment.status': 'completed',
          'commission.paidToArtisan': false 
        }},
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { 
          _id: null, 
          amount: { $sum: '$items.totalPrice' } 
        }}
      ])
    ]);

    const formattedOrders = recentOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      customer: order.customer,
      items: order.items,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    const orderCountsObj = {};
    orderStats.forEach(item => { 
      orderCountsObj[item._id] = item.count; 
    });

    res.json({
      success: true,
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          rating: artisan.rating || 0,
          totalProducts: productCounts[0]?.total || 0,
          status: artisan.status
        },
        stats: {
          totalProducts: productCounts[0]?.total || 0,
          approvedProducts: productCounts[0]?.approved || 0,
          pendingProducts: productCounts[0]?.pending || 0,
          pendingOrders: orderCountsObj['pending'] || 0,
          processingOrders: orderCountsObj['processing'] || 0,
          confirmedOrders: orderCountsObj['confirmed'] || 0,
          shippedOrders: (orderCountsObj['shipped'] || 0) + (orderCountsObj['ready_to_ship'] || 0),
          deliveredOrders: orderCountsObj['delivered'] || 0,
          cancelledOrders: orderCountsObj['cancelled'] || 0,
          pendingPayouts: pendingPayouts[0]?.amount || 0
        },
        recentProducts: products,
        recentOrders: formattedOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get artisan's products
exports.getProducts = async (req, res) => {
  try {
    if (!['artisan', 'pending_artisan'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    // FIXED: Added category to destructured query parameters
    const { page = 1, limit = 10, status, approvalStatus, search, category } = req.query;

    const filter = { artisan: artisan._id };
    
    // Add status filter if provided
    if (status && status !== 'all') filter.status = status;
    
    // Add approvalStatus filter if provided
    if (approvalStatus && approvalStatus !== 'all') filter.approvalStatus = approvalStatus;
    
    // FIXED: Add category filter if provided and not 'all'
    if (category && category !== 'all' && category !== 'All Categories') {
      filter.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    console.log('Applied filters:', filter); // For debugging

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name price stock status approvalStatus image sales rating createdAt category views')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const summary = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalSales: { $sum: '$sales' },
          totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$stock', 0] },
                  { $lte: ['$stock', 5] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [
                { $eq: ['$stock', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        products,
        summary: summary[0] || {
          totalValue: 0,
          totalSales: 0,
          totalRevenue: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get artisan's orders
exports.getOrders = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, search } = req.query;

    // Build match filter for orders that contain this artisan's products
    const matchFilter = { 'items.artisan': artisan._id };
    
    if (status && status !== 'all') {
      matchFilter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      matchFilter['payment.status'] = paymentStatus;
    }
    
    if (dateFrom || dateTo) {
      matchFilter.createdAt = {};
      if (dateFrom) {
        matchFilter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchFilter.createdAt.$lte = endDate;
      }
    }

    // Add search functionality
    if (search) {
      matchFilter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customer.name': new RegExp(search, 'i') },
        { 'customer.email': new RegExp(search, 'i') },
        { 'customer.phone': new RegExp(search, 'i') }
      ];
    }

    // Get total count
    const total = await Order.countDocuments(matchFilter);

    // Get paginated orders
    const orders = await Order.find(matchFilter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('orderNumber status createdAt customer items payment shipping')
      .lean();

    // Filter items for this artisan only and calculate totals
    const formattedOrders = orders.map(order => {
      const artisanItems = order.items.filter(item => 
        item.artisan && item.artisan.toString() === artisan._id.toString()
      );

      // Calculate subtotal for artisan items
      const subtotal = artisanItems.reduce((sum, item) => 
        sum + (item.totalPrice || (item.price * item.quantity)), 0
      );

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        customer: order.customer,
        payment: order.payment,
        shipping: order.shipping,
        items: artisanItems,
        subtotal: subtotal
      };
    });

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);

    // First check if the order exists
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if this order contains any products from this artisan
    const hasArtisanItems = order.items.some(item => 
      item.artisan && item.artisan.toString() === artisan._id.toString()
    );

    if (!hasArtisanItems) {
      return res.status(404).json({ 
        success: false, 
        message: 'This order does not contain any products from your shop' 
      });
    }

    // Filter items for this artisan only
    const artisanItems = order.items.filter(item => 
      item.artisan && item.artisan.toString() === artisan._id.toString()
    );

    // Get product details for the items
    const productIds = artisanItems.map(item => item.product).filter(id => id);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name images description');

    // Create a map of product details
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    // Add product details to items
    const itemsWithDetails = artisanItems.map(item => ({
      ...item,
      productDetails: item.product ? (productMap[item.product.toString()] || null) : null
    }));

    // Create a response object with only the relevant data
    const orderResponse = {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.customer,
      payment: order.payment,
      shipping: order.shipping,
      items: itemsWithDetails,
      statusHistory: order.statusHistory || [],
      notes: order.notes || []
    };

    res.json({
      success: true,
      data: orderResponse
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update artisan's order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    console.log('=== Updating Order Status ===');
    console.log('Order ID:', orderId);
    console.log('New Status:', status);
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);

    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    console.log('Artisan ID:', artisan._id.toString());

    // Validate status - allowed statuses for artisans
    const artisanAllowedStatuses = ['confirmed', 'processing', 'ready_to_ship', 'cancelled'];
    if (!artisanAllowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Allowed: confirmed, processing, ready_to_ship, cancelled' 
      });
    }

    // Find the order and check if it contains this artisan's products
    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    console.log('Order found:', order.orderNumber);
    console.log('Current status:', order.status);

    // Check if order contains this artisan's products
    const hasArtisanItems = order.items.some(item => 
      item.artisan && item.artisan.toString() === artisan._id.toString()
    );

    if (!hasArtisanItems) {
      console.log('Order does not contain artisan products');
      return res.status(404).json({ 
        success: false, 
        message: 'This order does not contain any products from your shop' 
      });
    }

    // Check if status transition is valid
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['ready_to_ship', 'cancelled'],
      'ready_for_shipment': ['shipped', 'cancelled'],
      'ready_to_ship': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const currentStatus = order.status;
    const allowedNextStatuses = validTransitions[currentStatus] || [];

    if (status !== 'cancelled' && !allowedNextStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change order status from ${currentStatus} to ${status}` 
      });
    }

    // Filter items for this artisan to update stock if cancelled
    const artisanItems = order.items.filter(item => 
      item.artisan && item.artisan.toString() === artisan._id.toString()
    );

    console.log('Artisan items count:', artisanItems.length);

    // Add to status history
    const statusHistoryEntry = {
      status,
      changedBy: req.user.id,
      reason: notes || `Status updated by artisan: ${artisan.businessName}`,
      changedAt: new Date()
    };

    // Update order
    order.status = status;
    order.statusHistory.push(statusHistoryEntry);
    order.updatedAt = new Date();

    // If cancelled, update stock
    if (status === 'cancelled') {
      // Restore stock for cancelled items
      for (const item of artisanItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
          console.log(`Restored stock for product ${item.product}: +${item.quantity}`);
        }
      }
    }

    await order.save();

    console.log('Order status updated successfully');

    // Send notification to customer
    if (order.customer && order.customer.userId) {
      try {
        await Notification.create({
          user: order.customer.userId,
          title: 'Order Status Updated',
          message: `Your order ${order.orderNumber} status is now ${status}`,
          type: 'order_update',
          data: { 
            orderId: order._id, 
            orderNumber: order.orderNumber, 
            status 
          }
        });
        console.log('Notification sent to customer');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    console.log('=== Update Complete ===');

    res.json({ 
      success: true, 
      message: 'Order status updated successfully', 
      data: { 
        orderId: order._id, 
        orderNumber: order.orderNumber,
        status: order.status
      } 
    });

  } catch (error) {
    console.error('=== Update Order Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send a proper error response
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Get earnings summary
exports.getEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    const { period = 'current_month' } = req.query;

    const startDate = new Date();
    const endDate = new Date();
    
    switch(period) {
      case 'current_month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth());
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_90_days':
        startDate.setDate(startDate.getDate() - 90);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'this_year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all_time':
        startDate.setFullYear(2000, 0, 1);
        break;
    }

    const [
      earnings,
      pendingPayouts,
      payouts,
      monthlyBreakdown
    ] = await Promise.all([
      Order.aggregate([
        { $match: { 
          'items.artisan': artisan._id, 
          status: 'delivered', 
          'payment.status': 'completed',
          createdAt: { $gte: startDate, $lte: endDate } 
        }},
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { 
          _id: null, 
          total: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 },
          items: { $sum: '$items.quantity' }
        }}
      ]),
      
      Order.aggregate([
        { $match: { 
          'items.artisan': artisan._id, 
          status: 'delivered', 
          'payment.status': 'completed',
          'commission.paidToArtisan': false 
        }},
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { 
          _id: null, 
          amount: { $sum: '$items.totalPrice' } 
        }}
      ]),

      Payout.find({ artisan: artisan._id })
        .sort({ requestedAt: -1 })
        .limit(10),

      Order.aggregate([
        { $match: { 
          'items.artisan': artisan._id, 
          status: 'delivered', 
          'payment.status': 'completed' 
        }},
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const platformFeeRate = 0.10;
    const totalEarnings = earnings[0]?.total || 0;
    const pendingAmount = pendingPayouts[0]?.amount || 0;
    const availableBalance = pendingAmount * (1 - platformFeeRate);

    res.json({
      success: true,
      data: {
        period,
        summary: {
          grossEarnings: totalEarnings,
          netEarnings: totalEarnings * (1 - platformFeeRate),
          platformFees: totalEarnings * platformFeeRate,
          ordersCount: earnings[0]?.orders || 0,
          itemsSold: earnings[0]?.items || 0,
          averageOrderValue: earnings[0]?.orders ? totalEarnings / earnings[0]?.orders : 0
        },
        balances: {
          pendingBalance: pendingAmount,
          availableBalance,
          platformFeeRate,
          minimumWithdrawal: 500,
          canWithdraw: availableBalance >= 500 && artisan.bankDetails?.verified === true
        },
        recentPayouts: payouts,
        monthlyBreakdown: monthlyBreakdown.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          amount: item.amount,
          orders: item.orders
        }))
      }
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get order statistics summary
exports.getOrderStats = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);

    // Get order statistics using aggregation
    const stats = await Order.aggregate([
      { $match: { 'items.artisan': artisan._id } },
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'delivered'] },
                '$items.totalPrice',
                0
              ]
            } 
          },
          pendingOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
          },
          deliveredOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } 
          },
          processingOrders: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['confirmed', 'processing', 'ready_to_ship']] }, 
                1, 
                0
              ] 
            } 
          },
          cancelledOrders: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['cancelled', 'refunded']] }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      processingOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add note to order
exports.addOrderNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;

    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note is required' });
    }

    const artisan = await getArtisanFromUser(req.user.id);

    // Find order that contains this artisan's products
    const order = await Order.findOne({ 
      _id: orderId, 
      'items.artisan': artisan._id 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or does not contain your products' 
      });
    }

    // Add note to order
    if (!order.notes) {
      order.notes = [];
    }

    order.notes.push({
      note: note.trim(),
      type: 'artisan_note',
      createdBy: req.user.id,
      createdAt: new Date()
    });

    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: order.notes[order.notes.length - 1]
    });
  } catch (error) {
    console.error('Add order note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Export orders as CSV
exports.exportOrdersCSV = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    const { status, paymentStatus, startDate, endDate } = req.query;

    const filter = { 'items.artisan': artisan._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter['payment.status'] = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const csvData = [];
    
    csvData.push([
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Product Name',
      'Quantity',
      'Price',
      'Total',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Shipping Address',
      'City',
      'State',
      'Postal Code'
    ]);

    orders.forEach(order => {
      const artisanItems = order.items.filter(item => 
        item.artisan && item.artisan.toString() === artisan._id.toString()
      );

      artisanItems.forEach(item => {
        csvData.push([
          order.orderNumber,
          new Date(order.createdAt).toLocaleDateString(),
          order.customer?.name || '',
          order.customer?.email || '',
          order.customer?.phone || '',
          item.name,
          item.quantity,
          item.price,
          item.totalPrice,
          order.status,
          order.payment?.status || '',
          order.payment?.method || '',
          order.customer?.shippingAddress?.street || '',
          order.customer?.shippingAddress?.city || '',
          order.customer?.shippingAddress?.state || '',
          order.customer?.shippingAddress?.postalCode || ''
        ]);
      });
    });

    const csvString = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csvString);
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Request payout
exports.requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;

    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);

    if (!artisan.bankDetails?.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bank details not verified. Please complete your bank details verification first.' 
      });
    }

    const pendingPayouts = await Order.aggregate([
      { $match: { 
        'items.artisan': artisan._id, 
        status: 'delivered', 
        'payment.status': 'completed',
        'commission.paidToArtisan': false 
      }},
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      { $group: { 
        _id: null, 
        amount: { $sum: '$items.totalPrice' } 
      }}
    ]);

    const platformFeeRate = 0.10;
    const pendingAmount = pendingPayouts[0]?.amount || 0;
    const availableBalance = pendingAmount * (1 - platformFeeRate);

    if (!amount || amount < 500) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minimum payout amount is ₹500' 
      });
    }

    if (amount > availableBalance) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available balance: ₹${availableBalance.toFixed(2)}` 
      });
    }

    const existingPayout = await Payout.findOne({
      artisan: artisan._id,
      status: 'pending'
    });

    if (existingPayout) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending payout request' 
      });
    }

    const payout = await Payout.create({
      artisan: artisan._id,
      amount,
      netAmount: amount * (1 - platformFeeRate),
      platformFee: amount * platformFeeRate,
      status: 'pending',
      requestedAt: new Date(),
      bankDetails: {
        accountName: artisan.bankDetails.accountName,
        accountNumber: artisan.bankDetails.accountNumber,
        bankName: artisan.bankDetails.bankName,
        ifscCode: artisan.bankDetails.ifscCode,
        accountType: artisan.bankDetails.accountType || 'savings'
      }
    });

    await Notification.create({
      title: 'New Payout Request',
      message: `${artisan.businessName} requested payout of ₹${amount}`,
      type: 'payout_request',
      data: { 
        artisanId: artisan._id, 
        payoutId: payout._id, 
        amount,
        businessName: artisan.businessName
      },
      forAdmin: true
    });

    res.status(201).json({ 
      success: true, 
      message: 'Payout requested successfully', 
      data: payout 
    });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payout history
exports.getPayoutHistory = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    const { page = 1, limit = 10 } = req.query;

    const [payouts, total] = await Promise.all([
      Payout.find({ artisan: artisan._id })
        .sort({ requestedAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit)),
      Payout.countDocuments({ artisan: artisan._id })
    ]);

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;