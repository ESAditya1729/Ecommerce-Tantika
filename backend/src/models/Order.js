// src/models/Order.js
const mongoose = require('mongoose');

// ==================== CATEGORY CODES ====================
const CATEGORY_CODES = {
    'jewelry': 'JWL',
    'sarees': 'SAR',
    'clothing': 'CLO',
    'home decor': 'HOM',
    'bags': 'BAG',
    'sculptures': 'SCU',
    'pottery': 'POT',
    'textiles': 'TEX',
    'art': 'ART',
    'furniture': 'FUR',
    'accessories': 'ACC',
    'stationery': 'STA',
    'crochet fashion': 'CRO',
    'handicrafts': 'HAN',
    'traditional': 'TRA',
    'modern art': 'MOD'
};

// Reverse mapping for validation
const REVERSE_CATEGORY_CODES = Object.fromEntries(
    Object.entries(CATEGORY_CODES).map(([key, value]) => [value, key])
);

// ==================== ORDER NUMBER GENERATOR ====================
const OrderNumberGenerator = {
    generate({ mode, category, dateTime = new Date(), randomLength = 5, includeChecksum = true } = {}) {
        // Validate inputs
        if (!mode || !['online', 'offline'].includes(mode.toLowerCase())) {
            throw new Error('Mode must be "online" or "offline"');
        }

        if (!category || !CATEGORY_CODES[category.toLowerCase()]) {
            throw new Error(`Invalid category. Must be one of: ${Object.keys(CATEGORY_CODES).join(', ')}`);
        }

        // Format components
        const modeCode = mode.toLowerCase() === 'online' ? 'ONL' : 'OFF';
        const categoryCode = CATEGORY_CODES[category.toLowerCase()];
        const datePart = this._formatDate(dateTime);
        const timePart = this._formatTime(dateTime);
        const randomPart = this._generateRandom(randomLength);
        const checksum = includeChecksum ? this._calculateChecksum(modeCode + categoryCode + datePart + timePart + randomPart) : '';

        // Build order number
        let orderNumber = modeCode + categoryCode + datePart + timePart + randomPart;
        if (includeChecksum) {
            orderNumber += checksum;
        }

        return orderNumber;
    },

    parse(orderNumber, validateChecksum = true) {
        if (!orderNumber || typeof orderNumber !== 'string') {
            throw new Error('Invalid order number');
        }

        const cleaned = orderNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (cleaned.length < 25) {
            throw new Error('Invalid order number format');
        }

        const modeCode = cleaned.substring(0, 3);
        const categoryCode = cleaned.substring(3, 6);
        const datePart = cleaned.substring(6, 14);
        const timePart = cleaned.substring(14, 20);
        const remaining = cleaned.substring(20);
        
        let randomPart, checksum;
        
        if (remaining.length >= 3) {
            const possibleChecksumLength = remaining.length % 2 === 0 ? 2 : 1;
            randomPart = remaining.substring(0, remaining.length - possibleChecksumLength);
            checksum = remaining.substring(remaining.length - possibleChecksumLength);
        } else {
            randomPart = remaining;
            checksum = '';
        }

        if (!['ONL', 'OFF'].includes(modeCode)) {
            throw new Error('Invalid mode code');
        }

        if (!REVERSE_CATEGORY_CODES[categoryCode]) {
            throw new Error('Invalid category code');
        }

        if (!this._isValidDate(datePart) || !this._isValidTime(timePart)) {
            throw new Error('Invalid date or time format');
        }

        if (validateChecksum && checksum) {
            const calculatedChecksum = this._calculateChecksum(
                modeCode + categoryCode + datePart + timePart + randomPart
            );
            if (checksum !== calculatedChecksum) {
                throw new Error('Invalid checksum');
            }
        }

        return {
            mode: modeCode === 'ONL' ? 'online' : 'offline',
            category: REVERSE_CATEGORY_CODES[categoryCode],
            categoryCode,
            date: new Date(`${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6, 8)}T${timePart.substring(0, 2)}:${timePart.substring(2, 4)}:${timePart.substring(4, 6)}`),
            random: randomPart,
            checksum,
            isChecksumValid: !validateChecksum || checksum === this._calculateChecksum(
                modeCode + categoryCode + datePart + timePart + randomPart
            ),
            original: orderNumber
        };
    },

    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    _formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}${minutes}${seconds}`;
    },

    _generateRandom(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    },

    _calculateChecksum(input) {
        const numbers = input.split('').map(char => {
            if (char >= '0' && char <= '9') return parseInt(char);
            if (char >= 'A' && char <= 'Z') return char.charCodeAt(0) - 55;
            return 0;
        });

        let sum = 0;
        for (let i = numbers.length - 1; i >= 0; i--) {
            let digit = numbers[i];
            if ((numbers.length - i) % 2 === 0) {
                digit *= 2;
                if (digit > 35) digit = digit - 35;
            }
            sum += digit;
        }

        const checksumValue = (10 - (sum % 10)) % 10;
        return checksumValue.toString(36).toUpperCase();
    },

    _isValidDate(dateStr) {
        if (!/^\d{8}$/.test(dateStr)) return false;
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day);
        return date.getFullYear() === year && 
               date.getMonth() === month && 
               date.getDate() === day;
    },

    _isValidTime(timeStr) {
        if (!/^\d{6}$/.test(timeStr)) return false;
        const hours = parseInt(timeStr.substring(0, 2));
        const minutes = parseInt(timeStr.substring(2, 4));
        const seconds = parseInt(timeStr.substring(4, 6));
        return hours >= 0 && hours <= 23 &&
               minutes >= 0 && minutes <= 59 &&
               seconds >= 0 && seconds <= 59;
    }
};

// ==================== NESTED SCHEMAS ====================
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
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: Object.keys(CATEGORY_CODES)
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
    // REMOVED: taxAmount field - no longer needed
    // taxAmount: {
    //     type: Number,
    //     min: 0,
    //     default: 0
    // },
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
        type: String
    }],
    scheduledFor: Date,
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed', 'scheduled'],
        default: 'sent'
    },
    messageId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// ==================== MAIN ORDER SCHEMA ====================
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
    // REMOVED: tax field - now always 0
    // tax: {
    //     type: Number,
    //     min: 0,
    //     default: 0
    // },
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
            'pending', 'confirmed', 'processing', 'ready_to_ship',
            'shipped', 'out_for_delivery', 'delivered',
            'cancelled', 'refunded', 'on_hold', 'failed'
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
    mode: {
        type: String,
        enum: ['online', 'offline'],
        required: [true, 'Order mode is required'],
        default: 'online'
    },
    primaryCategory: {
        type: String,
        enum: Object.keys(CATEGORY_CODES),
        required: [true, 'Primary category is required']
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
orderSchema.index({ mode: 1 });
orderSchema.index({ primaryCategory: 1 });

// ==================== VIRTUAL FIELDS ====================
orderSchema.virtual('formattedDate').get(function() {
    return this.createdAt ? this.createdAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }) : 'N/A';
});

orderSchema.virtual('itemCount').get(function() {
    return this.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
});

orderSchema.virtual('isPaid').get(function() {
    return this.payment?.status === 'completed';
});

orderSchema.virtual('isDelivered').get(function() {
    return this.status === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
    return this.status === 'cancelled' || this.status === 'refunded';
});

orderSchema.virtual('estimatedDeliveryDate').get(function() {
    if (this.shipping?.estimatedDelivery) {
        return this.shipping.estimatedDelivery.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
    return 'Not available';
});

orderSchema.virtual('customerFullAddress').get(function() {
    if (!this.customer?.shippingAddress) return 'Address not available';
    const addr = this.customer.shippingAddress;
    return addr ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.postalCode || ''}, ${addr.country || 'India'}`.replace(/, ,/g, ',').replace(/^, |, $/g, '') : 'Address not available';
});

