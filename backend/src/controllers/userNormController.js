// controllers/userNormController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/usernorms/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get member since info
    const memberSince = user.createdAt.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
    });

    // Calculate member duration
    const months = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24 * 30));

    res.json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive,
            memberSince,
            memberDuration: `${months} months`,
            memberId: `TNT${user._id.toString().slice(-6).padStart(6, '0')}`,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
});

// @desc    Update user profile
// @route   PUT /api/usernorms/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const { username, email, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check if new email exists (excluding current user)
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use by another account'
            });
        }
        user.email = email;
    }

    // Check if new username exists (excluding current user)
    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username, _id: { $ne: userId } });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Username already in use'
            });
        }
        user.username = username;
    }

    // Update phone if provided
    if (phone !== undefined) {
        user.phone = phone;
    }

    user.updatedAt = Date.now();
    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            ...userResponse,
            id: user._id,
            memberId: `TNT${user._id.toString().slice(-6).padStart(6, '0')}`
        }
    });
});

// @desc    Change password
// @route   PUT /api/usernorms/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();

    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Get user dashboard statistics
// @route   GET /api/usernorms/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get order statistics
    const orders = await Order.find({ 'customerDetails.email': userEmail });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => 
        ['pending', 'contacted', 'confirmed', 'processing', 'shipped'].includes(order.status)
    ).length;
    
    const totalSpent = orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.productPrice, 0);

    // Get REAL wishlist count - FIXED
    const wishlist = await Wishlist.findOne({ userId });
    const wishlistCount = wishlist ? wishlist.getTotalItems() : 0;

    // Get cart count (placeholder - need Cart schema)
    const cartCount = 0; // Temporary

    // Calculate loyalty points (simple formula based on orders)
    const points = completedOrders * 50 + Math.floor(totalSpent / 100);

    res.json({
        success: true,
        data: {
            totalOrders,
            wishlistCount, // NOW REAL COUNT!
            cartCount,
            totalSpent,
            points,
            completedOrders,
            pendingOrders,
            memberSince: user.createdAt,
            accountStatus: user.isActive ? 'active' : 'inactive',
            memberId: `TNT${user._id.toString().slice(-6).padStart(6, '0')}`
        }
    });
});

// @desc    Get user orders
// @route   GET /api/usernorms/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
    const userEmail = req.user.email;
    const { 
        page = 1, 
        limit = 10, 
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc' 
    } = req.query;

    // Build filter
    let filter = { 'customerDetails.email': userEmail };
    
    if (status && status !== 'all') {
        filter.status = status;
    }

    // Calculate pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    // Get orders
    const orders = await Order.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitInt);

    // Get total count
    const total = await Order.countDocuments(filter);

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        productName: order.productName,
        productImage: order.productImage,
        artisan: order.artisan,
        price: order.productPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        customerName: order.customerDetails.name,
        customerAddress: `${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} - ${order.customerDetails.pincode}`,
        customerPhone: order.customerDetails.phone,
        customerMessage: order.customerDetails.message,
        createdAt: order.createdAt,
        formattedDate: order.createdAt.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        trackingInfo: order.contactHistory || [],
        adminNotes: order.adminNotes || []
    }));

    res.json({
        success: true,
        count: transformedOrders.length,
        total,
        pagination: {
            page: pageInt,
            limit: limitInt,
            pages: Math.ceil(total / limitInt)
        },
        data: transformedOrders
    });
});

// @desc    Get single order details
// @route   GET /api/usernorms/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userEmail = req.user.email;

    const order = await Order.findOne({
        _id: orderId,
        'customerDetails.email': userEmail
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found or unauthorized'
        });
    }

    // Get order summary
    const summary = order.getSummary();

    res.json({
        success: true,
        data: {
            id: order._id,
            orderNumber: order.orderNumber,
            productName: order.productName,
            productImage: order.productImage,
            productPrice: order.productPrice,
            artisan: order.artisan,
            productLocation: order.productLocation,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            customerDetails: order.customerDetails,
            customerFullAddress: `${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} - ${order.customerDetails.pincode}`,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            formattedDate: order.createdAt.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            adminNotes: order.adminNotes || [],
            contactHistory: order.contactHistory || [],
            summary
        }
    });
});

// @desc    Cancel order
// @route   PUT /api/usernorms/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userEmail = req.user.email;
    const { reason } = req.body;

    const order = await Order.findOne({
        _id: orderId,
        'customerDetails.email': userEmail
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found or unauthorized'
        });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'contacted', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({
            success: false,
            message: `Order cannot be cancelled in "${order.status}" status`
        });
    }

    // Update order status
    order.status = 'cancelled';
    order.updatedAt = Date.now();
    
    // Add admin note about cancellation
    order.adminNotes.push({
        note: `Order cancelled by customer. Reason: ${reason || 'Not specified'}`,
        addedBy: req.user.username || 'Customer',
        createdAt: new Date()
    });

    await order.save();

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
            orderNumber: order.orderNumber,
            status: order.status,
            updatedAt: order.updatedAt
        }
    });
});

