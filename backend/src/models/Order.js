// src/models/Order.js
const mongoose = require('mongoose');

// Nested schemas for better organization
const customerDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  billingAddress: {
    sameAsShipping: {
      type: Boolean,
      default: true
    },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  message: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  variant: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Maximum quantity per item is 100']
  },
  sku: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: [true, 'Artisan reference is required']
  },
  artisanName: {
    type: String,
    trim: true
  },
  discountApplied: {
    type: Number,
    min: 0,
    default: 0
  },
  taxAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalPrice: {
    type: Number,
    min: 0
  }
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cod', 'online', 'bank_transfer', 'upi'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cash', null],
    default: null
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amountPaid: {
    type: Number,
    min: 0
  },
  paidAt: Date,
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundedAt: Date,
  refundReason: String
}, { _id: false });

const shippingDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['standard', 'express', 'priority', 'pickup'],
    default: 'standard'
  },
  carrier: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date,
  shippingCost: {
    type: Number,
    min: 0,
    default: 0
  },
  packagingFee: {
    type: Number,
    min: 0,
    default: 0
  },
  insuranceCost: {
    type: Number,
    min: 0,
    default: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'm'],
      default: 'cm'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Shipping notes cannot exceed 500 characters']
  }
}, { _id: false });

const adminNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['status_update', 'customer_note', 'internal_note', 'issue', 'resolution'],
    default: 'internal_note'
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const contactHistorySchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['email', 'phone', 'whatsapp', 'sms', 'in_app'],
    required: true
  },
  contactedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String // URLs to attached files
  }],
  scheduledFor: Date,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'scheduled'],
    default: 'sent'
  },
  messageId: String, // For email/SMS tracking
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Main Order Schema
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: [true, 'Order number is required'],
    uppercase: true,
    trim: true
  },

  // Customer Information
  customer: customerDetailsSchema,

  // Order Items
  items: [orderItemSchema],

  // Order Totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    min: 0,
    default: 0
  },
  shippingCost: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },

  // Order Status
  status: {
    type: String,
    enum: [
      'pending',           // Order placed, awaiting confirmation
      'confirmed',         // Artisan has confirmed the order
      'processing',        // Artisan is preparing the order
      'ready_to_ship',     // Order is packed and ready for shipping
      'shipped',          // Order has been shipped
      'out_for_delivery', // Order is out for delivery
      'delivered',        // Order has been delivered
      'cancelled',        // Order was cancelled
      'refunded',         // Order was refunded
      'on_hold',          // Order is on hold (payment issue, stock issue)
      'failed'            // Order failed (payment failed, other issues)
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedBy: mongoose.Schema.Types.ObjectId,
    reason: String,
    notes: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Payment Information
  payment: paymentDetailsSchema,

  // Shipping Information
  shipping: shippingDetailsSchema,

  // Artisan Information
  artisanOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtisanOrder'
  },

  // Commission & Payout
  commission: {
    rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    paidToArtisan: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout'
    }
  },

  // Order Metadata
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'admin_panel', 'api'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },

  // Notes & Communication
  notes: [adminNoteSchema],
  contactHistory: [contactHistorySchema],

  // Customer Communication Preferences
  communicationPrefs: {
    sendSmsUpdates: {
      type: Boolean,
      default: true
    },
    sendEmailUpdates: {
      type: Boolean,
      default: true
    },
    sendWhatsappUpdates: {
      type: Boolean,
      default: true
    }
  },

  // Analytics
  viewedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  convertedFromWishlist: {
    type: Boolean,
    default: false
  },
  couponCode: {
    type: String,
    trim: true
  },

  // Admin Tracking
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.userId': 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ 'items.artisan': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ updatedAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'payment.method': 1 });
orderSchema.index({ total: 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1, createdAt: -1 });
orderSchema.index({ 'payment.transactionId': 1 }, { sparse: true });
orderSchema.index({ tags: 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ priority: 1 });

// ==================== VIRTUAL FIELDS ====================
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('isPaid').get(function() {
  return this.payment.status === 'completed';
});

orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled' || this.status === 'refunded';
});

