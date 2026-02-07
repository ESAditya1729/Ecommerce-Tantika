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

    // FIXED: Get artisan's products by searching for their business name in the product data
    // Since your products don't have an artisan field, we need to find them differently
    // Option 1: If products have artisan info in description or other fields
    // Option 2: We need to store artisan info in products
    
    // For now, let's search for products that might have artisan info
    // This is a temporary fix - you need to update your product schema
    const products = await Product.find({ 
      $or: [
        { 'artisan.businessName': artisan.businessName },
        { artisanName: artisan.businessName },
        { artisanBusinessName: artisan.businessName },
        { description: { $regex: artisan.businessName, $options: 'i' } }
      ]
    })
      .select('name price stock status approvalStatus image images sales rating')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('Found products for artisan:', artisan.businessName, 'Count:', products.length);
    
    // FIXED: Get all products for this artisan (using same logic)
    const allProducts = await Product.find({ 
      $or: [
        { 'artisan.businessName': artisan.businessName },
        { artisanName: artisan.businessName },
        { artisanBusinessName: artisan.businessName }
      ]
    });

    // Get product counts from all products
    const productCounts = {
      approved: allProducts.filter(p => p.approvalStatus === 'approved').length,
      pending: allProducts.filter(p => p.approvalStatus === 'pending').length,
      rejected: allProducts.filter(p => p.approvalStatus === 'rejected').length
    };

    // Calculate total sales and revenue
    let totalSales = 0;
    let totalRevenue = 0;
    
    allProducts.forEach(product => {
      totalSales += product.sales || 0;
      totalRevenue += (product.price || 0) * (product.sales || 0);
    });

    // Get recent orders using business name (as per your Order model)
    const recentOrders = await Order.find({ artisan: artisan.businessName })
      .select('orderNumber productName productPrice status createdAt customerDetails.name customerDetails.email paymentStatus')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get order counts
    const orderCounts = await Order.aggregate([
      { $match: { artisan: artisan.businessName } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly sales trend from orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { 
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$productPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 7 }
    ]);

    // Get customer metrics
    const customerMetrics = await Order.aggregate([
      { $match: { artisan: artisan.businessName } },
      { 
        $group: {
          _id: '$customerDetails.email',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$productPrice' }
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
          artisan: artisan.businessName,
          status: 'delivered',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$productPrice' }
        }
      }
    ]);

    // Get order stats
    const orderStats = await Order.aggregate([
      { $match: { artisan: artisan.businessName } },
      { $group: {
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
        totalProducts: allProducts.length, // Use actual count
        totalSales: totalSales,
        totalRevenue: totalRevenue,
        status: artisan.status,
        approvedAt: artisan.approvedAt
      },
      stats: {
        totalProducts: allProducts.length,
        totalSales: totalSales,
        totalRevenue: totalRevenue,
        activeProducts: allProducts.filter(p => p.status === 'active').length,
        pendingProducts: productCounts.pending,
        totalOrders: orderStats[0]?.totalOrders || 0,
        pendingOrders: orderCounts.find(o => o._id === 'pending')?.count || 0,
        deliveredOrders: orderCounts.find(o => o._id === 'delivered')?.count || 0,
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
        totalSales: totalSales,
        totalRevenue: totalRevenue
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
    // Check if user is artisan
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

    // FIXED: Build filter to find artisan's products
    // Since products don't have artisan field, we need alternative ways
    const filter = {
      $or: [
        { 'artisan.businessName': artisan.businessName },
        { artisanName: artisan.businessName },
        { artisanBusinessName: artisan.businessName }
      ]
    };
    
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (category) filter.category = category;
    if (search) {
      filter.$and = [
        filter,
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filter)
      .select('name price stock status approvalStatus image images sales rating createdAt category tags artisan')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found products for artisan:', artisan.businessName, 'Count:', products.length);

    // Get total count and summary
    const totalProducts = await Product.countDocuments(filter);
    
    // Calculate summary from products
    const allProductsForSummary = await Product.find(filter);
    
    let summary = {
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalSales: 0,
      totalRevenue: 0
    };

    allProductsForSummary.forEach(product => {
      const productValue = (product.price || 0) * (product.stock || 0);
      const productRevenue = (product.price || 0) * (product.sales || 0);
      
      summary.totalValue += productValue;
      summary.totalSales += product.sales || 0;
      summary.totalRevenue += productRevenue;
      
      if (product.stock <= 0) {
        summary.outOfStockCount += 1;
      } else if (product.stock <= 5) {
        summary.lowStockCount += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        products,
        summary: summary,
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

    // Build filter using business name
    const filter = { artisan: artisan.businessName };
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with pagination
    const orders = await Order.find(filter)
      .select('orderNumber productName productPrice status createdAt customerDetails.name customerDetails.email customerDetails.phone paymentStatus paymentMethod adminNotes contactHistory')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count and summary
    const totalOrders = await Order.countDocuments(filter);
    
    const summary = await Order.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: '$productPrice' },
          pendingAmount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'contacted', 'confirmed', 'processing', 'shipped']] },
                '$productPrice',
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

    res.status(200).json({
      success: true,
      data: {
        orders,
        summary: summary[0] || {
          totalRevenue: 0,
          pendingAmount: 0,
          deliveredCount: 0,
          orderCount: 0
        },
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
          artisan: artisan.businessName,
          createdAt: { $gte: startDate }
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
          totalRevenue: { $sum: '$productPrice' },
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
          artisan: artisan.businessName,
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: '$productName',
          productId: { $first: '$productId' },
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: '$productPrice' },
          avgPrice: { $avg: '$productPrice' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get category performance from products
    const categoryPerformance = await Product.aggregate([
      { $match: { 'artisan.businessName': artisan.businessName } },
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
      { $match: { artisan: artisan.businessName } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$productPrice' },
          avgAmount: { $avg: '$productPrice' }
        }
      }
    ]);

    // Get customer metrics
    const customerMetrics = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customerDetails.email',
          customerName: { $first: '$customerDetails.name' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$productPrice' },
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
      { $match: { 'artisan.businessName': artisan.businessName } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgPrice: { $avg: '$price' },
          totalStockValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate completion rate
    const orderStats = await Order.aggregate([
      { $match: { artisan: artisan.businessName } },
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
      { $match: { 'artisan.businessName': artisan.businessName } },
      { $group: {
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
            artisan: artisan.businessName,
            status: { $in: ['pending', 'contacted', 'confirmed', 'processing'] }
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

    if (period === 'last_month') {
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
    } else if (period === 'last_3_months') {
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setDate(1);
    } else if (period === 'current_year') {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    } else {
      // current_month
      startDate.setDate(1);
    }

    // Calculate earnings from delivered orders
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { 
        $group: {
          _id: null,
          totalEarnings: { $sum: '$productPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate pending payouts (delivered orders with paid status but not processed)
    const pendingPayoutData = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          paymentStatus: 'paid',
          payoutStatus: { $ne: 'processed' } // Assuming you have payoutStatus field
        }
      },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$productPrice' },
          pendingOrders: { $sum: 1 }
        }
      }
    ]);

    // Get payout history
    const payouts = await Payout.find({ artisan: req.user.id })
      .sort({ requestedAt: -1 })
      .limit(10);

    // Get monthly earnings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    const monthlyEarnings = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      { 
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$productPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Calculate payout summary
    const payoutSummary = await Payout.aggregate([
      { $match: { artisan: req.user.id } },
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

    res.status(200).json({
      success: true,
      data: {
        period,
        earnings: {
          totalEarnings: earningsData[0]?.totalEarnings || 0,
          pendingPayouts: pendingPayoutData[0]?.pendingPayouts || 0,
          pendingOrders: pendingPayoutData[0]?.pendingOrders || 0,
          orderCount: earningsData[0]?.orderCount || 0,
          deliveredCount: earningsData[0]?.orderCount || 0 // Same as orderCount for delivered orders
        },
        payouts,
        monthlyEarnings,
        payoutSummary: summary,
        bankDetails: {
          accountName: artisan.bankDetails?.accountName,
          bankName: artisan.bankDetails?.bankName,
          accountType: artisan.bankDetails?.accountType,
          verified: artisan.bankDetails?.verified,
          canWithdraw: artisan.bankDetails?.verified && 
                      artisan.bankDetails?.accountNumber && 
                      artisan.bankDetails?.ifscCode
        },
        nextPayout: {
          minimumAmount: 500, // Minimum amount for payout
          estimatedDate: '15th of next month',
          processingTime: '3-5 business days'
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