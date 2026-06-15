const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.get('/', getCategories);
router.post('/', protect, authorizeAdmin, createCategory);
router.put('/:id', protect, authorizeAdmin, updateCategory);
router.delete('/:id', protect, authorizeAdmin, deleteCategory);

module.exports = router;
