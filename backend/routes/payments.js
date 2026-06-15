const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/stripe/create', protect, createStripePaymentIntent);

module.exports = router;
