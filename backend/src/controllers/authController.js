const mongoose = require('mongoose');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send Token Response with artisan data if applicable
const sendTokenResponse = async (user, statusCode, res, artisanData = null) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };

  // Prepare user response
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    artisanId: user.artisanId || null,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  // Prepare response
  const response = {
    success: true,
    token,
    user: userResponse,
    message: statusCode === 201 ? 'Registration successful!' : 'Login successful!'
  };

  // Add artisan data if exists
  if (artisanData) {
    response.artisan = artisanData;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json(response);
};

// @desc    Register user (regular user registration)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Register request received:', req.body);
    
    const { username, email, password, phone, role = 'user' } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }
    
    if (password.length < 8) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Validate role
    const validRoles = ['user', 'admin', 'artisan', 'pending_artisan'];
    if (!validRoles.includes(role)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create([{
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      isActive: true,
      role: role
    }], { session });
    
    await session.commitTransaction();
    
    // Send response
    const userResponse = {
      id: user[0]._id,
      username: user[0].username,
      email: user[0].email,
      phone: user[0].phone || '',
      role: user[0].role,
      isActive: user[0].isActive,
      createdAt: user[0].createdAt
    };

    const token = generateToken(user[0]._id);
    
    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful!'
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Register as artisan
// @route   POST /api/auth/register/artisan
// @access  Public
exports.registerArtisan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Artisan registration request received:', req.body);
    
    const { 
      username, 
      email, 
      password, 
      phone,
      // Artisan-specific fields
      businessName,
      fullName,
      address,
      idProof,
      specialization,
      yearsOfExperience,
      description,
      portfolioLink,
      website,
      socialLinks,
      bankDetails,
      documents
    } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }
    
    if (password.length < 8) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Artisan-specific validation
    if (!businessName || !fullName || !address || !idProof || !description) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required artisan information'
      });
    }
    
    if (description.length < 50) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 50 characters'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Step 1: Create User (basic info only)
    const user = await User.create([{
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      isActive: true,
      role: 'pending_artisan' // Initial role
    }], { session });
    
    // Step 2: Create Artisan record with all business data
    const artisan = await Artisan.create([{
      userId: user[0]._id,
      businessName,
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'India'
      },
      idProof: {
        type: idProof.type || 'aadhaar',
        number: idProof.number || '',
        documentUrl: idProof.documentUrl || '',
        verified: false
      },
      specialization: specialization || [],
      yearsOfExperience: yearsOfExperience || 0,
      description: description || '',
      portfolioLink: portfolioLink || '',
      website: website || '',
      socialLinks: socialLinks || {},
      bankDetails: bankDetails || {},
      documents: documents || [],
      status: 'pending',
      submittedAt: new Date()
    }], { session });
    
    // Step 3: Update user with artisanId reference
    await User.findByIdAndUpdate(
      user[0]._id,
      { artisanId: artisan[0]._id },
      { session }
    );
    
    await session.commitTransaction();
    
    console.log(`✅ Artisan application created: ${artisan[0]._id}`);
    
    // TODO: Notify admin about new artisan application
    // await notifyAdminNewArtisan(artisan[0]);
    
    // Send response
    const token = generateToken(user[0]._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user[0]._id,
        username: user[0].username,
        email: user[0].email,
        phone: user[0].phone || '',
        role: user[0].role,
        artisanId: artisan[0]._id,
        isActive: user[0].isActive,
        createdAt: user[0].createdAt
      },
      artisan: {
        id: artisan[0]._id,
        businessName: artisan[0].businessName,
        status: artisan[0].status,
        submittedAt: artisan[0].submittedAt
      },
      message: 'Artisan application submitted successfully! Our team will review your application within 3-5 business days.'
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Artisan registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during artisan registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Login user (with artisan data if applicable)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, username, password } = req.body;

    // Build query to find by email OR username
    const query = {};
    if (email) {
      query.email = email.toLowerCase();
    } else if (username) {
      query.username = username;
    } else {
      return res.status(400).json({
        success: false,
        errors: { email: 'Email or username is required' }
      });
    }

    // Check for user with password
    const user = await User.findOne(query).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: { 
          email: email ? 'Invalid email or password' : 'Invalid username or password'
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        errors: { 
          email: 'Account is deactivated. Please contact support.',
          isActive: false
        }
      });
    }

    // Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: { password: 'Invalid email or password' }
      });
    }
    
    // Get artisan data if applicable
    let artisanData = null;
    if (user.role === 'artisan' || user.role === 'pending_artisan') {
      artisanData = await Artisan.findOne({ userId: user._id })
        .select('businessName status rating totalProducts totalSales submittedAt approvedAt');
    }
    
    // Update user login info
    user.lastLogin = Date.now();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });
    
    // Prepare response
    const token = generateToken(user._id);
    
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      artisanId: user.artisanId || null,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    const response = {
      success: true,
      token,
      user: userResponse,
      message: getLoginMessage(user.role, artisanData?.status)
    };
    
    // Add artisan data if exists
    if (artisanData) {
      response.artisan = artisanData;
    }
    
    // Set cookie
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };
    
    res
      .status(200)
      .cookie('token', token, options)
      .json(response);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function for login messages
