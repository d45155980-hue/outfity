const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', getActiveBanners);
router.post('/admin/create', protect, authorizeAdmin, upload.single('image'), createBanner);
router.get('/admin/all', protect, authorizeAdmin, getAllBanners);
router.put('/admin/:id', protect, authorizeAdmin, upload.single('image'), updateBanner);
router.delete('/admin/:id', protect, authorizeAdmin, deleteBanner);

module.exports = router;
