// controllers/UserController.js
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateCSV } = require('../utils/csvGenerator');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        role,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    if (role && role !== 'all') {
        filter.role = role;
    }

    if (isActive !== undefined && isActive !== 'all') {
        filter.isActive = isActive === 'true' || isActive === 'active';
    }

    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    // Calculate pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    // Get users with filters
    const users = await User.find(filter)
        .select('-password') // Exclude password
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitInt)
        .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get additional stats for each user (order counts)
    const usersWithStats = await Promise.all(
        users.map(async (user) => {
            // Assuming Order model has customerEmail or userId field
            const orderCount = await Order.countDocuments({ 
                $or: [
                    { customerEmail: user.email },
                    { userId: user._id }
                ]
            });

            // Get last order date
            const lastOrder = await Order.findOne({
                $or: [
                    { customerEmail: user.email },
                    { userId: user._id }
                ]
            })
            .sort({ createdAt: -1 })
            .select('createdAt')
            .lean();

            return {
                ...user,
                // Transform for frontend compatibility
                id: user._id,
                name: user.username, // Map username to name for frontend
                status: user.isActive ? 'active' : 'inactive', // Map isActive to status
                orders: orderCount,
                lastActive: lastOrder?.createdAt || user.updatedAt,
                // Add location if your schema doesn't have it, but frontend expects it
                location: user.location || 'Unknown'
            };
        })
    );

    res.json({
        success: true,
        count: usersWithStats.length,
        total,
        pagination: {
            page: pageInt,
            limit: limitInt,
            pages: Math.ceil(total / limitInt)
        },
        data: usersWithStats
    });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private/Admin
exports.searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }

    const users = await User.find({
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } }
        ]
    })
    .select('-password')
    .limit(20)
    .lean();

    // Transform for frontend
    const transformedUsers = users.map(user => ({
        ...user,
        id: user._id,
        name: user.username,
        status: user.isActive ? 'active' : 'inactive'
    }));

    res.json({
        success: true,
        count: transformedUsers.length,
        data: transformedUsers
    });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // For your schema, we only have 'user' and 'admin' roles
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Get average orders per user (if Order model exists)
    let avgOrders = 0;
    try {
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$customerEmail',
                    orderCount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgOrders: { $avg: '$orderCount' }
                }
            }
        ]);
        avgOrders = orderStats[0]?.avgOrders || 0;
    } catch (error) {
        console.log('Order statistics not available');
    }

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            premiumUsers: 0, // Your schema doesn't have premium/vip roles
            vipUsers: 0,
            avgOrders,
            newUsers
        }
    });
});

// @desc    Get user segments
// @route   GET /api/users/segments
// @access  Private/Admin
exports.getUserSegments = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // New users (joined in last 30 days)
    const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });

    // Active users
    const activeUsers = await User.countDocuments({ isActive: true });

    // Inactive users (not active)
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Admin users
    const adminUsers = await User.countDocuments({ role: 'admin' });

    res.json({
        success: true,
        data: {
            newUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            topCustomers: await getTopCustomers()
        }
    });
});

// Helper function to get top customers (based on orders)
async function getTopCustomers() {
    try {
        return await Order.aggregate([
            {
                $group: {
                    _id: '$customerEmail',
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'email',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: '$user._id',
                    name: '$user.username',
                    email: '$user.email',
                    totalOrders: 1,
                    totalAmount: 1,
                    role: '$user.role',
                    isActive: '$user.isActive'
                }
            },
            {
                $sort: { totalOrders: -1 }
            },
            {
                $limit: 5
            }
        ]);
    } catch (error) {
        console.log('Error getting top customers:', error);
        return [];
    }
}