const getLoginMessage = (role, artisanStatus) => {
  switch(role) {
    case 'admin':
      return 'Welcome back, Admin!';
    case 'artisan':
      return artisanStatus === 'approved' 
        ? 'Welcome to your artisan dashboard!' 
        : 'Artisan dashboard access granted!';
    case 'pending_artisan':
      return 'Your artisan application is under review. We\'ll notify you once approved.';
    default:
      return 'Login successful!';
  }
};

// @desc    Get current logged in user with artisan data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get artisan data if applicable
    let artisanData = null;
    if (user.role === 'artisan' || user.role === 'pending_artisan') {
      artisanData = await Artisan.findOne({ userId: user._id })
        .select('businessName status rating totalProducts totalSales submittedAt approvedAt');
    }

    // Prepare response
    const response = {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        artisanId: user.artisanId || null,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };

    // Add artisan data if exists
    if (artisanData) {
      response.artisan = artisanData;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get artisan profile (for approved artisans)
// @route   GET /api/auth/me/artisan
// @access  Private (Artisan only)
exports.getMyArtisanProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is an artisan
    if (user.role !== 'artisan' && user.role !== 'pending_artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan role required.'
      });
    }
    
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: user._id });
    
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      artisan: artisan
    });
    
  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update artisan profile
// @route   PUT /api/auth/me/artisan
// @access  Private (Artisan only)
exports.updateArtisanProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is an artisan
    if (user.role !== 'artisan' && user.role !== 'pending_artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan role required.'
      });
    }
    
    // Get allowed fields for update (exclude sensitive fields)
    const allowedUpdates = [
      'description', 'portfolioLink', 'website', 'socialLinks',
      'specialization', 'yearsOfExperience'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Update artisan profile
    const artisan = await Artisan.findOneAndUpdate(
      { userId: user._id },
      updates,
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
      message: 'Artisan profile updated successfully',
      artisan: artisan
    });
    
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Admin: Deactivate user
// @route   PUT /api/auth/deactivate/:userId
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Can't deactivate yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }
    
    // If user is artisan, also update artisan status
    if (user.role === 'artisan' && user.artisanId) {
      await Artisan.findByIdAndUpdate(user.artisanId, {
        status: 'suspended',
        suspensionReason: reason || ''
      });
    }
    
    // Deactivate user
    user.isActive = false;
    user.deactivationReason = reason || '';
    user.deactivatedAt = Date.now();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        deactivatedAt: user.deactivatedAt
      }
    });
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Admin: Activate user
// @route   PUT /api/auth/activate/:userId
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user is suspended artisan, also update artisan status
    if (user.role === 'artisan' && user.artisanId) {
      const artisan = await Artisan.findById(user.artisanId);
      if (artisan && artisan.status === 'suspended') {
        await Artisan.findByIdAndUpdate(user.artisanId, {
          status: 'approved',
          suspensionReason: ''
        });
      }
    }
    
    // Activate user
    user.isActive = true;
    user.deactivationReason = '';
    user.deactivatedAt = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }
    
    // Generate reset token (simplified for now)
    const resetToken = 'temp-token-' + Date.now();
    
    // TODO: Implement proper email sending
    console.log('Password reset requested for:', email);
    console.log('Reset token:', resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully (demo mode)'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // TODO: Implement proper token validation
    console.log('Password reset attempt with token:', req.params.resettoken);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // TODO: Find user by token and update password
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful (demo mode)'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};