const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    if (user.role === 'admin') {
      return next(new ErrorHandler('Cannot block an admin', 400));
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    sse.broadcast('user_updated', { user: user._id, isBlocked: user.isBlocked });
    notifyAdmins(user.isBlocked ? 'user_blocked' : 'user_unblocked', { userName: user.name, userId: user._id });
    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    if (user.role === 'admin') {
      return next(new ErrorHandler('Cannot delete an admin', 400));
    }
    await user.deleteOne();
    sse.broadcast('user_deleted', { user: user._id });
    notifyAdmins('user_deleted', { userName: user.name, userId: user._id });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
