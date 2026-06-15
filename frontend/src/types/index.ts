export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: { public_id: string; url: string };
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  category: Category;
  price: number;
  salePrice: number;
  stock: number;
  sku: string;
  images: { public_id: string; url: string; alt: string }[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  tags: string[];
  featured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  isSale: boolean;
  ratings: number;
  numOfReviews: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: { public_id: string; url: string };
  isActive: boolean;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: { name: string; hex: string };
  quantity: number;
  stock: number;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  discount: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar: string };
  product: string;
  rating: number;
  comment: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  isActive: boolean;
  expiresAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: { public_id: string; url: string };
  link: string;
  position: number;
  isActive: boolean;
  category: string;
}
