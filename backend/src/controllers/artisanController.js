const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Payout = require('../models/Payout');

// @desc    Get artisan profile
// @route   GET /api/artisan/profile
// @access  Private (Artisan only)
exports.getProfile = async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user.id });

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get user info for avatar/email
    const user = await User.findById(req.user.id)
      .select('username email avatar');

    // Mask sensitive bank details for response
    if (artisan.bankDetails && artisan.bankDetails.accountNumber) {
      artisan.bankDetails.accountNumber = maskAccountNumber(artisan.bankDetails.accountNumber);
    }
    if (artisan.bankDetails && artisan.bankDetails.ifscCode) {
      artisan.bankDetails.ifscCode = maskIfscCode(artisan.bankDetails.ifscCode);
    }

    res.status(200).json({
      success: true,
      data: {
        artisan,
        user
      }
    });

  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// @desc    Update artisan profile (only editable fields)
// @route   PUT /api/artisan/profile
// @access  Private (Artisan only)
exports.updateProfile = async (req, res) => {
  try {
    // Only allow updating these fields (read-only fields excluded)
    const allowedUpdates = {
      // Basic Info
      businessName: req.body.businessName,
      fullName: req.body.fullName,
      phone: req.body.phone,
      description: req.body.description,
      yearsOfExperience: req.body.yearsOfExperience,
      
      // Address
      'address.street': req.body.address?.street,
      'address.city': req.body.address?.city,
      'address.state': req.body.address?.state,
      'address.postalCode': req.body.address?.postalCode,
      'address.country': req.body.address?.country,
      
      // Specializations
      specialization: req.body.specialization,
      
      // Social & Portfolio Links
      portfolioLink: req.body.portfolioLink,
      website: req.body.website,
      'socialLinks.instagram': req.body.socialLinks?.instagram,
      'socialLinks.facebook': req.body.socialLinks?.facebook,
      'socialLinks.youtube': req.body.socialLinks?.youtube,
      'socialLinks.twitter': req.body.socialLinks?.twitter,
      
      // Settings
      'settings.autoApproveProducts': req.body.settings?.autoApproveProducts,
      'settings.lowStockNotification': req.body.settings?.lowStockNotification,
      'settings.newOrderNotification': req.body.settings?.newOrderNotification,
      'settings.payoutMethod': req.body.settings?.payoutMethod,
      'settings.payoutSchedule': req.body.settings?.payoutSchedule
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Update artisan profile
    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: artisan
    });

  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Update bank details (for payouts)
// @route   PUT /api/artisan/bank-details
// @access  Private (Artisan only)
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, ifscCode, accountType } = req.body;

    // Optional - only update if provided
    const updates = {};
    if (accountName) updates['bankDetails.accountName'] = accountName;
    if (accountNumber) updates['bankDetails.accountNumber'] = accountNumber;
    if (bankName) updates['bankDetails.bankName'] = bankName;
    if (ifscCode) updates['bankDetails.ifscCode'] = ifscCode.toUpperCase();
    if (accountType) updates['bankDetails.accountType'] = accountType;
    
    // Reset verification when bank details change
    if (Object.keys(updates).length > 0) {
      updates['bankDetails.verified'] = false;
    }

    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: {
        accountName: artisan.bankDetails.accountName,
        bankName: artisan.bankDetails.bankName,
        accountType: artisan.bankDetails.accountType,
        verified: artisan.bankDetails.verified,
        accountNumber: maskAccountNumber(artisan.bankDetails.accountNumber),
        ifscCode: maskIfscCode(artisan.bankDetails.ifscCode)
      }
    });

  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating bank details'
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/artisan/notification-settings
// @access  Private (Artisan only)
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { lowStockNotification, newOrderNotification } = req.body;

    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          'settings.lowStockNotification': lowStockNotification,
          'settings.newOrderNotification': newOrderNotification
        }
      },
      { new: true, runValidators: true }
    ).select('settings');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        lowStockNotification: artisan.settings.lowStockNotification,
        newOrderNotification: artisan.settings.newOrderNotification
      }
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification settings'
    });
  }
};

// @desc    Update payout settings
// @route   PUT /api/artisan/payout-settings
// @access  Private (Artisan only)
exports.updatePayoutSettings = async (req, res) => {
  try {
    const { payoutMethod, payoutSchedule } = req.body;

    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          'settings.payoutMethod': payoutMethod,
          'settings.payoutSchedule': payoutSchedule
        }
      },
      { new: true, runValidators: true }
    ).select('settings');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payout settings updated successfully',
      data: {
        payoutMethod: artisan.settings.payoutMethod,
        payoutSchedule: artisan.settings.payoutSchedule
      }
    });

  } catch (error) {
    console.error('Update payout settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payout settings'
    });
  }
};

// @desc    Get ID proof details
// @route   GET /api/artisan/id-proof
// @access  Private (Artisan only)
exports.getIdProof = async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user.id })
      .select('idProof');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        type: artisan.idProof.type,
        number: maskIdNumber(artisan.idProof.type, artisan.idProof.number),
        verified: artisan.idProof.verified,
        verifiedAt: artisan.idProof.verifiedAt,
        documentUrl: artisan.idProof.documentUrl
      }
    });

  } catch (error) {
    console.error('Get ID proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ID proof'
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/artisan/metrics
// @access  Private (Artisan only)
exports.getMetrics = async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user.id })
      .select('rating totalProducts totalSales totalRevenue totalViews totalOrders completionRate');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        rating: artisan.rating,
        totalProducts: artisan.totalProducts,
        totalSales: artisan.totalSales,
        totalRevenue: artisan.totalRevenue,
        totalViews: artisan.totalViews,
        totalOrders: artisan.totalOrders,
        completionRate: artisan.completionRate
      }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching metrics'
    });
  }
};

// @desc    Update last active timestamp
// @route   POST /api/artisan/heartbeat
// @access  Private (Artisan only)
exports.updateHeartbeat = async (req, res) => {
  try {
    await Artisan.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $set: { 
          lastActiveAt: new Date(),
          lastLoginAt: req.body.isLogin ? new Date() : undefined
        }
      }
    );

    res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error('Update heartbeat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper functions
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  const str = accountNumber.toString();
  if (str.length <= 4) return '****';
  return 'XXXXXX' + str.slice(-4);
};

const maskIfscCode = (ifscCode) => {
  if (!ifscCode) return '';
  return ifscCode.slice(0, 4) + 'XXXXX';
};

const maskIdNumber = (type, number) => {
  if (!number) return '';
  const str = number.toString();
  if (type === 'aadhaar') {
    // Mask Aadhaar: XXXX-XXXX-1234
    return 'XXXX-XXXX-' + str.slice(-4);
  } else if (type === 'pan') {
    // Mask PAN: ABCPX1234X -> ABCPX****X
    return str.slice(0, 5) + '****' + str.slice(-1);
  }
  return '********' + str.slice(-4);
};