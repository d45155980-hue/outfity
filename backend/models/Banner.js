const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter banner title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  image: {
    public_id: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    url: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
  },
  link: {
    type: String,
  },
  position: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['men', 'women', 'kids', 'accessories', 'sale', 'general'],
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
