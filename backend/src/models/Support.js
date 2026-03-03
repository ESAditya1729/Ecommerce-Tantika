// src/models/Support.js
const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  
  // User reference (can be either regular user or artisan)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // To distinguish between regular user and artisan
  userRole: {
    type: String,
    enum: ['user', 'artisan', 'pending_artisan'],
    required: true
  },
  
  // If user is artisan, store reference to Artisan model
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    default: null
  },
  
  // Contact Information (pre-filled from user/artisan profile)
  contactInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternativePhone: {
      type: String,
      default: ''
    }
  },
  
  // Ticket Details
  category: {
    type: String,
    enum: [
      'product_issue',
      'order_issue',
      'payment_issue',
      'technical_issue',
      'account_issue',
      'shipping_delivery',
      'customization_request',
      'artisan_application',
      'payout_issue',
      'verification_issue',
      'other'
    ],
    required: true
  },
  
  subCategory: {
    type: String,
    trim: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Related Entities (optional)
  relatedTo: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status Management
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'open'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin users
    default: null
  },
  
  assignedAt: Date,
  
  // Conversation Thread
  conversations: [{
    message: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['user', 'artisan', 'admin'],
      required: true
    },
    senderName: String,
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String
    }],
    isInternal: {
      type: Boolean,
      default: false // For admin notes not visible to user
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution Details
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    trim: true
  },
  resolutionTime: {
    type: Number, // Time in hours taken to resolve
    default: 0
  },
  
  // Customer Satisfaction
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    submittedAt: Date
  },
  
  // Escalation
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: Date,
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationReason: String,
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'phone'],
      default: 'web'
    },
    browser: String,
    platform: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate ticket ID before saving
SupportTicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.ticketId = `TKT${year}${month}${day}${random}`;
  }
  
  this.updatedAt = Date.now();
  this.lastActivityAt = Date.now();
  
  // Calculate resolution time if resolved
  if (this.status === 'resolved' && !this.resolutionTime) {
    const created = this.createdAt;
    const resolved = new Date();
    const diffHours = (resolved - created) / (1000 * 60 * 60);
    this.resolutionTime = Math.round(diffHours * 10) / 10;
  }
  
  next();
});

// Indexes for better query performance
SupportTicketSchema.index({ ticketId: 1 });
SupportTicketSchema.index({ user: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ category: 1, createdAt: -1 });
SupportTicketSchema.index({ 'contactInfo.email': 1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ lastActivityAt: -1 });

// Virtual for time since last activity
SupportTicketSchema.virtual('timeSinceLastActivity').get(function() {
  const now = new Date();
  const diffMs = now - this.lastActivityAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} days ago`;
  if (diffHours > 0) return `${diffHours} hours ago`;
  if (diffMins > 0) return `${diffMins} minutes ago`;
  return 'Just now';
});

// Virtual for ticket age
SupportTicketSchema.virtual('age').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10;
});

// Method to check if ticket is overdue (no activity for 48 hours)
SupportTicketSchema.methods.isOverdue = function() {
  if (this.status === 'closed' || this.status === 'resolved') return false;
  const now = new Date();
  const diffMs = now - this.lastActivityAt;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 48;
};

// Method to add system message
SupportTicketSchema.methods.addSystemMessage = function(message, userId) {
  this.conversations.push({
    message,
    sender: userId,
    senderRole: 'admin',
    senderName: 'System',
    isSystemMessage: true,
    createdAt: new Date()
  });
  this.lastActivityAt = new Date();
};

// Static method to get ticket statistics
SupportTicketSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        avgResolutionTime: { $avg: '$resolutionTime' },
        avgRating: { $avg: '$satisfaction.rating' }
      }
    }
  ]);
  
  const categoryStats = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  return {
    overall: stats[0] || {
      total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
      urgent: 0, high: 0, avgResolutionTime: 0, avgRating: 0
    },
    byCategory: categoryStats
  };
};

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);