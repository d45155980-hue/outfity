const Review = require('../models/Review');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const sse = require('../utils/sseManager');
const { notifyAdmins, notifyUser } = require('../utils/notificationService');

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }
    review.isApproved = true;
    await review.save();
    const reviews = await Review.find({ product: review.product, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, {
      ratings: Math.round(avgRating * 10) / 10,
      numOfReviews: reviews.length,
    });
    sse.broadcast('review_approved', { review: review._id, product: review.product });
    notifyUser(review.user, 'review_approved', { productId: review.product });
    notifyAdmins('review_approved', { reviewId: review._id, productId: review.product });
    res.status(200).json({ success: true, message: 'Review approved successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }
    const productId = review.product;
    await review.deleteOne();
    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(avgRating * 10) / 10,
      numOfReviews: reviews.length,
    });
    sse.broadcast('review_deleted', { review: req.params.id, product: productId });
    notifyAdmins('review_deleted', { reviewId: req.params.id, productId });
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
