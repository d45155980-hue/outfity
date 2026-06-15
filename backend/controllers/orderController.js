const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const sse = require('../utils/sseManager');
const { notifyBoth, notifyAdmins } = require('../utils/notificationService');

exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      shippingPrice,
      discount,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler('No order items provided', 400));
    }

    for (const item of orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return next(new ErrorHandler(`Invalid product ID: ${item.product}`, 400));
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorHandler(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
      }
    }

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const deliveryCharge = itemsPrice > 999 ? 0 : 40;
    const totalPrice = itemsPrice + shippingPrice + deliveryCharge - (discount || 0);

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      shippingPrice,
      deliveryCharge,
      discount: discount || 0,
      couponCode,
      totalPrice,
    });

    const itemsHtml = orderItems.map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td></tr>`
    ).join('');

    try {
      await sendEmail({
        email: shippingAddress.email,
        subject: `Order Confirmed #${order._id} - OUTFITY`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:#1c1917;color:#fff;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:22px;">OUTFITY</h1>
              <p style="margin:4px 0 0;opacity:.8;">Order Confirmed</p>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #eee;">
              <p style="margin:0 0 16px;">Hi <strong>${shippingAddress.fullName}</strong>,</p>
              <p style="margin:0 0 16px;color:#555;">Your order has been placed successfully.</p>
              <p style="margin:0 0 20px;font-size:13px;color:#888;">Order #${order._id}</p>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Price</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="border-top:2px solid #1c1917;margin-top:12px;padding-top:12px;font-size:13px;">
                <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Subtotal</span><span>₹${itemsPrice}</span></p>
                <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Shipping</span><span>₹${shippingPrice}</span></p>
                ${discount ? `<p style="display:flex;justify-content:space-between;margin:4px 0;color:#16a34a;"><span>Discount</span><span>-₹${discount}</span></p>` : ''}
                <p style="display:flex;justify-content:space-between;margin:8px 0 0;font-weight:bold;font-size:15px;"><span>Total</span><span>₹${totalPrice}</span></p>
              </div>
            </div>
            <div style="text-align:center;padding:16px;font-size:11px;color:#999;">
              <p style="margin:0;">OUTFITY — Premium Fashion</p>
            </div>
          </div>`,
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    sse.broadcast('order_created', { order: order._id });
    notifyBoth(req.user.id, 'order_created', { orderNumber: order._id.toString().slice(-8).toUpperCase(), orderId: order._id });

    res.status(201).json({ success: true, order });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorHandler(`Invalid ID format: ${error.value}`, 400));
    }
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name images')
      .sort('-createdAt');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized to access this order', 403));
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to cancel this order', 403));
    }
    if (order.orderStatus !== 'Processing') {
      return next(new ErrorHandler('Order cannot be cancelled at current status', 400));
    }
    order.orderStatus = 'Cancelled';
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
    await order.save();
    sse.broadcast('order_updated', { order: order._id, status: 'Cancelled' });
    notifyBoth(req.user.id, 'order_cancelled', { orderNumber: order._id.toString().slice(-8).toUpperCase(), orderId: order._id });
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .sort('-createdAt');
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
    res.status(200).json({ success: true, totalAmount, orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }
    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return next(new ErrorHandler(`Order already ${order.orderStatus}`, 400));
    }
    const prevStatus = order.orderStatus;
    order.orderStatus = req.body.status;
    if (req.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
    }
    if (req.body.status === 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }
    await order.save();

    const userEmail = order.user?.email || order.shippingAddress?.email;
    const userName = order.user?.name || order.shippingAddress?.fullName;

    if (userEmail) {
      const statusMessages = {
        Confirmed: 'Your order has been accepted and confirmed. We\'re preparing your items!',
        Packed: 'Your order has been packed and is ready for shipping.',
        Shipped: 'Your order has been shipped and is on its way!',
        OutForDelivery: 'Your order is out for delivery — expect it soon!',
        Delivered: 'Your order has been delivered. Thank you for shopping with OUTFITY!',
        Cancelled: 'Your order has been cancelled by the admin. If you have any questions, please contact us.',
      };

      try {
        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
          email: userEmail,
          subject: `Order ${req.body.status} #${order._id} - OUTFITY`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
              <div style="background:#1c1917;color:#fff;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;font-size:22px;">OUTFITY</h1>
                <p style="margin:4px 0 0;opacity:.8;">Order ${req.body.status}</p>
              </div>
              <div style="padding:24px;background:#fff;border:1px solid #eee;">
                <p style="margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>
                <p style="margin:0 0 16px;color:#555;">${statusMessages[req.body.status] || 'Your order status has been updated.'}</p>
                <p style="margin:0 0 16px;font-size:13px;color:#888;">Order #${order._id}</p>
                <p style="margin:0;font-size:13px;">Status: <strong>${req.body.status}</strong></p>
                <p style="margin:8px 0 0;font-size:13px;">Total: <strong>₹${order.totalPrice}</strong></p>
              </div>
              <div style="text-align:center;padding:16px;font-size:11px;color:#999;">
                <p style="margin:0;">OUTFITY — Premium Fashion</p>
              </div>
            </div>`,
        });
      } catch (emailError) {
        console.log('Status notification email failed:', emailError.message);
      }
    }

    sse.broadcast('order_updated', { order: order._id, status: order.orderStatus });
    notifyBoth(order.user?._id || order.user, 'order_status', {
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      status: order.orderStatus,
      orderId: order._id,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
