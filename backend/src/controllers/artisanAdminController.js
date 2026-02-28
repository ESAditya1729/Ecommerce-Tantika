const User = require('../models/User');
const Artisan = require('../models/Artisan');
const mongoose = require('mongoose');

// @desc    Get all pending artisans
// @route   GET /api/admin/artisans/pending
// @access  Private (Admin only)
exports.getPendingArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const searchQuery = {
      status: 'pending'
    };

    if (search) {
      searchQuery.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get pending artisans with user data
    const artisans = await Artisan.aggregate([
      { $match: searchQuery },
      { $sort: { submittedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          businessName: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          submittedAt: 1,
          'user.username': 1,
          'user.createdAt': 1,
          address: 1,
          idProof: 1,
          specialization: 1,
          yearsOfExperience: 1,
          description: 1
        }
      }
    ]);

    // Get total count
    const total = await Artisan.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        artisans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending artisans'
    });
  }
};

// @desc    Get all approved artisans
// @route   GET /api/admin/artisans/approved
// @access  Private (Admin only)
exports.getApprovedArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const searchQuery = {
      status: 'approved'
    };

    if (search) {
      searchQuery.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get approved artisans
    const artisans = await Artisan.find(searchQuery)
      .select('businessName fullName email phone rating totalProducts totalSales totalRevenue approvedAt')
      .sort({ approvedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Artisan.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        artisans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get approved artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching approved artisans'
    });
  }
};

// @desc    Get artisan details by ID
// @route   GET /api/admin/artisans/:id
// @access  Private (Admin only)
exports.getArtisanById = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get user info
    const user = await User.findById(artisan.userId)
      .select('username email role isActive createdAt');

    // Get artisan's products count
    const Product = require('../models/Product');
    const productCounts = await Product.aggregate([
      { $match: { artisan: artisan._id } },
      { $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const artisanDetails = {
      ...artisan.toObject(),
      user,
      productStats: {
        total: productCounts.reduce((sum, item) => sum + item.count, 0),
        approved: productCounts.find(p => p._id === 'approved')?.count || 0,
        pending: productCounts.find(p => p._id === 'pending')?.count || 0
      }
    };

    res.status(200).json({
      success: true,
      data: artisanDetails
    });

  } catch (error) {
    console.error('Get artisan by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching artisan details'
    });
  }
};

