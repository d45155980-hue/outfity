const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const { createNotification } = require('../utils/notificationService');
const sendEmail = require('../utils/sendEmail');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { user: req.user.id },
        { broadcast: true, user: null },
        { forAdmin: req.user.role === 'admin', user: null },
      ],
    }).sort('-createdAt').limit(100);
    const unreadCount = await Notification.countDocuments({
      $or: [
        { user: req.user.id, isRead: false },
        { broadcast: true, user: null, isRead: false },
        { forAdmin: req.user.role === 'admin', user: null, isRead: false },
      ],
    });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ forAdmin: true })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(200);
    const unreadCount = await Notification.countDocuments({ forAdmin: true, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(new ErrorHandler('Notification not found', 404));
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { user: req.user.id, isRead: false },
          { broadcast: true, user: null, isRead: false },
          { forAdmin: req.user.role === 'admin', user: null, isRead: false },
        ],
      },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.createAdminNotification = async (req, res, next) => {
  try {
    const { type, title, message, data, forAdmin } = req.body;
    const notification = await createNotification({
      type: type || 'site_maintenance',
      data: data || {},
      forAdmin: forAdmin !== false,
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

const broadcastEmailTemplate = (title, message) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f0;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr><td style="text-align:center;padding:24px 0 8px;">
      <h1 style="font-size:20px;font-weight:700;letter-spacing:4px;color:#1c1917;margin:0;">OUTFITY</h1>
      <p style="font-size:11px;color:#a8a29e;margin:4px 0 0;">Premium Fashion</p>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:12px;padding:32px;">
      <h2 style="font-size:16px;font-weight:600;color:#1c1917;margin:0 0 12px;">${title}</h2>
      <p style="font-size:14px;color:#44403c;line-height:1.6;margin:0;">${message}</p>
    </td></tr>
    <tr><td style="text-align:center;padding:20px 0;font-size:11px;color:#a8a29e;">
      OUTFITY — you received this because you are a valued member.
    </td></tr>
  </table>
</body>
</html>`;

exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type, userList, sendMethod } = req.body;
    if (!title || !message) {
      return next(new ErrorHandler('Title and message are required', 400));
    }

    const method = sendMethod || 'website';
    let targetUsers = [];

    if (userList && Array.isArray(userList) && userList.length > 0) {
      targetUsers = await User.find({ _id: { $in: userList } });
      for (const user of targetUsers) {
        await createNotification({
          type: type || 'admin_broadcast',
          data: { message, title, broadcastBy: req.user.name },
          userId: user._id,
          forAdmin: false,
          broadcast: false,
          customTitle: title,
          customMessage: message,
        });
      }
    } else {
      targetUsers = await User.find({ role: { $ne: 'admin' } });
      await createNotification({
        type: type || 'admin_broadcast',
        data: { message, title, broadcastBy: req.user.name },
        broadcast: true,
        forAdmin: false,
        customTitle: title,
        customMessage: message,
      });
    }

    if (method === 'email' || method === 'both') {
      const html = broadcastEmailTemplate(title, message);
      let sent = 0, failed = 0;
      for (const user of targetUsers) {
        try {
          await sendEmail({
            email: user.email,
            subject: `📬 ${title} — OUTFITY`,
            html,
          });
          sent++;
        } catch {
          failed++;
        }
      }
      return res.status(201).json({
        success: true,
        message: 'Notification sent',
        method,
        recipients: targetUsers.length,
        emailSent: sent,
        emailFailed: failed,
      });
    }

    res.status(201).json({ success: true, message: 'Notification sent', method, recipients: targetUsers.length });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return next(new ErrorHandler('Notification not found', 404));
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
