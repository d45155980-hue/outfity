const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/auth');
const {
  getMyNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  createAdminNotification,
  broadcastNotification,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.get('/admin/all', protect, authorizeAdmin, getAdminNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.post('/admin/create', protect, authorizeAdmin, createAdminNotification);
router.post('/admin/broadcast', protect, authorizeAdmin, broadcastNotification);
router.delete('/:id', protect, authorizeAdmin, deleteNotification);

module.exports = router;
