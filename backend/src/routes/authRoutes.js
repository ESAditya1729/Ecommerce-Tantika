const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  deactivateUser,
  activateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

// Admin routes for user management
router.put('/deactivate/:userId', protect, authorize('admin'), deactivateUser);
router.put('/activate/:userId', protect, authorize('admin'), activateUser);

module.exports = router;