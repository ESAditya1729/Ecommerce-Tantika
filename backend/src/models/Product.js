// src/models/Product.js
const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Specification key is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Specification value is required'],
    trim: true
  }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Variant stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { _id: false });

const dimensionSchema = new mongoose.Schema({
  length: { type: Number, min: 0 },
  width: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  unit: { 
    type: String, 
    enum: ['cm', 'in', 'm', 'mm'], 
    default: 'cm' 
  }
}, { _id: false });

const discountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  value: {
    type: Number,
    min: 0,
    default: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const seoSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  keywords: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const shippingSchema = new mongoose.Schema({
  weight: {
    type: Number,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['g', 'kg', 'lb', 'oz'],
    default: 'g'
  },
  dimensions: dimensionSchema,
  shippingClass: {
    type: String,
    enum: ['standard', 'express', 'bulk', 'fragile', 'none'],
    default: 'standard'
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  freeShipping: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const inventorySchema = new mongoose.Schema({
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 5
  },
  manageStock: {
    type: Boolean,
    default: true
  },
  backorderAllowed: {
    type: Boolean,
    default: false
  },
  maxPurchaseQuantity: {
    type: Number,
    min: 1,
    default: 10
  },
  allowOutOfStockPurchase: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  // ==================== BASIC INFORMATION ====================
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Sarees',
      'Home Decor', 
      'Bags',
      'Sculptures',
      'Clothing',
      'Jewelry',
      'Accessories',
      'Pottery',
      'Textiles',
      'Art',
      'Furniture',
      'Stationery'
    ],
    default: 'Clothing'
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // ==================== PRICING ====================
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price is too high']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  discount: discountSchema,
  
  // ==================== INVENTORY ====================
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inventory: inventorySchema,
  
  // ==================== PRODUCT STATUS ====================
  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'low_stock', 'draft', 'archived', 'discontinued'],
    default: 'draft' // Changed to draft for artisan submissions
  },
  
  // ==================== ARTISAN APPROVAL SYSTEM ====================
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  // ==================== SALES & RATING ====================
  sales: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // ==================== MEDIA ====================
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  galleryImages: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // ==================== PRODUCT DETAILS ====================
  specifications: [specificationSchema],
  variants: [variantSchema],
  features: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  materials: [{
    type: String,
    trim: true
  }],
  brand: {
    type: String,
    trim: true
  },
  customFields: [{
    label: String,
    value: mongoose.Schema.Types.Mixed,
    type: { type: String, enum: ['text', 'number', 'boolean', 'date'] }
  }],
  
  // ==================== SHIPPING & DIMENSIONS ====================
  shipping: shippingSchema,
  weight: {
    type: Number,
    min: 0
  },
  
  // ==================== SEO & MARKETING ====================
  seo: seoSchema,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: true
  },
  featureRequest: {
    requested: { type: Boolean, default: false },
    requestedAt: Date,
    approved: { type: Boolean, default: false },
    approvedAt: Date
  },
  
  // ==================== IDENTIFICATION ====================
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true // Changed to sparse to handle null values
  },
  artisanSku: {
    type: String,
    trim: true
  },
  
  // ==================== RELATED PRODUCTS ====================
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // ==================== ANALYTICS & TRACKING ====================
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  wishlistCount: {
    type: Number,
    default: 0,
    min: 0
  },
  artisanViews: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewed: {
    type: Date
  },
  
  // ==================== ARTISAN SYSTEM ====================
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: [true, 'Artisan reference is required'],
    index: true
  },
  
  // ==================== ADMIN TRACKING ====================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // ==================== PRODUCT LIFE CYCLE ====================
  lifecycle: {
    stage: {
      type: String,
      enum: ['concept', 'development', 'testing', 'production', 'launch', 'maintenance', 'end_of_life'],
      default: 'development'
    },
    notes: [{
      text: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      addedAt: { type: Date, default: Date.now }
    }]
  },
  
  // ==================== QUALITY CONTROL ====================
  qualityCheck: {
    passed: { type: Boolean, default: false },
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedAt: Date,
    notes: String,
    issues: [{
      description: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      resolved: { type: Boolean, default: false }
    }]
  }
}, {
  timestamps: true
});

// ==================== INDEXES ====================
productSchema.index({ name: 'text', description: 'text', 'specifications.value': 'text' });
productSchema.index({ status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1 }, { unique: true, sparse: true }); // Added sparse
productSchema.index({ createdAt: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ artisan: 1 });
productSchema.index({ approvalStatus: 1 });
productSchema.index({ artisan: 1, approvalStatus: 1 });
productSchema.index({ artisan: 1, status: 1 });
productSchema.index({ artisan: 1, category: 1 });
productSchema.index({ submittedAt: -1 });
productSchema.index({ approvedAt: -1 });

// ==================== VIRTUAL FIELDS ====================
productSchema.virtual('artisanName').get(function() {
  return this.artisan?.username || 'Unknown Artisan';
});

productSchema.virtual('isPendingApproval').get(function() {
  return this.approvalStatus === 'pending';
});

productSchema.virtual('isApproved').get(function() {
  return this.approvalStatus === 'approved' && this.status === 'active';
});

productSchema.virtual('canBeSold').get(function() {
  return this.approvalStatus === 'approved' && 
         this.status === 'active' && 
         this.stock > 0;
});

// ==================== STATIC METHODS ====================
productSchema.statics.generateSKU = function(category = 'PRO') {
  const prefix = category.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${random}`;
};

productSchema.statics.generateArtisanSKU = function(artisanId, category) {
  const artisanPrefix = artisanId.toString().slice(-4).toUpperCase();
  const catPrefix = category.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `ART-${artisanPrefix}-${catPrefix}-${timestamp}`;
};

// ==================== INSTANCE METHODS ====================
productSchema.methods.requestApproval = function() {
  this.approvalStatus = 'pending';
  this.submittedAt = new Date();
  return this.save();
};

productSchema.methods.approveProduct = function(adminId) {
  this.approvalStatus = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.status = 'active';
  return this.save();
};

productSchema.methods.rejectProduct = function(adminId, reason) {
  this.approvalStatus = 'rejected';
  this.rejectionReason = reason;
  return this.save();
};

// ==================== PRE-SAVE MIDDLEWARE ====================
productSchema.pre('save', async function(next) {
  try {
    // Generate SKU if not provided
    if (!this.sku) {
      this.sku = this.constructor.generateSKU(this.category);
    }
    
    // Generate artisan SKU if not provided and artisan exists
    if (this.artisan && !this.artisanSku) {
      this.artisanSku = this.constructor.generateArtisanSKU(this.artisan, this.category);
    }
    
    // Set submittedAt for new artisan products
    if (this.isNew && this.approvalStatus === 'pending') {
      this.submittedAt = new Date();
    }
    
    // Auto-set status based on approval
    if (this.approvalStatus === 'approved' && this.status === 'draft') {
      this.status = 'active';
    }
    
    // For artisan submissions, default status should be draft
    if (this.isNew && this.approvalStatus === 'pending') {
      this.status = 'draft';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema);