const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.get('/admin/all', protect, authorizeAdmin, getAllReviews);
router.put('/admin/:id/approve', protect, authorizeAdmin, approveReview);
router.delete('/admin/:id', protect, authorizeAdmin, deleteReview);

module.exports = router;
