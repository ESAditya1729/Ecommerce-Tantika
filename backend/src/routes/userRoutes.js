// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    getUserStats,
    getUserSegments,
    exportUsers,
    sendBulkEmail,
    getFilterOptions,
    searchUsers,
    bulkUpdateUsers
} = require('../controllers/userAdminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/stats', getUserStats);
router.get('/segments', getUserSegments);
router.get('/filters/options', getFilterOptions);
router.get('/export', exportUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);
router.post('/bulk/email', sendBulkEmail);
router.patch('/bulk/update', bulkUpdateUsers);

module.exports = router;