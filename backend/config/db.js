const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('All MongoDB connection attempts failed. Continuing without DB...');
      }
    }
  }
};

module.exports = connectDB;
