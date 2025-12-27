const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };

  // Return user data (without sensitive info)
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse,
      message: statusCode === 201 ? 'Registration successful!' : 'Login successful!'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { username, email, password, phone } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }
    
    // ✅ FIXED: Hash password BEFORE creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with already-hashed password
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword, // Already hashed
      phone: phone || '',
      isActive: true,
      role: 'user'
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    // Send response
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };

    res
      .status(201)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: userResponse,
        message: 'Registration successful!'
      });
    
  } catch (error) {
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
  }
};

// @desc    Login user
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

    // ✅ Check if account is active
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
    
    // Update login info
    user.lastLogin = Date.now();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// @desc    Get current logged in user
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

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
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