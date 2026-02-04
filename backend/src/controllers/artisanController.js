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

    // Get artisan's products
    const products = await Product.find({ artisan: artisan._id })
      .select('name price stock status approvalStatus images sales rating')
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

    // Prepare dashboard data
    const dashboardData = {
      artisan: {
        id: artisan._id,
        businessName: artisan.businessName,
        fullName: artisan.fullName,
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
        pendingOrders: orderCounts.find(o => o._id === 'pending')?.count || 0,
        deliveredOrders: orderCounts.find(o => o._id === 'delivered')?.count || 0,
        completionRate: artisan.completionRate || 0,
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
      .select('-bankDetails.accountNumber -bankDetails.ifscCode');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get user info
    const user = await User.findById(req.user.id)
      .select('username email phone createdAt avatar');

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
    // Get allowed fields for update
    const allowedUpdates = [
      'description', 'portfolioLink', 'website',
      'specialization', 'yearsOfExperience',
      'socialLinks', 'address'
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
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
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
        'bankDetails.ifscCode': ifscCode.toUpperCase(),
        'bankDetails.accountType': accountType || 'savings',
        'bankDetails.verified': false
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
      .select('businessName status submittedAt rejectionReason adminNotes');

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
        'Document validation',
        'Final decision and notification'
      ],
      contactSupport: {
        email: 'support@tantika.com',
        phone: '+91-9876543210',
        hours: 'Mon-Fri, 10AM-6PM'
      }
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
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
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
      .select('name price stock status approvalStatus images sales rating createdAt category tags')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count and summary
    const totalProducts = await Product.countDocuments(filter);
    
    const summary = await Product.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] }
          },
          totalSales: { $sum: '$sales' },
          totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        summary: summary[0] || {
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalSales: 0,
          totalRevenue: 0
        },
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

