// src/controllers/artisanController.js
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');
const mongoose = require('mongoose');

// @desc    Get artisan dashboard data (for approved artisans)
// @route   GET /api/artisan/dashboard
// @access  Private (Artisan only)
exports.getDashboard = async (req, res) => {
  try {
    // Check if user is artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approved artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id })
      .select('-bankDetails.accountNumber -bankDetails.ifscCode -documents -socialLinks');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Check if artisan is approved
    if (artisan.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your artisan account is not yet approved.'
      });
    }

    // Get artisan's products using the proper reference
    const products = await Product.find({ 
      artisan: artisan._id
    })
      .select('name price stock status approvalStatus image images sales rating createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get product counts
    const productCounts = {
      total: await Product.countDocuments({ artisan: artisan._id }),
      approved: await Product.countDocuments({ 
        artisan: artisan._id, 
        approvalStatus: 'approved',
        status: 'active'
      }),
      pending: await Product.countDocuments({ 
        artisan: artisan._id, 
        approvalStatus: 'pending' 
      }),
      rejected: await Product.countDocuments({ 
        artisan: artisan._id, 
        approvalStatus: 'rejected' 
      })
    };

    // Get recent orders using the updated Order schema
    const recentOrders = await Order.find({ 
      'items.artisan': artisan._id 
    })
      .select('orderNumber status createdAt total payment.status customer.name customer.email items')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format recent orders to show only artisan's items
    const formattedRecentOrders = recentOrders.map(order => {
      const artisanItems = order.items.filter(item => 
        item.artisan && item.artisan.toString() === artisan._id.toString()
      );
      
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          name: order.customer.name,
          email: order.customer.email
        },
        items: artisanItems.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          image: item.image
        })),
        itemCount: artisanItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: artisanItems.reduce((sum, item) => sum + item.totalPrice, 0),
        paymentStatus: order.payment?.status
      };
    });

    // Get order counts from database aggregation
    const orderCounts = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert orderCounts to object for easier access
    const orderCountsObj = {};
    orderCounts.forEach(item => {
      orderCountsObj[item._id] = item.count;
    });

    // Get monthly sales trend from orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    // Get customer metrics
    const customerMetrics = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: '$customer.email',
          customerName: { $first: '$customer.name' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$items.totalPrice' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          repeatCustomers: {
            $sum: { $cond: [{ $gte: ['$orderCount', 2] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$totalSpent' },
          topSpender: { $max: '$totalSpent' }
        }
      }
    ]);

    // Calculate pending payout amount (from delivered orders with completed payment)
    const pendingPayouts = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Get total sales and revenue from products
    const productStats = await Product.aggregate([
      { 
        $match: { artisan: artisan._id } 
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sales' },
          totalRevenue: { 
            $sum: { $multiply: ['$price', '$sales'] } 
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Calculate completion rate from orders
    const orderStats = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ['$status', ['cancelled', 'refunded']] }, 1, 0] }
          }
        }
      }
    ]);

    const completionRate = orderStats[0] ? 
      ((orderStats[0].completedOrders / orderStats[0].totalOrders) * 100).toFixed(2) || 0 : 0;

    // Prepare dashboard data
    const dashboardData = {
      artisan: {
        id: artisan._id,
        businessName: artisan.businessName,
        fullName: artisan.fullName,
        rating: artisan.rating || 0,
        totalProducts: productCounts.total,
        totalSales: productStats[0]?.totalSales || 0,
        totalRevenue: productStats[0]?.totalRevenue || 0,
        status: artisan.status,
        approvedAt: artisan.approvedAt,
        profileComplete: artisan.profileComplete || false,
        joinedDate: artisan.createdAt
      },
      stats: {
        totalProducts: productCounts.total,
        totalSales: productStats[0]?.totalSales || 0,
        totalRevenue: productStats[0]?.totalRevenue || 0,
        activeProducts: productCounts.approved,
        pendingProducts: productCounts.pending,
        rejectedProducts: productCounts.rejected,
        totalOrders: orderStats[0]?.totalOrders || 0,
        pendingOrders: orderCountsObj['pending'] || 0,
        confirmedOrders: orderCountsObj['confirmed'] || 0,
        processingOrders: orderCountsObj['processing'] || 0,
        readyToShipOrders: orderCountsObj['ready_to_ship'] || 0,
        shippedOrders: orderCountsObj['shipped'] || 0,
        deliveredOrders: orderCountsObj['delivered'] || 0,
        cancelledOrders: orderCountsObj['cancelled'] || 0,
        completionRate: parseFloat(completionRate),
        pendingPayouts: pendingPayouts[0]?.amount || 0,
        averageRating: productStats[0]?.averageRating || 0
      },
      metrics: {
        monthlySales: monthlySales.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          revenue: item.totalRevenue,
          orders: item.orderCount,
          items: item.itemCount
        })),
        totalCustomers: customerMetrics[0]?.totalCustomers || 0,
        repeatCustomers: customerMetrics[0]?.repeatCustomers || 0,
        repeatRate: customerMetrics[0]?.totalCustomers ? 
          ((customerMetrics[0]?.repeatCustomers / customerMetrics[0]?.totalCustomers) * 100).toFixed(2) : 0,
        avgOrderValue: customerMetrics[0]?.avgOrderValue || 0,
        topSpender: customerMetrics[0]?.topSpender || 0
      },
      recentProducts: products,
      recentOrders: formattedRecentOrders,
      salesData: {
        totalSales: productStats[0]?.totalSales || 0,
        totalRevenue: productStats[0]?.totalRevenue || 0
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get artisan dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get artisan's products
// @route   GET /api/artisan/products
// @access  Private (Artisan only)
exports.getProducts = async (req, res) => {
  try {
    // Check if user is artisan or pending artisan
    if (req.user.role !== 'artisan' && req.user.role !== 'pending_artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      approvalStatus,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter using ObjectId reference
    const filter = { artisan: artisan._id };
    
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filter)
      .select('name price stock status approvalStatus image images sales rating createdAt category tags description')
      .populate('artisan', 'businessName fullName')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalProducts = await Product.countDocuments(filter);
    
    // Get summary using aggregation for better performance
    const summaryAggregation = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalValue: { 
            $sum: { $multiply: ['$price', '$stock'] } 
          },
          totalSales: { $sum: '$sales' },
          totalRevenue: { 
            $sum: { $multiply: ['$price', '$sales'] } 
          },
          averagePrice: { $avg: '$price' },
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
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const summary = summaryAggregation[0] || {
      totalValue: 0,
      totalSales: 0,
      totalRevenue: 0,
      averagePrice: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };

    res.status(200).json({
      success: true,
      data: {
        products,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalProducts,
          pages: Math.ceil(totalProducts / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
};

// @desc    Get artisan's orders
// @route   GET /api/artisan/orders
// @access  Private (Artisan only)
exports.getOrders = async (req, res) => {
  try {
    // Check if user is artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approved artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      dateFrom, 
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter using ObjectId reference
    let matchFilter = { 'items.artisan': artisan._id };
    
    if (status && status !== 'all') {
      matchFilter.status = status;
    }
    
    if (dateFrom || dateTo) {
      matchFilter.createdAt = {};
      if (dateFrom) matchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchFilter.createdAt.$lte = endDate;
      }
    }
    
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchFilter.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders with pagination using aggregation to filter items by artisan
    const ordersAggregation = await Order.aggregate([
      { $match: matchFilter },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          'items.productDetails': { $arrayElemAt: ['$productDetails', 0] }
        }
      },
      {
        $group: {
          _id: '$_id',
          orderNumber: { $first: '$orderNumber' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          total: { $first: '$total' },
          customer: { $first: '$customer' },
          payment: { $first: '$payment' },
          shipping: { $first: '$shipping' },
          items: { $push: '$items' },
          allItems: { $first: '$items' }
        }
      },
      {
        $project: {
          orderNumber: 1,
          status: 1,
          createdAt: 1,
          'customer.name': 1,
          'customer.email': 1,
          'customer.phone': 1,
          'payment.status': 1,
          'payment.method': 1,
          'shipping.estimatedDelivery': 1,
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                product: '$$item.product',
                name: '$$item.name',
                quantity: '$$item.quantity',
                price: '$$item.price',
                totalPrice: '$$item.totalPrice',
                image: '$$item.image',
                variant: '$$item.variant',
                productDetails: '$$item.productDetails'
              }
            }
          }
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Get total count of orders containing artisan's items
    const totalOrdersAggregation = await Order.aggregate([
      { $match: matchFilter },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { $group: { _id: '$_id' } },
      { $count: 'total' }
    ]);

    const totalOrders = totalOrdersAggregation[0]?.total || 0;

    // Get summary using aggregation
    const summaryAggregation = await Order.aggregate([
      { $match: { 'items.artisan': artisan._id } },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.totalPrice' },
          totalItems: { $sum: '$items.quantity' },
          pendingAmount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery']] },
                '$items.totalPrice',
                0
              ]
            }
          },
          deliveredRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$items.totalPrice', 0]
            }
          },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { 
              $cond: [{ $in: ['$status', ['pending', 'confirmed', 'processing']] }, 1, 0] 
            }
          },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const summary = summaryAggregation[0] || {
      totalRevenue: 0,
      totalItems: 0,
      pendingAmount: 0,
      deliveredRevenue: 0,
      deliveredCount: 0,
      pendingCount: 0,
      orderCount: 0
    };

    // Format orders for response
    const formattedOrders = ordersAggregation.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      customer: order.customer,
      paymentStatus: order.payment?.status,
      paymentMethod: order.payment?.method,
      estimatedDelivery: order.shipping?.estimatedDelivery,
      items: order.items.map(item => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        image: item.image,
        variant: item.variant,
        productDetails: item.productDetails ? {
          name: item.productDetails.name,
          image: item.productDetails.image,
          category: item.productDetails.category
        } : null
      })),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        summary: {
          totalOrders: summary.orderCount,
          totalRevenue: summary.totalRevenue,
          totalItems: summary.totalItems,
          pendingAmount: summary.pendingAmount,
          deliveredRevenue: summary.deliveredRevenue,
          deliveredOrders: summary.deliveredCount,
          pendingOrders: summary.pendingCount
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalOrders,
          pages: Math.ceil(totalOrders / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get artisan's analytics
// @route   GET /api/artisan/analytics
// @access  Private (Artisan only)
exports.getAnalytics = async (req, res) => {
  try {
    // Check if user is artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approved artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get timeframe (default: last 30 days)
    const timeframe = req.query.timeframe || '30d';
    let days = 30;
    if (timeframe === '7d') days = 7;
    if (timeframe === '90d') days = 90;
    if (timeframe === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sales analytics from orders
    const salesAnalytics = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$items.totalPrice' },
          items: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: days <= 30 ? 30 : 12 }
    ]);

    // Get top selling products from orders
    const topProducts = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$productDetails.name' },
          productImage: { $first: '$productDetails.image' },
          category: { $first: '$productDetails.category' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get category performance from orders
    const categoryPerformance = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalProducts: { $sum: 1 },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          avgPrice: { $avg: '$items.price' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get order status distribution
    const orderDistribution = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$items.totalPrice' },
          avgAmount: { $avg: '$items.totalPrice' }
        }
      }
    ]);

    // Get customer metrics
    const customerMetrics = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          createdAt: { $gte: startDate }
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: '$customer.email',
          customerName: { $first: '$customer.name' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$items.totalPrice' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          repeatCustomers: {
            $sum: { $cond: [{ $gte: ['$orderCount', 2] }, 1, 0] }
          },
          avgOrdersPerCustomer: { $avg: '$orderCount' },
          avgCustomerValue: { $avg: '$totalSpent' },
          maxCustomerValue: { $max: '$totalSpent' }
        }
      }
    ]);

    // Get product performance metrics
    const productMetrics = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgPrice: { $avg: '$price' },
          totalStockValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStockProducts: {
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
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate completion rate
    const orderStats = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ['$status', ['cancelled', 'refunded']] }, 1, 0] }
          }
        }
      }
    ]);

    const completionRate = orderStats[0] ? 
      ((orderStats[0].completedOrders / orderStats[0].totalOrders) * 100).toFixed(2) || 0 : 0;

    // Get product counts
    const productCounts = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      { 
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ['$status', 'active'] },
                  { $eq: ['$approvalStatus', 'approved'] }
                ]}, 
                1, 
                0 
              ]
            }
          }
        }
      }
    ]);

    // Calculate revenue by month for chart
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        summary: {
          totalProducts: productCounts[0]?.totalProducts || 0,
          totalSales: productStats[0]?.totalSales || 0,
          totalRevenue: productStats[0]?.totalRevenue || 0,
          totalOrders: orderStats[0]?.totalOrders || 0,
          completedOrders: orderStats[0]?.completedOrders || 0,
          cancelledOrders: orderStats[0]?.cancelledOrders || 0,
          completionRate: parseFloat(completionRate),
          activeProducts: productCounts[0]?.activeProducts || 0,
          pendingOrders: await Order.countDocuments({
            'items.artisan': artisan._id,
            status: { $in: ['pending', 'confirmed', 'processing', 'ready_to_ship'] }
          })
        },
        salesAnalytics: salesAnalytics.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          orders: item.orders,
          revenue: item.revenue,
          items: item.items
        })),
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          revenue: item.revenue,
          orders: item.orders
        })),
        topProducts,
        categoryPerformance,
        orderDistribution: orderDistribution.map(item => ({
          status: item._id,
          count: item.count,
          amount: item.totalAmount,
          percentage: orderStats[0]?.totalOrders ? 
            ((item.count / orderStats[0].totalOrders) * 100).toFixed(2) : 0
        })),
        customerMetrics: {
          totalCustomers: customerMetrics[0]?.totalCustomers || 0,
          repeatCustomers: customerMetrics[0]?.repeatCustomers || 0,
          repeatRate: customerMetrics[0]?.totalCustomers ? 
            ((customerMetrics[0].repeatCustomers / customerMetrics[0].totalCustomers) * 100).toFixed(2) : 0,
          avgOrdersPerCustomer: customerMetrics[0]?.avgOrdersPerCustomer?.toFixed(2) || 0,
          avgCustomerValue: customerMetrics[0]?.avgCustomerValue?.toFixed(2) || 0,
          maxCustomerValue: customerMetrics[0]?.maxCustomerValue || 0
        },
        productMetrics: {
          avgRating: productMetrics[0]?.avgRating?.toFixed(1) || 0,
          avgPrice: productMetrics[0]?.avgPrice?.toFixed(2) || 0,
          totalStockValue: productMetrics[0]?.totalStockValue || 0,
          lowStockProducts: productMetrics[0]?.lowStockProducts || 0,
          outOfStockProducts: productMetrics[0]?.outOfStockProducts || 0
        }
      }
    });

  } catch (error) {
    console.error('Get artisan analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
};

// @desc    Get artisan earnings and payouts
// @route   GET /api/artisan/earnings
// @access  Private (Artisan only)
exports.getEarnings = async (req, res) => {
  try {
    // Check if user is artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approved artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get timeframe (default: current month)
    const { period = 'current_month' } = req.query;
    let startDate = new Date();
    let endDate = new Date();

    switch(period) {
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_3_months':
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'current_year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(new Date().getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'all_time':
        startDate = new Date(0); // Beginning of time
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default: // current_month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }

    // Calculate earnings from delivered orders
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: null,
          totalEarnings: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$items.quantity' },
          avgOrderValue: { $avg: '$items.totalPrice' }
        }
      }
    ]);

    // Calculate pending payouts (delivered orders with completed payment, not yet paid out)
    const pendingPayoutData = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed',
          'commission.paidToArtisan': false
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$items.totalPrice' },
          pendingOrders: { $sum: 1 },
          pendingItems: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Get payout history
    const payouts = await Payout.find({ artisan: artisan._id })
      .sort({ requestedAt: -1 })
      .limit(10);

    // Get monthly earnings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 },
          items: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Calculate payout summary
    const payoutSummary = await Payout.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          latestDate: { $max: '$processedAt' }
        }
      }
    ]);

    const summary = {
      totalProcessed: 0,
      totalPending: 0,
      totalFailed: 0
    };

    payoutSummary.forEach(item => {
      if (item._id === 'processed') {
        summary.totalProcessed = item.totalAmount;
        summary.processedCount = item.count;
        summary.lastPayoutDate = item.latestDate;
      } else if (item._id === 'pending' || item._id === 'processing') {
        summary.totalPending += item.totalAmount;
        summary.pendingCount = (summary.pendingCount || 0) + item.count;
      } else if (item._id === 'failed') {
        summary.totalFailed += item.totalAmount;
        summary.failedCount = item.count;
      }
    });

    // Calculate platform commission (example: 10% platform fee)
    const platformCommissionRate = 0.10; // 10% platform commission
    const totalEarnings = earningsData[0]?.totalEarnings || 0;
    const netEarnings = totalEarnings * (1 - platformCommissionRate);
    const platformFee = totalEarnings * platformCommissionRate;

    // Calculate lifetime earnings
    const lifetimeEarnings = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed'
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: null,
          total: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 },
          items: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Check if bank details are verified
    const canWithdraw = artisan.bankDetails?.verified && 
                       artisan.bankDetails?.accountNumber && 
                       artisan.bankDetails?.ifscCode &&
                       (pendingPayoutData[0]?.pendingPayouts || 0) >= 500; // Minimum withdrawal amount

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate,
          end: endDate
        },
        earnings: {
          periodEarnings: {
            gross: totalEarnings,
            net: netEarnings,
            platformFee: platformFee,
            orders: earningsData[0]?.orderCount || 0,
            items: earningsData[0]?.itemCount || 0,
            avgOrderValue: earningsData[0]?.avgOrderValue || 0
          },
          lifetimeEarnings: {
            total: lifetimeEarnings[0]?.total || 0,
            orders: lifetimeEarnings[0]?.orders || 0,
            items: lifetimeEarnings[0]?.items || 0
          },
          pendingPayouts: pendingPayoutData[0]?.pendingPayouts || 0,
          pendingOrders: pendingPayoutData[0]?.pendingOrders || 0,
          pendingItems: pendingPayoutData[0]?.pendingItems || 0
        },
        payouts: {
          history: payouts,
          summary: {
            totalProcessed: summary.totalProcessed || 0,
            totalPending: summary.totalPending || 0,
            totalFailed: summary.totalFailed || 0,
            processedCount: summary.processedCount || 0,
            pendingCount: summary.pendingCount || 0,
            failedCount: summary.failedCount || 0,
            lastPayoutDate: summary.lastPayoutDate
          }
        },
        monthlyEarnings: monthlyEarnings.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          earnings: item.earnings,
          orders: item.orders,
          items: item.items
        })),
        bankDetails: {
          accountName: artisan.bankDetails?.accountName,
          bankName: artisan.bankDetails?.bankName,
          accountType: artisan.bankDetails?.accountType,
          verified: artisan.bankDetails?.verified || false,
          canWithdraw: canWithdraw
        },
        withdrawalInfo: {
          minimumAmount: 500,
          availableBalance: pendingPayoutData[0]?.pendingPayouts || 0,
          estimatedProcessingDays: '3-5 business days',
          nextPayoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString('en-IN'),
          platformCommission: `${(platformCommissionRate * 100)}%`
        }
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings data'
    });
  }
};

