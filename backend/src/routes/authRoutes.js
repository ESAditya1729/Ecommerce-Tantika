const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  protect,
  admin,
  artisan,
  isApprovedArtisan,
  isResourceOwner
} = require('../middleware/authMiddleware');

// ========================
// Public Routes
// ========================
router.post('/register', authController.register);
router.post('/register/artisan', authController.registerArtisan);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

// ========================
// Protected Routes
// ========================
router.get('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// Artisan profile routes
router.get('/me/artisan', protect, artisan, authController.getMyArtisanProfile);
router.put('/me/artisan', protect, artisan, authController.updateArtisanProfile);

// Admin routes
router.put('/deactivate/:userId', protect, admin, authController.deactivateUser);
router.put('/activate/:userId', protect, admin, authController.activateUser);

module.exports = router;