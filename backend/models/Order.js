const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      image: { type: String },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      size: { type: String },
      color: { type: String },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'razorpay', 'stripe'],
    required: [true, 'Payment method is required'],
  },
  paymentInfo: {
    id: { type: String },
    status: { type: String },
    method: { type: String },
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  deliveredAt: {
    type: Date,
  },
  estimatedDelivery: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', function () {
  if (!this.estimatedDelivery) {
    this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  if (this.itemsPrice > 999) {
    this.deliveryCharge = 0;
  } else if (!this.deliveryCharge) {
    this.deliveryCharge = 40;
  }
  if (this.orderStatus === 'Delivered') {
    this.deliveredAt = Date.now();
  }
});

module.exports = mongoose.model('Order', orderSchema);
