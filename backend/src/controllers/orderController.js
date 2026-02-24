// controllers/OrderController.js
const Order = require('../models/Order');

class OrderController {
  // Create a new order (Express Interest) - Public API (no auth required)
  static async createOrder(req, res) {
    try {
      const {
        productId,
        productName,
        productPrice,
        productImage,
        artisan,
        productLocation,
        customerDetails
      } = req.body;

      console.log('Received customerDetails:', customerDetails);

      // Validate required fields
      if (!productId || !productName || !productPrice) {
        return res.status(400).json({
          success: false,
          error: 'Product information is required'
        });
      }

      if (!customerDetails) {
        return res.status(400).json({
          success: false,
          error: 'Customer details are required'
        });
      }

      const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      const missingFields = requiredFields.filter(field => !customerDetails[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Generate unique order number
      const generateOrderNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD${timestamp}${random}`.toUpperCase();
      };

      // Create order object with FULL customerDetails
      const orderData = {
        productId,
        productName: productName.trim(),
        productPrice: Number(productPrice),
        productImage: productImage || '',
        artisan: (artisan || 'Unknown Artisan').trim(),
        productLocation: (productLocation || 'Unknown Location').trim(),
        customerDetails: {
          name: customerDetails.name.trim(),
          email: customerDetails.email.toLowerCase().trim(),
          phone: customerDetails.phone.trim(),
          address: customerDetails.address.trim(),
          city: customerDetails.city.trim(),
          state: customerDetails.state.trim(),
          pincode: customerDetails.pincode.trim(),
          message: (customerDetails.message || '').trim()
        },
        orderNumber: generateOrderNumber(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        adminNotes: [{
          note: 'Interest expressed by customer',
          addedBy: 'System',
          createdAt: new Date()
        }]
      };

      console.log('Order data being saved:', JSON.stringify(orderData, null, 2));

      const order = new Order(orderData);
      await order.save();

      console.log('Order saved successfully:', order);

      res.status(201).json({
        success: true,
        message: 'Interest submitted successfully! We will contact you within 24 hours.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerDetails.name,
          productName: order.productName,
          estimatedContact: 'Within 24 hours'
        }
      });

    } catch (error) {
      console.error('Create order error:', error);
      
      // Handle duplicate order number with retry logic
      if (error.code === 11000 && error.keyPattern?.orderNumber) {
        try {
          // Retry with a new order number
          const generateNewOrderNumber = () => {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            return `ORD${timestamp}${random}R`.toUpperCase();
          };
          
          const {
            productId,
            productName,
            productPrice,
            productImage,
            artisan,
            productLocation,
            customerDetails
          } = req.body;
          
          const retryOrderData = {
            productId,
            productName: productName.trim(),
            productPrice: Number(productPrice),
            productImage: productImage || '',
            artisan: (artisan || 'Unknown Artisan').trim(),
            productLocation: (productLocation || 'Unknown Location').trim(),
            customerDetails: {
              name: customerDetails.name.trim(),
              email: customerDetails.email.toLowerCase().trim(),
              phone: customerDetails.phone.trim(),
              address: customerDetails.address.trim(),
              city: customerDetails.city.trim(),
              state: customerDetails.state.trim(),
              pincode: customerDetails.pincode.trim(),
              message: (customerDetails.message || '').trim()
            },
            orderNumber: generateNewOrderNumber(),
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'cod',
            adminNotes: [{
              note: 'Interest expressed by customer',
              addedBy: 'System',
              createdAt: new Date()
            }]
          };

          const retryOrder = new Order(retryOrderData);
          await retryOrder.save();

          return res.status(201).json({
            success: true,
            message: 'Interest submitted successfully!',
            data: {
              orderId: retryOrder._id,
              orderNumber: retryOrder.orderNumber,
              customerName: retryOrder.customerDetails.name,
              productName: retryOrder.productName,
              estimatedContact: 'Within 24 hours'
            }
          });
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          return res.status(500).json({
            success: false,
            error: 'System error. Please try again later.'
          });
        }
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: errors.join(', ')
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to submit interest. Please try again.'
      });
    }
  }

  // Get order by ID - Admin only
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order details'
      });
    }
  }

  // Get order by order number - Public (for order tracking)
  static async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      
      // Return limited fields for public tracking
      const order = await Order.findOne({ orderNumber }).select(
        'orderNumber productName productPrice productImage status paymentStatus customerDetails.name customerDetails.email createdAt estimatedDelivery'
      );
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order by number error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order details'
      });
    }
  }

  // Get orders by customer email - Public (for customer to view their orders)
  static async getOrdersByCustomer(req, res) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const query = { 'customerDetails.email': email.toLowerCase() };
      
      if (status) {
        query.status = status;
      }
      
      // Return limited fields for customer view
      const orders = await Order.find(query)
        .select('orderNumber productName productPrice productImage status paymentStatus createdAt estimatedDelivery')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await Order.countDocuments(query);
      
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }

  // Cancel order - Public (customer can cancel their own order)
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { 
        cancellationReason, 
        customerNote,
        refundRequired = false,
        customerEmail // For verification
      } = req.body;

      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          error: 'Cancellation reason is required'
        });
      }

      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Verify customer email (optional - for security)
      if (customerEmail && order.customerDetails.email !== customerEmail.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to cancel this order'
        });
      }

      // Check if order can be cancelled
      const nonCancellableStatuses = ['delivered', 'shipped', 'processing'];
      if (nonCancellableStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: `Order cannot be cancelled in ${order.status} status`
        });
      }

      // Update order status and add notes
      order.status = 'cancelled';
      order.updatedAt = new Date();
      order.paymentStatus = refundRequired ? 'refunded' : order.paymentStatus;
      
      // Add cancellation details to admin notes
      const cancellationNote = {
        note: `Order cancelled by customer. Reason: ${cancellationReason}. ${customerNote ? `Customer note: ${customerNote}` : ''} Refund required: ${refundRequired}`,
        addedBy: 'Customer',
        createdAt: new Date()
      };
      
      if (!order.adminNotes) {
        order.adminNotes = [];
      }
      order.adminNotes.push(cancellationNote);
      
      await order.save();

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          cancellationNote: cancellationNote.note,
          refundRequired
        }
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel order'
      });
    }
  }

  // Update order status - Admin only
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      
      const validStatuses = ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status value'
        });
      }
      
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      const updateData = {
        status,
        updatedAt: new Date()
      };
      
      if (adminNote) {
        updateData.$push = {
          adminNotes: {
            note: `${status.toUpperCase()}: ${adminNote}`,
            addedBy: req.user?.name || 'Admin',
            createdAt: new Date()
          }
        };
      }
      
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }

  // Add contact history - Admin only
  static async addContactHistory(req, res) {
    try {
      const { id } = req.params;
      const { method, notes, nextFollowUp } = req.body;
      
      const validMethods = ['email', 'phone', 'whatsapp', 'sms', 'in_person'];
      
      if (!validMethods.includes(method)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact method'
        });
      }
      
      const contactEntry = {
        method,
        date: new Date(),
        notes,
        contactedBy: req.user?.name || 'Admin',
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null
      };
      
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $push: { contactHistory: contactEntry },
          $set: { 
            status: 'contacted',
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Contact history added successfully',
        data: order
      });
    } catch (error) {
      console.error('Add contact history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add contact history'
      });
    }
  }

  // Get all orders with filters - Admin only
static async getAllOrders(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status - ONLY if status is provided and not 'all'
    if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate && endDate && startDate !== 'undefined' && endDate !== 'undefined') {
      try {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      } catch (dateError) {
        console.error('Date parsing error:', dateError);
        // Continue without date filter
      }
    }
    
    // Search functionality - FIXED: Check if search exists and is not empty
    if (search && search.trim() !== '' && search !== 'undefined' && search !== 'null') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'customerDetails.name': searchRegex },
        { 'customerDetails.email': searchRegex },
        { 'customerDetails.phone': searchRegex },
        { orderNumber: searchRegex },
        { productName: searchRegex },
        { 'customerDetails.city': searchRegex },
        { 'customerDetails.state': searchRegex }
      ];
    }
    
    console.log('Executing query:', JSON.stringify(query, null, 2));
    
    // Build sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'productPrice', 'orderNumber'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    
    // Parse pagination values safely
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skipNum = (pageNum - 1) * limitNum;
    
    // Execute main query with error handling
    let orders = [];
    try {
      orders = await Order.find(query)
        .sort(sortOptions)
        .limit(limitNum)
        .skip(skipNum)
        .lean(); // Use lean() for better performance
    } catch (dbError) {
      console.error('Database error in find:', dbError);
      // Return empty array instead of throwing
      orders = [];
    }
    
    // Get total count
    let total = 0;
    try {
      total = await Order.countDocuments(query);
    } catch (countError) {
      console.error('Database error in count:', countError);
      total = 0;
    }
    
    // Get status counts for dashboard - with error handling
    let statusCounts = [];
    try {
      statusCounts = await Order.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'unknown'] },
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (aggError) {
      console.error('Aggregation error:', aggError);
      statusCounts = [];
    }
    
    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayOrders = 0;
    try {
      todayOrders = await Order.countDocuments({
        createdAt: { $gte: today }
      });
    } catch (todayError) {
      console.error('Error counting today\'s orders:', todayError);
      todayOrders = 0;
    }
    
    // Format status counts safely
    const statusCountsObj = {};
    if (Array.isArray(statusCounts)) {
      statusCounts.forEach(item => {
        if (item && item._id) {
          statusCountsObj[item._id] = item.count || 0;
        }
      });
    }
    
    // Ensure all expected statuses exist
    const expectedStatuses = ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    expectedStatuses.forEach(status => {
      if (!statusCountsObj[status]) {
        statusCountsObj[status] = 0;
      }
    });
    
    // Calculate total pages safely
    const totalPages = Math.ceil((total || 0) / limitNum) || 1;
    
    console.log('Successfully fetched orders:', {
      count: orders.length,
      total,
      page: pageNum,
      pages: totalPages
    });
    
    res.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total || 0,
          pages: totalPages
        },
        stats: {
          statusCounts: statusCountsObj,
          totalOrders: total || 0,
          todayOrders: todayOrders || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get all orders error - DETAILED:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more helpful error message
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Get orders summary for dashboard - Admin only
  static async getOrdersSummary(req, res) {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      // Get daily summary for chart
      const dailySummary = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: last30Days }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 },
            totalValue: { $sum: "$productPrice" }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ]);
      
      // Process for chart data
      const chartData = {};
      const statuses = ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      dailySummary.forEach(item => {
        const date = item._id.date;
        if (!chartData[date]) {
          chartData[date] = { 
            date, 
            pending: 0, 
            contacted: 0, 
            confirmed: 0, 
            processing: 0, 
            shipped: 0, 
            delivered: 0, 
            cancelled: 0 
          };
        }
        chartData[date][item._id.status] = item.count;
      });
      
      // Get status counts
      const statusCounts = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Get recent orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber customerDetails.name productName status createdAt productPrice');
      
      // Get total revenue
      const revenueData = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$productPrice" }
          }
        }
      ]);
      
      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      
      // Get pending orders count
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      
      // Get total orders
      const totalOrders = await Order.countDocuments();
      
      res.json({
        success: true,
        data: {
          chartData: Object.values(chartData),
          statusCounts: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          totalOrders,
          pendingOrders,
          totalRevenue,
          recentOrders,
          todayOrders: await Order.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
          })
        }
      });
    } catch (error) {
      console.error('Get orders summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders summary'
      });
    }
  }

  // Bulk update orders - Admin only
  static async bulkUpdateOrders(req, res) {
    try {
      const { orderIds, action, value } = req.body;
      
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order IDs are required'
        });
      }
      
      let updateData = {};
      
      switch (action) {
        case 'status':
          const validStatuses = ['pending', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
          if (!validStatuses.includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid status value'
            });
          }
          updateData = { status: value, updatedAt: new Date() };
          break;
          
        case 'delete':
          // Soft delete or actual delete based on your requirement
          await Order.deleteMany({ _id: { $in: orderIds } });
          return res.json({
            success: true,
            message: `${orderIds.length} orders deleted successfully`
          });
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }
      
      const result = await Order.updateMany(
        { _id: { $in: orderIds } },
        updateData
      );
      
      res.json({
        success: true,
        message: `${result.modifiedCount} orders updated successfully`,
        data: result
      });
    } catch (error) {
      console.error('Bulk update orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update orders'
      });
    }
  }

  // Export orders - Admin only
  static async exportOrders(req, res) {
    try {
      const { format = 'json', ...filters } = req.query;
      
      // Build query based on filters (similar to getAllOrders)
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      const orders = await Order.find(query).sort({ createdAt: -1 });
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Order Number,Date,Customer Name,Email,Phone,Product,Price,Status,Payment Status\n';
        const csvRows = orders.map(order => {
          return `${order.orderNumber},${order.createdAt.toISOString().split('T')[0]},${order.customerDetails.name},${order.customerDetails.email},${order.customerDetails.phone},${order.productName},${order.productPrice},${order.status},${order.paymentStatus}`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        return res.send(csvHeader + csvRows);
      }
      
      // Default JSON export
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Export orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export orders'
      });
    }
  }
}

module.exports = OrderController;