orderSchema.virtual('artisans').get(function() {
    if (!this.items || !this.items.length) return [];
    const artisanIds = new Set();
    this.items.forEach(item => {
        if (item.artisan) {
            artisanIds.add(item.artisan.toString());
        }
    });
    return Array.from(artisanIds);
});

// ==================== STATIC METHODS ====================
orderSchema.statics.generateOrderNumber = function(options = {}) {
    const defaultOptions = {
        mode: options.mode || 'online',
        category: options.category || 'handicrafts',
        dateTime: options.dateTime || new Date(),
        randomLength: 5,
        includeChecksum: true
    };
    
    return OrderNumberGenerator.generate(defaultOptions);
};

orderSchema.statics.generateOrderNumberForItems = function(items, mode = 'online', dateTime = new Date()) {
    if (!items || items.length === 0) {
        throw new Error('Items are required to generate category-based order number');
    }
    
    // Find the most expensive item to use its category
    const primaryItem = items.reduce((max, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        const maxTotal = (max.price || 0) * (max.quantity || 1);
        return itemTotal > maxTotal ? item : max;
    });
    
    const category = primaryItem.category || 'handicrafts';
    
    return this.generateOrderNumber({
        mode,
        category,
        dateTime
    });
};

orderSchema.statics.parseOrderNumber = function(orderNumber) {
    return OrderNumberGenerator.parse(orderNumber);
};

