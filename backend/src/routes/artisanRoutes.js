const express = require('express');
const router = express.Router();
const {
  getPendingArtisans,
  getAllArtisans,
  getApprovedArtisans,
  getArtisanById,
  approveArtisan,
  rejectArtisan,
  suspendArtisan,
  reactivateArtisan,
  verifyBankDetails,
  getArtisanStats,
  updateArtisan,           
  bulkApproveArtisans,     
  bulkRejectArtisans
} = require('../controllers/artisanAdminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Artisan management routes
router.get('/', getAllArtisans);
router.get('/pending', getPendingArtisans);
router.get('/approved', getApprovedArtisans);
router.get('/stats', getArtisanStats);
router.get('/:id', getArtisanById);

// PUT routes for updates (order matters - specific routes first)
router.put('/:id/approve', approveArtisan);
router.put('/:id/reject', rejectArtisan);
router.put('/:id/suspend', suspendArtisan);
router.put('/:id/reactivate', reactivateArtisan);
router.put('/:id/verify-bank', verifyBankDetails);
router.put('/:id', updateArtisan); // General update route - MUST COME LAST

// POST routes for bulk actions
router.post('/bulk-approve', bulkApproveArtisans);
router.post('/bulk-reject', bulkRejectArtisans);

module.exports = router;