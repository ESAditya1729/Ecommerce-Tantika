// src/routes/offerRoutes.js
const express = require('express');
const router = express.Router();
const {
    getOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    getOfferStats,
    toggleOfferStatus,
    getOffersByType,
    bulkCreateOffers,
    getOffersByProduct,
    getCheckoutOffers
} = require('../controllers/offerController');

// Middleware for admin authentication
const { protect, admin } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES ==========

/**
 * @route   GET /api/offers
 * @desc    Get all products with active discounts
 * @access  Public (shows only active discounts) / Admin (shows all)
 */
router.get('/', (req, res, next) => {
    getOffers(req, res).catch(next);
});

/**
 * @route   GET /api/offers/type/:type
 * @desc    Get products by discount type (percentage/fixed)
 * @access  Public
 */
router.get('/type/:type', (req, res, next) => {
    getOffersByType(req, res).catch(next);
});

/**
 * @route   GET /api/offers/product/:productId
 * @desc    Get active discounts for a specific product
 * @access  Public
 */
router.get('/product/:productId', (req, res, next) => {
    getOffersByProduct(req, res).catch(next);
});

/**
 * @route   POST /api/offers/checkout
 * @desc    Get applicable offers for checkout cart
 * @access  Public (Authenticated users)
 */
router.post('/checkout', protect, (req, res, next) => {
    getCheckoutOffers(req, res).catch(next);
});

// ========== ADMIN ONLY ROUTES ==========

/**
 * @route   POST /api/offers
 * @desc    Create a new discount for a product
 * @access  Private (Admin only)
 */
router.post('/', protect, admin, (req, res, next) => {
    createOffer(req, res).catch(next);
});

/**
 * @route   POST /api/offers/bulk
 * @desc    Bulk create discounts for multiple products
 * @access  Private (Admin only)
 */
router.post('/bulk', protect, admin, (req, res, next) => {
    bulkCreateOffers(req, res).catch(next);
});

/**
 * @route   GET /api/offers/stats
 * @desc    Get discount statistics for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/stats', protect, admin, (req, res, next) => {
    getOfferStats(req, res).catch(next);
});

/**
 * @route   PUT /api/offers/:id
 * @desc    Update an existing discount for a product
 * @access  Private (Admin only)
 */
router.put('/:id', protect, admin, (req, res, next) => {
    updateOffer(req, res).catch(next);
});

/**
 * @route   PUT /api/offers/:id/toggle
 * @desc    Toggle discount status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.put('/:id/toggle', protect, admin, (req, res, next) => {
    toggleOfferStatus(req, res).catch(next);
});

/**
 * @route   DELETE /api/offers/:id
 * @desc    Delete (remove) a discount from a product
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, admin, (req, res, next) => {
    deleteOffer(req, res).catch(next);
});

// ========== SINGLE OFFER ROUTE (MUST BE LAST) ==========

/**
 * @route   GET /api/offers/:id
 * @desc    Get single product discount details
 * @access  Public/Admin
 * @note    This route must be placed after all specific routes to avoid conflicts
 */
router.get('/:id', (req, res, next) => {
    getOfferById(req, res).catch(next);
});

module.exports = router;