orderSchema.statics.isValidOrderNumber = function(orderNumber) {
    try {
        OrderNumberGenerator.parse(orderNumber);
        return true;
    } catch (error) {
        return false;
    }
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

orderSchema.statics.findByCategory = function(category, mode = null) {
    const query = { primaryCategory: category };
    if (mode) {
        query.mode = mode;
    }
    return this.find(query)
        .sort({ createdAt: -1 })
        .populate('items.product', 'name image')
        .populate('customer.userId', 'username email');
};

orderSchema.statics.findByMode = function(mode) {
    return this.find({ mode })
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
        estimatedDelivery: this.estimatedDeliveryDate,
        mode: this.mode,
        primaryCategory: this.primaryCategory
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

orderSchema.methods.validateOrderNumber = function() {
    try {
        return OrderNumberGenerator.parse(this.orderNumber);
    } catch (error) {
        return null;
    }
};

orderSchema.methods.getCategoryDistribution = function() {
    const distribution = {};
    this.items.forEach(item => {
        const category = item.category || 'uncategorized';
        distribution[category] = (distribution[category] || 0) + item.quantity;
    });
    return distribution;
};

// ==================== PRE-SAVE MIDDLEWARE ====================
orderSchema.pre('save', async function(next) {
    try {
        // Generate order number if new
        if (this.isNew && !this.orderNumber) {
            // Determine primary category
            if (!this.primaryCategory && this.items && this.items.length > 0) {
                const primaryItem = this.items.reduce((max, item) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1);
                    const maxTotal = (max.price || 0) * (max.quantity || 1);
                    return itemTotal > maxTotal ? item : max;
                });
                this.primaryCategory = primaryItem.category || 'handicrafts';
            }

            if (!this.primaryCategory) {
                this.primaryCategory = 'handicrafts';
            }

            this.orderNumber = this.constructor.generateOrderNumber({
                mode: this.mode || 'online',
                category: this.primaryCategory,
                dateTime: new Date()
            });
        }

        // Calculate totals - TAX IS NOW 0 (REMOVED)
        if (this.isModified('items') || this.isNew) {
            // Calculate subtotal
            this.subtotal = this.items.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                0
            );

            // Calculate total price for each item
            this.items.forEach(item => {
                item.totalPrice = ((item.price || 0) - (item.discountApplied || 0)) * (item.quantity || 1);
            });

            // Calculate total - WITHOUT TAX (tax is always 0)
            this.total = this.subtotal - (this.discount || 0) + (this.shippingCost || 0);
            // Note: tax is completely removed from calculation
        }

        // Billing address fallback
        if (this.customer?.billingAddress?.sameAsShipping) {
            this.customer.billingAddress = {
                ...this.customer.shippingAddress,
                sameAsShipping: true
            };
        }

        next();
    } catch (error) {
        next(error);
    }
});

// ==================== POST-SAVE MIDDLEWARE ====================
orderSchema.post('save', async function(doc) {
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
                (sum, item) => sum + (item.totalPrice || 0),
                0
            );

            const totalSales = artisanOrders.reduce(
                (sum, item) => sum + (item.quantity || 0),
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

// ==================== EXPORT ====================
module.exports = mongoose.model('Order', orderSchema);
module.exports.CATEGORY_CODES = CATEGORY_CODES;
module.exports.OrderNumberGenerator = OrderNumberGenerator;