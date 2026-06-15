const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: './.env' });

const categories = [
  { name: 'Men', description: 'Men\'s fashion and clothing' },
  { name: 'Women', description: 'Women\'s fashion and clothing' },
  { name: 'Kids', description: 'Kids\' fashion and clothing' },
  { name: 'Accessories', description: 'Fashion accessories' },
  { name: 'Footwear', description: 'Shoes and footwear' },
  { name: 'Ethnic Wear', description: 'Traditional ethnic clothing' },
  { name: 'Sportswear', description: 'Sports and active wear' },
  { name: 'Winter Wear', description: 'Winter clothing and jackets' },
];

const products = [
  {
    name: 'Classic Fit Cotton T-Shirt',
    description: 'Premium quality cotton t-shirt with a classic fit. Perfect for casual wear.',
    brand: 'OUTFITY',
    price: 799,
    salePrice: 499,
    stock: 150,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#000080' }],
    tags: ['t-shirt', 'cotton', 'casual', 'basic'],
    featured: true,
    isNewArrival: true,
    isTrending: true,
    ratings: 4.5,
    numOfReviews: 128,
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Modern slim fit denim jeans made from stretchable denim fabric.',
    brand: 'OUTFITY',
    price: 1999,
    salePrice: 1499,
    stock: 80,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Blue', hex: '#0000FF' }, { name: 'Black', hex: '#000000' }],
    tags: ['jeans', 'denim', 'slim-fit', 'pants'],
    featured: true,
    isTrending: true,
    ratings: 4.3,
    numOfReviews: 95,
  },
  {
    name: 'Floral Print Summer Dress',
    description: 'Beautiful floral print dress perfect for summer outings. Lightweight and breathable.',
    brand: 'OUTFITY',
    price: 2499,
    salePrice: 1799,
    stock: 60,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Pink', hex: '#FFC0CB' }, { name: 'Yellow', hex: '#FFFF00' }],
    tags: ['dress', 'floral', 'summer', 'women'],
    featured: true,
    isNewArrival: true,
    ratings: 4.7,
    numOfReviews: 67,
  },
  {
    name: 'Formal Blazer - Slim Fit',
    description: 'Sharp formal blazer for professional occasions. Premium fabric with tailored fit.',
    brand: 'OUTFITY',
    price: 4999,
    stock: 40,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#000080' }, { name: 'Charcoal', hex: '#36454F' }],
    tags: ['blazer', 'formal', 'office', 'professional'],
    featured: true,
    isNewArrival: true,
    ratings: 4.6,
    numOfReviews: 42,
  },
  {
    name: 'Graphic Print Hoodie',
    description: 'Comfortable hoodie with unique graphic prints. Fleece lined for warmth.',
    brand: 'OUTFITY',
    price: 1499,
    salePrice: 999,
    stock: 100,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }, { name: 'Maroon', hex: '#800000' }],
    tags: ['hoodie', 'graphic', 'casual', 'warm'],
    isTrending: true,
    ratings: 4.4,
    numOfReviews: 156,
  },
  {
    name: 'Handloom Cotton Saree',
    description: 'Traditional handloom cotton saree with elegant border design.',
    brand: 'OUTFITY Ethnic',
    price: 2999,
    salePrice: 2199,
    stock: 35,
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Red', hex: '#FF0000' }, { name: 'Green', hex: '#008000' }, { name: 'Blue', hex: '#0000FF' }],
    tags: ['saree', 'ethnic', 'handloom', 'traditional'],
    featured: true,
    ratings: 4.8,
    numOfReviews: 89,
  },
  {
    name: 'Sports Running Shoes',
    description: 'Lightweight running shoes with cushioned sole and breathable mesh upper.',
    brand: 'OUTFITY Sport',
    price: 3999,
    salePrice: 2999,
    stock: 70,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }, { name: 'Blue', hex: '#0000FF' }],
    tags: ['shoes', 'sports', 'running', 'footwear'],
    isNewArrival: true,
    isTrending: true,
    ratings: 4.2,
    numOfReviews: 203,
  },
  {
    name: 'Kids Colorful Sweatshirt',
    description: 'Fun and colorful sweatshirt for kids. Soft fabric with cute animal prints.',
    brand: 'OUTFITY Kids',
    price: 899,
    salePrice: 599,
    stock: 120,
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' }, { name: 'Green', hex: '#008000' }],
    tags: ['kids', 'sweatshirt', 'casual', 'colorful'],
    isNewArrival: true,
    ratings: 4.6,
    numOfReviews: 54,
  },
  {
    name: 'Leather Messenger Bag',
    description: 'Genuine leather messenger bag with multiple compartments. Perfect for work or travel.',
    brand: 'OUTFITY Accessories',
    price: 3499,
    salePrice: 2799,
    stock: 45,
    colors: [{ name: 'Brown', hex: '#A52A2A' }, { name: 'Black', hex: '#000000' }],
    tags: ['bag', 'leather', 'messenger', 'accessories'],
    featured: true,
    ratings: 4.5,
    numOfReviews: 73,
  },
  {
    name: 'Classic White Shirt',
    description: 'Essential classic white shirt for every wardrobe. Crisp cotton fabric.',
    brand: 'OUTFITY',
    price: 1299,
    salePrice: 899,
    stock: 90,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    tags: ['shirt', 'formal', 'classic', 'white'],
    isTrending: true,
    ratings: 4.3,
    numOfReviews: 167,
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Stylish aviator sunglasses with UV protection and gold-tone frame.',
    brand: 'OUTFITY Accessories',
    price: 1499,
    salePrice: 999,
    stock: 200,
    colors: [{ name: 'Gold/Green', hex: '#FFD700' }, { name: 'Silver/Blue', hex: '#C0C0C0' }],
    tags: ['sunglasses', 'aviator', 'accessories', 'UV protection'],
    featured: true,
    isNewArrival: true,
    ratings: 4.1,
    numOfReviews: 48,
  },
  {
    name: 'Wool Blend Overcoat',
    description: 'Premium wool-blend overcoat for winter. Double-breasted with satin lining.',
    brand: 'OUTFITY',
    price: 6999,
    salePrice: 4999,
    stock: 25,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Camel', hex: '#C19A6B' }, { name: 'Grey', hex: '#808080' }],
    tags: ['overcoat', 'winter', 'wool', 'formal'],
    featured: true,
    ratings: 4.7,
    numOfReviews: 36,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await Category.deleteMany({});
    await Product.deleteMany({});

    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories inserted`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    const productCategoryMap = [
      'Men', 'Men', 'Women', 'Men', 'Men', 'Women', 'Footwear', 'Kids',
      'Accessories', 'Men', 'Accessories', 'Men',
    ];

    const productsWithCategory = products.map((product, index) => {
      const random = Math.floor(1000 + Math.random() * 9000);
      const namePart = product.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
      return {
        ...product,
        sku: `${namePart}-${random}`,
        category: categoryMap[productCategoryMap[index].toLowerCase()],
        subcategory: productCategoryMap[index],
      };
    });

    await Product.insertMany(productsWithCategory);
    console.log(`${products.length} products inserted`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
