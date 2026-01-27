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