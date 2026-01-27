const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artisan = require('../models/Artisan');

// ========================
// General Authentication Middleware
// ========================

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // OR check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found, continue as public user
  if (!token) {
    req.user = null; // Set user to null for public access
    req.artisan = null;
    return next(); // Continue without authentication
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    // If user not found, continue as public
    if (!user) {
      req.user = null;
      req.artisan = null;
      return next();
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }
    
    // Get artisan data if user is artisan
    if (user.role === 'artisan' || user.role === 'pending_artisan') {
      const artisan = await Artisan.findOne({ userId: user._id });
      req.artisan = artisan; // Attach artisan data to request
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // For public routes, continue even if token is invalid
    req.user = null;
    req.artisan = null;
    next(); // Continue with null user
    
    // If you want to be strict about invalid tokens, uncomment below:
    /*
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
    */
  }
};

// ========================
// Role-Based Authorization Middleware
// ========================

// Flexible role authorization (accepts multiple roles)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      const rolesText = roles.join(', ');
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${rolesText}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

// ========================
// Specific Role Middleware (Shortcuts)
// ========================

const admin = authorize('admin');
const artisan = authorize('artisan', 'pending_artisan');
const approvedArtisan = authorize('artisan');
const pendingArtisan = authorize('pending_artisan');
const user = authorize('user');

// ========================
// Artisan-Specific Middleware
// ========================

// Check if artisan is approved (has approved status)
const isApprovedArtisan = async (req, res, next) => {
  if (req.user.role !== 'artisan') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Approved artisan role required.'
    });
  }
  
  try {
    const artisan = await Artisan.findOne({ userId: req.user._id });
    
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }
    
    if (artisan.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your artisan account is ${artisan.status}.`
      });
    }
    
    req.artisan = artisan;
    next();
  } catch (error) {
    console.error('Approved artisan middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if user can manage products (approved artisan or admin)
const canManageProducts = async (req, res, next) => {
  try {
    // Admin can always manage products
    if (req.user.role === 'admin') {
      return next();
    }
    
    // For artisans, check approval status
    if (req.user.role === 'artisan') {
      const artisan = await Artisan.findOne({ userId: req.user._id });
      
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }
      
      if (artisan.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your artisan account must be approved to manage products.'
        });
      }
      
      req.artisan = artisan;
      return next();
    }
    
    // Deny access for other roles
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or approved artisan role required.'
    });
  } catch (error) {
    console.error('Can manage products middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ========================
// Admin-Specific Middleware
// ========================

// Check if user is super admin (additional check)
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  // Add additional super admin checks here if needed
  // For example: check if user has superAdmin flag
  // if (!req.user.isSuperAdmin) {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Access denied. Super admin privileges required.'
  //   });
  // }
  
  next();
};

// ========================
// Resource Ownership Middleware
// ========================

// Check if user owns the resource (for user-specific operations)
const isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      let resource;
      
      switch (resourceType) {
        case 'user':
          if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Access denied. You can only manage your own account.'
            });
          }
          break;
          
        case 'artisan':
          const artisan = await Artisan.findById(req.params.artisanId || req.params.id);
          if (!artisan) {
            return res.status(404).json({
              success: false,
              message: 'Artisan not found'
            });
          }
          
          // Admin can access any artisan, user can only access their own
          if (artisan.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Access denied. You can only access your own artisan profile.'
            });
          }
          break;
          
        case 'product':
          // This would check if user owns the product
          // You'll need to implement this based on your Product model
          break;
          
        default:
          return res.status(500).json({
            success: false,
            message: 'Invalid resource type'
          });
      }
      
      next();
    } catch (error) {
      console.error('Resource ownership middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// ========================
// Export All Middleware
// ========================

module.exports = {
  // General authentication
  protect,
  
  // Role-based authorization
  authorize,
  admin,
  artisan,
  approvedArtisan,
  pendingArtisan,
  user,
  
  // Artisan-specific
  isApprovedArtisan,
  canManageProducts,
  
  // Admin-specific
  isSuperAdmin,
  
  // Resource ownership
  isResourceOwner
};