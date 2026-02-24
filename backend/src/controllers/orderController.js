// controllers/OrderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');

class OrderController {
  // Create a new order
  static async createOrder(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { items, productId, customerDetails, quantity = 1, paymentMethod = 'cod', notes } = req.body;

      // Validate customer details
      const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      const missingFields = requiredFields.filter(field => !customerDetails?.[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ success: false, error: `Missing fields: ${missingFields.join(', ')}` });
      }

      // Prepare order items
      let orderItems = [];
      
      if (items?.length) {
        for (const item of items) {
          const product = await Product.findById(item.productId).populate('artisan');
          if (!product) return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
          
          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.images?.[0] || '',
            artisan: product.artisan?._id || null,
            artisanName: product.artisan?.businessName || product.artisan?.name || 'Unknown',
            totalPrice: product.price * item.quantity
          });
        }
      } else if (productId) {
        const product = await Product.findById(productId).populate('artisan');
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || '',
          artisan: product.artisan?._id || null,
          artisanName: product.artisan?.businessName || product.artisan?.name || 'Unknown',
          totalPrice: product.price * quantity
        });
      } else {
        return res.status(400).json({ success: false, error: 'Order must contain items' });
      }

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.18;
      const shippingCost = subtotal > 500 ? 0 : 40;
      const total = subtotal + tax + shippingCost;

      // Create order
      const order = new Order({
        orderNumber: `ORD-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: {
          userId: req.user.role === 'user' ? req.user._id : null,
          name: customerDetails.name,
          email: customerDetails.email.toLowerCase(),
          phone: customerDetails.phone,
          shippingAddress: {
            street: customerDetails.address,
            city: customerDetails.city,
            state: customerDetails.state,
            postalCode: customerDetails.pincode,
            country: customerDetails.country || 'India'
          }
        },
        items: orderItems,
        subtotal,
        tax,
        shippingCost,
        total,
        currency: 'INR',
        status: 'pending',
        payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'processing' },
        shipping: { method: 'standard', shippingCost },
        source: req.user.role === 'admin' ? 'admin_panel' : 'website'
      });

      await order.save();

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, error: 'Failed to place order' });
    }
  }

  // Get user's orders
  static async getMyOrders(req, res) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

      const orders = await Order.find({ 'customer.userId': req.user._id })
        .select('orderNumber items subtotal total status payment.status createdAt')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Get my orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  }

  // Get artisan orders
  static async getArtisanOrders(req, res) {
    try {
      if (!req.user || !['artisan', 'admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const artisanId = req.user.artisanId || req.user._id;
      const orders = await Order.find({ 'items.artisan': artisanId })
        .select('orderNumber items customer.name status total createdAt')
        .sort({ createdAt: -1 });

      // Filter items for this artisan
      const formattedOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(item => item.artisan?.toString() === artisanId.toString())
      }));

      res.json({ success: true, data: formattedOrders });
    } catch (error) {
      console.error('Get artisan orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

      const order = await Order.findById(req.params.id)
        .populate('customer.userId', 'email')
        .populate('items.product', 'name')
        .populate('items.artisan', 'businessName');

      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      // Check authorization
      if (req.user.role === 'user' && order.customer.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      if (req.user.role === 'artisan') {
        const hasArtisanItems = order.items.some(item => 
          item.artisan?._id.toString() === (req.user.artisanId || req.user._id).toString()
        );
        if (!hasArtisanItems) return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  }

  // Update order status (Admin only)
  static async updateOrderStatus(req, res) {
    try {
      if (!req.user || !['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { status, reason } = req.body;
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      order.status = status;
      order.statusHistory.push({
        status,
        changedBy: req.user._id,
        reason: reason || `Status updated to ${status}`,
        changedAt: new Date()
      });

      await order.save();

      res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

      const { cancellationReason } = req.body;
      if (!cancellationReason) {
        return res.status(400).json({ success: false, error: 'Cancellation reason required' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      // Check authorization
      if (req.user.role === 'user') {
        if (order.customer.userId?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        if (!['pending', 'confirmed'].includes(order.status)) {
          return res.status(400).json({ success: false, error: `Cannot cancel order in ${order.status} status` });
        }
      }

      order.status = 'cancelled';
      order.statusHistory.push({
        status: 'cancelled',
        changedBy: req.user._id,
        reason: cancellationReason,
        changedAt: new Date()
      });

      await order.save();

      res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel order' });
    }
  }

  // Get all orders (Admin only)
  static async getAllOrders(req, res) {
    try {
      if (!req.user || !['admin', 'superAdmin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { page = 1, limit = 20, status, search } = req.query;
      const query = {};

      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { 'customer.name': new RegExp(search, 'i') },
          { 'customer.email': new RegExp(search, 'i') },
          { orderNumber: new RegExp(search, 'i') }
        ];
      }

      const orders = await Order.find(query)
        .populate('customer.userId', 'email')
        .populate('items.artisan', 'businessName')
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
      console.error('Get all orders error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  }

  // Get order by order number (public)
  static async getOrderByNumber(req, res) {
    try {
      const order = await Order.findOne({ orderNumber: req.params.orderNumber })
        .select('orderNumber items customer.name status total createdAt');

      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Get order by number error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  }
}

module.exports = OrderController;