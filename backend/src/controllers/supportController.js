// src/controllers/supportController.js
const SupportTicket = require('../models/Support');
const User = require('../models/User');
const Artisan = require('../models/Artisan');

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user details with artisan info if applicable
 */
const getUserDetails = async (userId) => {
  const user = await User.findById(userId).select('username email phone role artisanId');
  if (!user) return null;
  
  let artisanDetails = null;
  let displayName = user.username;
  let phone = user.phone || '';
  
  // If user is artisan, get artisan details
  if ((user.role === 'artisan' || user.role === 'pending_artisan') && user.artisanId) {
    artisanDetails = await Artisan.findById(user.artisanId)
      .select('businessName fullName phone email');
    
    if (artisanDetails) {
      displayName = artisanDetails.businessName || artisanDetails.fullName || user.username;
      phone = artisanDetails.phone || user.phone || '';
    }
  }
  
  return {
    user,
    artisan: artisanDetails,
    displayName,
    phone,
    role: user.role
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Generate ticket ID
 */
const generateTicketId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TKT${year}${month}${day}${random}`;
};

// ==================== USER/ARTISAN CONTROLLERS ====================

/**
 * Create a new support ticket
 * Access: All authenticated users (users, artisans, pending_artisans)
 */
exports.createTicket = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      subject,
      description,
      priority = 'medium',
      relatedTo,
      attachments = []
    } = req.body;

    const userId = req.user.id;

    // Get user details
    const userDetails = await getUserDetails(userId);
    if (!userDetails) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prepare contact info
    const contactInfo = {
      name: userDetails.displayName,
      email: userDetails.user.email,
      phone: userDetails.phone || 'Not provided'
    };

    // Create ticket
    const ticket = new SupportTicket({
      ticketId: generateTicketId(),
      user: userId,
      userRole: userDetails.role,
      artisan: userDetails.artisan?._id || null,
      contactInfo,
      category,
      subCategory,
      priority,
      subject,
      description,
      relatedTo: relatedTo || {},
      attachments: attachments || [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      },
      conversations: [{
        message: `Ticket created with subject: ${subject}`,
        sender: userId,
        senderRole: userDetails.role === 'artisan' ? 'artisan' : 'user',
        senderName: userDetails.displayName,
        isSystemMessage: true,
        createdAt: new Date()
      }]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating support ticket', 
      error: error.message 
    });
  }
};

/**
 * Get user's tickets
 * Access: All authenticated users (view their own tickets only)
 */
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(query)
      .select('ticketId category subject status priority createdAt lastActivityAt')
      .sort({ lastActivityAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTickets: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching tickets', 
      error: error.message 
    });
  }
};

/**
 * Get single ticket details
 * Access: Users can view their own tickets, admins can view any ticket
 */
exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isAdminUser = user && user.role === 'admin';

    let query = { ticketId };
    
    // Non-admin users can only view their own tickets
    if (!isAdminUser) {
      query.user = userId;
    }

    const ticket = await SupportTicket.findOne(query)
      .populate('user', 'username email role')
      .populate('artisan', 'businessName fullName phone email')
      .populate('assignedTo', 'username email')
      .populate('conversations.sender', 'username email role');

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    // Filter out internal messages for non-admin users
    if (!isAdminUser) {
      ticket.conversations = ticket.conversations.filter(
        conv => !conv.isInternal || conv.senderRole === 'admin'
      );
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching ticket details', 
      error: error.message 
    });
  }
};

/**
 * Add message to ticket
 * Access: Users can add to their own open tickets, admins can add to any
 */
exports.addMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, attachments = [], isInternal = false } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isAdminUser = user && user.role === 'admin';

    let query = { ticketId };
    
    // Non-admin users can only message their own tickets and cannot create internal notes
    if (!isAdminUser) {
      query.user = userId;
      query.status = { $nin: ['closed', 'resolved'] };
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found or not accessible' 
      });
    }

    // Get sender details
    const userDetails = await getUserDetails(userId);
    
    // Determine sender role
    let senderRole = 'user';
    if (isAdminUser) {
      senderRole = 'admin';
    } else if (userDetails.role === 'artisan' || userDetails.role === 'pending_artisan') {
      senderRole = 'artisan';
    }

    // Add message
    ticket.conversations.push({
      message,
      sender: userId,
      senderRole,
      senderName: userDetails.displayName,
      attachments: attachments || [],
      isInternal: isInternal && isAdminUser, // Only admins can create internal notes
      createdAt: new Date()
    });

    // Update status
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    // Auto-assign to admin if admin is responding and ticket unassigned
    if (isAdminUser && !ticket.assignedTo) {
      ticket.assignedTo = userId;
      ticket.assignedAt = new Date();
    }

    ticket.lastActivityAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      data: {
        conversation: ticket.conversations[ticket.conversations.length - 1],
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding message', 
      error: error.message 
    });
  }
};

/**
 * Close ticket
 * Access: Users can close their own tickets, admins can close any
 */
exports.closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { resolution } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isAdminUser = user && user.role === 'admin';

    let query = { ticketId };
    
    // Non-admin users can only close their own tickets
    if (!isAdminUser) {
      query.user = userId;
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({ 
        success: false,
        message: 'Ticket is already closed' 
      });
    }

    ticket.status = 'closed';
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = userId;
    if (resolution) ticket.resolution = resolution;
    ticket.lastActivityAt = new Date();

    // Add system message
    const userDetails = await getUserDetails(userId);
    ticket.conversations.push({
      message: `Ticket closed by ${userDetails.displayName}${resolution ? ': ' + resolution : ''}`,
      sender: userId,
      senderRole: isAdminUser ? 'admin' : (userDetails.role === 'artisan' ? 'artisan' : 'user'),
      senderName: userDetails.displayName,
      isSystemMessage: true,
      createdAt: new Date()
    });
    
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket closed successfully',
      data: { status: ticket.status }
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error closing ticket', 
      error: error.message 
    });
  }
};

/**
 * Submit satisfaction rating
 * Access: Only the user who created the ticket
 */
exports.submitRating = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    const ticket = await SupportTicket.findOne({ 
      ticketId,
      user: userId,
      status: 'closed'
    });

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found or not closed' 
      });
    }

    if (ticket.satisfaction && ticket.satisfaction.rating) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating already submitted for this ticket' 
      });
    }

    ticket.satisfaction = {
      rating,
      feedback,
      submittedAt: new Date()
    };

    await ticket.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error submitting rating', 
      error: error.message 
    });
  }
};

/**
 * Reopen closed ticket
 * Access: Users can reopen their own tickets, admins can reopen any
 */
exports.reopenTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isAdminUser = user && user.role === 'admin';

    let query = { ticketId, status: 'closed' };
    
    if (!isAdminUser) {
      query.user = userId;
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found or not eligible for reopening' 
      });
    }

    ticket.status = 'reopened';
    ticket.lastActivityAt = new Date();

    // Add system message
    const userDetails = await getUserDetails(userId);
    ticket.conversations.push({
      message: `Ticket reopened by ${userDetails.displayName}. Reason: ${reason || 'Not specified'}`,
      sender: userId,
      senderRole: isAdminUser ? 'admin' : (userDetails.role === 'artisan' ? 'artisan' : 'user'),
      senderName: userDetails.displayName,
      isSystemMessage: true,
      createdAt: new Date()
    });
    
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket reopened successfully',
      data: { status: ticket.status }
    });
  } catch (error) {
    console.error('Error reopening ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error reopening ticket', 
      error: error.message 
    });
  }
};

// ==================== ADMIN ONLY CONTROLLERS ====================

/**
 * Get all tickets with filters (Admin only)
 * Access: Admin only
 */
exports.getAllTickets = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const {
      status,
      priority,
      category,
      userRole,
      search,
      fromDate,
      toDate,
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'lastActivityAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userRole) filter.userRole = userRole;
    if (assignedTo === 'unassigned') {
      filter.assignedTo = null;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (search) {
      filter.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { 'contactInfo.name': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'username email role')
      .populate('assignedTo', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(filter);

    // Get counts for filters
    const statusCounts = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityCounts = await SupportTicket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        filters: {
          status: statusCounts,
          priority: priorityCounts
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTickets: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching tickets', 
      error: error.message 
    });
  }
};

/**
 * Assign ticket to admin (Admin only)
 */
exports.assignTicket = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const { ticketId } = req.params;
    const { adminId } = req.body;
    const currentAdminId = req.user.id;

    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    const assignToId = adminId || currentAdminId;
    
    // Check if admin exists
    const admin = await User.findOne({ _id: assignToId, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid admin' 
      });
    }

    ticket.assignedTo = assignToId;
    ticket.assignedAt = new Date();
    ticket.status = 'in_progress';
    
    // Add system message
    ticket.conversations.push({
      message: `Ticket assigned to ${admin.username}`,
      sender: currentAdminId,
      senderRole: 'admin',
      senderName: user.username,
      isSystemMessage: true,
      createdAt: new Date()
    });
    
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: {
        assignedTo: admin.username,
        assignedAt: ticket.assignedAt
      }
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error assigning ticket', 
      error: error.message 
    });
  }
};

/**
 * Get ticket statistics (Admin only)
 */
exports.getTicketStats = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          reopened: { $sum: { $cond: [{ $eq: ['$status', 'reopened'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          avgResolutionTime: { $avg: '$resolutionTime' },
          avgRating: { $avg: '$satisfaction.rating' }
        }
      }
    ]);

    const categoryStats = await SupportTicket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity
    const recentActivity = await SupportTicket.find()
      .sort({ lastActivityAt: -1 })
      .limit(10)
      .populate('user', 'username')
      .select('ticketId subject status priority lastActivityAt contactInfo.name');

    // Get unassigned tickets count
    const unassignedCount = await SupportTicket.countDocuments({ 
      assignedTo: null, 
      status: { $nin: ['closed', 'resolved'] }
    });

    // Get overdue tickets (no activity for 48 hours)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const overdueCount = await SupportTicket.countDocuments({
      lastActivityAt: { $lt: twoDaysAgo },
      status: { $nin: ['closed', 'resolved'] }
    });

    // Get daily performance for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyPerformance = await SupportTicket.aggregate([
      {
        $match: {
          resolvedAt: { $exists: true, $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' } },
          resolved: { $sum: 1 },
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0,
          urgent: 0, high: 0, medium: 0, low: 0,
          avgResolutionTime: 0, avgRating: 0
        },
        byCategory: categoryStats,
        recentActivity,
        unassigned: unassignedCount,
        overdue: overdueCount,
        dailyPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
};

/**
 * Bulk assign tickets (Admin only)
 */
exports.bulkAssignTickets = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const { ticketIds, adminId } = req.body;
    const currentAdminId = req.user.id;

    if (!ticketIds || !ticketIds.length) {
      return res.status(400).json({ 
        success: false,
        message: 'No tickets selected' 
      });
    }

    const assignToId = adminId || currentAdminId;
    
    // Check if admin exists
    const admin = await User.findOne({ _id: assignToId, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid admin' 
      });
    }

    const result = await SupportTicket.updateMany(
      { ticketId: { $in: ticketIds } },
      {
        $set: {
          assignedTo: assignToId,
          assignedAt: new Date(),
          status: 'in_progress',
          lastActivityAt: new Date()
        }
      }
    );

    // Add system message to each ticket
    for (const ticketId of ticketIds) {
      await SupportTicket.updateOne(
        { ticketId },
        {
          $push: {
            conversations: {
              message: `Bulk assigned to ${admin.username}`,
              sender: currentAdminId,
              senderRole: 'admin',
              senderName: user.username,
              isSystemMessage: true,
              createdAt: new Date()
            }
          }
        }
      );
    }

    res.json({
      success: true,
      message: `Successfully assigned ${result.modifiedCount} tickets`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error bulk assigning tickets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error bulk assigning tickets', 
      error: error.message 
    });
  }
};

/**
 * Export tickets to CSV (Admin only)
 */
exports.exportTicketsCSV = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const { status, fromDate, toDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    // Convert to CSV
    const fields = [
      'Ticket ID', 'User Name', 'User Email', 'User Role', 'Category', 
      'Priority', 'Subject', 'Status', 'Assigned To', 'Created At', 
      'Resolved At', 'Resolution Time (hrs)', 'Rating', 'Feedback'
    ];

    const csvData = tickets.map(ticket => [
      ticket.ticketId,
      ticket.contactInfo.name,
      ticket.contactInfo.email,
      ticket.userRole,
      ticket.category,
      ticket.priority,
      ticket.subject,
      ticket.status,
      ticket.assignedTo?.username || 'Unassigned',
      ticket.createdAt.toISOString(),
      ticket.resolvedAt?.toISOString() || '',
      ticket.resolutionTime || '',
      ticket.satisfaction?.rating || '',
      ticket.satisfaction?.feedback ? `"${ticket.satisfaction.feedback.replace(/"/g, '""')}"` : ''
    ]);

    const csv = [
      fields.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tickets.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting tickets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error exporting tickets', 
      error: error.message 
    });
  }
};

/**
 * Delete ticket (Admin only - use with caution)
 */
exports.deleteTicket = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const { ticketId } = req.params;

    const ticket = await SupportTicket.findOneAndDelete({ ticketId });

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting ticket', 
      error: error.message 
    });
  }
};