// @desc    Get recent activity
// @route   GET /api/usernorms/recent-activity
// @access  Private
exports.getRecentActivity = asyncHandler(async (req, res) => {
    const userEmail = req.user.email;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent orders
    const recentOrders = await Order.find({ 'customerDetails.email': userEmail })
        .sort({ createdAt: -1 })
        .limit(5);

    // Transform orders into activity items
    const activities = [];

    recentOrders.forEach(order => {
        activities.push({
            id: order._id,
            type: 'order',
            message: `Order ${order.orderNumber} ${getStatusMessage(order.status)}`,
            time: getRelativeTime(order.createdAt),
            icon: getOrderIcon(order.status),
            status: getActivityStatus(order.status)
        });
    });

    // Get user wishlist for wishlist activities
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
        // Add recent wishlist items (last 3)
        const recentWishlistItems = wishlist.items
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .slice(0, 3);
        
        recentWishlistItems.forEach(item => {
            activities.push({
                id: `wishlist-${item.productId}`,
                type: 'wishlist',
                message: `Added "${item.productName}" to wishlist`,
                time: getRelativeTime(item.addedAt),
                icon: '💝',
                status: 'info'
            });
        });
    }

    // Add profile update activity
    const user = await User.findById(req.user._id);
    if (user.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
            id: 'profile-update',
            type: 'profile',
            message: 'Profile updated successfully',
            time: getRelativeTime(user.updatedAt),
            icon: '👤',
            status: 'info'
        });
    }

    // Sort by time and limit
    const sortedActivities = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, limit);

    res.json({
        success: true,
        data: sortedActivities
    });
});

// Helper functions
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getStatusMessage(status) {
    const messages = {
        'pending': 'placed',
        'contacted': 'is being reviewed',
        'confirmed': 'confirmed',
        'processing': 'is being processed',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
    };
    return messages[status] || 'updated';
}

function getOrderIcon(status) {
    const icons = {
        'pending': '📝',
        'contacted': '📞',
        'confirmed': '✅',
        'processing': '⚙️',
        'shipped': '🚚',
        'delivered': '📦',
        'cancelled': '❌'
    };
    return icons[status] || '📋';
}

function getActivityStatus(status) {
    const statuses = {
        'delivered': 'success',
        'cancelled': 'error',
        'pending': 'info',
        'contacted': 'info',
        'confirmed': 'success',
        'processing': 'info',
        'shipped': 'success'
    };
    return statuses[status] || 'info';
}

// @desc    Get dashboard summary (all in one)
// @route   GET /api/usernorms/dashboard/summary
// @access  Private
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Get user profile
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get stats
    const orders = await Order.find({ 'customerDetails.email': userEmail });
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => 
        ['pending', 'contacted', 'confirmed', 'processing', 'shipped'].includes(order.status)
    ).length;
    const totalSpent = orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.productPrice, 0);
    const points = completedOrders * 50 + Math.floor(totalSpent / 100);

    // Get REAL wishlist count - FIXED
    const wishlist = await Wishlist.findOne({ userId });
    const wishlistCount = wishlist ? wishlist.getTotalItems() : 0;

    // Get recent orders for activity
    const recentOrders = await Order.find({ 'customerDetails.email': userEmail })
        .sort({ createdAt: -1 })
        .limit(5);

    // Build activity
    const recentActivity = recentOrders.map(order => ({
        id: order._id,
        type: 'order',
        message: `Order ${order.orderNumber} ${getStatusMessage(order.status)}`,
        time: getRelativeTime(order.createdAt),
        icon: getOrderIcon(order.status),
        status: getActivityStatus(order.status)
    }));

    // Add wishlist activities if available
    if (wishlist) {
        const recentWishlistItems = wishlist.items
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .slice(0, 2);
        
        recentWishlistItems.forEach(item => {
            recentActivity.push({
                id: `wishlist-${item.productId}`,
                type: 'wishlist',
                message: `Added "${item.productName}" to wishlist`,
                time: getRelativeTime(item.addedAt),
                icon: '💝',
                status: 'info'
            });
        });
    }

    // Add profile activity if recently updated
    if (user.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        recentActivity.push({
            id: 'profile-update',
            type: 'profile',
            message: 'Profile updated successfully',
            time: getRelativeTime(user.updatedAt),
            icon: '👤',
            status: 'info'
        });
    }

    // Sort activity by time
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Prepare quick actions (static)
    const quickActions = [
        { id: 1, title: 'Browse Shop', description: 'Discover crafts', icon: '🛍️', link: '/shop', color: 'blue' },
        { id: 2, title: 'Edit Profile', description: 'Update details', icon: '👤', link: '/profile', color: 'purple' },
        { id: 3, title: 'My Wishlist', description: 'Saved items', icon: '💝', link: '/wishlist', color: 'pink' },
        { id: 4, title: 'Order History', description: 'Past purchases', icon: '📋', link: '/orders', color: 'green' },
        { id: 5, title: 'Address Book', description: 'Manage addresses', icon: '📍', link: '/addresses', color: 'amber' },
        { id: 6, title: 'Contact Us', description: 'Get help', icon: '💬', link: '/contact', color: 'indigo' },
        { id: 7, title: 'Settings', description: 'Preferences', icon: '⚙️', link: '/settings', color: 'gray' },
        { id: 8, title: 'Support Artisans', description: 'Learn more', icon: '👨‍🎨', link: '/artisans', color: 'red' },
    ];

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                isActive: user.isActive,
                memberSince: user.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                memberId: `TNT${user._id.toString().slice(-6).padStart(6, '0')}`,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            stats: {
                totalOrders,
                wishlistCount, // NOW REAL COUNT!
                cartCount: 0, // Placeholder - need Cart schema
                totalSpent,
                points,
                completedOrders,
                pendingOrders
            },
            recentActivity: recentActivity.slice(0, 5),
            quickActions
        }
    });
});