// @desc    Update artisan's order status
// @route   PUT /api/artisan/orders/:orderId/status
// @access  Private (Artisan only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const artisanId = req.user.id;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: artisanId });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Find the order and check if it belongs to this artisan
    const order = await Order.findOne({
      _id: orderId,
      'items.artisan': artisan._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update this order'
      });
    }

    // Validate status transition (artisan-specific allowed statuses)
    const artisanAllowedStatuses = ['confirmed', 'processing', 'ready_to_ship', 'cancelled'];
    
    if (!artisanAllowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Artisans can only set status to: ${artisanAllowedStatuses.join(', ')}`
      });
    }

    // Validate status transition based on current status
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['ready_to_ship', 'cancelled'],
      ready_to_ship: [], // Cannot change from ready_to_ship (handled by admin)
      shipped: [], // Cannot change from shipped (handled by admin)
      out_for_delivery: [], // Cannot change from out_for_delivery (handled by admin)
      delivered: [] // Final state
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update status using the model's method
    await order.updateStatus(
      status,
      artisan.userId,
      `Status updated by artisan: ${artisan.businessName}`,
      notes || ''
    );

    // Add admin note
    await order.addNote(
      `Order status changed to ${status} by artisan ${artisan.businessName}${notes ? ': ' + notes : ''}`,
      artisan.userId,
      'status_update',
      false // Not internal, customer can see
    );

    // Send notification to customer if they have userId
    if (order.customer.userId) {
      await Notification.create({
        user: order.customer.userId,
        title: 'Order Status Updated',
        message: `Your order ${order.orderNumber} status has been updated to ${status}`,
        type: 'order_update',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: status,
          updatedBy: 'artisan'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
};

// @desc    Get single order details for artisan
// @route   GET /api/artisan/orders/:orderId
// @access  Private (Artisan only)
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user is artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Approved artisan role required.'
      });
    }

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Find the order and check if it contains this artisan's items
    const order = await Order.findOne({
      _id: orderId,
      'items.artisan': artisan._id
    })
    .populate('items.product', 'name sku category')
    .populate('customer.userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to view this order'
      });
    }

    // Filter items for this artisan only
    const artisanItems = order.items.filter(item => 
      item.artisan && item.artisan.toString() === artisan._id.toString()
    );

    // Calculate totals for artisan's items
    const artisanSubtotal = artisanItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const artisanItemCount = artisanItems.reduce((sum, item) => sum + item.quantity, 0);

    // Format response
    const orderDetails = {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        shippingAddress: order.customer.shippingAddress
      },
      items: artisanItems.map(item => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        image: item.image,
        variant: item.variant,
        sku: item.sku,
        productDetails: item.product ? {
          name: item.product.name,
          category: item.product.category,
          sku: item.product.sku
        } : null
      })),
      summary: {
        itemCount: artisanItemCount,
        subtotal: artisanSubtotal,
        estimatedDelivery: order.shipping?.estimatedDelivery,
        shippingMethod: order.shipping?.method
      },
      payment: {
        status: order.payment?.status,
        method: order.payment?.method
      },
      statusHistory: order.statusHistory.filter(history => 
        history.status === order.status || !history.isInternal
      ).map(history => ({
        status: history.status,
        changedAt: history.changedAt,
        reason: history.reason,
        notes: history.notes
      })),
      notes: order.notes.filter(note => !note.isInternal).map(note => ({
        note: note.note,
        type: note.type,
        createdAt: note.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: orderDetails
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order details'
    });
  }
};

// @desc    Request payout
// @route   POST /api/artisan/payouts/request
// @access  Private (Artisan only)
exports.requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const artisanId = req.user.id;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: artisanId });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Check if artisan is approved
    if (artisan.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Only approved artisans can request payouts'
      });
    }

    // Check bank details
    if (!artisan.bankDetails?.verified || 
        !artisan.bankDetails?.accountNumber || 
        !artisan.bankDetails?.ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete and verify your bank details before requesting payout'
      });
    }

    // Calculate available earnings (delivered orders not yet paid out)
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id,
          status: 'delivered',
          'payment.status': 'completed',
          'commission.paidToArtisan': false
        }
      },
      { 
        $unwind: '$items'
      },
      {
        $match: {
          'items.artisan': artisan._id
        }
      },
      { 
        $group: {
          _id: null,
          totalEarnings: { $sum: '$items.totalPrice' }
        }
      }
    ]);

    const totalEarnings = earningsData[0]?.totalEarnings || 0;
    const platformCommissionRate = 0.10; // 10% platform commission
    const netEarnings = totalEarnings * (1 - platformCommissionRate);

    // Check pending payouts
    const pendingPayouts = await Payout.find({
      artisan: artisan._id,
      status: { $in: ['pending', 'processing'] }
    });

    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const availableForPayout = netEarnings - totalPending;

    // Validate amount
    if (amount > availableForPayout) {
      return res.status(400).json({
        success: false,
        message: `Requested amount exceeds available payout balance. Available: ₹${availableForPayout.toFixed(2)}`
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is ₹500'
      });
    }

    // Calculate platform fee for this payout
    const platformFee = amount * platformCommissionRate;
    const netAmount = amount - platformFee;

    // Create payout request
    const payout = await Payout.create({
      artisan: artisan._id,
      amount: amount,
      netAmount: netAmount,
      platformFee: platformFee,
      status: 'pending',
      requestedAt: new Date(),
      bankDetails: {
        accountName: artisan.bankDetails.accountName,
        accountNumber: artisan.bankDetails.accountNumber,
        bankName: artisan.bankDetails.bankName,
        ifscCode: artisan.bankDetails.ifscCode,
        accountType: artisan.bankDetails.accountType
      },
      metadata: {
        orderIds: [] // Will be populated by admin when processing
      }
    });

    // Create notification for admin
    await Notification.create({
      title: 'New Payout Request',
      message: `${artisan.businessName} has requested a payout of ₹${amount}`,
      type: 'payout_request',
      data: {
        artisanId: artisan._id,
        payoutId: payout._id,
        amount: amount
      },
      forAdmin: true
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        payoutId: payout._id,
        amount: payout.amount,
        netAmount: payout.netAmount,
        platformFee: payout.platformFee,
        status: payout.status,
        requestedAt: payout.requestedAt,
        estimatedCompletion: '3-5 business days'
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error requesting payout'
    });
  }
};

// @desc    Get payout history
// @route   GET /api/artisan/payouts
// @access  Private (Artisan only)
exports.getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const payouts = await Payout.find({ artisan: artisan._id })
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payout.countDocuments({ artisan: artisan._id });

    // Calculate summary statistics
    const summary = await Payout.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summaryObj = {
      processed: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      failed: { amount: 0, count: 0 }
    };

    summary.forEach(item => {
      if (item._id === 'processed') {
        summaryObj.processed = { amount: item.totalAmount, count: item.count };
      } else if (item._id === 'pending' || item._id === 'processing') {
        summaryObj.pending = { 
          amount: (summaryObj.pending.amount || 0) + item.totalAmount,
          count: (summaryObj.pending.count || 0) + item.count
        };
      } else if (item._id === 'failed') {
        summaryObj.failed = { amount: item.totalAmount, count: item.count };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        payouts,
        summary: summaryObj,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payout history'
    });
  }
};