const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');

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
      .select('-bankDetails -documents -socialLinks'); // Exclude sensitive data

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

    // Get artisan's products
    const products = await Product.find({ artisan: artisan._id })
      .select('name price stock status approvalStatus image sales rating')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get product counts
    const productCounts = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      { $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total sales and revenue
    const salesData = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      { $group: {
          _id: null,
          totalSales: { $sum: '$sales' },
          totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } }
        }
      }
    ]);

    // Prepare dashboard data
    const dashboardData = {
      artisan: {
        id: artisan._id,
        businessName: artisan.businessName,
        rating: artisan.rating,
        totalProducts: artisan.totalProducts,
        totalSales: artisan.totalSales,
        totalRevenue: artisan.totalRevenue,
        status: artisan.status,
        approvedAt: artisan.approvedAt
      },
      stats: {
        totalProducts: artisan.totalProducts,
        totalSales: artisan.totalSales,
        totalRevenue: artisan.totalRevenue || 0,
        activeProducts: productCounts.find(p => p._id === 'approved')?.count || 0,
        pendingProducts: productCounts.find(p => p._id === 'pending')?.count || 0,
        totalOrders: artisan.totalOrders || 0,
        completionRate: artisan.completionRate || 0
      },
      recentProducts: products,
      salesData: salesData[0] || { totalSales: 0, totalRevenue: 0 }
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

// @desc    Get artisan profile
// @route   GET /api/artisan/profile
// @access  Private (Artisan only)
exports.getProfile = async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id })
      .select('-bankDetails.accountNumber -bankDetails.ifscCode'); // Exclude sensitive bank details

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get user info
    const user = await User.findById(req.user.id)
      .select('username email phone createdAt');

    res.status(200).json({
      success: true,
      data: {
        artisan,
        user
      }
    });

  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// @desc    Update artisan profile
// @route   PUT /api/artisan/profile
// @access  Private (Artisan only)
exports.updateProfile = async (req, res) => {
  try {
    // Get allowed fields for update (exclude sensitive fields)
    const allowedUpdates = [
      'description', 'portfolioLink', 'website',
      'specialization', 'yearsOfExperience',
      'socialLinks'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update artisan profile
    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).select('-bankDetails.accountNumber -bankDetails.ifscCode');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: artisan
    });

  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Update artisan bank details (for payouts)
// @route   PUT /api/artisan/bank-details
// @access  Private (Artisan only)
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, ifscCode, accountType } = req.body;

    // Validate required fields
    if (!accountName || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required bank details'
      });
    }

    // Validate IFSC code format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid IFSC code'
      });
    }

    // Update bank details
    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      {
        'bankDetails.accountName': accountName,
        'bankDetails.accountNumber': accountNumber,
        'bankDetails.bankName': bankName,
        'bankDetails.ifscCode': ifscCode,
        'bankDetails.accountType': accountType || 'savings',
        'bankDetails.verified': false // Reset verification when details change
      },
      { new: true, runValidators: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully. They will be verified by admin.',
      data: {
        accountName: artisan.bankDetails.accountName,
        bankName: artisan.bankDetails.bankName,
        accountType: artisan.bankDetails.accountType,
        verified: artisan.bankDetails.verified
      }
    });

  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating bank details'
    });
  }
};

// @desc    Get pending approval status (for pending artisans)
// @route   GET /api/artisan/pending-status
// @access  Private (Pending Artisan only)
exports.getPendingStatus = async (req, res) => {
  try {
    // Check if user is pending artisan
    if (req.user.role !== 'pending_artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pending artisan role required.'
      });
    }

    // Get artisan application details
    const artisan = await Artisan.findOne({ userId: req.user.id })
      .select('businessName status submittedAt rejectionReason');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan application not found'
      });
    }

    // Calculate days since submission
    const submittedDate = new Date(artisan.submittedAt);
    const currentDate = new Date();
    const daysPending = Math.floor((currentDate - submittedDate) / (1000 * 60 * 60 * 24));

    // Prepare response
    const statusData = {
      businessName: artisan.businessName,
      status: artisan.status,
      submittedAt: artisan.submittedAt,
      daysPending: daysPending,
      rejectionReason: artisan.rejectionReason,
      estimatedTimeline: {
        minDays: 3,
        maxDays: 5,
        typicalProcessing: '3-5 business days'
      },
      nextSteps: [
        'Initial review and verification',
        'Background check and document validation',
        'Final decision and notification'
      ]
    };

    res.status(200).json({
      success: true,
      data: statusData
    });

  } catch (error) {
    console.error('Get pending status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching application status'
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { artisan: artisan._id };
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filter)
      .select('name price stock status approvalStatus image sales rating createdAt')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
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
    // For now, return mock data - you'll need to implement Order model
    // TODO: Implement actual order fetching when Order model is created
    
    const mockOrders = [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        product: 'Handwoven Silk Saree',
        quantity: 1,
        total: 2499,
        status: 'delivered',
        date: '2024-01-15'
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        product: 'Terracotta Pot Set',
        quantity: 2,
        total: 2598,
        status: 'shipped',
        date: '2024-01-14'
      },
      {
        id: 'ORD-003',
        customer: 'Robert Johnson',
        product: 'Brass Diya Set',
        quantity: 1,
        total: 899,
        status: 'processing',
        date: '2024-01-13'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        orders: mockOrders,
        total: mockOrders.length
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

// @desc    Get artisan's earnings/sales analytics
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

    // Get sales analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesAnalytics = await Product.aggregate([
      { $match: { 
          artisan: artisan._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$sales' },
          totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top selling products
    const topProducts = await Product.find({ artisan: artisan._id })
      .select('name price stock sales')
      .sort({ sales: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        salesAnalytics,
        topProducts,
        summary: {
          totalProducts: artisan.totalProducts,
          totalSales: artisan.totalSales,
          totalRevenue: artisan.totalRevenue || 0,
          completionRate: artisan.completionRate || 0
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