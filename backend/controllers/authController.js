const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { notifyAdmins } = require('../utils/notificationService');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getJwtToken();
  const options = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  const userData = user.toObject();
  delete userData.password;
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: userData,
  });
};

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler('Email already registered', 400));
    }
    const user = await User.create({ name, email, phone, password });
    notifyAdmins('user_registered', { userName: user.name, userId: user._id, email: user.email });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }
    if (user.isBlocked) {
      return next(new ErrorHandler('Your account has been blocked. Contact support.', 403));
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken, accessToken, email, name, googleId, avatar } = req.body;

    let verifiedPayload;

    if (idToken) {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      verifiedPayload = ticket.getPayload();
    } else if (accessToken) {
      const https = require('https');
      const userInfo = await new Promise((resolve, reject) => {
        https.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch (e) { reject(e); }
          });
        }).on('error', reject);
      });
      verifiedPayload = {
        email: userInfo.email,
        name: userInfo.name,
        sub: userInfo.id,
        picture: userInfo.picture,
      };
    }

    const finalEmail = verifiedPayload?.email || email;
    const finalName = verifiedPayload?.name || name;
    const finalGoogleId = verifiedPayload?.sub || googleId;
    const finalAvatar = verifiedPayload?.picture || avatar;

    if (!finalEmail || !finalGoogleId) {
      return next(new ErrorHandler('Email and Google ID are required', 400));
    }

    let user = await User.findOne({ email: finalEmail });
    if (user) {
      if (!user.googleId) {
        user.googleId = finalGoogleId;
        if (finalAvatar) user.avatar = { url: finalAvatar };
        await user.save();
      }
    } else {
      const randomPassword = crypto.randomBytes(20).toString('hex');
      user = await User.create({
        name: finalName || finalEmail.split('@')[0],
        email: finalEmail,
        googleId: finalGoogleId,
        password: randomPassword,
        avatar: finalAvatar ? { url: finalAvatar } : undefined,
      });
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logoutUser = async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorHandler('User not found with this email', 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    try {
      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'OUTFITY Password Reset',
        html: `<p>Your password reset link: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
      });
      res.status(200).json({ success: true, message: 'Email sent successfully', resetToken });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorHandler('Invalid or expired reset token', 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler('Passwords do not match', 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.phone) updates.phone = req.body.phone;
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.body.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null) || (req.cookies && req.cookies.token);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    sendTokenResponse(user, 200, res);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return next(new ErrorHandler('Current password is incorrect', 401));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler('Passwords do not match', 400));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
