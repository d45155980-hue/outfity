const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/admin/all', protect, authorizeAdmin, getAllOrders);
router.put('/admin/:id/status', protect, authorizeAdmin, updateOrderStatus);
router.delete('/admin/:id', protect, authorizeAdmin, deleteOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
