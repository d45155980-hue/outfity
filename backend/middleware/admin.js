const ErrorHandler = require('../utils/errorHandler');

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ErrorHandler('Admin access required', 403));
  }
  next();
};

module.exports = { authorizeAdmin };
