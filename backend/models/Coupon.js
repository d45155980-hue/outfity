const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please enter coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Please select coupon type'],
  },
  value: {
    type: Number,
    required: [true, 'Please enter coupon value'],
    min: [0, 'Value cannot be negative'],
  },
  minOrder: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 100,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
