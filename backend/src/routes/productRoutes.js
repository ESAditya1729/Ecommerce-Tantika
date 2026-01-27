const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    bulkDeleteProducts,
    updateStock,
    getProductStats,
    getCategories,
    exportProducts
} = require('../controllers/productController');

// Middleware for admin authentication
const { protect, admin } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES ==========
// Shop pages should be accessible to everyone
router.get('/', (req, res, next) => {
    getProducts(req, res).catch(next);
});

router.get('/categories', (req, res, next) => {
    getCategories(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    getProductById(req, res).catch(next);
});

// ========== ADMIN ROUTES ==========
// These routes require admin authentication
router.post('/', protect, admin, (req, res, next) => {
    createProduct(req, res).catch(next);
});

router.put('/:id', protect, admin, (req, res, next) => {
    updateProduct(req, res).catch(next);
});

router.delete('/:id', protect, admin, (req, res, next) => {
    deleteProduct(req, res).catch(next);
});

router.put('/:id/stock', protect, admin, (req, res, next) => {
    updateStock(req, res).catch(next);
});

// Bulk operations
router.put('/bulk/update', protect, admin, (req, res, next) => {
    bulkUpdateProducts(req, res).catch(next);
});

router.delete('/bulk/delete', protect, admin, (req, res, next) => {
    bulkDeleteProducts(req, res).catch(next);
});

// Analytics & Export
router.get('/stats/summary', protect, admin, (req, res, next) => {
    getProductStats(req, res).catch(next);
});

router.get('/export', protect, admin, (req, res, next) => {
    exportProducts(req, res).catch(next);
});

module.exports = router;