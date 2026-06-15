const express = require('express');
const router = express.Router();
const { getStatus, toggleMaintenance, getPaymentConfig, updatePaymentConfig } = require('../controllers/siteController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/status', getStatus);
router.put('/maintenance', protect, authorizeAdmin, toggleMaintenance);
router.get('/payment', getPaymentConfig);
router.put('/payment', protect, authorizeAdmin, updatePaymentConfig);

module.exports = router;
