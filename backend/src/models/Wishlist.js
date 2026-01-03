// models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    productImage: {
      type: String,
      default: ''
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0
    },
    artisan: {
      type: String,
      default: 'Unknown Artisan',
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique product per user
wishlistSchema.index({ userId: 1, 'items.productId': 1 }, { unique: true });

// Methods
wishlistSchema.methods.getTotalItems = function() {
  return this.items.length;
};

wishlistSchema.methods.getTotalValue = function() {
  return this.items.reduce((total, item) => total + item.productPrice, 0);
};

wishlistSchema.methods.isProductInWishlist = function(productId) {
  return this.items.some(item => item.productId === productId);
};

// Static methods
wishlistSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'username email');
};

wishlistSchema.statics.addToWishlist = async function(userId, productData) {
  const wishlist = await this.findOne({ userId });
  
  if (!wishlist) {
    // Create new wishlist if doesn't exist
    return this.create({
      userId,
      items: [{
        ...productData,
        addedAt: new Date()
      }]
    });
  }
  
  // Check if product already exists
  const exists = wishlist.items.some(item => item.productId === productData.productId);
  if (exists) {
    throw new Error('Product already in wishlist');
  }
  
  // Add new item
  wishlist.items.push({
    ...productData,
    addedAt: new Date()
  });
  wishlist.updatedAt = new Date();
  
  return wishlist.save();
};

wishlistSchema.statics.removeFromWishlist = async function(userId, productId) {
  const wishlist = await this.findOne({ userId });
  
  if (!wishlist) {
    throw new Error('Wishlist not found');
  }
  
  // Remove item
  wishlist.items = wishlist.items.filter(item => item.productId !== productId);
  wishlist.updatedAt = new Date();
  
  return wishlist.save();
};

wishlistSchema.statics.clearWishlist = async function(userId) {
  return this.findOneAndUpdate(
    { userId },
    { $set: { items: [], updatedAt: new Date() } },
    { new: true }
  );
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;