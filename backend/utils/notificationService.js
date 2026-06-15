const Notification = require('../models/Notification');
const User = require('../models/User');
const sse = require('./sseManager');

const notificationTemplates = {
  order_created: {
    title: 'Order Placed 🛍️',
    message: (d) => `Order #${d.orderNumber || ''} placed successfully — we will start preparing your items right away!`,
  },
  order_cancelled: {
    title: 'Order Cancelled',
    message: (d) => `Order #${d.orderNumber || ''} has been cancelled as requested.`,
  },
  order_status: {
    title: 'Order Updated 📦',
    message: (d) => {
      const msgs = {
        Confirmed: 'Your order has been confirmed — get ready!',
        Packed: 'Your items are packed and ready to ship!',
        Shipped: 'Your order is on its way!',
        OutForDelivery: 'Your order is out for delivery — keep an eye out!',
        Delivered: 'Your order has been delivered! Enjoy!',
        Cancelled: 'Your order has been cancelled.',
      };
      return msgs[d.status] || `Your order #${d.orderNumber || ''} is now ${d.status || 'updated'}.`;
    },
  },
  product_created: {
    title: 'New Arrival ✨',
    message: (d) => `"${d.productName || 'New product'}" is now live in the store — check it out!`,
  },
  product_updated: {
    title: 'Product Updated ✏️',
    message: (d) => `"${d.productName || 'Product'}" details have been updated.`,
  },
  product_deleted: {
    title: 'Product Removed',
    message: (d) => `"${d.productName || 'Product'}" has been removed from the catalog.`,
  },
  review_submitted: {
    title: 'New Review ⭐',
    message: (d) => `${d.userName || 'A customer'} submitted a ${d.rating || ''}★ review.`,
  },
  review_approved: {
    title: 'Review Approved ✅',
    message: () => 'Your review has been approved and is now visible!',
  },
  review_deleted: {
    title: 'Review Removed',
    message: (d) => 'A review has been removed.',
  },
  coupon_created: {
    title: 'New Offer 🎉',
    message: (d) => `Code "${d.code || ''}" — ${d.discount || 'amazing discount'}! Grab it before it expires.`,
  },
  coupon_updated: {
    title: 'Coupon Updated ✏️',
    message: (d) => `Coupon "${d.code || ''}" details have been updated.`,
  },
  coupon_deleted: {
    title: 'Coupon Removed',
    message: (d) => `Coupon "${d.code || ''}" has been removed.`,
  },
  banner_created: {
    title: 'New Banner 🖼️',
    message: (d) => `Banner "${d.title || 'New banner'}" is now live on the homepage!`,
  },
  banner_updated: {
    title: 'Banner Updated ✏️',
    message: (d) => `Banner "${d.title || 'Banner'}" has been updated.`,
  },
  banner_deleted: {
    title: 'Banner Removed',
    message: (d) => `Banner "${d.title || 'Banner'}" has been removed.`,
  },
  category_created: {
    title: 'New Category 📂',
    message: (d) => `Category "${d.name || 'New category'}" has been added to the store.`,
  },
  category_updated: {
    title: 'Category Updated ✏️',
    message: (d) => `Category "${d.name || 'Category'}" has been updated.`,
  },
  category_deleted: {
    title: 'Category Removed',
    message: (d) => `Category "${d.name || 'Category'}" has been removed.`,
  },
  user_registered: {
    title: 'New User 👤',
    message: (d) => `${d.userName || 'Someone new'} just joined OUTFITY — welcome!`,
  },
  user_blocked: {
    title: 'User Blocked 🔒',
    message: (d) => `${d.userName || 'User'} has been blocked from the platform.`,
  },
  user_unblocked: {
    title: 'User Unblocked 🔓',
    message: (d) => `${d.userName || 'User'} has been unblocked.`,
  },
  site_maintenance: {
    title: 'Maintenance 🔧',
    message: (d) => d.enabled ? 'Maintenance mode has been enabled — the store is temporarily unavailable.' : 'Maintenance mode has been disabled — the store is back online!',
  },
  site_payments: {
    title: 'Payment Settings 💳',
    message: () => 'Payment configuration has been updated.',
  },
  admin_broadcast: {
    title: (d) => d.title || 'Announcement',
    message: (d) => d.message || '',
  },
};

async function createNotification({ type, data = {}, userId = null, forAdmin = false, broadcast = false, customTitle = null, customMessage = null }) {
  let title, message;

  if (customTitle && customMessage) {
    title = customTitle;
    message = customMessage;
  } else {
    const template = notificationTemplates[type];
    if (!template) return null;
    title = typeof template.title === 'function' ? template.title(data) : template.title;
    message = typeof template.message === 'function' ? template.message(data) : template.message;
  }

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data,
    forAdmin,
    broadcast,
  });

  const payload = {
    _id: notification._id,
    type,
    title,
    message,
    data,
    isRead: false,
    createdAt: notification.createdAt,
    forAdmin,
    broadcast,
    user: userId ? userId.toString() : null,
  };

  if (userId) {
    sse.sendToUser(userId, 'new_notification', payload);
    sse.sendToUser(userId, 'user_notification', payload);
  } else {
    sse.broadcast('new_notification', payload);
  }

  return notification;
}

async function notifyAdmins(type, data = {}) {
  return createNotification({ type, data, forAdmin: true });
}

async function notifyUser(userId, type, data = {}) {
  return createNotification({ type, data, userId, forAdmin: false });
}

async function notifyBoth(userId, type, data = {}) {
  await notifyUser(userId, type, data);
  await notifyAdmins(type, data);
}

async function createBroadcast(type, data, title, message) {
  return createNotification({ type, data, broadcast: true, forAdmin: false, userId: null });
}

module.exports = { createNotification, notifyAdmins, notifyUser, notifyBoth, createBroadcast, notificationTemplates };
