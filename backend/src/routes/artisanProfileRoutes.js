const express = require('express');
const router = express.Router();
const {
  getArtisanProfile,
  getArtisanProfileBySlug,
  getArtisans,
  getArtisanProducts,
  getArtisanStats,
  updateArtisanStock
} = require('../controllers/artisanProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES ====================
// These routes are accessible to all users (no authentication required)

// GET /api/artisan-profiles - Get all artisans with pagination and filters
router.get('/', getArtisans);

// GET /api/artisan-profiles/artisan/:artisanId - Get artisan profile by artisan ID
router.get('/artisan/:artisanId', getArtisanProfile);

// GET /api/artisan-profiles/user/:userId - Get artisan profile by user ID
router.get('/user/:userId', getArtisanProfile);

// GET /api/artisan-profiles/slug/:slug - Get artisan profile by business name slug
router.get('/slug/:slug', getArtisanProfileBySlug);

// GET /api/artisan-profiles/artisan/:artisanId/products - Get artisan products with pagination
router.get('/artisan/:artisanId/products', getArtisanProducts);

// GET /api/artisan-profiles/artisan/:artisanId/stats - Get artisan statistics
router.get('/artisan/:artisanId/stats', getArtisanStats);

// ==================== PROTECTED ROUTES ====================
// These routes require authentication

// GET /api/artisan-profiles/dashboard - Get artisan dashboard data (only for artisans)
router.get('/dashboard', protect, authorize('artisan'), (req, res) => {
  // This would typically call a controller method
  // For now, redirect to the stats endpoint with the user's artisan ID
  if (req.user && req.user.artisanId) {
    req.params.artisanId = req.user.artisanId;
    return getArtisanStats(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Artisan ID not found for this user'
  });
});

// GET /api/artisan-profiles/my-products - Get current artisan's products (only for artisans)
router.get('/my-products', protect, authorize('artisan'), (req, res) => {
  if (req.user && req.user.artisanId) {
    req.params.artisanId = req.user.artisanId;
    return getArtisanProducts(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Artisan ID not found for this user'
  });
});

// PUT /api/artisan-profiles/products/:id/stock - Update stock for a product (only for artisans)
router.put('/products/:id/stock', protect, authorize('artisan'), (req, res) => {
  if (req.user && req.user.artisanId) {
    return updateArtisanStock(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Artisan ID not found for this user'
  });
});

// GET /api/artisan-profiles/my-profile - Get current artisan's profile (only for artisans)
router.get('/my-profile', protect, authorize('artisan'), (req, res) => {
  if (req.user && req.user.artisanId) {
    req.params.artisanId = req.user.artisanId;
    return getArtisanProfile(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Artisan ID not found for this user'
  });
});


// ==================== ADMIN ROUTES ====================
// These routes require admin privileges

// GET /api/artisan-profiles/admin/all - Get all artisans with pending status (admin only)
router.get('/admin/all', protect, authorize('admin'), getArtisans);

// GET /api/artisan-profiles/admin/artisan/:artisanId - Get detailed artisan info for admin
router.get('/admin/artisan/:artisanId', protect, authorize('admin'), getArtisanProfile);

// GET /api/artisan-profiles/admin/artisan/:artisanId/products - Get artisan products for admin review
router.get('/admin/artisan/:artisanId/products', protect, authorize('admin'), getArtisanProducts);

// GET /api/artisan-profiles/admin/artisan/:artisanId/stats - Get artisan stats for admin
router.get('/admin/artisan/:artisanId/stats', protect, authorize('admin'), getArtisanStats);

module.exports = router;