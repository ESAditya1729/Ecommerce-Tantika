// src/models/Artisan.js
const mongoose = require('mongoose');

const ArtisanSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  
  phone: {
    type: String,
    required: true
  },
  
  // Business Address
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postalCode: {
      type: String,
      default: '' // Changed from required to default empty
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Identity Verification
  idProof: {
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'passport', 'driver_license'],
      required: true
    },
    number: {
      type: String,
      required: true
      // Removed unique: true - can cause issues during registration
    },
    documentUrl: {
      type: String,
      default: ''
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Professional Information
  specialization: [{
    type: String,
    enum: [
      'Sarees Weaving', 'Pottery', 'Jewelry Making', 'Wood Carving',
      'Textile Printing', 'Metal Crafts', 'Bamboo Crafts', 'Embroidery',
      'Terracotta', 'Painting', 'Sculpture', 'Leather Work',
      'Weaving', 'Block Printing', 'Kantha Stitch', 'Madhubani',
      'Patachitra', 'Dokra', 'Sholapith', 'Conch Shell'
    ]
  }],
  
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Social & Portfolio Links
  portfolioLink: {
    type: String,
    default: ''
  },
  
  website: {
    type: String,
    default: ''
  },
  
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  
  // Business Documents
  documents: [{
    type: {
      type: String,
      enum: ['business_license', 'gst_certificate', 'msme_certificate', 'other']
    },
    url: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Financial Information (for payouts) - MADE OPTIONAL
  bankDetails: {
    accountName: {
      type: String,
      default: '' // Changed from required to default empty
    },
    accountNumber: {
      type: String,
      default: '' // Changed from required to default empty
    },
    bankName: {
      type: String,
      default: '' // Changed from required to default empty
    },
    ifscCode: {
      type: String,
      default: '' // Changed from required to default empty
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'salary'],
      default: 'savings'
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Approval Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  
  rejectionReason: {
    type: String,
    default: ''
  },
  
  // Approval Tracking
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  approvedAt: Date,
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalProducts: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Analytics
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Settings
  settings: {
    autoApproveProducts: {
      type: Boolean,
      default: false
    },
    lowStockNotification: {
      type: Boolean,
      default: true
    },
    newOrderNotification: {
      type: Boolean,
      default: true
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque'],
      default: 'bank_transfer'
    },
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    }
  },
  
  // Timestamps
  lastLoginAt: Date,
  lastActiveAt: Date
  
}, {
  timestamps: true
});

// Indexes
ArtisanSchema.index({ userId: 1 });
ArtisanSchema.index({ status: 1 });
ArtisanSchema.index({ specialization: 1 });
ArtisanSchema.index({ rating: -1 });
ArtisanSchema.index({ totalSales: -1 });
ArtisanSchema.index({ createdAt: -1 });
ArtisanSchema.index({ businessName: 'text', description: 'text' });

// Virtual for active products count
ArtisanSchema.virtual('activeProducts', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'artisan',
  match: { status: 'active', approvalStatus: 'approved' },
  count: true
});

// Virtual for pending products count
ArtisanSchema.virtual('pendingProducts', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'artisan',
  match: { approvalStatus: 'pending' },
  count: true
});

// Method to check if artisan is verified
ArtisanSchema.methods.isVerified = function() {
  return this.status === 'approved' && 
         this.idProof.verified === true;
  // Removed bankDetails.verified check since it's optional now
};

// Method to get approval status badge
ArtisanSchema.methods.getStatusBadge = function() {
  const badges = {
    pending: { color: 'yellow', text: 'Under Review' },
    approved: { color: 'green', text: 'Verified Artisan' },
    rejected: { color: 'red', text: 'Application Rejected' },
    suspended: { color: 'gray', text: 'Account Suspended' }
  };
  return badges[this.status] || { color: 'gray', text: 'Unknown' };
};

module.exports = mongoose.model('Artisan', ArtisanSchema);