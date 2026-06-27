const express = require('express');
const router = express.Router();
const {
  // Get notifications
  getArtisanNotifications,
  getAdminNotifications,
  getUserNotifications,
  getNotification,
  
  // Read operations
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  
  // Reply operations
  addReply,
  dismissNotification,
  
  // Admin operations
  createArtisanNotification,
  broadcastToArtisans,
  deleteNotification,
  getBroadcastHistory
} = require('../controllers/notificationController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// ============================================
// PROTECTED ROUTES (All require authentication)
// ============================================
router.use(protect);

// ============================================
// UNREAD COUNT
// ============================================
router.get('/unread-count', getUnreadCount);

// ============================================
// ARTISAN NOTIFICATIONS
// ============================================
router.get('/artisan', getArtisanNotifications);

// ============================================
// ADMIN NOTIFICATIONS (Admin only)
// ============================================
router.get('/admin', admin, getAdminNotifications);
router.get('/admin/broadcast-history', admin, getBroadcastHistory);

// ============================================
// USER NOTIFICATIONS
// ============================================
router.get('/user', getUserNotifications);

// ============================================
// SINGLE NOTIFICATION OPERATIONS
// ============================================
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.post('/:id/reply', addReply);
router.post('/:id/dismiss', dismissNotification);

// ============================================
// BULK OPERATIONS
// ============================================
router.put('/read-all', markAllAsRead);

// ============================================
// ADMIN ONLY OPERATIONS
// ============================================
router.post('/admin/create', admin, createArtisanNotification);
router.post('/admin/broadcast', admin, broadcastToArtisans);
router.delete('/admin/:id', admin, deleteNotification);

module.exports = router;