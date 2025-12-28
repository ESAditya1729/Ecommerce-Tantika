const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Product Information
  productId: { 
    type: String, 
    required: true
  },
  productName: { 
    type: String, 
    required: true,
    trim: true 
  },
  productPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  productImage: { 
    type: String, 
    default: ''
  },
  artisan: { 
    type: String, 
    default: 'Unknown Artisan',
    trim: true 
  },
  productLocation: { 
    type: String, 
    default: 'Unknown Location',
    trim: true 
  },
  
  // Customer Information
  customerDetails: {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    address: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String, 
      required: true,
      trim: true 
    },
    state: { 
      type: String, 
      required: true,
      trim: true 
    },
    pincode: { 
      type: String, 
      required: true,
      trim: true
    },
    message: { 
      type: String, 
      default: '',
      trim: true
    }
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Order Tracking - FIXED: Added required
  orderNumber: { 
    type: String, 
    unique: true,
    required: [true, 'Order number is required'], // ADDED THIS LINE
    uppercase: true
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'cod'],
    default: 'cod'
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
  
  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: { type: String, default: 'System' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Contact History
  contactHistory: [{
    method: { 
      type: String, 
      enum: ['email', 'phone', 'whatsapp']
    },
    date: { type: Date, default: Date.now },
    notes: String,
    contactedBy: { type: String, default: 'Admin' }
  }]
}, {
  timestamps: true
});

// Simple virtual properties
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

orderSchema.virtual('customerFullAddress').get(function() {
  const cd = this.customerDetails;
  return `${cd.address}, ${cd.city}, ${cd.state} - ${cd.pincode}`;
});

// Indexes
orderSchema.index({ status: 1 });
orderSchema.index({ 'customerDetails.email': 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

// Methods
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    productName: this.productName,
    customerName: this.customerDetails.name,
    status: this.status,
    amount: this.productPrice,
    date: this.formattedDate,
    paymentStatus: this.paymentStatus
  };
};

// Static methods
orderSchema.statics.findByCustomerEmail = function(email) {
  return this.find({ 'customerDetails.email': email.toLowerCase() })
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber: orderNumber.toUpperCase() });
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;