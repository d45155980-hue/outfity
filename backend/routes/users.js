const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  toggleBlockUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.get('/admin/all', protect, authorizeAdmin, getAllUsers);
router.get('/admin/:id', protect, authorizeAdmin, getUser);
router.put('/admin/:id/block', protect, authorizeAdmin, toggleBlockUser);
router.delete('/admin/:id', protect, authorizeAdmin, deleteUser);

module.exports = router;
