// models/Payout.js
const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  // Artisan reference (using userId from Artisan model)
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model (artisan's user account)
    required: true
  },
  
  artisanName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Payout details
  amount: {
    type: Number,
    required: true,
    min: 100, // Minimum payout amount ₹100
    validate: {
      validator: function(v) {
        return v >= 100;
      },
      message: 'Minimum payout amount is ₹100'
    }
  },
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'processed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Bank details
  bankDetails: {
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings'
    }
  },
  
  // UPI option
  upiId: {
    type: String,
    trim: true
  },
  
  // Transaction reference
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  referenceNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  // Dates
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  },
  
  // Failure details
  failureReason: {
    type: String,
    trim: true
  },
  
  // Related orders (using your Order model)
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Processing fees
  processingFee: {
    type: Number,
    default: function() {
      // 2% processing fee, minimum ₹10
      return Math.max(this.amount * 0.02, 10);
    }
  },
  
  gst: {
    type: Number,
    default: function() {
      // 18% GST on processing fee
      return this.processingFee * 0.18;
    }
  },
  
  netAmount: {
    type: Number,
    default: function() {
      return this.amount - this.processingFee - this.gst;
    }
  },
  
  // Admin information
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Payout method
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'upi'],
    default: 'bank_transfer'
  }
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ artisan: 1, status: 1 });
payoutSchema.index({ artisan: 1, requestedAt: -1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

// Pre-save middleware
payoutSchema.pre('save', function(next) {
  // Auto-calculate fees if not set
  if (this.isModified('amount')) {
    this.processingFee = Math.max(this.amount * 0.02, 10);
    this.gst = this.processingFee * 0.18;
    this.netAmount = this.amount - this.processingFee - this.gst;
  }
  
  // Set processedAt when status changes to processed
  if (this.isModified('status') && this.status === 'processed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Set completedAt when status changes to processed or failed
  if (this.isModified('status') && (this.status === 'processed' || this.status === 'failed') && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-generate reference number for processed payouts
  if (this.isModified('status') && this.status === 'processed' && !this.referenceNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.referenceNumber = `PYT-${timestamp}${random}`;
  }
  
  next();
});

// Virtuals
payoutSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

payoutSchema.virtual('formattedNetAmount').get(function() {
  return `₹${this.netAmount.toLocaleString('en-IN')}`;
});

payoutSchema.virtual('formattedDate').get(function() {
  return this.requestedAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

// Static methods
payoutSchema.statics.getArtisanSummary = async function(artisanId) {
  const result = await this.aggregate([
    {
      $match: {
        artisan: mongoose.Types.ObjectId(artisanId)
      }
    },
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
    totalRequested: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalFailed: 0,
    totalAmount: 0,
    lastPayoutDate: null
  };
  
  result.forEach(item => {
    summary.totalAmount += item.totalAmount;
    if (item._id === 'processed') {
      summary.totalProcessed = item.totalAmount;
      summary.lastPayoutDate = item.latestDate;
    } else if (item._id === 'pending' || item._id === 'processing') {
      summary.totalPending += item.totalAmount;
    } else if (item._id === 'failed') {
      summary.totalFailed += item.totalAmount;
    }
  });
  
  summary.totalRequested = summary.totalProcessed + summary.totalPending + summary.totalFailed;
  
  return summary;
};

payoutSchema.statics.calculatePendingAmount = async function(artisanId) {
  // Calculate amount from orders that are delivered but not yet included in payouts
  // This would need to be implemented based on your order structure
  // For now, returning 0 - you'll need to implement this based on your Order model
  return 0;
};

payoutSchema.statics.createFromOrders = async function(artisanId, orders, bankDetails) {
  // Calculate total from orders
  const totalAmount = orders.reduce((sum, order) => {
    return sum + (order.productPrice || 0);
  }, 0);
  
  // Get artisan name (you'll need to fetch from Artisan model)
  const Artisan = require('./Artisan');
  const artisan = await Artisan.findOne({ userId: artisanId });
  
  if (!artisan) {
    throw new Error('Artisan not found');
  }
  
  // Create payout
  const payout = await this.create({
    artisan: artisanId,
    artisanName: artisan.businessName || artisan.name,
    amount: totalAmount,
    bankDetails,
    orders: orders.map(order => order._id),
    status: 'pending'
  });
  
  return payout;
};

// Instance methods
payoutSchema.methods.updateStatus = async function(newStatus, options = {}) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (options.transactionId) {
    this.transactionId = options.transactionId;
  }
  
  if (options.failureReason) {
    this.failureReason = options.failureReason;
  }
  
  if (options.adminNotes) {
    this.adminNotes = options.adminNotes;
  }
  
  if (options.processedBy) {
    this.processedBy = options.processedBy;
  }
  
  await this.save();
  
  return {
    oldStatus,
    newStatus,
    payout: this
  };
};

payoutSchema.methods.getSummary = function() {
  return {
    id: this._id,
    amount: this.formattedAmount,
    netAmount: this.formattedNetAmount,
    status: this.status,
    requestedAt: this.formattedDate,
    transactionId: this.transactionId,
    referenceNumber: this.referenceNumber
  };
};

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;