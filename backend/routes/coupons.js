const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getActiveCoupons,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.post('/validate', protect, validateCoupon);
router.get('/active', getActiveCoupons);
router.post('/admin/create', protect, authorizeAdmin, createCoupon);
router.get('/admin/all', protect, authorizeAdmin, getAllCoupons);
router.put('/admin/:id', protect, authorizeAdmin, updateCoupon);
router.delete('/admin/:id', protect, authorizeAdmin, deleteCoupon);

module.exports = router;