// @desc    Get filter options
// @route   GET /api/users/filters/options
// @access  Private/Admin
exports.getFilterOptions = asyncHandler(async (req, res) => {
    const roles = await User.distinct('role');
    const activeStatuses = ['all', 'active', 'inactive'];

    res.json({
        success: true,
        data: {
            roles: ['all', ...roles],
            statuses: activeStatuses,
            // Your schema doesn't have location field
            locations: ['all'] // Can be extended if you add location field
        }
    });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get user's order stats
    let orderStats = {};
    try {
        const stats = await Order.aggregate([
            { 
                $match: { 
                    $or: [
                        { customerEmail: user.email },
                        { userId: user._id }
                    ]
                } 
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);
        orderStats = stats[0] || {};
    } catch (error) {
        console.log('Order stats not available');
    }

    const recentOrders = await Order.find({
        $or: [
            { customerEmail: user.email },
            { userId: user._id }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Transform user for frontend compatibility
    const transformedUser = {
        ...user.toObject(),
        id: user._id,
        name: user.username,
        status: user.isActive ? 'active' : 'inactive',
        stats: orderStats,
        recentOrders
    };

    res.json({
        success: true,
        data: transformedUser
    });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        phone = '',
        role = 'user',
        isActive = true,
        password
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
    });

    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email or username'
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        username,
        email,
        phone,
        role,
        isActive,
        password: hashedPassword
    });

    // Send welcome email
    try {
        await sendEmail({
            to: email,
            subject: 'Your Account Has Been Created',
            template: 'accountCreated',
            context: {
                name: username,
                email: email,
                username: username
            }
        });
    } catch (emailError) {
        console.log('Email sending failed:', emailError);
        // Don't fail the request if email fails
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
        success: true,
        data: {
            ...userResponse,
            id: user._id,
            name: user.username,
            status: user.isActive ? 'active' : 'inactive'
        }
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const { username, email, phone, role, isActive, password } = req.body;

    // Check if email or username already exists (excluding current user)
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        user.email = email;
    }

    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Username already in use'
            });
        }
        user.username = username;
    }

    // Update other fields
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Update password if provided
    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    user.updatedAt = Date.now();
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
        success: true,
        data: {
            ...userResponse,
            id: user._id,
            name: user.username,
            status: user.isActive ? 'active' : 'inactive'
        }
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check if user is an admin (prevent deleting last admin)
    if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the last admin user'
            });
        }
    }

    // Check if user has orders (optional)
    try {
        const orderCount = await Order.countDocuments({ 
            $or: [
                { customerEmail: user.email },
                { userId: user._id }
            ]
        });

        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with existing orders. Deactivate instead.'
            });
        }
    } catch (error) {
        // If Order model doesn't exist or error occurs, continue with deletion
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Update user status (isActive)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (status !== 'active' && status !== 'inactive') {
        return res.status(400).json({
            success: false,
            message: 'Status must be either "active" or "inactive"'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    user.isActive = status === 'active';
    user.updatedAt = Date.now();
    await user.save();

    res.json({
        success: true,
        data: {
            ...user.toObject(),
            id: user._id,
            name: user.username,
            status: user.isActive ? 'active' : 'inactive'
        }
    });
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Role must be either "user" or "admin"'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role === 'user') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the last admin user'
            });
        }
    }

    user.role = role;
    user.updatedAt = Date.now();
    await user.save();

    // Send email notification for role change
    if (role === 'admin') {
        try {
            await sendEmail({
                to: user.email,
                subject: 'Account Role Updated',
                template: 'roleUpdated',
                context: {
                    name: user.username,
                    newRole: 'Administrator'
                }
            });
        } catch (emailError) {
            console.log('Email sending failed:', emailError);
        }
    }

    res.json({
        success: true,
        data: {
            ...user.toObject(),
            id: user._id,
            name: user.username,
            status: user.isActive ? 'active' : 'inactive'
        }
    });
});

// @desc    Export users to CSV
// @route   GET /api/users/export
// @access  Private/Admin
exports.exportUsers = asyncHandler(async (req, res) => {
    const { format = 'csv' } = req.query;

    const users = await User.find({}).select('-password').lean();

    // Get order counts for each user
    const usersWithStats = await Promise.all(
        users.map(async (user) => {
            let orderCount = 0;
            try {
                orderCount = await Order.countDocuments({ 
                    $or: [
                        { customerEmail: user.email },
                        { userId: user._id }
                    ]
                });
            } catch (error) {
                console.log('Error counting orders:', error);
            }

            return {
                ...user,
                // Transform for export
                id: user._id.toString(),
                name: user.username,
                status: user.isActive ? 'Active' : 'Inactive',
                orders: orderCount,
                joined: new Date(user.createdAt).toISOString().split('T')[0],
                lastActive: new Date(user.updatedAt).toISOString().split('T')[0],
                // Add empty location for compatibility
                location: ''
            };
        })
    );

    if (format === 'csv') {
        const csv = await generateCSV(usersWithStats, [
            { key: 'id', label: 'User ID' },
            { key: 'username', label: 'Username' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status' },
            { key: 'orders', label: 'Total Orders' },
            { key: 'joined', label: 'Joined Date' },
            { key: 'lastActive', label: 'Last Updated' }
        ]);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    } else {
        res.json({
            success: true,
            data: usersWithStats
        });
    }
});

// @desc    Send bulk email to users
// @route   POST /api/users/bulk/email
// @access  Private/Admin
exports.sendBulkEmail = asyncHandler(async (req, res) => {
    const { userIds, subject, message, template } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'User IDs array is required'
        });
    }

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Subject and message are required'
        });
    }

    const users = await User.find({ _id: { $in: userIds } });

    if (users.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No users found'
        });
    }

    // Send emails in batches
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const batchPromises = batch.map(user =>
            sendEmail({
                to: user.email,
                subject,
                template: template || 'bulkEmail',
                context: {
                    name: user.username,
                    message
                }
            }).then(() => ({
                userId: user._id,
                email: user.email,
                success: true
            })).catch(err => ({
                userId: user._id,
                email: user.email,
                success: false,
                error: err.message
            }))
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    res.json({
        success: true,
        message: `Emails sent to ${users.length} users`,
        results
    });
});

// @desc    Bulk update users
// @route   PATCH /api/users/bulk/update
// @access  Private/Admin
exports.bulkUpdateUsers = asyncHandler(async (req, res) => {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'User IDs array is required'
        });
    }

    if (!updates || typeof updates !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Updates object is required'
        });
    }

    const validUpdates = {};
    const allowedFields = ['role', 'isActive'];

    // Filter only allowed fields
    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
            validUpdates[key] = updates[key];
        }
    });

    // Special handling for isActive
    if (validUpdates.hasOwnProperty('isActive')) {
        validUpdates.isActive = validUpdates.isActive === true || validUpdates.isActive === 'true';
    }

    if (Object.keys(validUpdates).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid fields to update'
        });
    }

    validUpdates.updatedAt = Date.now();

    const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: validUpdates }
    );

    res.json({
        success: true,
        message: `Updated ${result.modifiedCount} users`,
        data: result
    });
});