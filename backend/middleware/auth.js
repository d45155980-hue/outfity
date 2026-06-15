const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorHandler('Please login to access this resource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User not found', 401));
    }

    if (req.user.isBlocked) {
      return next(new ErrorHandler('Your account has been blocked. Contact support.', 403));
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandler('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandler('Token expired. Please login again', 401));
    }
    return next(new ErrorHandler('Authentication failed', 401));
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ErrorHandler('Admin access required', 403));
  }
  next();
};

module.exports = { protect, authorizeAdmin };
