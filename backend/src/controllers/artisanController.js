const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');

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

// @desc    Create new product (Artisan)
// @route   POST /api/artisan/products
// @access  Private (Artisan only)
exports.createProductArtisan = async (req, res) => {
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
      artisanName: artisan.businessName || artisan.fullName,
      approvalStatus: 'pending', // Always pending for artisan submissions
      submittedAt: new Date() // Set submission timestamp
    };

    // Generate SKU if not provided
    if (!productData.sku) {
      const prefix = productData.category.substring(0, 3).toUpperCase();
      const random = Math.floor(10000 + Math.random() * 90000);
      productData.sku = `${prefix}-${random}`;
    }

    // Process arrays - ensure they exist
    if (!productData.images) productData.images = [];
    if (!productData.specifications) productData.specifications = [];
    if (!productData.variants) productData.variants = [];
    if (!productData.tags) productData.tags = [];

    // Create product
    const product = await Product.create(productData);

    // Update artisan's product count
    await Artisan.findByIdAndUpdate(artisan._id, {
      $inc: { totalProducts: 1 }
    });

    // Create notification for admin
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        recipientType: 'admin',
        type: 'new_product_submitted',
        title: 'New Product Submission',
        message: `${artisan.businessName || artisan.fullName} has submitted a new product: ${product.name}`,
        data: {
          productId: product._id,
          artisanId: artisan._id,
          productName: product.name,
          artisanName: artisan.businessName || artisan.fullName
        },
        priority: 'medium'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully. Awaiting admin approval.',
      data: product
    });

  } catch (error) {
    console.error('Artisan create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message
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