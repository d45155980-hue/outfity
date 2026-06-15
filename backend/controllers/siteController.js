const SiteConfig = require('../models/SiteConfig');
const ErrorHandler = require('../utils/errorHandler');
const sse = require('../utils/sseManager');
const { notifyAdmins } = require('../utils/notificationService');

const getConfig = async () => {
  let config = await SiteConfig.findOne({ key: 'site_config' });
  if (!config) {
    config = await SiteConfig.create({ key: 'site_config', maintenance: false });
  }
  return config;
};

exports.getStatus = async (req, res, next) => {
  try {
    const config = await getConfig();
    res.status(200).json({ success: true, maintenance: config.maintenance });
  } catch (error) {
    next(error);
  }
};

exports.toggleMaintenance = async (req, res, next) => {
  try {
    const config = await getConfig();
    config.maintenance = !config.maintenance;
    await config.save();
    sse.broadcast('site_updated', { maintenance: config.maintenance, payments: config.payments });
    notifyAdmins('site_maintenance', { enabled: config.maintenance });
    res.status(200).json({ success: true, maintenance: config.maintenance });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentConfig = async (req, res, next) => {
  try {
    const config = await getConfig();
    res.status(200).json({ success: true, payments: config.payments });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentConfig = async (req, res, next) => {
  try {
    const { payments } = req.body;
    const config = await getConfig();
    if (payments) {
      Object.keys(config.payments).forEach((key) => {
        if (typeof payments[key] === 'boolean') {
          config.payments[key] = payments[key];
        }
      });
    }
    await config.save();
    sse.broadcast('site_updated', { maintenance: config.maintenance, payments: config.payments });
    notifyAdmins('site_payments', { payments: config.payments });
    res.status(200).json({ success: true, payments: config.payments });
  } catch (error) {
    next(error);
  }
};
