// models/Notification.js
const mongoose = require('mongoose');

// ========== FIXED: Pre-defined message templates for storage optimization ==========
const NOTIFICATION_TEMPLATES = {
  // Order related
  'order_placed': {
    title: '📦 New Order Received',
    message: (data) => `Order #${data.orderNumber} for ₹${data.amount} received from ${data.customerName}`
  },
  'order_status_update': {
    title: '📦 Order Status Updated',
    message: (data) => `Order #${data.orderNumber} is now ${data.status}`
  },
  'order_cancelled': {
    title: '❌ Order Cancelled',
    message: (data) => `Order #${data.orderNumber} was cancelled by ${data.cancelledBy || 'customer'}`
  },
  
  // Product related
  'product_approved': {
    title: '✅ Product Approved',
    message: (data) => `"${data.productName}" is now live on Tantika!`
  },
  'product_rejected': {
    title: '⚠️ Product Needs Revision',
    message: (data) => `"${data.productName}" needs revisions${data.reason ? `: ${data.reason}` : ''}`
  },
  'product_submitted': {
    title: '📤 Product Submitted',
    message: (data) => `"${data.productName}" is under review`
  },
  'low_stock_alert': {
    title: '⚠️ Low Stock Alert',
    message: (data) => `"${data.productName}" has only ${data.stock} units remaining`
  },
  
  // Payout related
  'payout_processed': {
    title: '💳 Payout Received',
    message: (data) => `₹${data.amount} has been credited to your account`
  },
  'payout_failed': {
    title: '❌ Payout Failed',
    message: (data) => `₹${data.amount} payout failed${data.reason ? `: ${data.reason}` : ''}`
  },
  
  // Account related
  'account_approved': {
    title: '✅ Account Approved',
    message: () => 'Your artisan account has been approved! Start selling now.'
  },
  'account_rejected': {
    title: '⚠️ Account Rejected',
    message: (data) => `Your account application was rejected${data.reason ? `: ${data.reason}` : ''}`
  },
  
  // System messages
  'system_announcement': {
    title: '📢 Announcement',
    message: (data) => data.message || 'Please check the latest announcement'
  },
  'new_message': {
    title: '💬 New Message',
    message: (data) => `New message from ${data.from}${data.subject ? `: ${data.subject}` : ''}`
  }
};

// ========== OPTIMIZED: Pre-defined quick replies ==========
const QUICK_REPLIES = {
  'product_rejected': [
    { id: 'fix_category', label: 'Fix Category', action: 'fix_category' },
    { id: 'fix_images', label: 'Update Images', action: 'fix_images' },
    { id: 'fix_description', label: 'Update Description', action: 'fix_description' },
    { id: 'resubmit', label: 'Resubmit', action: 'resubmit' }
  ],
  'low_stock_alert': [
    { id: 'restock', label: 'Restock Now', action: 'restock' },
    { id: 'discontinue', label: 'Discontinue', action: 'discontinue' }
  ],
  'order_placed': [
    { id: 'confirm', label: 'Confirm Order', action: 'confirm_order' },
    { id: 'contact_customer', label: 'Contact Customer', action: 'contact_customer' }
  ],
  'product_approved': [
    { id: 'view_product', label: 'View Product', action: 'view_product' },
    { id: 'share', label: 'Share on Social', action: 'share' }
  ],
  'order_cancelled': [
    { id: 'contact_customer', label: 'Contact Customer', action: 'contact_customer' }
  ]
};

