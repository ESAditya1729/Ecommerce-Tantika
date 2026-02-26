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
const { protect, admin, artisan } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES ==========
router.get('/', (req, res, next) => {
  getProducts(req, res).catch(next);
});

router.get('/categories', (req, res, next) => {
  getCategories(req, res).catch(next);
});

// ========== ADMIN ONLY ROUTES ==========
router.put('/bulk/update', protect, admin, (req, res, next) => {
  bulkUpdateProducts(req, res).catch(next);
});

router.delete('/bulk/delete', protect, admin, (req, res, next) => {
  bulkDeleteProducts(req, res).catch(next);
});

router.get('/stats/summary', protect, admin, (req, res, next) => {
  getProductStats(req, res).catch(next);
});

router.get('/export', protect, admin, (req, res, next) => {
  exportProducts(req, res).catch(next);
});

// ========== ARTISAN & ADMIN ==========
router.post('/', protect, admin, artisan, (req, res, next) => {
  createProduct(req, res).catch(next);
});

router.put('/:id/stock', protect, admin, artisan, (req, res, next) => {
  updateStock(req, res).catch(next);
});

router.put('/:id', protect, admin, artisan, (req, res, next) => {
  updateProduct(req, res).catch(next);
});

router.delete('/:id', protect, admin, artisan, (req, res, next) => {
  deleteProduct(req, res).catch(next);
});

// ⚠️ MUST BE LAST
router.get('/:id', (req, res, next) => {
  getProductById(req, res).catch(next);
});

module.exports = router;