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

// Middleware for admin authentication (placeholder - implement as needed)
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/stock', protect, admin, updateStock);

// Bulk operations
router.put('/bulk/update', protect, admin, bulkUpdateProducts);
router.delete('/bulk/delete', protect, admin, bulkDeleteProducts);

// Analytics & Export
router.get('/stats/summary', protect, admin, getProductStats);
router.get('/export', protect, admin, exportProducts);

module.exports = router;