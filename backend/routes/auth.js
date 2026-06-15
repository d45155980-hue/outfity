const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  updatePassword,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/logout', logoutUser);
router.post('/logout', logoutUser);

module.exports = router;
