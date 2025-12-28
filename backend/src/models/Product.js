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
  // Basic Information
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
  
  // Pricing
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
  
  // Inventory
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inventory: inventorySchema,
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'low_stock', 'draft', 'archived', 'discontinued'],
    default: 'active'
  },
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
  
  // Media
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  
  // Product Details
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
  
  // Shipping & Dimensions
  shipping: shippingSchema,
  weight: {
    type: Number,
    min: 0
  },
  
  // SEO & Marketing
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
  
  // Identification
  sku: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Related Products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Analytics & Tracking
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
  
  // Vendor/Admin Info
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < (this.inventory?.lowStockThreshold || 5)) return 'low_stock';
  return 'active';
});

productSchema.virtual('salePrice').get(function() {
  if (this.discount?.isActive && this.discount.type !== 'none') {
    if (this.discount.type === 'percentage') {
      return this.price * (1 - this.discount.value / 100);
    } else if (this.discount.type === 'fixed') {
      return Math.max(0, this.price - this.discount.value);
    }
  }
  return this.price;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.discount?.isActive && this.discount.type === 'percentage') {
    return this.discount.value;
  }
  return 0;
});

productSchema.virtual('hasVariants').get(function() {
  return this.variants && this.variants.length > 0;
});

productSchema.virtual('totalStock').get(function() {
  if (this.hasVariants) {
    return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  }
  return this.stock;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Auto-generate SKU if not provided
  if (!this.sku) {
    const prefix = (this.category || 'PRO').substring(0, 3).toUpperCase();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.sku = `${prefix}-${random}`;
  }
  
  // Generate slug if not provided
  if (!this.seo?.slug && this.name) {
    this.seo = this.seo || {};
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Update stock status based on inventory
  if (this.stock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.stock < (this.inventory?.lowStockThreshold || 5)) {
    this.status = 'low_stock';
  } else if (this.status === 'out_of_stock' && this.stock > 0) {
    this.status = 'active';
  }
  
  // Update sale price calculation
  if (this.discount?.isActive && this.discount.type === 'percentage' && !this.discount.originalPrice) {
    this.discount.originalPrice = this.price;
  }
  
  next();
});

// Indexes
productSchema.index({ name: 'text', description: 'text', 'specifications.value': 'text' });
productSchema.index({ status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);