orderSchema.virtual('estimatedDeliveryDate').get(function() {
  if (this.shipping.estimatedDelivery) {
    return this.shipping.estimatedDelivery.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return 'Not available';
});

orderSchema.virtual('customerFullAddress').get(function() {
  const addr = this.customer.shippingAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.postalCode}, ${addr.country}`;
});

orderSchema.virtual('artisans').get(function() {
  const artisanIds = new Set(this.items.map(item => item.artisan.toString()));
  return Array.from(artisanIds);
});

// ==================== STATIC METHODS ====================
orderSchema.statics.generateOrderNumber = function() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

orderSchema.statics.findByCustomer = function(userId, email) {
  const query = {};
  if (userId) {
    query['customer.userId'] = userId;
  }
  if (email) {
    query['customer.email'] = email.toLowerCase();
  }
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('items.product', 'name image price')
    .populate('items.artisan', 'businessName')
    .populate('assignedTo', 'username email');
};

orderSchema.statics.findByArtisan = function(artisanId) {
  return this.find({ 'items.artisan': artisanId })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name image')
    .populate('customer.userId', 'username email');
};

orderSchema.statics.getOrderStats = async function(timeRange = 'month') {
  const now = new Date();
  let startDate;
  
  switch(timeRange) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
};

// ==================== INSTANCE METHODS ====================
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    itemCount: this.itemCount,
    customerName: this.customer.name,
    status: this.status,
    total: this.total,
    formattedDate: this.formattedDate,
    paymentStatus: this.payment.status,
    isPaid: this.isPaid,
    estimatedDelivery: this.estimatedDeliveryDate
  };
};

orderSchema.methods.addNote = function(note, userId, type = 'internal_note', isInternal = false) {
  this.notes.push({
    note,
    addedBy: userId,
    type,
    isInternal,
    createdAt: new Date()
  });
  return this.save();
};

orderSchema.methods.updateStatus = function(newStatus, userId, reason = '', notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    reason,
    notes,
    changedAt: new Date()
  });
  
  // Update timestamps based on status
  const now = new Date();
  switch(newStatus) {
    case 'shipped':
      this.shipping.shippedAt = now;
      break;
    case 'delivered':
      this.shipping.deliveredAt = now;
      this.payment.status = 'completed';
      break;
    case 'cancelled':
      this.payment.status = 'cancelled';
      break;
    case 'refunded':
      this.payment.refundedAt = now;
      break;
  }
  
  return this.save();
};

orderSchema.methods.addContactRecord = function(method, contactedBy, notes = '', attachments = []) {
  this.contactHistory.push({
    method,
    contactedBy,
    notes,
    attachments,
    createdAt: new Date()
  });
  return this.save();
};

orderSchema.methods.calculateCommission = function() {
  const commissionRate = this.commission.rate;
  this.commission.amount = (this.total * commissionRate) / 100;
  return this.save();
};

// ==================== PRE-SAVE MIDDLEWARE ====================
orderSchema.pre('save', function () {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = this.constructor.generateOrderNumber();
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    this.items.forEach(item => {
      item.totalPrice = (item.price - item.discountApplied) * item.quantity;
    });

    this.total = this.subtotal - this.discount + this.tax + this.shippingCost;
  }

  // Billing address fallback
  if (this.customer?.billingAddress?.sameAsShipping) {
    this.customer.billingAddress = {
      ...this.customer.shippingAddress,
      sameAsShipping: true
    };
  }

  this.updatedAt = new Date();
});

// ==================== POST-SAVE MIDDLEWARE ====================
orderSchema.post('save', async function (doc) {
  try {
    // Update product stock
    if (doc.status === 'confirmed' || doc.status === 'processing') {
      const Product = mongoose.model('Product');

      for (const item of doc.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: -item.quantity,
              sales: item.quantity
            }
          }
        );
      }
    }

    // Update artisan statistics
    const Artisan = mongoose.model('Artisan');
    const artisanIds = [...new Set(doc.items.map(i => i.artisan.toString()))];

    for (const artisanId of artisanIds) {
      const artisanOrders = doc.items.filter(
        item => item.artisan.toString() === artisanId
      );

      const revenue = artisanOrders.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      const totalSales = artisanOrders.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      await Artisan.findByIdAndUpdate(artisanId, {
        $inc: {
          totalOrders: 1,
          totalRevenue: revenue,
          totalSales
        }
      });
    }
  } catch (err) {
    console.error('Post-save hook error:', err);
  }
});

module.exports = mongoose.model('Order', orderSchema);