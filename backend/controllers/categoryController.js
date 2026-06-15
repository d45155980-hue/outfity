const Category = require('../models/Category');
const ErrorHandler = require('../utils/errorHandler');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    sse.broadcast('category_created', { category: category._id });
    notifyAdmins('category_created', { name: category.name });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return next(new ErrorHandler('Category not found', 404));
    sse.broadcast('category_updated', { category: category._id });
    notifyAdmins('category_updated', { name: category.name });
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));
    sse.broadcast('category_deleted', { category: req.params.id });
    notifyAdmins('category_deleted', { name: category.name });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