// @desc    Approve artisan application
// @route   PUT /api/admin/artisans/:id/approve
// @access  Private (Admin only)
exports.approveArtisan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adminNotes } = req.body;

    // Find artisan
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check if already approved
    if (artisan.status === 'approved') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Artisan is already approved'
      });
    }

    // Update artisan status
    artisan.status = 'approved';
    artisan.approvedAt = new Date();
    artisan.approvedBy = req.user.id;
    artisan.idProof.verified = true;
    artisan.idProof.verifiedAt = new Date();
    artisan.idProof.verifiedBy = req.user.id;
    
    // Add admin notes if provided
    if (adminNotes) {
      artisan.adminNotes = adminNotes;
    }

    await artisan.save({ session });

    // Update user role
    const user = await User.findByIdAndUpdate(
      artisan.userId,
      {
        role: 'artisan',
        artisanId: artisan._id,
        updatedAt: new Date()
      },
      { new: true, session }
    );

    await session.commitTransaction();

    // TODO: Send approval email to artisan
    // TODO: Create notification for artisan

    res.status(200).json({
      success: true,
      message: 'Artisan approved successfully',
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          status: artisan.status,
          approvedAt: artisan.approvedAt
        },
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Approve artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving artisan'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Reject artisan application
// @route   PUT /api/admin/artisans/:id/reject
// @access  Private (Admin only)
exports.rejectArtisan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find artisan
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check if already rejected
    if (artisan.status === 'rejected') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Artisan is already rejected'
      });
    }

    // Update artisan status
    artisan.status = 'rejected';
    artisan.rejectionReason = rejectionReason.trim();
    artisan.rejectedAt = new Date();
    artisan.rejectedBy = req.user.id;

    await artisan.save({ session });

    // Update user role back to user (or keep as pending_artisan for reference)
    const user = await User.findByIdAndUpdate(
      artisan.userId,
      {
        role: 'user', // Change back to regular user
        updatedAt: new Date()
      },
      { new: true, session }
    );

    await session.commitTransaction();

    // TODO: Send rejection email to artisan
    // TODO: Create notification for artisan

    res.status(200).json({
      success: true,
      message: 'Artisan application rejected',
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          status: artisan.status,
          rejectionReason: artisan.rejectionReason
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Reject artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting artisan'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Suspend artisan account
// @route   PUT /api/admin/artisans/:id/suspend
// @access  Private (Admin only)
exports.suspendArtisan = async (req, res) => {
  try {
    const { suspensionReason } = req.body;

    if (!suspensionReason || suspensionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required'
      });
    }

    // Find and update artisan
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      {
        status: 'suspended',
        suspensionReason: suspensionReason.trim(),
        suspendedAt: new Date(),
        suspendedBy: req.user.id
      },
      { new: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Update user's isActive status
    await User.findByIdAndUpdate(
      artisan.userId,
      {
        isActive: false,
        deactivationReason: `Artisan account suspended: ${suspensionReason}`,
        deactivatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Artisan account suspended',
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          status: artisan.status,
          suspensionReason: artisan.suspensionReason
        }
      }
    });

  } catch (error) {
    console.error('Suspend artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error suspending artisan'
    });
  }
};

// @desc    Reactivate suspended artisan
// @route   PUT /api/admin/artisans/:id/reactivate
// @access  Private (Admin only)
exports.reactivateArtisan = async (req, res) => {
  try {
    // Find and update artisan
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        suspensionReason: '',
        reactivatedAt: new Date(),
        reactivatedBy: req.user.id
      },
      { new: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Update user's isActive status
    await User.findByIdAndUpdate(
      artisan.userId,
      {
        isActive: true,
        deactivationReason: '',
        deactivatedAt: null
      }
    );

    res.status(200).json({
      success: true,
      message: 'Artisan account reactivated',
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          status: artisan.status
        }
      }
    });

  } catch (error) {
    console.error('Reactivate artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reactivating artisan'
    });
  }
};

// @desc    Verify artisan bank details
// @route   PUT /api/admin/artisans/:id/verify-bank
// @access  Private (Admin only)
exports.verifyBankDetails = async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      {
        'bankDetails.verified': true,
        'bankDetails.verifiedAt': new Date(),
        'bankDetails.verifiedBy': req.user.id
      },
      { new: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank details verified successfully',
      data: {
        artisan: {
          id: artisan._id,
          businessName: artisan.businessName,
          bankDetails: {
            accountName: artisan.bankDetails.accountName,
            bankName: artisan.bankDetails.bankName,
            verified: artisan.bankDetails.verified,
            verifiedAt: artisan.bankDetails.verifiedAt
          }
        }
      }
    });

  } catch (error) {
    console.error('Verify bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying bank details'
    });
  }
};

// @desc    Get artisan statistics for admin dashboard
// @route   GET /api/admin/artisans/stats
// @access  Private (Admin only)
exports.getArtisanStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Artisan.aggregate([
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total artisans
    const totalArtisans = await Artisan.countDocuments();

    // Get new applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newApplications = await Artisan.countDocuments({
      submittedAt: { $gte: sevenDaysAgo },
      status: 'pending'
    });

    // Get top performing artisans by sales
    const topArtisans = await Artisan.find({ status: 'approved' })
      .select('businessName totalSales totalRevenue rating')
      .sort({ totalSales: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total: totalArtisans,
        statusCounts,
        newApplications,
        topArtisans
      }
    });

  } catch (error) {
    console.error('Get artisan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching artisan statistics'
    });
  }
};

