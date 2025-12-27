const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
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
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'out_of_stock', 'low_stock', 'draft'],
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
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Virtual for determining stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'out_of_stock';
    if (this.stock < 5) return 'low_stock';
    return 'active';
});

// Indexes for better query performance
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);