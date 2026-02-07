// src/controllers/artisanController.js
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');

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
      .select('orderNumber status createdAt total payment.status customer.name customer.email')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get order counts from database aggregation
    const orderCounts = await Order.aggregate([
      { 
        $match: { 
          'items.artisan': artisan._id 
        } 
      },
      { 
        $project: {
          hasArtisanItem: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.artisan", artisan._id] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: { $size: '$hasArtisanItem' } }
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
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 7 }
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
          avgOrderValue: { $avg: '$totalSpent' }
        }
      }
    ]);

    // Calculate pending payout amount (from delivered orders)
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
          amount: { $sum: '$items.totalPrice' }
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
          }
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
          }
        }
      }
    ]);

    const completionRate = orderStats[0] ? 
      (orderStats[0].completedOrders / orderStats[0].totalOrders * 100) || 0 : 0;

    // Prepare dashboard data
    const dashboardData = {
      artisan: {
        id: artisan._id,
        businessName: artisan.businessName,
        fullName: artisan.fullName,
        rating: artisan.rating,
        totalProducts: productCounts.total,
        totalSales: productStats[0]?.totalSales || 0,
        totalRevenue: productStats[0]?.totalRevenue || 0,
        status: artisan.status,
        approvedAt: artisan.approvedAt
      },
      stats: {
        totalProducts: productCounts.total,
        totalSales: productStats[0]?.totalSales || 0,
        totalRevenue: productStats[0]?.totalRevenue || 0,
        activeProducts: productCounts.approved,
        pendingProducts: productCounts.pending,
        totalOrders: orderStats[0]?.totalOrders || 0,
        pendingOrders: orderCountsObj['pending'] || 0,
        deliveredOrders: orderCountsObj['delivered'] || 0,
        completionRate: completionRate,
        pendingPayouts: pendingPayouts[0]?.amount || 0
      },
      metrics: {
        monthlySales,
        totalCustomers: customerMetrics[0]?.totalCustomers || 0,
        repeatRate: customerMetrics[0]?.repeatCustomers || 0,
        avgOrderValue: customerMetrics[0]?.avgOrderValue || 0
      },
      recentProducts: products,
      recentOrders: recentOrders,
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
      .select('name price stock status approvalStatus image images sales rating createdAt category tags')
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
    
    if (status) matchFilter.status = status;
    
    if (dateFrom || dateTo) {
      matchFilter.createdAt = {};
      if (dateFrom) matchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchFilter.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      matchFilter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

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
          allItems: { $push: '$items' },
          document: { $first: '$$ROOT' }
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
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
      { $count: 'total' }
    ]);

    const totalOrders = totalOrdersAggregation[0]?.total || 0;

    // Get summary using aggregation
    const summaryAggregation = await Order.aggregate([
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
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.totalPrice' },
          pendingAmount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery']] },
                '$items.totalPrice',
                0
              ]
            }
          },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const summary = summaryAggregation[0] || {
      totalRevenue: 0,
      pendingAmount: 0,
      deliveredCount: 0,
      orderCount: 0
    };

    res.status(200).json({
      success: true,
      data: {
        orders: ordersAggregation,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          pages: Math.ceil(totalOrders / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
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
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
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
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get category performance from products
    const categoryPerformance = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalSales: { $sum: '$sales' },
          totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } },
          avgRating: { $avg: '$rating' },
          avgPrice: { $avg: '$price' }
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
          topSpender: { $max: '$totalSpent' }
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
          }
        }
      }
    ]);

    const completionRate = orderStats[0] ? 
      (orderStats[0].completedOrders / orderStats[0].totalOrders * 100) || 0 : 0;

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

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        salesAnalytics,
        topProducts,
        categoryPerformance,
        orderDistribution,
        customerMetrics: customerMetrics[0] || {
          totalCustomers: 0,
          repeatCustomers: 0,
          avgOrdersPerCustomer: 0,
          avgCustomerValue: 0,
          topSpender: 0
        },
        productMetrics: productMetrics[0] || {
          avgRating: 0,
          avgPrice: 0,
          totalStockValue: 0,
          lowStockProducts: 0
        },
        summary: {
          totalProducts: productCounts[0]?.totalProducts || 0,
          totalSales: artisan.totalSales || 0,
          totalRevenue: artisan.totalRevenue || 0,
          completionRate: completionRate,
          pendingOrders: await Order.countDocuments({
            'items.artisan': artisan._id,
            status: { $in: ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery'] }
          }),
          activeProducts: productCounts[0]?.activeProducts || 0
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
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        break;
      case 'last_3_months':
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setDate(1);
        break;
      case 'current_year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      case 'all_time':
        startDate = new Date(0); // Beginning of time
        break;
      default: // current_month
        startDate.setDate(1);
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
          itemCount: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Calculate pending payouts (delivered orders with completed payment)
    const pendingPayoutData = await Order.aggregate([
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
          pendingPayouts: { $sum: '$items.totalPrice' },
          pendingOrders: { $sum: 1 }
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
      { $sort: { '_id.year': -1, '_id.month': -1 } },
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
          latestDate: { $max: '$requestedAt' }
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
        summary.lastPayoutDate = item.latestDate;
      } else if (item._id === 'pending' || item._id === 'processing') {
        summary.totalPending += item.totalAmount;
      } else if (item._id === 'failed') {
        summary.totalFailed += item.totalAmount;
      }
    });

    // Calculate commission (platform fee)
    const platformCommissionRate = 0.15; // 15% platform commission
    const totalEarnings = earningsData[0]?.totalEarnings || 0;
    const netEarnings = totalEarnings * (1 - platformCommissionRate);
    const platformFee = totalEarnings * platformCommissionRate;

    // Check if bank details are verified
    const canWithdraw = artisan.bankDetails?.verified && 
                       artisan.bankDetails?.accountNumber && 
                       artisan.bankDetails?.ifscCode &&
                       netEarnings >= 500; // Minimum withdrawal amount

    res.status(200).json({
      success: true,
      data: {
        period,
        earnings: {
          grossEarnings: totalEarnings,
          netEarnings: netEarnings,
          platformFee: platformFee,
          pendingPayouts: pendingPayoutData[0]?.pendingPayouts || 0,
          pendingOrders: pendingPayoutData[0]?.pendingOrders || 0,
          deliveredOrders: earningsData[0]?.orderCount || 0,
          totalItemsSold: earningsData[0]?.itemCount || 0
        },
        payouts,
        monthlyEarnings,
        payoutSummary: summary,
        bankDetails: {
          accountName: artisan.bankDetails?.accountName,
          bankName: artisan.bankDetails?.bankName,
          accountType: artisan.bankDetails?.accountType,
          verified: artisan.bankDetails?.verified,
          canWithdraw: canWithdraw
        },
        nextPayout: {
          minimumAmount: 500,
          estimatedDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString('en-IN'),
          processingTime: '3-5 business days',
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

    // Validate status transition
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['ready_to_ship', 'cancelled'],
      ready_to_ship: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
      delivered: [] // Final state
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update status
    order.status = status;
    
    // Add status history
    order.statusHistory.push({
      status,
      changedBy: artisan.userId,
      reason: notes || 'Status updated by artisan',
      changedAt: new Date()
    });

    // Add admin note
    order.notes.push({
      note: `Order status changed to ${status} by artisan${notes ? ': ' + notes : ''}`,
      addedBy: artisan.userId,
      type: 'status_update',
      createdAt: new Date()
    });

    await order.save();

    // Send notification to customer
    await Notification.create({
      user: order.customer.userId,
      title: 'Order Status Updated',
      message: `Your order ${order.orderNumber} status has been updated to ${status}`,
      type: 'order_update',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status
      }
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderNumber: order.orderNumber,
        status: order.status
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

    // Calculate available earnings
    const earningsData = await Order.aggregate([
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
          totalEarnings: { $sum: '$items.totalPrice' }
        }
      }
    ]);

    const totalEarnings = earningsData[0]?.totalEarnings || 0;
    const platformCommissionRate = 0.15;
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

    // Create payout request
    const payout = await Payout.create({
      artisan: artisan._id,
      amount: amount,
      status: 'pending',
      requestedAt: new Date(),
      bankDetails: {
        accountName: artisan.bankDetails.accountName,
        accountNumber: artisan.bankDetails.accountNumber,
        bankName: artisan.bankDetails.bankName,
        ifscCode: artisan.bankDetails.ifscCode,
        accountType: artisan.bankDetails.accountType
      },
      platformFee: amount * platformCommissionRate,
      netAmount: amount * (1 - platformCommissionRate)
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        payoutId: payout._id,
        amount: payout.amount,
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