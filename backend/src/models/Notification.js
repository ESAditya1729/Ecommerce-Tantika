// models/Notification.js
const mongoose = require('mongoose');

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
  
  // Notification details
  type: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'order_status_update',
      'order_cancelled',
      'payment_received',
      'payment_failed',
      'product_approved',
      'product_rejected',
      'new_product_submitted',
      'review_received',
      'payout_processed',
      'payout_failed',
      'account_approved',
      'account_rejected',
      'low_stock_alert',
      'system_announcement',
      'new_message'
    ]
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Additional data for dynamic content
  data: {
    orderId: mongoose.Schema.Types.ObjectId,
    orderNumber: String,
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    artisanId: mongoose.Schema.Types.ObjectId,
    payoutId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    status: String,
    trackingNumber: String,
    // Additional fields
    metadata: mongoose.Schema.Types.Mixed
  },
  
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
  
  // Action URL for frontend navigation
  actionUrl: {
    type: String,
    trim: true
  },
  
  // Expiry date for auto-cleanup
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  
  // Source of notification (who triggered it)
  source: {
    type: String,
    enum: ['system', 'admin', 'customer', 'artisan'],
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, recipientType: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods
notificationSchema.statics.createOrderNotification = async function(order, artisanId, notificationType = 'order_placed') {
  let title, message;
  
  switch(notificationType) {
    case 'order_placed':
      title = 'New Order Received';
      message = `You have received a new order #${order.orderNumber} for ₹${order.productPrice}`;
      break;
    case 'order_status_update':
      title = 'Order Status Updated';
      message = `Order #${order.orderNumber} status updated to: ${order.status}`;
      break;
    case 'order_cancelled':
      title = 'Order Cancelled';
      message = `Order #${order.orderNumber} has been cancelled`;
      break;
    default:
      title = 'Order Update';
      message = `Update for order #${order.orderNumber}`;
  }
  
  return this.create({
    recipientId: artisanId,
    recipientType: 'artisan',
    type: notificationType,
    title,
    message,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      productName: order.productName,
      amount: order.productPrice,
      status: order.status
    },
    actionUrl: `/dashboard/orders/${order._id}`,
    priority: 'high'
  });
};

notificationSchema.statics.createProductNotification = async function(product, artisanId, notificationType, additionalData = {}) {
  const messages = {
    product_approved: {
      title: 'Product Approved',
      message: `Your product "${product.name}" has been approved and is now live on Tantika.`
    },
    product_rejected: {
      title: 'Product Needs Revision',
      message: `Your product "${product.name}" needs revisions. ${additionalData.reason ? `Reason: ${additionalData.reason}` : ''}`
    },
    new_product_submitted: {
      title: 'Product Submitted',
      message: `Your product "${product.name}" has been submitted for review.`
    }
  };
  
  const notificationData = messages[notificationType] || messages.new_product_submitted;
  
  return this.create({
    recipientId: artisanId,
    recipientType: 'artisan',
    type: notificationType,
    title: notificationData.title,
    message: notificationData.message,
    data: {
      productId: product._id,
      productName: product.name,
      approvalStatus: product.approvalStatus,
      ...additionalData
    },
    actionUrl: `/dashboard/products/${product._id}`,
    priority: 'medium'
  });
};

notificationSchema.statics.createPayoutNotification = async function(payout, artisanId, notificationType) {
  const messages = {
    payout_processed: {
      title: 'Payout Processed',
      message: `Your payout of ₹${payout.amount} has been processed successfully.`
    },
    payout_failed: {
      title: 'Payout Failed',
      message: `Your payout of ₹${payout.amount} failed. ${payout.failureReason ? `Reason: ${payout.failureReason}` : ''}`
    }
  };
  
  const notificationData = messages[notificationType] || {
    title: 'Payout Update',
    message: `Update for your payout request of ₹${payout.amount}`
  };
  
  return this.create({
    recipientId: artisanId,
    recipientType: 'artisan',
    type: notificationType,
    title: notificationData.title,
    message: notificationData.message,
    data: {
      payoutId: payout._id,
      amount: payout.amount,
      status: payout.status,
      transactionId: payout.transactionId
    },
    actionUrl: `/dashboard/payouts/${payout._id}`,
    priority: 'high'
  });
};

// Get unread count
notificationSchema.statics.getUnreadCount = async function(recipientId, recipientType) {
  return this.countDocuments({
    recipientId,
    recipientType,
    read: false,
    expiresAt: { $gt: new Date() }
  });
};

// Mark all as read
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

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;