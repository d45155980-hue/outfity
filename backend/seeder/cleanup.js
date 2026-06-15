const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = ['products', 'users', 'orders', 'categories', 'reviews', 'coupons', 'banners'];
    for (const name of collections) {
      const result = await mongoose.connection.db.dropCollection(name).catch(() => null);
      if (result) console.log(`Dropped collection: ${name}`);
    }

    console.log('Cleanup complete. Run `npm run seed` to re-seed categories and products.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
