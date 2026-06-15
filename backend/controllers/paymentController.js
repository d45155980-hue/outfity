const ErrorHandler = require('../utils/errorHandler');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('your_')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('Stripe initialization skipped:', e.message);
}

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith('your_')) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.log('Razorpay initialization skipped:', e.message);
}

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    if (!amount) {
      return next(new ErrorHandler('Amount is required', 400));
    }
    if (!razorpay) {
      return next(new ErrorHandler('Razorpay not configured', 503));
    }
    const options = {
      amount,
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new ErrorHandler('Missing payment verification details', 400));
    }
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const isValid = expectedSignature === razorpay_signature;
    res.status(200).json({
      success: isValid,
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed',
    });
  } catch (error) {
    next(error);
  }
};

exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    if (!amount) {
      return next(new ErrorHandler('Amount is required', 400));
    }
    if (!stripe) {
      return next(new ErrorHandler('Stripe not configured', 503));
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'inr',
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};
