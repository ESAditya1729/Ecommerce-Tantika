const Notification = require('../models/Notification');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { NOTIFICATION_TEMPLATES } = require('../models/Notification');

// ============================================
// GET NOTIFICATIONS
// ============================================

// @desc    Get artisan notifications
// @route   GET /api/notifications/artisan
// @access  Private (Artisan only)
exports.getArtisanNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    
    // Get artisan ID from user
    const artisan = await Artisan.findOne({ userId: req.user.id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const filter = {
      recipientId: artisan._id,
      recipientType: 'artisan'
    };
    
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    if (type) filter.templateId = type;

    const notifications = await Notification.find(filter)
      .sort({ priority: 1, createdAt: -1 }) // Urgent first, then newest
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(artisan._id, 'artisan');

    // Get unread count for each type (for filtering)
    const typeCounts = await Notification.aggregate([
      { $match: { recipientId: artisan._id, recipientType: 'artisan', read: false } },
      { $group: { _id: '$templateId', count: { $sum: 1 } } }
    ]);

    const unreadByType = {};
    typeCounts.forEach(item => {
      unreadByType[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: notifications.map(n => n.toFrontend()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount,
      unreadByType
    });

  } catch (error) {
    console.error('Get artisan notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// @desc    Get admin notifications
// @route   GET /api/notifications/admin
// @access  Private (Admin only)
exports.getAdminNotifications = async (req, res) => {
  try {
    // Only super admin can see all notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const { page = 1, limit = 50, read, type, recipientType } = req.query;
    
    const filter = {
      recipientType: 'admin'
    };
    
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    if (type) filter.templateId = type;
    if (recipientType) filter.recipientType = recipientType;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('recipientId', 'username email businessName');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipientType: 'admin',
      read: false
    });

    res.status(200).json({
      success: true,
      data: notifications.map(n => ({
        ...n.toFrontend(),
        recipient: n.recipientId
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications/user
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;

    const filter = {
      recipientId: req.user.id,
      recipientType: 'user'
    };
    
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    if (type) filter.templateId = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(req.user.id, 'user');

    res.status(200).json({
      success: true,
      data: notifications.map(n => n.toFrontend()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// ============================================
// SINGLE NOTIFICATION OPERATIONS
// ============================================

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check authorization
    const artisan = await Artisan.findOne({ userId: req.user.id });
    let isAuthorized = false;

    if (notification.recipientType === 'artisan' && artisan) {
      isAuthorized = notification.recipientId.toString() === artisan._id.toString();
    } else if (notification.recipientType === 'user') {
      isAuthorized = notification.recipientId.toString() === req.user.id.toString();
    } else if (notification.recipientType === 'admin') {
      isAuthorized = req.user.role === 'admin' || req.user.role === 'superAdmin';
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: notification.toFrontend()
    });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notification'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check authorization
    const artisan = await Artisan.findOne({ userId: req.user.id });
    let isAuthorized = false;

    if (notification.recipientType === 'artisan' && artisan) {
      isAuthorized = notification.recipientId.toString() === artisan._id.toString();
    } else if (notification.recipientType === 'user') {
      isAuthorized = notification.recipientId.toString() === req.user.id.toString();
    } else if (notification.recipientType === 'admin') {
      isAuthorized = req.user.role === 'admin' || req.user.role === 'superAdmin';
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification.toFrontend()
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const { recipientType } = req.body;
    
    let recipientId;
    let type = recipientType || 'user';

    // Determine recipient based on role
    if (req.user.role === 'artisan') {
      const artisan = await Artisan.findOne({ userId: req.user.id });
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }
      recipientId = artisan._id;
      type = 'artisan';
    } else if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
      recipientId = req.user.id;
      type = 'admin';
    } else {
      recipientId = req.user.id;
      type = 'user';
    }

    const result = await Notification.markAllAsRead(recipientId, type);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount || 0
      }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking all as read'
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    let recipientId;
    let recipientType = 'user';

    // Determine recipient based on role
    if (req.user.role === 'artisan') {
      const artisan = await Artisan.findOne({ userId: req.user.id });
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }
      recipientId = artisan._id;
      recipientType = 'artisan';
    } else if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
      recipientId = req.user.id;
      recipientType = 'admin';
    } else {
      recipientId = req.user.id;
      recipientType = 'user';
    }

    const count = await Notification.getUnreadCount(recipientId, recipientType);

    res.status(200).json({
      success: true,
      count,
      recipientType
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
};

// ============================================
// REPLY OPERATIONS
// ============================================

// @desc    Add reply to notification
// @route   POST /api/notifications/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content, action } = req.body;

    if (!content && !action) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content or action'
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check authorization
    const artisan = await Artisan.findOne({ userId: req.user.id });
    let isAuthorized = false;

    if (notification.recipientType === 'artisan' && artisan) {
      isAuthorized = notification.recipientId.toString() === artisan._id.toString();
    } else if (notification.recipientType === 'user') {
      isAuthorized = notification.recipientId.toString() === req.user.id.toString();
    } else if (notification.recipientType === 'admin') {
      isAuthorized = req.user.role === 'admin' || req.user.role === 'superAdmin';
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add reply
    const replyAction = action || null;
    const replyContent = content || `Action: ${action}`;

    await notification.addReply(replyContent, replyAction);

    // Handle the action if provided
    if (action) {
      await handleNotificationAction(notification, action, req.user);
    }

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: notification.toFrontend()
    });

  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reply'
    });
  }
};

// @desc    Dismiss notification
// @route   POST /api/notifications/:id/dismiss
// @access  Private
exports.dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check authorization
    const artisan = await Artisan.findOne({ userId: req.user.id });
    let isAuthorized = false;

    if (notification.recipientType === 'artisan' && artisan) {
      isAuthorized = notification.recipientId.toString() === artisan._id.toString();
    } else if (notification.recipientType === 'user') {
      isAuthorized = notification.recipientId.toString() === req.user.id.toString();
    } else if (notification.recipientType === 'admin') {
      isAuthorized = req.user.role === 'admin' || req.user.role === 'superAdmin';
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.dismiss();

    res.status(200).json({
      success: true,
      message: 'Notification dismissed',
      data: notification.toFrontend()
    });

  } catch (error) {
    console.error('Dismiss notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error dismissing notification'
    });
  }
};

// ============================================
// ADMIN OPERATIONS
// ============================================

// @desc    Create notification for artisan (Admin only)
// @route   POST /api/notifications/admin/create
// @access  Private (Admin only)
exports.createArtisanNotification = async (req, res) => {
  try {
    const { artisanId, templateId, data, priority, action, actionParams } = req.body;

    // Only admin/superAdmin can create notifications
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Verify artisan exists
    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Create notification
    const notification = await Notification.createNotification(
      artisanId,
      'artisan',
      templateId,
      data || {},
      {
        priority: priority || 'medium',
        action,
        actionParams,
        source: 'admin'
      }
    );

    res.status(201).json({
      success: true,
      message: 'Notification sent to artisan',
      data: notification.toFrontend()
    });

  } catch (error) {
    console.error('Create artisan notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating notification'
    });
  }
};

// controllers/notificationController.js

// @desc    Create notification for all artisans (Admin only)
// @route   POST /api/notifications/admin/broadcast
// @access  Private (Admin only)
exports.broadcastToArtisans = async (req, res) => {
  try {
    const { templateId, data, priority, action, artisanIds } = req.body;

    console.log('📤 Broadcast request received:', { templateId, artisanIds, priority });

    // Only admin/superAdmin can broadcast
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // ========== FIXED: Validate required fields ==========
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    if (!artisanIds || !Array.isArray(artisanIds) || artisanIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one artisan ID is required'
      });
    }

    // ========== FIXED: Check if template exists ==========
    // Import NOTIFICATION_TEMPLATES from the model
    const { NOTIFICATION_TEMPLATES } = require('../models/Notification');
    
    if (!NOTIFICATION_TEMPLATES[templateId]) {
      return res.status(400).json({
        success: false,
        message: `Template "${templateId}" not found. Available templates: ${Object.keys(NOTIFICATION_TEMPLATES).join(', ')}`
      });
    }

    // Find artisans
    let artisans;
    if (artisanIds && artisanIds.length > 0) {
      artisans = await Artisan.find({ _id: { $in: artisanIds } });
    } else {
      artisans = await Artisan.find({ status: 'approved' });
    }

    if (artisans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No artisans found'
      });
    }

    console.log(`📦 Found ${artisans.length} artisans`);

    // Create notifications for each artisan
    const notifications = [];
    const errors = [];

    for (const artisan of artisans) {
      try {
        console.log(`📝 Creating notification for artisan: ${artisan._id}`);
        
        const notification = await Notification.createNotification(
          artisan._id,
          'artisan',
          templateId,
          {
            ...data,
            artisanName: artisan.businessName || artisan.fullName
          },
          {
            priority: priority || 'medium',
            action,
            actionParams: req.body.actionParams,
            source: 'admin'
          }
        );
        notifications.push(notification);
        console.log(`✅ Notification created for artisan: ${artisan._id}`);
      } catch (error) {
        console.error(`❌ Failed to create notification for artisan ${artisan._id}:`, error.message);
        errors.push({
          artisanId: artisan._id,
          error: error.message
        });
      }
    }

    if (notifications.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create notifications for any artisan',
        errors
      });
    }

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${notifications.length} artisans`,
      data: {
        sentCount: notifications.length,
        artisans: artisans.map(a => ({
          id: a._id,
          name: a.businessName || a.fullName
        })),
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Broadcast to artisans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error broadcasting notifications'
    });
  }
};

// @desc    Delete notification (Admin only)
// @route   DELETE /api/notifications/admin/:id
// @access  Private (Admin only)
exports.deleteNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
};

// @desc    Get broadcast history (notifications sent by admin to artisans)
// @route   GET /api/notifications/admin/broadcast-history
// @access  Private (Admin only)
exports.getBroadcastHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 50, read, type } = req.query;
    
    const filter = {
      source: 'admin',
      recipientType: { $in: ['artisan', 'user'] }
    };
    
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    if (type) filter.templateId = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('recipientId', 'username email businessName');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      source: 'admin',
      recipientType: { $in: ['artisan', 'user'] },
      read: false
    });

    res.status(200).json({
      success: true,
      data: notifications.map(n => ({
        ...n.toFrontend(),
        recipient: n.recipientId
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get broadcast history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching broadcast history'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Handle notification actions
async function handleNotificationAction(notification, action, user) {
  try {
    switch (action) {
      case 'confirm_order': {
        // Confirm order
        const orderId = notification.data?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.status === 'pending') {
            order.status = 'confirmed';
            order.statusHistory.push({
              status: 'confirmed',
              changedBy: user.id,
              reason: 'Order confirmed via notification',
              changedAt: new Date()
            });
            await order.save();
          }
        }
        break;
      }
      
      case 'restock_product': {
        // This would typically open a modal or redirect to product edit
        // The actual restock happens on the frontend
        break;
      }
      
      case 'contact_customer': {
        // This would trigger a message or notification
        break;
      }
      
      case 'fix_product': {
        // This would redirect to product edit page
        break;
      }
      
      case 'resubmit_product': {
        // This would trigger product resubmission
        const productId = notification.data?.productId;
        if (productId) {
          const product = await Product.findById(productId);
          if (product && product.approvalStatus === 'rejected') {
            product.approvalStatus = 'pending';
            product.submittedAt = new Date();
            await product.save();
          }
        }
        break;
      }
      
      default:
        break;
    }
  } catch (error) {
    console.error('Handle notification action error:', error);
    // Don't throw - we don't want to fail the reply if action fails
  }
}