const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorizeAdmin, upload.array('images', 10), createProduct);
router.put('/:id', protect, authorizeAdmin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, authorizeAdmin, deleteProduct);
router.put('/:id/review', protect, createProductReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
