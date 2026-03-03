// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware'); // For file attachments

// Import controllers
const supportController = require('../controllers/supportController');
const adminSupportController = require('../controllers/admin/supportController');

// ==================== PUBLIC/OPEN ROUTES ====================
// (None for now - all support routes require authentication)

// ==================== PROTECTED ROUTES - ALL AUTHENTICATED USERS ====================
router.use(protect);

// User/Artisan Support Routes - Accessible by both users and artisans
router.post('/create', supportController.createTicket);
router.get('/my-tickets', supportController.getUserTickets);
router.get('/:ticketId', supportController.getTicketDetails);
router.post('/:ticketId/message', supportController.addMessage);
router.put('/:ticketId/close', supportController.closeTicket);
router.post('/:ticketId/rating', supportController.submitRating);

// ==================== ADMIN ONLY ROUTES ====================
// Dashboard Stats
router.get('/admin/stats', authorize('admin'), adminSupportController.getTicketStats);

// Ticket Management
router.get('/admin/tickets', authorize('admin'), adminSupportController.getAllTickets);
router.get('/admin/tickets/:ticketId', authorize('admin'), adminSupportController.getTicketDetailsAdmin);
router.put('/admin/tickets/:ticketId/assign', authorize('admin'), adminSupportController.assignTicket);
router.post('/admin/tickets/:ticketId/respond', authorize('admin'), adminSupportController.addAdminResponse);
router.put('/admin/tickets/:ticketId/status', authorize('admin'), adminSupportController.updateTicketStatus);

// Bulk Operations (commented for now)
// router.post('/admin/tickets/bulk/assign', authorize('admin'), adminSupportController.bulkAssignTickets);
// router.get('/admin/tickets/export/csv', authorize('admin'), adminSupportController.exportTicketsCSV);

// ==================== ATTACHMENTS (if implementing file upload) ====================
// router.post('/upload', upload.single('attachment'), supportController.uploadAttachment);
// router.delete('/attachments/:fileId', supportController.deleteAttachment);

module.exports = router;