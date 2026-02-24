// controllers/OrderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');

class OrderController {
  // Create a new order - Authenticated users (user, admin, superAdmin)
  static async createOrder(req, res) {
    try {
      // Check authorization - Only authenticated users can create orders
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Please login to place an order.'
        });
      }

      // All authenticated roles can create orders (user, admin, superAdmin)
      const allowedRoles = ['user', 'admin', 'superAdmin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Only users and admins can create orders.'
        });
      }

      const {
        items, // Array of items for multi-product orders
        productId, // For backward compatibility (single product)
        productName,
        productPrice,
        productImage,
        artisan,
        productLocation,
        customerDetails,
        quantity = 1,
        variant = '',
        paymentMethod = 'cod',
        shippingMethod = 'standard',
        billingAddressSameAsShipping = true,
        billingAddress,
        couponCode,
        notes
      } = req.body;

      console.log('Received order request from user:', req.user._id, 'Role:', req.user.role);

      // Validate customer details
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

      // Prepare order items
      let orderItems = [];
      
      if (items && Array.isArray(items) && items.length > 0) {
        // Multi-item order
        for (const item of items) {
          // Validate each item
          if (!item.productId || !item.quantity || item.quantity < 1) {
            return res.status(400).json({
              success: false,
              error: 'Each item must have productId and valid quantity'
            });
          }

          // Fetch product details to get artisan info
          const product = await Product.findById(item.productId).populate('artisan');
          if (!product) {
            return res.status(404).json({
              success: false,
              error: `Product not found: ${item.productId}`
            });
          }

          orderItems.push({
            product: product._id,
            variant: item.variant || '',
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            sku: product.sku || '',
            image: product.images && product.images[0] ? product.images[0] : '',
            artisan: product.artisan ? product.artisan._id : null,
            artisanName: product.artisan ? (product.artisan.businessName || product.artisan.name) : 'Unknown Artisan',
            discountApplied: 0,
            taxAmount: 0,
            totalPrice: product.price * item.quantity
          });
        }
      } else if (productId) {
        // Backward compatibility: single product order
        // Validate product
        const product = await Product.findById(productId).populate('artisan');
        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Product not found'
          });
        }

        orderItems.push({
          product: product._id,
          variant: variant,
          name: productName || product.name,
          price: Number(productPrice) || product.price,
          quantity: quantity,
          sku: product.sku || '',
          image: productImage || (product.images && product.images[0] ? product.images[0] : ''),
          artisan: product.artisan ? product.artisan._id : null,
          artisanName: product.artisan ? (product.artisan.businessName || product.artisan.name) : (artisan || 'Unknown Artisan'),
          discountApplied: 0,
          taxAmount: 0,
          totalPrice: (Number(productPrice) || product.price) * quantity
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Order must contain at least one item'
        });
      }

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Calculate tax (example: 18% GST)
      const taxRate = 0.18;
      const tax = subtotal * taxRate;
      
      // Calculate shipping cost (example logic)
      let shippingCost = 0;
      if (shippingMethod === 'express') {
        shippingCost = 100;
      } else if (shippingMethod === 'priority') {
        shippingCost = 200;
      } else {
        shippingCost = subtotal > 500 ? 0 : 40; // Free shipping above ₹500
      }

      // Apply discount if coupon code exists
      let discount = 0;
      if (couponCode) {
        // Add coupon validation logic here
        discount = 0; // Placeholder
      }

      const total = subtotal + tax + shippingCost - discount;

      // Generate unique order number
      const generateOrderNumber = () => {
        const prefix = 'ORD';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${timestamp}-${random}`;
      };

      // Prepare billing address
      let finalBillingAddress = {
        sameAsShipping: billingAddressSameAsShipping
      };

      if (!billingAddressSameAsShipping && billingAddress) {
        finalBillingAddress = {
          ...billingAddress,
          sameAsShipping: false
        };
      }

      // Create order object matching the comprehensive schema
      const orderData = {
        orderNumber: generateOrderNumber(),
        
        // Customer Information
        customer: {
          userId: req.user.role === 'user' ? req.user._id : null, // Link to user account if regular user
          name: customerDetails.name.trim(),
          email: customerDetails.email.toLowerCase().trim(),
          phone: customerDetails.phone.trim(),
          shippingAddress: {
            street: customerDetails.address.trim(),
            city: customerDetails.city.trim(),
            state: customerDetails.state.trim(),
            postalCode: customerDetails.pincode.trim(),
            country: customerDetails.country || 'India',
            landmark: customerDetails.landmark || ''
          },
          billingAddress: finalBillingAddress,
          message: (customerDetails.message || notes || '').trim()
        },

        // Order Items
        items: orderItems,

        // Order Totals
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        shippingCost: shippingCost,
        total: total,
        currency: 'INR',

        // Order Status
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          changedBy: req.user._id,
          reason: 'Initial order creation',
          notes: `Order placed by ${req.user.role}: ${req.user.email}`,
          changedAt: new Date()
        }],

        // Payment Information
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'processing',
          amountPaid: 0,
          paymentGateway: paymentMethod === 'online' ? 'razorpay' : null
        },

        // Shipping Information
        shipping: {
          method: shippingMethod,
          shippingCost: shippingCost,
          packagingFee: 0
        },

        // Commission (will be calculated per artisan later)
        commission: {
          rate: 0,
          amount: 0,
          paidToArtisan: false
        },

        // Order Metadata
        source: req.user.role === 'admin' || req.user.role === 'superAdmin' ? 'admin_panel' : 'website',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: req.useragent ? req.useragent.isMobile ? 'mobile' : 
                   req.useragent.isTablet ? 'tablet' : 'desktop' : 'unknown',

        // Notes
        notes: [{
          note: `Order created by ${req.user.role}: ${req.user.email}`,
          addedBy: req.user._id,
          type: req.user.role === 'user' ? 'customer_note' : 'internal_note',
          isInternal: req.user.role !== 'user',
          createdAt: new Date()
        }],

        // Admin tracking
        assignedTo: req.user.role === 'admin' || req.user.role === 'superAdmin' ? req.user._id : null,
        priority: 'normal',

        // Customer Communication Preferences
        communicationPrefs: {
          sendSmsUpdates: true,
          sendEmailUpdates: true,
          sendWhatsappUpdates: false
        },

        // Analytics
        convertedFromWishlist: false,
        couponCode: couponCode || null
      };

      console.log('Order data being saved:', JSON.stringify(orderData, null, 2));

      const order = new Order(orderData);
      await order.save();

      console.log('Order saved successfully:', order.orderNumber);

      // Prepare response based on user role
      const responseData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        totalAmount: order.total,
        status: order.status,
        paymentStatus: order.payment.status,
        itemsCount: order.items.length,
        estimatedDelivery: order.estimatedDeliveryDate
      };

      // Add admin-specific data if user is admin/superAdmin
      if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
        responseData.adminView = {
          artisanBreakdown: order.artisans,
          commission: order.commission,
          fullDetails: order
        };
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: responseData
      });

    } catch (error) {
      console.error('Create order error:', error);
      
      // Handle duplicate order number with retry logic
      if (error.code === 11000 && error.keyPattern?.orderNumber) {
        try {
          // Retry with a new order number
          const generateNewOrderNumber = () => {
            const prefix = 'ORD';
            const timestamp = Date.now().toString().slice(-8);
            const random = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}-${timestamp}-${random}`;
          };
          
          // Update order number and retry save
          if (req.body.items) {
            req.body.items = JSON.parse(JSON.stringify(req.body.items));
          }
          
          // Recreate order data with new number
          const retryOrderData = { ...orderData, orderNumber: generateNewOrderNumber() };
          const retryOrder = new Order(retryOrderData);
          await retryOrder.save();

          return res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: {
              orderId: retryOrder._id,
              orderNumber: retryOrder.orderNumber,
              customerName: retryOrder.customer.name,
              productName: retryOrder.items[0]?.name,
              estimatedDelivery: retryOrder.estimatedDeliveryDate
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
        error: 'Failed to place order. Please try again.'
      });
    }
  }

  // Get orders for the authenticated user (customer view)
  static async getMyOrders(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { page = 1, limit = 10, status } = req.query;
      
      const query = { 
        $or: [
          { 'customer.userId': req.user._id },
          { 'customer.email': req.user.email.toLowerCase() }
        ]
      };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      const orders = await Order.find(query)
        .select('orderNumber items subtotal total status payment.status createdAt shipping.estimatedDelivery')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await Order.countDocuments(query);
      
      // Format orders for customer view
      const formattedOrders = orders.map(order => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        date: order.formattedDate,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          artisanName: item.artisanName
        })),
        total: order.total,
        status: order.status,
        paymentStatus: order.payment.status,
        estimatedDelivery: order.estimatedDeliveryDate,
        itemCount: order.itemCount
      }));
      
      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }

  // Get orders by artisan ID - For artisans to view their orders
  static async getArtisanOrders(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only artisans, admins, and superAdmins can access this
      const allowedRoles = ['artisan', 'admin', 'superAdmin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Artisan privileges required.'
        });
      }

      let artisanId = req.params.artisanId || req.query.artisanId;
      
      // If user is an artisan, use their own ID
      if (req.user.role === 'artisan') {
        artisanId = req.user.artisanId || req.user._id;
      }

      if (!artisanId) {
        return res.status(400).json({
          success: false,
          error: 'Artisan ID is required'
        });
      }

      const { page = 1, limit = 20, status, startDate, endDate } = req.query;
      
      // Build query for items containing this artisan
      const query = { 'items.artisan': artisanId };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const orders = await Order.find(query)
        .select('orderNumber items customer.name customer.email customer.phone shippingAddress status payment.status total createdAt shipping.estimatedDelivery notes')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      const total = await Order.countDocuments(query);
      
      // Filter items for this artisan and format response
      const formattedOrders = orders.map(order => {
        const artisanItems = order.items.filter(item => 
          item.artisan && item.artisan.toString() === artisanId
        );
        
        const artisanSubtotal = artisanItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderDate: order.formattedDate,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone
          },
          shippingAddress: order.customer.shippingAddress,
          items: artisanItems.map(item => ({
            productId: item.product,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            image: item.image,
            variant: item.variant
          })),
          itemCount: artisanItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: artisanSubtotal,
          total: order.total, // Full order total
          status: order.status,
          paymentStatus: order.payment.status,
          estimatedDelivery: order.estimatedDeliveryDate,
          notes: order.notes.filter(note => !note.isInternal || req.user.role !== 'artisan')
                             .map(note => ({
                               note: note.note,
                               type: note.type,
                               createdAt: note.createdAt
                             }))
        };
      });
      
      // Get statistics for this artisan
      const stats = await Order.aggregate([
        {
          $match: { 'items.artisan': mongoose.Types.ObjectId(artisanId) }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { 
              $sum: {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$items',
                        as: 'item',
                        cond: { $eq: ['$$item.artisan', mongoose.Types.ObjectId(artisanId)] }
                      }
                    },
                    as: 'filteredItem',
                    in: '$$filteredItem.totalPrice'
                  }
                }
              }
            },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            processingOrders: {
              $sum: { $cond: [{ $in: ['$status', ['confirmed', 'processing', 'ready_to_ship']] }, 1, 0] }
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          statistics: stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            completedOrders: 0
          }
        }
      });
    } catch (error) {
      console.error('Get artisan orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artisan orders'
      });
    }
  }

  // Update order status as artisan (for their own items)
  static async updateArtisanOrderStatus(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only artisans, admins, and superAdmins can update order status
      const allowedRoles = ['artisan', 'admin', 'superAdmin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.'
        });
      }

      const { orderId } = req.params;
      const { status, notes, itemIds } = req.body;

      // Artisan-specific statuses they can set
      const artisanAllowedStatuses = ['confirmed', 'processing', 'ready_to_ship', 'cancelled'];
      
      if (!artisanAllowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Artisans can only set status to: ${artisanAllowedStatuses.join(', ')}`
        });
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // If user is an artisan, verify they only update their own items
      if (req.user.role === 'artisan') {
        const artisanId = req.user.artisanId || req.user._id;
        const artisanItems = order.items.filter(item => 
          item.artisan && item.artisan.toString() === artisanId.toString()
        );

        if (artisanItems.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You are not authorized to update this order'
          });
        }

        // If specific items provided, verify they belong to this artisan
        if (itemIds && itemIds.length > 0) {
          const invalidItems = itemIds.filter(itemId => 
            !artisanItems.some(item => item._id.toString() === itemId)
          );
          
          if (invalidItems.length > 0) {
            return res.status(403).json({
              success: false,
              error: 'Some items do not belong to you'
            });
          }
        }
      }

      // Update the order status using the model's method
      const updatedOrder = await order.updateStatus(
        status,
        req.user._id,
        `Status updated by ${req.user.role}`,
        notes || ''
      );

      // Add artisan-specific note
      if (notes) {
        await order.addNote(
          notes,
          req.user._id,
          'status_update',
          req.user.role === 'artisan' // Internal if admin, public if artisan?
        );
      }

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          updatedAt: order.updatedAt
        }
      });
    } catch (error) {
      console.error('Update artisan order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }

  // Get order by ID - Role-based access
  static async getOrderById(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { id } = req.params;
      
      let query = Order.findById(id);
      
      // Role-based field selection
      if (req.user.role === 'user') {
        // Users can only see their own orders with limited fields
        query = query.findOne({ 
          _id: id,
          $or: [
            { 'customer.userId': req.user._id },
            { 'customer.email': req.user.email.toLowerCase() }
          ]
        }).select('orderNumber items customer.name customer.email customer.phone shippingAddress status payment.status total createdAt shipping.estimatedDelivery');
      } else if (req.user.role === 'artisan') {
        // Artisans can see orders containing their products
        const artisanId = req.user.artisanId || req.user._id;
        query = query.findOne({
          _id: id,
          'items.artisan': artisanId
        }).select('orderNumber items customer.name customer.email customer.phone shippingAddress status payment.status total createdAt shipping.estimatedDelivery notes');
      }
      // Admins and superAdmins see full details
      
      const order = await query
        .populate('customer.userId', 'username email')
        .populate('items.product', 'name sku')
        .populate('items.artisan', 'businessName name email phone')
        .populate('assignedTo', 'username email')
        .populate('notes.addedBy', 'username email role');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found or access denied'
        });
      }

      // Filter items for artisans
      let responseData = order.toObject();
      
      if (req.user.role === 'artisan') {
        const artisanId = req.user.artisanId || req.user._id;
        responseData.items = order.items.filter(item => 
          item.artisan && item.artisan._id.toString() === artisanId.toString()
        );
        
        // Remove internal notes for artisans
        responseData.notes = order.notes.filter(note => !note.isInternal);
      }

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order details'
      });
    }
  }

  // Get order by order number - Public (limited info)
  static async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      
      const order = await Order.findOne({ orderNumber })
        .select(
          'orderNumber items customer.name status payment.status total createdAt shipping.estimatedDelivery shipping.shippedAt shipping.deliveredAt'
        );
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Format for public view
      const publicOrder = {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        status: order.status,
        paymentStatus: order.payment.status,
        total: order.total,
        orderDate: order.formattedDate,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          artisanName: item.artisanName
        })),
        estimatedDelivery: order.estimatedDeliveryDate,
        tracking: order.shipping.trackingNumber ? {
          carrier: order.shipping.carrier,
          trackingNumber: order.shipping.trackingNumber,
          trackingUrl: order.shipping.trackingUrl,
          shippedAt: order.shipping.shippedAt,
          deliveredAt: order.shipping.deliveredAt
        } : null
      };

      res.json({
        success: true,
        data: publicOrder
      });
    } catch (error) {
      console.error('Get order by number error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order details'
      });
    }
  }

  // Get orders by customer email/ID - Role-based
  static async getOrdersByCustomer(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { email, userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      // Authorization checks
      if (req.user.role === 'user') {
        // Users can only see their own orders
        if (userId && userId !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. You can only view your own orders.'
          });
        }
        if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. You can only view your own orders.'
          });
        }
      }
      
      const query = {};
      if (userId) {
        query['customer.userId'] = userId;
      }
      if (email) {
        query['customer.email'] = email.toLowerCase();
      }
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      // Field selection based on role
      let selectFields = 'orderNumber items customer.name status payment.status total createdAt shipping.estimatedDelivery';
      if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
        selectFields = ''; // Get all fields for admins
      }
      
      const orders = await Order.find(query)
        .select(selectFields)
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

  // Cancel order - Role-based
  static async cancelOrder(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

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

      // Authorization checks
      if (req.user.role === 'user') {
        // Users can only cancel their own orders
        if (order.customer.userId && order.customer.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized to cancel this order'
          });
        }
        
        // Check if order can be cancelled by user
        const userCancellableStatuses = ['pending', 'confirmed'];
        if (!userCancellableStatuses.includes(order.status)) {
          return res.status(400).json({
            success: false,
            error: `Order cannot be cancelled in ${order.status} status`
          });
        }
      } else if (req.user.role === 'artisan') {
        // Artisans can only cancel orders containing their items
        const artisanId = req.user.artisanId || req.user._id;
        const hasArtisanItems = order.items.some(item => 
          item.artisan && item.artisan.toString() === artisanId.toString()
        );
        
        if (!hasArtisanItems) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized to cancel this order'
          });
        }
        
        // Artisans can only cancel in certain statuses
        const artisanCancellableStatuses = ['pending', 'confirmed'];
        if (!artisanCancellableStatuses.includes(order.status)) {
          return res.status(400).json({
            success: false,
            error: `Order cannot be cancelled in ${order.status} status`
          });
        }
      }
      // Admins and superAdmins can cancel any order

      // Update order status using model method
      const cancellationNote = `Order cancelled by ${req.user.role}. Reason: ${cancellationReason}. ${customerNote ? `Customer note: ${customerNote}` : ''}`;
      
      await order.updateStatus(
        'cancelled',
        req.user._id,
        cancellationReason,
        cancellationNote
      );

      // Update payment status if refund required
      if (refundRequired && order.payment.status === 'completed') {
        order.payment.status = 'refunded';
        order.payment.refundAmount = order.total;
        order.payment.refundedAt = new Date();
        order.payment.refundReason = cancellationReason;
        await order.save();
      }

      // Add cancellation note
      await order.addNote(
        cancellationNote,
        req.user._id,
        'customer_note',
        req.user.role !== 'user' // Internal if not user
      );

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment.status,
          refundRequired,
          cancelledAt: new Date()
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

  // Update order status - Admin/SuperAdmin only
  static async updateOrderStatus(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can update order status globally
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      const { id } = req.params;
      const { status, reason, notes } = req.body;
      
      const validStatuses = [
        'pending', 'confirmed', 'processing', 'ready_to_ship', 
        'shipped', 'out_for_delivery', 'delivered', 'cancelled', 
        'refunded', 'on_hold', 'failed'
      ];
      
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
      
      // Update status using model method
      await order.updateStatus(
        status,
        req.user._id,
        reason || `Status updated by admin`,
        notes || ''
      );

      // Add admin note if provided
      if (notes) {
        await order.addNote(
          notes,
          req.user._id,
          'status_update',
          true // Internal note
        );
      }

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          statusHistory: order.statusHistory,
          updatedAt: order.updatedAt
        }
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }

  // Add contact history - Admin/SuperAdmin only
  static async addContactHistory(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can add contact history
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      const { id } = req.params;
      const { method, notes, attachments, scheduledFor } = req.body;
      
      const validMethods = ['email', 'phone', 'whatsapp', 'sms', 'in_app'];
      
      if (!validMethods.includes(method)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact method'
        });
      }
      
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Add contact record using model method
      await order.addContactRecord(
        method,
        req.user._id,
        notes,
        attachments || []
      );

      // Update order status to 'contacted' if it's pending
      if (order.status === 'pending') {
        await order.updateStatus(
          'contacted',
          req.user._id,
          'Customer contacted',
          `Contacted via ${method}`
        );
      }

      // Add note about contact
      await order.addNote(
        `Customer contacted via ${method}. ${notes || ''}`,
        req.user._id,
        'customer_note',
        true
      );

      res.json({
        success: true,
        message: 'Contact history added successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          contactHistory: order.contactHistory,
          status: order.status
        }
      });
    } catch (error) {
      console.error('Add contact history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add contact history'
      });
    }
  }

  // Get all orders with filters - Admin/SuperAdmin only
  static async getAllOrders(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can access all orders
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        search,
        artisan,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const query = {};
      
      // Filter by status
      if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
        query.status = status;
      }
      
      // Filter by artisan
      if (artisan && artisan !== 'all' && artisan !== 'undefined') {
        query['items.artisan'] = artisan;
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
        }
      }
      
      // Search functionality
      if (search && search.trim() !== '' && search !== 'undefined' && search !== 'null') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { 'customer.name': searchRegex },
          { 'customer.email': searchRegex },
          { 'customer.phone': searchRegex },
          { orderNumber: searchRegex },
          { 'items.name': searchRegex },
          { 'customer.shippingAddress.city': searchRegex },
          { 'customer.shippingAddress.state': searchRegex }
        ];
      }
      
      console.log('Executing admin query:', JSON.stringify(query, null, 2));
      
      // Build sort options
      const sortOptions = {};
      const validSortFields = ['createdAt', 'updatedAt', 'total', 'orderNumber'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
      
      // Parse pagination values
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const skipNum = (pageNum - 1) * limitNum;
      
      // Execute main query
      let orders = await Order.find(query)
        .populate('customer.userId', 'username email')
        .populate('items.artisan', 'businessName name')
        .populate('assignedTo', 'username email')
        .sort(sortOptions)
        .limit(limitNum)
        .skip(skipNum)
        .lean();
      
      // Get total count
      const total = await Order.countDocuments(query);
      
      // Get status counts for dashboard
      const statusCounts = await Order.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'unknown'] },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Get today's orders count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today }
      });
      
      // Format status counts
      const statusCountsObj = {};
      statusCounts.forEach(item => {
        if (item && item._id) {
          statusCountsObj[item._id] = item.count || 0;
        }
      });
      
      // Calculate total pages
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
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get orders summary for dashboard - Admin/SuperAdmin only
  static async getOrdersSummary(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can access summary
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

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
            totalValue: { $sum: "$total" }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ]);
      
      // Process for chart data
      const chartData = {};
      const statuses = ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded'];
      
      dailySummary.forEach(item => {
        const date = item._id.date;
        if (!chartData[date]) {
          chartData[date] = { 
            date,
            ...statuses.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})
          };
        }
        if (statuses.includes(item._id.status)) {
          chartData[date][item._id.status] = item.count;
        }
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
        .populate('customer.userId', 'name')
        .populate('items.artisan', 'businessName')
        .select('orderNumber customer.name items total status createdAt');
      
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
            totalRevenue: { $sum: "$total" }
          }
        }
      ]);
      
      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      
      // Get pending orders count
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      
      // Get total orders
      const totalOrders = await Order.countDocuments();
      
      // Get revenue by artisan
      const artisanRevenue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.artisan',
            totalRevenue: { $sum: '$items.totalPrice' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'artisans',
            localField: '_id',
            foreignField: '_id',
            as: 'artisanInfo'
          }
        },
        {
          $project: {
            artisanName: { $arrayElemAt: ['$artisanInfo.businessName', 0] },
            totalRevenue: 1,
            orderCount: 1
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ]);
      
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
          recentOrders: recentOrders.map(order => ({
            id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            items: order.items.length,
            total: order.total,
            status: order.status,
            date: order.formattedDate
          })),
          todayOrders: await Order.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
          }),
          topArtisans: artisanRevenue
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

  // Bulk update orders - Admin/SuperAdmin only
  static async bulkUpdateOrders(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can bulk update
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      const { orderIds, action, value, reason } = req.body;
      
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order IDs are required'
        });
      }
      
      let updateData = {};
      let updateResult;
      
      switch (action) {
        case 'status':
          const validStatuses = [
            'pending', 'confirmed', 'processing', 'ready_to_ship', 
            'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'
          ];
          if (!validStatuses.includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid status value'
            });
          }
          
          // Update each order's status history
          const orders = await Order.find({ _id: { $in: orderIds } });
          
          for (const order of orders) {
            await order.updateStatus(
              value,
              req.user._id,
              reason || 'Bulk status update',
              `Bulk update by ${req.user.role}`
            );
          }
          
          updateResult = { modifiedCount: orders.length };
          break;
          
        case 'assign':
          // Assign orders to admin
          updateData = { 
            assignedTo: value,
            updatedAt: new Date()
          };
          
          updateResult = await Order.updateMany(
            { _id: { $in: orderIds } },
            updateData
          );
          
          // Add notes for each order
          for (const orderId of orderIds) {
            const order = await Order.findById(orderId);
            if (order) {
              await order.addNote(
                `Order assigned to ${value} via bulk update`,
                req.user._id,
                'internal_note',
                true
              );
            }
          }
          break;
          
        case 'priority':
          const validPriorities = ['low', 'normal', 'high', 'urgent'];
          if (!validPriorities.includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid priority value'
            });
          }
          
          updateData = { 
            priority: value,
            updatedAt: new Date()
          };
          
          updateResult = await Order.updateMany(
            { _id: { $in: orderIds } },
            updateData
          );
          break;
          
        case 'delete':
          // Soft delete or actual delete
          if (value === 'permanent') {
            updateResult = await Order.deleteMany({ _id: { $in: orderIds } });
          } else {
            // Soft delete by updating status
            const ordersToDelete = await Order.find({ _id: { $in: orderIds } });
            for (const order of ordersToDelete) {
              await order.updateStatus(
                'cancelled',
                req.user._id,
                'Bulk cancellation',
                'Order cancelled via bulk delete'
              );
            }
            updateResult = { modifiedCount: ordersToDelete.length };
          }
          break;
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }
      
      res.json({
        success: true,
        message: `${updateResult.modifiedCount || updateResult.deletedCount} orders updated successfully`,
        data: {
          action,
          value,
          modifiedCount: updateResult.modifiedCount || updateResult.deletedCount || 0
        }
      });
    } catch (error) {
      console.error('Bulk update orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update orders'
      });
    }
  }

  // Export orders - Admin/SuperAdmin only
  static async exportOrders(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Only admins and superAdmins can export orders
      if (!['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      const { format = 'json', ...filters } = req.query;
      
      // Build query based on filters
      const query = {};
      
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.artisan && filters.artisan !== 'all') {
        query['items.artisan'] = filters.artisan;
      }
      
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      const orders = await Order.find(query)
        .populate('customer.userId', 'email')
        .populate('items.artisan', 'businessName')
        .sort({ createdAt: -1 });
      
      if (format === 'csv') {
        // Prepare CSV data
        const csvHeader = 'Order Number,Date,Customer Name,Email,Phone,Address,Items,Total,Status,Payment Status,Payment Method,Artisans\n';
        const csvRows = orders.map(order => {
          const items = order.items.map(item => 
            `${item.name} (Qty: ${item.quantity}, ₹${item.price})`
          ).join('; ');
          
          const artisans = [...new Set(order.items
            .filter(item => item.artisanName)
            .map(item => item.artisanName)
          )].join('; ');
          
          const address = `${order.customer.shippingAddress.street}, ${order.customer.shippingAddress.city}, ${order.customer.shippingAddress.state} - ${order.customer.shippingAddress.postalCode}`;
          
          return [
            order.orderNumber,
            order.createdAt.toISOString().split('T')[0],
            order.customer.name,
            order.customer.email,
            order.customer.phone,
            address.replace(/,/g, ';'), // Escape commas
            items.replace(/,/g, ';'),
            order.total,
            order.status,
            order.payment.status,
            order.payment.method,
            artisans.replace(/,/g, ';')
          ].join(',');
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csvHeader + csvRows);
      }
      
      // Default JSON export
      res.json({
        success: true,
        data: orders.map(order => ({
          orderNumber: order.orderNumber,
          date: order.createdAt,
          customer: order.customer,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          shippingCost: order.shippingCost,
          total: order.total,
          status: order.status,
          payment: order.payment,
          shipping: order.shipping,
          artisans: order.artisans,
          itemCount: order.itemCount
        }))
      });
    } catch (error) {
      console.error('Export orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export orders'
      });
    }
  }

  // Add note to order - Role-based
  static async addOrderNote(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { id } = req.params;
      const { note, type = 'internal_note' } = req.body;

      if (!note) {
        return res.status(400).json({
          success: false,
          error: 'Note content is required'
        });
      }

      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Authorization checks
      if (req.user.role === 'user') {
        // Users can only add notes to their own orders
        if (order.customer.userId && order.customer.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized to add notes to this order'
          });
        }
        
        // Users can only add customer notes
        if (type !== 'customer_note') {
          return res.status(403).json({
            success: false,
            error: 'You can only add customer notes'
          });
        }
      } else if (req.user.role === 'artisan') {
        // Artisans can only add notes to orders containing their items
        const artisanId = req.user.artisanId || req.user._id;
        const hasArtisanItems = order.items.some(item => 
          item.artisan && item.artisan.toString() === artisanId.toString()
        );
        
        if (!hasArtisanItems) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized to add notes to this order'
          });
        }
      }

      // Determine if note should be internal
      const isInternal = req.user.role !== 'user';

      // Add note using model method
      await order.addNote(
        note,
        req.user._id,
        type,
        isInternal
      );

      res.json({
        success: true,
        message: 'Note added successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          notes: order.notes
        }
      });
    } catch (error) {
      console.error('Add order note error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add note'
      });
    }
  }
}

module.exports = OrderController;