// @desc    Deactivate account (soft delete)
// @route   PUT /api/usernorms/deactivate
// @access  Private
exports.deactivateAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check if user has pending orders
    const pendingOrders = await Order.find({
        'customerDetails.email': user.email,
        status: { $in: ['pending', 'contacted', 'confirmed', 'processing', 'shipped'] }
    });

    if (pendingOrders.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Cannot deactivate account with pending orders. Please complete or cancel your orders first.'
        });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    user.updatedAt = Date.now();
    await user.save();

    // TODO: Send deactivation email
    // TODO: Log deactivation reason if provided

    res.json({
        success: true,
        message: 'Account deactivated successfully. You can reactivate by logging in.'
    });
});

// @desc    Reactivate account
// @route   PUT /api/usernorms/reactivate
// @access  Public (login endpoint will handle this)
exports.reactivateAccount = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Account not found'
        });
    }

    if (user.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Account is already active'
        });
    }

    user.isActive = true;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
        success: true,
        message: 'Account reactivated successfully'
    });
});

// ============================
// WISHLIST ENDPOINTS
// ============================

// @desc    Get user's wishlist
// @route   GET /api/usernorms/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ userId });

    // If no wishlist exists, create empty one
    if (!wishlist) {
        wishlist = await Wishlist.create({
            userId,
            items: []
        });
    }

    res.json({
        success: true,
        data: {
            items: wishlist.items,
            totalItems: wishlist.getTotalItems(),
            totalValue: wishlist.getTotalValue(),
            updatedAt: wishlist.updatedAt
        }
    });
});

// @desc    Add item to wishlist
// @route   POST /api/usernorms/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        productId,
        productName,
        productImage = '',
        productPrice,
        artisan = 'Unknown Artisan',
        category = ''
    } = req.body;

    // Validate required fields
    if (!productId || !productName || !productPrice) {
        return res.status(400).json({
            success: false,
            message: 'Product ID, name and price are required'
        });
    }

    try {
        const wishlist = await Wishlist.addToWishlist(userId, {
            productId,
            productName,
            productImage,
            productPrice,
            artisan,
            category
        });

        res.status(201).json({
            success: true,
            message: 'Added to wishlist',
            data: {
                items: wishlist.items,
                totalItems: wishlist.getTotalItems(),
                totalValue: wishlist.getTotalValue()
            }
        });
    } catch (error) {
        if (error.message === 'Product already in wishlist') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        throw error;
    }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/usernorms/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.removeFromWishlist(userId, productId);

    res.json({
        success: true,
        message: 'Removed from wishlist',
        data: {
            items: wishlist.items,
            totalItems: wishlist.getTotalItems(),
            totalValue: wishlist.getTotalValue()
        }
    });
});

// @desc    Clear wishlist
// @route   DELETE /api/usernorms/wishlist
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const wishlist = await Wishlist.clearWishlist(userId);

    res.json({
        success: true,
        message: 'Wishlist cleared',
        data: {
            items: wishlist.items,
            totalItems: wishlist.getTotalItems(),
            totalValue: wishlist.getTotalValue()
        }
    });
});

// @desc    Check if product is in wishlist
// @route   GET /api/usernorms/wishlist/check/:productId
// @access  Private
exports.checkWishlistStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    const isInWishlist = wishlist ? wishlist.isProductInWishlist(productId) : false;

    res.json({
        success: true,
        data: {
            isInWishlist,
            productId
        }
    });
});