// @desc    Create new product
// @route   POST /api/artisan/products
// @access  Private (Artisan only)
exports.createProduct = async (req, res) => {
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

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Please provide ${field}`
        });
      }
    }

    // Prepare product data
    const productData = {
      ...req.body,
      artisan: artisan._id,
      artisanName: artisan.businessName,
      approvalStatus: 'pending' // Products need admin approval
    };

    // Create product
    const product = await Product.create(productData);

    // Update artisan's product count
    await Artisan.findByIdAndUpdate(artisan._id, {
      $inc: { totalProducts: 1 }
    });

    // Create notification for admin
    await Notification.create({
      recipientId: artisan._id, // This will need to be admin's ID in production
      recipientType: 'admin',
      type: 'new_product_submitted',
      title: 'New Product Submission',
      message: `${artisan.businessName} has submitted a new product: ${product.name}`,
      data: {
        productId: product._id,
        artisanId: artisan._id,
        productName: product.name
      },
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully. Awaiting admin approval.',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/artisan/products/:id
// @access  Private (Artisan only)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Check if product belongs to artisan
    const product = await Product.findOne({
      _id: productId,
      artisan: artisan._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Define allowed updates
    const allowedUpdates = [
      'name', 'description', 'price', 'stock', 'category',
      'materials', 'dimensions', 'weight', 'tags', 'images',
      'shippingInfo', 'returnPolicy', 'specifications'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Reset approval status if important fields change
    const criticalFields = ['name', 'price', 'category', 'description', 'images'];
    const hasCriticalChanges = Object.keys(updates).some(field => 
      criticalFields.includes(field)
    );

    if (hasCriticalChanges) {
      updates.approvalStatus = 'pending';
      
      // Notify admin about product update
      await Notification.create({
        recipientId: artisan._id, // Admin ID in production
        recipientType: 'admin',
        type: 'new_product_submitted',
        title: 'Product Updated - Needs Re-approval',
        message: `${artisan.businessName} updated product: ${product.name}. Requires re-approval.`,
        data: {
          productId: product._id,
          artisanId: artisan._id,
          productName: product.name
        },
        priority: 'medium'
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/artisan/products/:id
// @access  Private (Artisan only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Check if product belongs to artisan
    const product = await Product.findOneAndDelete({
      _id: productId,
      artisan: artisan._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Update artisan's product count
    await Artisan.findByIdAndUpdate(artisan._id, {
      $inc: { totalProducts: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
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

    // Build filter using business name (as per your Order model)
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

// @desc    Update order status
// @route   PUT /api/artisan/orders/:id/status
// @access  Private (Artisan only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
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

    // Check if order belongs to artisan (using business name)
    const order = await Order.findOne({
      _id: req.params.id,
      artisan: artisan.businessName
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Update order status
    const updates = { status };
    
    // Add admin note with status update
    if (notes) {
      order.adminNotes.push({
        note: `${notes} (Status changed to: ${status})`,
        addedBy: artisan.businessName,
        createdAt: new Date()
      });
    } else {
      order.adminNotes.push({
        note: `Status updated to: ${status}`,
        addedBy: artisan.businessName,
        createdAt: new Date()
      });
    }

    // Add tracking info if provided
    if (trackingNumber) {
      order.adminNotes.push({
        note: `Tracking number: ${trackingNumber}`,
        addedBy: artisan.businessName,
        createdAt: new Date()
      });
    }

    // Add contact history entry
    order.contactHistory.push({
      method: 'system',
      date: new Date(),
      notes: `Status changed to ${status}`,
      contactedBy: artisan.businessName
    });

    // Save the order
    await order.save();

    // Create notification for customer
    await Notification.create({
      recipientId: req.user.id, // This should be customer's ID - you'll need to adjust this
      recipientType: 'user',
      type: 'order_status_update',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} status has been updated to: ${status}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status,
        productName: order.productName
      },
      priority: 'medium'
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
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
      { $match: { artisan: artisan._id } },
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
          totalProducts: artisan.totalProducts,
          totalSales: artisan.totalSales,
          totalRevenue: artisan.totalRevenue || 0,
          completionRate: artisan.completionRate || 0,
          pendingOrders: await Order.countDocuments({
            artisan: artisan.businessName,
            status: { $in: ['pending', 'contacted', 'confirmed', 'processing'] }
          }),
          activeProducts: await Product.countDocuments({
            artisan: artisan._id,
            status: 'active',
            approvalStatus: 'approved'
          })
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

// @desc    Get artisan notifications
// @route   GET /api/artisan/notifications
// @access  Private (Artisan only)
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    // Get artisan profile to get artisan ID
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }
    
    const filter = { 
      $or: [
        { recipientId: req.user.id, recipientType: 'user' },
        { recipientId: artisan._id, recipientType: 'artisan' }
      ]
    };
    
    if (unreadOnly) filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      ...filter,
      read: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/artisan/notifications/:id/read
// @access  Private (Artisan only)
exports.markNotificationAsRead = async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { recipientId: req.user.id, recipientType: 'user' },
          { recipientId: artisan._id, recipientType: 'artisan' }
        ]
      },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification'
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
    } else if (period === 'current_year') {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    }

    // Calculate earnings from delivered orders
    const earningsData = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: { $in: ['paid', 'pending'] }
        }
      },
      { 
        $group: {
          _id: null,
          totalEarnings: { $sum: '$productPrice' },
          pendingPayouts: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'paid'] },
                '$productPrice',
                0
              ]
            }
          },
          pendingOrders: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'pending'] },
                '$productPrice',
                0
              ]
            }
          },
          orderCount: { $sum: 1 },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get payout history
    const payouts = await Payout.find({ artisan: req.user.id })
      .sort({ requestedAt: -1 })
      .limit(10);

    // Get monthly earnings trend
    const monthlyEarnings = await Order.aggregate([
      { 
        $match: { 
          artisan: artisan.businessName,
          status: 'delivered',
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
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
        earnings: earningsData[0] || {
          totalEarnings: 0,
          pendingPayouts: 0,
          pendingOrders: 0,
          orderCount: 0,
          deliveredCount: 0
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

// @desc    Request payout
// @route   POST /api/artisan/payouts/request
// @access  Private (Artisan only)
exports.requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Check if bank details are verified
    if (!artisan.bankDetails?.verified) {
      return res.status(400).json({
        success: false,
        message: 'Bank details not verified. Please update and verify your bank details first.'
      });
    }

    // Check if bank details are complete
    if (!artisan.bankDetails?.accountNumber || !artisan.bankDetails?.ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Bank details incomplete. Please update your bank details.'
      });
    }

    // Calculate available balance from delivered and paid orders
    const earningsData = await Order.aggregate([
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
          availableBalance: { $sum: '$productPrice' }
        }
      }
    ]);

    const availableBalance = earningsData[0]?.availableBalance || 0;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount'
      });
    }

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${availableBalance}`
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is ₹500'
      });
    }

    // Get orders for this payout
    const ordersForPayout = await Order.find({
      artisan: artisan.businessName,
      status: 'delivered',
      paymentStatus: 'paid'
    }).limit(10); // Limit to prevent too many orders in one payout

    // Create payout request
    const payout = await Payout.create({
      artisan: req.user.id,
      artisanName: artisan.businessName,
      amount,
      bankDetails: {
        accountName: artisan.bankDetails.accountName,
        accountNumber: artisan.bankDetails.accountNumber,
        bankName: artisan.bankDetails.bankName,
        ifscCode: artisan.bankDetails.ifscCode,
        accountType: artisan.bankDetails.accountType
      },
      orders: ordersForPayout.map(order => order._id),
      status: 'pending',
      payoutMethod: 'bank_transfer'
    });

    // Update orders to mark them as included in payout
    await Order.updateMany(
      {
        _id: { $in: ordersForPayout.map(order => order._id) }
      },
      {
        $set: { paymentStatus: 'processing_payout' }
      }
    );

    // Create notification for admin
    await Notification.create({
      recipientId: artisan._id, // Admin ID in production
      recipientType: 'admin',
      type: 'payout_request',
      title: 'New Payout Request',
      message: `${artisan.businessName} requested a payout of ₹${amount}`,
      data: {
        payoutId: payout._id,
        artisanId: artisan._id,
        artisanName: artisan.businessName,
        amount: amount
      },
      priority: 'high'
    });

    // Create notification for artisan
    await Notification.create({
      recipientId: req.user.id,
      recipientType: 'user',
      type: 'payout_request',
      title: 'Payout Request Submitted',
      message: `Your payout request of ₹${amount} has been submitted and is being processed.`,
      data: {
        payoutId: payout._id,
        amount: amount,
        status: 'pending'
      },
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        payoutId: payout._id,
        amount,
        status: 'pending',
        estimatedProcessing: '3-5 business days',
        referenceNumber: payout.referenceNumber
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payout request'
    });
  }
};