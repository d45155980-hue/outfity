const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxlength: [120, 'Product name cannot exceed 120 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  brand: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'Stock cannot be negative'],
  },
  sku: {
    type: String,
    unique: true,
  },
  images: {
    type: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length <= 10;
      },
      message: 'Cannot have more than 10 images',
    },
  },
  sizes: {
    type: [String],
  },
  colors: {
    type: [{ name: String, hex: String }],
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isSale: {
    type: Boolean,
    default: false,
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre('save', function () {
  if (!this.sku) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const namePart = this.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    this.sku = `${namePart}-${random}`;
  }
});

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
