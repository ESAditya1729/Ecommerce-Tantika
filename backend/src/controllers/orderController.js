// controllers/OrderController.js
const Order = require('../models/Order');

class OrderController {
  // Create a new order (Express Interest)
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

      console.log('Received customerDetails:', customerDetails); // Debug log

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

      console.log('Order data being saved:', JSON.stringify(orderData, null, 2)); // Debug log

      const order = new Order(orderData);
      await order.save();

      console.log('Order saved successfully:', order); // Debug log

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

  // Rest of the methods remain the same...
  // Get order by ID
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

  // Get order by order number
  static async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      
      // Use the static method from the updated schema
      const order = await Order.findByOrderNumber(orderNumber);
      
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

  // Get orders by customer email
  static async getOrdersByCustomer(req, res) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const query = { 'customerDetails.email': email.toLowerCase() };
      
      if (status) {
        query.status = status;
      }
      
      const orders = await Order.find(query)
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

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { 
        cancellationReason, 
        customerNote,
        refundRequired = false 
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

  // Update order status (Admin function)
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

  // Add contact history (Admin function)
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

  // Get all orders with filters (Admin function)
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
      
      // Filter by status
      if (status) {
        query.status = status;
      }
      
      // Filter by date range
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Search functionality
      if (search) {
        query.$or = [
          { 'customerDetails.name': { $regex: search, $options: 'i' } },
          { 'customerDetails.email': { $regex: search, $options: 'i' } },
          { 'customerDetails.phone': { $regex: search, $options: 'i' } },
          { orderNumber: { $regex: search, $options: 'i' } },
          { productName: { $regex: search, $options: 'i' } },
          { 'customerDetails.city': { $regex: search, $options: 'i' } },
          { 'customerDetails.state': { $regex: search, $options: 'i' } }
        ];
      }
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const orders = await Order.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await Order.countDocuments(query);
      
      // Get status counts for dashboard
      const statusCounts = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          stats: {
            statusCounts: statusCounts.reduce((acc, curr) => {
              acc[curr._id] = curr.count;
              return acc;
            }, {}),
            totalOrders: total,
            todayOrders: await Order.countDocuments({
              createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0)
              }
            })
          }
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }

  // Get orders summary for dashboard
  static async getOrdersSummary(req, res) {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const summary = await Order.aggregate([
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
      summary.forEach(item => {
        const date = item._id.date;
        if (!chartData[date]) {
          chartData[date] = { date, pending: 0, contacted: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
        }
        chartData[date][item._id.status] = item.count;
      });
      
      const statusCounts = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          chartData: Object.values(chartData),
          statusCounts: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          totalOrders: await Order.countDocuments(),
          pendingOrders: await Order.countDocuments({ status: 'pending' }),
          recentOrders: await Order.find().sort({ createdAt: -1 }).limit(5)
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
}

module.exports = OrderController;