const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@outfity.com' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@outfity.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
    });

    console.log('Admin user created: admin@outfity.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