// @desc    Get all artisans (with optional status filter)
// @route   GET /api/admin/artisans
// @access  Private (Admin only)
exports.getAllArtisans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const searchQuery = {};

    // Add status filter if provided and not 'all'
    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    if (search) {
      searchQuery.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get artisans with user data
    const artisans = await Artisan.aggregate([
      { $match: searchQuery },
      { $sort: { submittedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          businessName: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          status: 1,
          submittedAt: 1,
          approvedAt: 1,
          rejectedAt: 1,
          suspendedAt: 1,
          'user.username': 1,
          'user.createdAt': 1,
          address: 1,
          idProof: 1,
          bankDetails: 1,
          specialization: 1,
          yearsOfExperience: 1,
          description: 1,
          totalProducts: 1,
          totalSales: 1,
          totalRevenue: 1,
          rating: 1
        }
      }
    ]);

    // Get total count
    const total = await Artisan.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        artisans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching artisans'
    });
  }
};

// @desc    Update artisan details
// @route   PUT /api/admin/artisans/:id
// @access  Private (Admin only)
exports.updateArtisan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the artisan
    const artisan = await Artisan.findById(id);
    
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check if status is being updated
    const isStatusChanging = updateData.status && updateData.status !== artisan.status;
    const oldStatus = artisan.status;
    const newStatus = updateData.status;

    console.log('Status change detected:', { oldStatus, newStatus, isStatusChanging });

    // Update allowed fields
    const allowedUpdates = [
      'businessName',
      'fullName',
      'phone',
      'specialization',
      'yearsOfExperience',
      'status',
      'email',
      'description'
    ];

    // Update basic fields
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        artisan[field] = updateData[field];
      }
    });

    // Update address if provided
    if (updateData.address) {
      artisan.address = {
        ...artisan.address,
        ...updateData.address
      };
    }

    // Save the updated artisan
    await artisan.save();

    // If status is changing, find and update the associated User
    if (isStatusChanging) {
      // Try to find user by artisanId (since User document has artisanId field)
      const User = mongoose.model('User');
      
      // First, try to find user by artisanId field
      let user = await User.findOne({ artisanId: artisan._id });
      
      // If not found by artisanId, try to find by email (if email exists)
      if (!user && artisan.email) {
        user = await User.findOne({ email: artisan.email });
      }
      
      // If still not found, try to find by phone
      if (!user && artisan.phone) {
        user = await User.findOne({ phone: artisan.phone });
      }

      if (user) {
        console.log('Found associated user:', { userId: user._id, currentRole: user.role });
        
        // Map artisan status to user role
        let newUserRole = user.role; // Default to current role
        
        switch (newStatus) {
          case 'approved':
            newUserRole = 'artisan';
            break;
          case 'pending':
            newUserRole = 'pending_artisan';
            break;
          case 'rejected':
          case 'suspended':
            // For rejected or suspended, set to pending_artisan
            newUserRole = 'pending_artisan';
            break;
          default:
            newUserRole = user.role;
        }

        // Only update if role changed
        if (newUserRole !== user.role) {
          user.role = newUserRole;
          
          // Also ensure the artisanId reference is correct
          if (!user.artisanId || user.artisanId.toString() !== artisan._id.toString()) {
            user.artisanId = artisan._id;
          }
          
          await user.save();
          
          console.log(`User role updated from ${user.role} to ${newUserRole} for user ${user._id}`);
        } else {
          console.log('User role unchanged:', user.role);
        }
      } else {
        console.log('No associated user found for artisan:', artisan._id);
        
        // Optional: If no user found, you might want to create one or handle differently
        console.log('Search criteria used:', {
          artisanId: artisan._id,
          email: artisan.email,
          phone: artisan.phone
        });
      }
    }

    // Get updated artisan with any available user data
    const updatedArtisan = await Artisan.findById(id)
      .populate('userId', 'username email role'); // If you have userId field in artisan

    // Also try to get user data from User model if needed
    let userData = null;
    if (!updatedArtisan.userId) {
      const User = mongoose.model('User');
      userData = await User.findOne({ artisanId: updatedArtisan._id })
        .select('username email role');
    }

    res.status(200).json({
      success: true,
      message: 'Artisan updated successfully',
      data: {
        ...updatedArtisan.toObject(),
        user: userData || updatedArtisan.userId
      },
      metadata: {
        statusChanged: isStatusChanging,
        oldStatus: isStatusChanging ? oldStatus : undefined,
        newStatus: isStatusChanging ? newStatus : undefined
      }
    });

  } catch (error) {
    console.error('Update artisan error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value entered',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating artisan',
      error: error.message
    });
  }
};