const notificationSchema = new mongoose.Schema({
  // Recipient information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['user', 'artisan', 'admin']
  },
  
  // ========== OPTIMIZED: Use template ID instead of storing full message ==========
  templateId: {
    type: String,
    required: true,
    enum: Object.keys(NOTIFICATION_TEMPLATES)
  },
  
  // ========== OPTIMIZED: Store only variable data, not the full message ==========
  data: {
    orderNumber: String,
    productName: String,
    artisanName: String,
    customerName: String,
    amount: Number,
    status: String,
    reason: String,
    stock: Number,
    from: String,
    subject: String,
    cancelledBy: String,
    // Reference IDs
    orderId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    payoutId: mongoose.Schema.Types.ObjectId,
    // Additional flexible data
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // ========== OPTIMIZED: Store pre-defined actions instead of full URLs ==========
  action: {
    type: String,
    enum: [
      'view_order', 'view_product', 'view_payout', 'view_profile',
      'fix_product', 'confirm_order', 'restock_product',
      'contact_customer', 'resubmit_product', 'share_product'
    ]
  },
  actionParams: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // ========== OPTIMIZED: Pre-defined quick replies ==========
  quickReplies: [{
    id: String,
    label: String,
    action: String,
    // Optional: store additional data for the action
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // ========== OPTIMIZED: Reply tracking ==========
  reply: {
    type: String,
    enum: ['pending', 'replied', 'dismissed'],
    default: 'pending'
  },
  replyContent: {
    type: String,
    trim: true
  },
  replyAt: {
    type: Date
  },
  replyAction: String, // Store which quick reply was used
  
  // Expiry
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  
  // Source
  source: {
    type: String,
    enum: ['system', 'admin', 'customer', 'artisan'],
    default: 'system'
  }
}, {
  timestamps: true
});

// ========== OPTIMIZED: Compressed indexes ==========
notificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, recipientType: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ========== FIXED: Virtual for generated message ==========
notificationSchema.virtual('message').get(function() {
  const template = NOTIFICATION_TEMPLATES[this.templateId];
  if (!template) return 'Notification';
  
  // Convert data object to plain object for template function
  const dataObj = this.data ? this.data.toObject() : {};
  return typeof template.message === 'function' 
    ? template.message(dataObj) 
    : template.message;
});

notificationSchema.virtual('title').get(function() {
  const template = NOTIFICATION_TEMPLATES[this.templateId];
  return template ? template.title : 'Notification';
});

// ========== FIXED: Static methods for creating notifications ==========
notificationSchema.statics.createNotification = async function(
  recipientId, 
  recipientType, 
  templateId, 
  data = {}, 
  options = {}
) {
  const template = NOTIFICATION_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Invalid template ID: ${templateId}`);
  }

  // Get quick replies for this template
  const quickReplies = QUICK_REPLIES[templateId] || [];

  return this.create({
    recipientId,
    recipientType,
    templateId,
    data,
    quickReplies: quickReplies.map(qr => ({
      ...qr,
      data: { templateId, ...qr.data }
    })),
    priority: options.priority || 'medium',
    action: options.action || null,
    actionParams: options.actionParams || null,
    source: options.source || 'system',
    expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
};

// ========== FIXED: Convenience methods for common notifications ==========
notificationSchema.statics.notifyOrderPlaced = async function(artisanId, order) {
  return this.createNotification(artisanId, 'artisan', 'order_placed', {
    orderNumber: order.orderNumber,
    amount: order.total || order.productPrice,
    customerName: order.customer?.name || 'Customer',
    orderId: order._id
  }, {
    priority: 'high',
    action: 'view_order',
    actionParams: { orderId: order._id }
  });
};

notificationSchema.statics.notifyOrderStatusUpdate = async function(artisanId, order, newStatus) {
  return this.createNotification(artisanId, 'artisan', 'order_status_update', {
    orderNumber: order.orderNumber,
    status: newStatus,
    orderId: order._id
  }, {
    priority: 'medium',
    action: 'view_order',
    actionParams: { orderId: order._id }
  });
};

notificationSchema.statics.notifyProductApproved = async function(artisanId, product) {
  return this.createNotification(artisanId, 'artisan', 'product_approved', {
    productName: product.name,
    productId: product._id
  }, {
    priority: 'medium',
    action: 'view_product',
    actionParams: { productId: product._id }
  });
};

notificationSchema.statics.notifyProductRejected = async function(artisanId, product, reason) {
  return this.createNotification(artisanId, 'artisan', 'product_rejected', {
    productName: product.name,
    reason: reason || 'Please review the product details',
    productId: product._id
  }, {
    priority: 'high',
    action: 'fix_product',
    actionParams: { productId: product._id }
  });
};

notificationSchema.statics.notifyLowStock = async function(artisanId, product, stock) {
  return this.createNotification(artisanId, 'artisan', 'low_stock_alert', {
    productName: product.name,
    stock: stock,
    productId: product._id
  }, {
    priority: 'high',
    action: 'restock_product',
    actionParams: { productId: product._id }
  });
};

// ========== FIXED: Reply handler ==========
notificationSchema.methods.addReply = async function(content, action = null) {
  this.reply = 'replied';
  this.replyContent = content;
  this.replyAt = new Date();
  if (action) {
    this.replyAction = action;
  }
  return this.save();
};

notificationSchema.methods.dismiss = async function() {
  this.reply = 'dismissed';
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// ========== FIXED: Get unread count ==========
notificationSchema.statics.getUnreadCount = async function(recipientId, recipientType) {
  return this.countDocuments({
    recipientId,
    recipientType,
    read: false,
    expiresAt: { $gt: new Date() }
  });
};

// ========== FIXED: Mark all as read ==========
notificationSchema.statics.markAllAsRead = async function(recipientId, recipientType) {
  return this.updateMany(
    {
      recipientId,
      recipientType,
      read: false
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// ========== FIXED: Get formatted notification for frontend ==========
notificationSchema.methods.toFrontend = function() {
  return {
    id: this._id,
    title: this.title,
    message: this.message,
    type: this.templateId,
    priority: this.priority,
    read: this.read,
    createdAt: this.createdAt,
    action: this.action ? {
      type: this.action,
      params: this.actionParams
    } : null,
    quickReplies: this.quickReplies || [],
    reply: {
      status: this.reply,
      content: this.replyContent,
      at: this.replyAt,
      action: this.replyAction
    },
    data: this.data || {}
  };
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports = Notification;
module.exports.NOTIFICATION_TEMPLATES = NOTIFICATION_TEMPLATES;
module.exports.QUICK_REPLIES = QUICK_REPLIES;