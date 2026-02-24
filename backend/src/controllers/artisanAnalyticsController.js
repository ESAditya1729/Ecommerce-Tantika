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

// Helper to filter items for specific artisan
const filterArtisanItems = (items, artisanId) => {
  return items.filter(item => item.artisan?.toString() === artisanId.toString());
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

    // Parallel queries for better performance
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
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } }
      ]),
      
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id } },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id, status: 'delivered', 'payment.status': 'completed' } },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { _id: null, amount: { $sum: '$items.totalPrice' } } }
      ])
    ]);

    // Format recent orders
    const formattedOrders = recentOrders.map(order => {
      const artisanItems = filterArtisanItems(order.items, artisan._id);
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        customer: order.customer,
        items: artisanItems,
        itemCount: artisanItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });

    // Format order counts
    const orderCountsObj = {};
    orderStats.forEach(item => { orderCountsObj[item._id] = item.count; });

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
          deliveredOrders: orderCountsObj['delivered'] || 0,
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
    const { page = 1, limit = 10, status, approvalStatus, search } = req.query;

    const filter = { artisan: artisan._id };
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name price stock status approvalStatus image sales rating createdAt')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
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
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

    const matchFilter = { 'items.artisan': artisan._id };
    if (status && status !== 'all') matchFilter.status = status;
    if (dateFrom || dateTo) {
      matchFilter.createdAt = {};
      if (dateFrom) matchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchFilter.createdAt.$lte = endDate;
      }
    }

    const orders = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      { $group: {
        _id: '$_id',
        orderNumber: { $first: '$orderNumber' },
        status: { $first: '$status' },
        createdAt: { $first: '$createdAt' },
        customer: { $first: '$customer' },
        items: { $push: '$items' }
      }}
    ]);

    const total = await Order.countDocuments(matchFilter);

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Update artisan's order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const artisan = await getArtisanFromUser(req.user.id);
    const artisanAllowedStatuses = ['confirmed', 'processing', 'ready_to_ship', 'cancelled'];
    
    if (!artisanAllowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: orderId, 'items.artisan': artisan._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.updateStatus(status, artisan.userId, `Updated by artisan: ${artisan.businessName}`, notes || '');

    // Send notification to customer
    if (order.customer.userId) {
      await Notification.create({
        user: order.customer.userId,
        title: 'Order Status Updated',
        message: `Your order ${order.orderNumber} status is now ${status}`,
        type: 'order_update',
        data: { orderId: order._id, orderNumber: order.orderNumber, status }
      });
    }

    res.json({ success: true, message: 'Order status updated', data: { orderId: order._id, status: order.status } });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    // Calculate date range
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
      case 'all_time':
        startDate.setFullYear(2000, 0, 1);
        break;
    }

    const [earnings, pendingPayouts, payouts] = await Promise.all([
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id, status: 'delivered', 'payment.status': 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { _id: null, total: { $sum: '$items.totalPrice' }, orders: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { 'items.artisan': artisan._id, status: 'delivered', 'payment.status': 'completed', 'commission.paidToArtisan': false } },
        { $unwind: '$items' },
        { $match: { 'items.artisan': artisan._id } },
        { $group: { _id: null, amount: { $sum: '$items.totalPrice' } } }
      ]),
      Payout.find({ artisan: artisan._id }).sort({ requestedAt: -1 }).limit(10)
    ]);

    const platformFeeRate = 0.10;
    const totalEarnings = earnings[0]?.total || 0;
    const availableBalance = (pendingPayouts[0]?.amount || 0) * (1 - platformFeeRate);

    res.json({
      success: true,
      data: {
        period,
        earnings: {
          gross: totalEarnings,
          net: totalEarnings * (1 - platformFeeRate),
          platformFee: totalEarnings * platformFeeRate,
          orders: earnings[0]?.orders || 0
        },
        pendingBalance: pendingPayouts[0]?.amount || 0,
        availableBalance,
        recentPayouts: payouts,
        canWithdraw: availableBalance >= 500 && artisan.bankDetails?.verified
      }
    });
  } catch (error) {
    console.error('Earnings error:', error);
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
      return res.status(400).json({ success: false, message: 'Bank details not verified' });
    }

    // Calculate available balance
    const pendingPayouts = await Order.aggregate([
      { $match: { 'items.artisan': artisan._id, status: 'delivered', 'payment.status': 'completed', 'commission.paidToArtisan': false } },
      { $unwind: '$items' },
      { $match: { 'items.artisan': artisan._id } },
      { $group: { _id: null, amount: { $sum: '$items.totalPrice' } } }
    ]);

    const platformFeeRate = 0.10;
    const availableBalance = (pendingPayouts[0]?.amount || 0) * (1 - platformFeeRate);

    if (amount < 500) {
      return res.status(400).json({ success: false, message: 'Minimum payout is ₹500' });
    }

    if (amount > availableBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
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
        ifscCode: artisan.bankDetails.ifscCode
      }
    });

    // Notify admin
    await Notification.create({
      title: 'New Payout Request',
      message: `${artisan.businessName} requested ₹${amount}`,
      type: 'payout_request',
      data: { artisanId: artisan._id, payoutId: payout._id, amount },
      forAdmin: true
    });

    res.status(201).json({ success: true, message: 'Payout requested', data: payout });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;