// @desc    Bulk approve artisans
// @route   POST /api/admin/artisans/bulk-approve
// @access  Private (Admin only)
exports.bulkApproveArtisans = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { artisanIds } = req.body;

    if (!artisanIds || !Array.isArray(artisanIds) || artisanIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of artisan IDs'
      });
    }

    const results = {
      approved: 0,
      failed: [],
      alreadyApproved: 0
    };

    for (const artisanId of artisanIds) {
      try {
        const artisan = await Artisan.findById(artisanId).session(session);
        
        if (!artisan) {
          results.failed.push({ id: artisanId, reason: 'Artisan not found' });
          continue;
        }

        if (artisan.status === 'approved') {
          results.alreadyApproved++;
          continue;
        }

        // Update artisan
        artisan.status = 'approved';
        artisan.approvedAt = new Date();
        artisan.approvedBy = req.user.id;
        artisan.idProof.verified = true;
        artisan.idProof.verifiedAt = new Date();
        artisan.idProof.verifiedBy = req.user.id;
        
        await artisan.save({ session });

        // Update user role
        await User.findByIdAndUpdate(
          artisan.userId,
          {
            role: 'artisan',
            artisanId: artisan._id,
            updatedAt: new Date()
          },
          { session }
        );

        results.approved++;
      } catch (error) {
        results.failed.push({ id: artisanId, reason: error.message });
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Bulk approve completed. Approved: ${results.approved}, Already approved: ${results.alreadyApproved}, Failed: ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Bulk approve artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk approval'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Bulk reject artisans
// @route   POST /api/admin/artisans/bulk-reject
// @access  Private (Admin only)
exports.bulkRejectArtisans = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { artisanIds } = req.body;

    if (!artisanIds || !Array.isArray(artisanIds) || artisanIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of artisan IDs'
      });
    }

    const results = {
      rejected: 0,
      failed: [],
      alreadyRejected: 0
    };

    for (const artisanId of artisanIds) {
      try {
        const artisan = await Artisan.findById(artisanId).session(session);
        
        if (!artisan) {
          results.failed.push({ id: artisanId, reason: 'Artisan not found' });
          continue;
        }

        if (artisan.status === 'rejected') {
          results.alreadyRejected++;
          continue;
        }

        // Update artisan
        artisan.status = 'rejected';
        artisan.rejectionReason = 'Bulk rejected by admin';
        artisan.rejectedAt = new Date();
        artisan.rejectedBy = req.user.id;
        
        await artisan.save({ session });

        // Update user role back to user
        await User.findByIdAndUpdate(
          artisan.userId,
          {
            role: 'user',
            updatedAt: new Date()
          },
          { session }
        );

        results.rejected++;
      } catch (error) {
        results.failed.push({ id: artisanId, reason: error.message });
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Bulk reject completed. Rejected: ${results.rejected}, Already rejected: ${results.alreadyRejected}, Failed: ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Bulk reject artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk rejection'
    });
  } finally {
    session.endSession();
  }
};