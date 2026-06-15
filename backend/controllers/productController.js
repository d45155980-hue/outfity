const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

const fileToImageData = (file, baseUrl = '') => ({
  public_id: crypto.randomBytes(16).toString('hex'),
  url: `${baseUrl}/uploads/${file.filename}`,
  alt: '',
});

exports.getProducts = async (req, res, next) => {
  try {
    const queryCopy = { ...req.query };

    // Map frontend param names
    if (queryCopy.search) {
      queryCopy.keyword = queryCopy.search;
      delete queryCopy.search;
    }
    if (queryCopy.sort) {
      const sortMap = {
        'newest': '-createdAt',
        'price-asc': 'price',
        'price-desc': '-price',
        'popular': '-numOfReviews',
        'rating': '-ratings',
      };
      queryCopy.sortBy = sortMap[String(queryCopy.sort)] || '-createdAt';
      delete queryCopy.sort;
    }

    // Resolve category name to ObjectId
    if (queryCopy.category) {
      const catName = String(queryCopy.category);
      const cat = await Category.findOne({ name: new RegExp('^' + catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
      if (cat) queryCopy.category = cat._id.toString();
      else queryCopy.category = 'nonexistent';
    }

    // Handle array filters (sizes, brands)
    if (queryCopy.sizes) {
      queryCopy.sizes = { $in: String(queryCopy.sizes).split(',') };
    }
    if (queryCopy.brands) {
      queryCopy.brand = { $in: String(queryCopy.brands).split(',') };
      delete queryCopy.brands;
    }

    // Handle color filter
    if (queryCopy.color) {
      queryCopy['colors.hex'] = queryCopy.color;
      delete queryCopy.color;
    }

    // Handle rating filter — use gte (no $) so APIFeatures.filter() adds it
    if (queryCopy.rating) {
      queryCopy.ratings = { gte: Number(queryCopy.rating) };
      delete queryCopy.rating;
    }

    // Handle price range — use gte/lte (no $) so APIFeatures.filter() adds them
    if (queryCopy.minPrice || queryCopy.maxPrice) {
      const priceFilter = {};
      if (queryCopy.minPrice) priceFilter['gte'] = Number(queryCopy.minPrice);
      if (queryCopy.maxPrice) priceFilter['lte'] = Number(queryCopy.maxPrice);
      queryCopy.price = priceFilter;
      delete queryCopy.minPrice;
      delete queryCopy.maxPrice;
    }

    const resultPerPage = Number(req.query.limit) || 12;
    const totalProducts = await Product.countDocuments();
    const apiFeatures = new APIFeatures(Product.find().populate('category', 'name'), queryCopy)
      .search()
      .filter()
      .sort()
      .pagination(resultPerPage);
    const products = await apiFeatures.query;
    const filteredCount = products.length;
    res.status(200).json({
      success: true,
      count: filteredCount,
      totalProducts,
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const resolveCategory = async (body) => {
  if (body.category && typeof body.category === 'string' && !body.category.match(/^[a-f\d]{24}$/i)) {
    let cat = await Category.findOne({ name: { $regex: new RegExp('^' + body.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } });
    if (!cat) {
      cat = await Category.create({ name: body.category, description: body.category });
    }
    body.category = cat._id;
  }
};

const parseJsonFields = (body) => {
  ['colors', 'sizes', 'tags'].forEach((field) => {
    if (typeof body[field] === 'string') {
      try { body[field] = JSON.parse(body[field]); } catch {}
    }
  });
};

exports.createProduct = async (req, res, next) => {
  try {
    parseJsonFields(req.body);
    await resolveCategory(req.body);
    const productData = { ...req.body };
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      productData.images = req.body.images.map((url) => ({
        public_id: crypto.randomBytes(16).toString('hex'),
        url,
        alt: productData.name || '',
      }));
    } else if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      productData.images = req.files.map((file) => ({
        ...fileToImageData(file, baseUrl),
        alt: productData.name || '',
      }));
    }
    const product = await Product.create(productData);
    sse.broadcast('product_created', { product: product._id });
    notifyAdmins('product_created', { productName: product.name, productId: product._id });
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    parseJsonFields(req.body);
    await resolveCategory(req.body);
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
    const updateData = { ...req.body };
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      updateData.images = req.body.images.map((url) => ({
        public_id: crypto.randomBytes(16).toString('hex'),
        url,
        alt: updateData.name || '',
      }));
    } else if (req.files && req.files.length > 0) {
      for (const image of product.images) {
        const filename = image.url.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        try { fs.unlinkSync(filePath); } catch {}
      }
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.images = req.files.map((file) => ({
        ...fileToImageData(file, baseUrl),
        alt: updateData.name || '',
      }));
    }
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    sse.broadcast('product_updated', { product: product._id });
    notifyAdmins('product_updated', { productName: product.name, productId: product._id });
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
    for (const image of product.images) {
      const filename = image.url.split('/').pop();
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      try { fs.unlinkSync(filePath); } catch {}
    }
    await Review.deleteMany({ product: product._id });
    await product.deleteOne();
    sse.broadcast('product_deleted', { product: product._id });
    notifyAdmins('product_deleted', { productName: product.name, productId: product._id });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: req.params.id,
    });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({
        user: req.user.id,
        product: req.params.id,
        rating,
        comment,
      });
    }
    const reviews = await Review.find({ product: req.params.id, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    product.ratings = Math.round(avgRating * 10) / 10;
    product.numOfReviews = reviews.length;
    await product.save();
    sse.broadcast('review_submitted', { product: req.params.id });
    const userName = req.user?.name || 'A user';
    notifyAdmins('review_submitted', { userName, rating, productId: req.params.id });
    res.status(200).json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
