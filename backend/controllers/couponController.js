const Coupon = require('../models/Coupon');
const ErrorHandler = require('../utils/errorHandler');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return next(new ErrorHandler('Coupon code is required', 400));
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return next(new ErrorHandler('Invalid coupon code', 404));
    }
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
      return next(new ErrorHandler('Coupon has expired', 400));
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return next(new ErrorHandler('Coupon usage limit reached', 400));
    }
    if (orderAmount && orderAmount < coupon.minOrder) {
      return next(new ErrorHandler(`Minimum order amount of ₹${coupon.minOrder} required`, 400));
    }
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }
    res.status(200).json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        isFreeShipping: coupon.type === 'free_shipping',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const all = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: now } },
      ],
    }).sort('-createdAt').limit(10);
    const coupons = all.filter(c => c.usedCount < c.maxUses && (!c.expiresAt || c.expiresAt >= now));
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    sse.broadcast('coupon_created', { coupon: coupon._id });
    notifyAdmins('coupon_created', { code: coupon.code, discount: coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}` });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(new ErrorHandler('Coupon not found', 404));
    }
    coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    sse.broadcast('coupon_updated', { coupon: coupon._id });
    notifyAdmins('coupon_updated', { code: coupon.code });
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(new ErrorHandler('Coupon not found', 404));
    }
    await coupon.deleteOne();
    sse.broadcast('coupon_deleted', { coupon: coupon._id });
    notifyAdmins('coupon_deleted', { code: coupon.code });
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