// @desc    Get wishlist count only
// @route   GET /api/usernorms/wishlist/count
// @access  Private
exports.getWishlistCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });

    const count = wishlist ? wishlist.getTotalItems() : 0;

    res.json({
        success: true,
        data: {
            count
        }
    });
});

// @desc    Update wishlist item availability
// @route   PUT /api/usernorms/wishlist/availability/:productId
// @access  Private
exports.updateItemAvailability = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;
    const { isAvailable } = req.body;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: 'Wishlist not found'
        });
    }

    // Find and update the item
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Product not found in wishlist'
        });
    }

    wishlist.items[itemIndex].isAvailable = isAvailable;
    wishlist.updatedAt = new Date();

    await wishlist.save();

    res.json({
        success: true,
        message: 'Availability updated',
        data: {
            productId,
            isAvailable,
            productName: wishlist.items[itemIndex].productName
        }
    });
});

// @desc    Get all addresses for a user
// @route   GET /api/usernorms/addresses
// @access  Private
exports.getUserAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const addresses = await Address.find({ userId, isActive: true })
    .sort({ isDefault: -1, createdAt: -1 })
    .select('-__v');

  res.json({
    success: true,
    count: addresses.length,
    data: addresses
  });
});

// @desc    Get a single address
// @route   GET /api/usernorms/addresses/:addressId
// @access  Private
exports.getAddressById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const address = await Address.findOne({ 
    _id: addressId, 
    userId, 
    isActive: true 
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    data: address
  });
});

// @desc    Create a new address
// @route   POST /api/usernorms/addresses
// @access  Private
exports.createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { 
    name, 
    phone, 
    addressLine1, 
    addressLine2, 
    city, 
    state, 
    pincode, 
    country, 
    type, 
    isDefault 
  } = req.body;

  // Validate required fields
  if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, phone, addressLine1, city, state, pincode'
    });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.create({
    userId,
    name,
    phone,
    addressLine1,
    addressLine2: addressLine2 || '',
    city,
    state,
    pincode,
    country: country || 'India',
    type: type || 'home',
    isDefault: isDefault || false
  });

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: address
  });
});

// @desc    Update an address
// @route   PUT /api/usernorms/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;
  const updateData = req.body;

  // Find the address
  let address = await Address.findOne({ 
    _id: addressId, 
    userId 
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  // If setting as default, unset other defaults
  if (updateData.isDefault === true) {
    await Address.updateMany(
      { userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );
  }

  // Update the address
  Object.keys(updateData).forEach(key => {
    if (key !== 'userId' && key !== '_id') {
      address[key] = updateData[key];
    }
  });

  address.updatedAt = Date.now();
  await address.save();

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: address
  });
});

// @desc    Delete an address (soft delete)
// @route   DELETE /api/usernorms/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const address = await Address.findOne({ 
    _id: addressId, 
    userId, 
    isActive: true 
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  // Check if it's the default address
  const wasDefault = address.isDefault;

  // Soft delete by setting isActive to false
  address.isActive = false;
  address.updatedAt = Date.now();
  await address.save();

  // If we deleted the default address, set the most recent address as default
  if (wasDefault) {
    const nextAddress = await Address.findOne({ 
      userId, 
      isActive: true,
      _id: { $ne: addressId }
    }).sort({ createdAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  res.json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Set an address as default
// @route   PUT /api/usernorms/addresses/:addressId/set-default
// @access  Private
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  // Unset all other default addresses for this user
  await Address.updateMany(
    { userId, _id: { $ne: addressId } },
    { $set: { isDefault: false } }
  );

  // Set the specified address as default
  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId, isActive: true },
    { 
      $set: { 
        isDefault: true,
        updatedAt: Date.now()
      } 
    },
    { new: true, runValidators: true }
  );

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    message: 'Default address updated successfully',
    data: address
  });
});

// @desc    Get user's default address
// @route   GET /api/usernorms/addresses/default
// @access  Private
exports.getDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const address = await Address.findOne({ 
    userId, 
    isDefault: true, 
    isActive: true 
  });

  if (!address) {
    // If no default, return the most recent address
    const recentAddress = await Address.findOne({ 
      userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    if (!recentAddress) {
      return res.json({
        success: true,
        message: 'No addresses found',
        data: null
      });
    }

    return res.json({
      success: true,
      data: recentAddress
    });
  }

  res.json({
    success: true,
    data: address
  });
});

// @desc    Get address count for dashboard
// @route   GET /api/usernorms/addresses/count
// @access  Private
exports.getAddressCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Address.countDocuments({ 
    userId, 
    isActive: true 
  });

  res.json({
    success: true,
    data: { count }
  });
});