const express = require('express');
const router = express.Router();
const {
  getPendingArtisans,
  getApprovedArtisans,
  getArtisanById,
  approveArtisan,
  rejectArtisan,
  suspendArtisan,
  reactivateArtisan,
  verifyBankDetails,
  getArtisanStats
} = require('../controllers/artisanAdminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Artisan management routes
router.get('/pending', getPendingArtisans);
router.get('/approved', getApprovedArtisans);
router.get('/stats', getArtisanStats);
router.get('/:id', getArtisanById);
router.put('/:id/approve', approveArtisan);
router.put('/:id/reject', rejectArtisan);
router.put('/:id/suspend', suspendArtisan);
router.put('/:id/reactivate', reactivateArtisan);
router.put('/:id/verify-bank', verifyBankDetails);

module.exports = router;