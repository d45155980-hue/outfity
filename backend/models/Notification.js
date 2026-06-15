const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'order_created', 'order_cancelled', 'order_status',
      'product_created', 'product_updated', 'product_deleted',
      'review_submitted', 'review_approved', 'review_deleted',
      'coupon_created', 'coupon_updated', 'coupon_deleted',
      'banner_created', 'banner_updated', 'banner_deleted',
      'category_created', 'category_updated', 'category_deleted',
      'user_registered', 'user_blocked', 'user_unblocked',
      'site_maintenance', 'site_payments',
      'admin_broadcast',
    ],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  forAdmin: { type: Boolean, default: false },
  broadcast: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ broadcast: 1, createdAt: -1 });
notificationSchema.index({ forAdmin: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
