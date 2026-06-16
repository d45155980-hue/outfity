const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const ErrorHandler = require('./utils/errorHandler');

dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');
const bannerRoutes = require('./routes/banners');
const paymentRoutes = require('./routes/payments');
const siteRoutes = require('./routes/site');
const sseRoutes = require('./routes/sse');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

connectDB().catch(() => console.log('MongoDB connection failed, starting server anyway...'));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://myoutfity.vercel.app',
  /^http:\/\/localhost:\d+$/,
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(a => (typeof a === 'string' ? a === origin : a.test(origin)))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use('/uploads', express.static(uploadsDir));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OUTFITY API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/site', siteRoutes);
app.use('/api/v1/sse', sseRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.all('/{*path}', (req, res, next) => {
  next(new ErrorHandler(`Route not found: ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
    statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB';
    }
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`OUTFITY server running on port ${PORT}`);
});

module.exports = app;
