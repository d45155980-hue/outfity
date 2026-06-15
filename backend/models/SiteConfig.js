const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'site_config',
    unique: true,
  },
  maintenance: {
    type: Boolean,
    default: false,
  },
  payments: {
    cod: { type: Boolean, default: true },
    razorpay: { type: Boolean, default: true },
    stripe: { type: Boolean, default: true },
    upi: { type: Boolean, default: true },
    netbanking: { type: Boolean, default: true },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

siteConfigSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
