const Banner = require('../models/Banner');
const ErrorHandler = require('../utils/errorHandler');
const path = require('path');
const fs = require('fs');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

const saveFile = (file, baseUrl = '') => {
  return {
    public_id: file.filename,
    url: `${baseUrl}/uploads/${file.filename}`,
  };
};

exports.getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort('position');
    res.status(200).json({ success: true, banners });
  } catch (error) {
    next(error);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const bannerData = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = saveFile(req.file, baseUrl);
      bannerData.image = { public_id: result.public_id, url: result.url };
    }
    const banner = await Banner.create(bannerData);
    sse.broadcast('banner_created', { banner: banner._id });
    notifyAdmins('banner_created', { title: banner.title });
    res.status(201).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('position');
    res.status(200).json({ success: true, banners });
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return next(new ErrorHandler('Banner not found', 404));
    }
    const updateData = { ...req.body };
      if (req.file) {
        if (banner.image && banner.image.public_id) {
          const oldPath = path.join(__dirname, '..', 'uploads', banner.image.public_id);
          try { fs.unlinkSync(oldPath); } catch {}
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = saveFile(req.file, baseUrl);
        updateData.image = { public_id: result.public_id, url: result.url };
      }
    banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    sse.broadcast('banner_updated', { banner: banner._id });
    notifyAdmins('banner_updated', { title: banner.title });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return next(new ErrorHandler('Banner not found', 404));
    }
    if (banner.image && banner.image.public_id) {
      const filePath = path.join(__dirname, '..', 'uploads', banner.image.public_id);
      try { fs.unlinkSync(filePath); } catch {}
    }
    await banner.deleteOne();
    sse.broadcast('banner_deleted', { banner: banner._id });
    notifyAdmins('banner_deleted', { title: banner.title });
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
