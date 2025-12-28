const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Since OrderController is a class, access static methods with the class name
router.post('/express-interest', OrderController.createOrder);
router.get('/:id', OrderController.getOrderById);
router.get('/order-number/:orderNumber', OrderController.getOrderByNumber);
router.get('/customer/:email', OrderController.getOrdersByCustomer);
router.put('/:id/cancel', OrderController.cancelOrder);
router.put('/:id/status', OrderController.updateOrderStatus);
router.post('/:id/contact', OrderController.addContactHistory);
router.get('/', OrderController.getAllOrders);
router.get('/summary/dashboard', OrderController.getOrdersSummary);

module.exports = router;