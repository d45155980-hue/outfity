'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercent, generateStars } from '@/lib/utils';
import { addToCart } from '@/store/slices/cartSlice';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag } from 'react-icons/hi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    brand?: string;
    category?: any;
    price: number;
    salePrice?: number;
    stock?: number;
    sku?: string;
    images?: { public_id?: string; url?: string; alt?: string }[];
    sizes?: string[];
    colors?: { name: string; hex: string }[];
    tags?: string[];
    featured?: boolean;
    isNewArrival?: boolean;
    isTrending?: boolean;
    isSale?: boolean;
    ratings?: number;
    numOfReviews?: number;
    createdAt?: string;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { wishlistItems } = useSelector((state: RootState) => state.wishlist);

  const isInWishlist = wishlistItems.some((item) => item.product === product._id);
  const discountPercent = getDiscountPercent(product.price, product.salePrice || 0);
  const validImages = product.images?.filter((i: any) => i?.url && (i.url.startsWith('http') || i.url.startsWith('/') || i.url.startsWith('data:')));
  const rawImage = validImages?.[0]?.url || '';
  const gradientClass = product.images?.[0]?.url?.startsWith('bg-') ? product.images[0].url : '';
  const stars = generateStars(product.ratings || 0);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist');
      router.push('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(
        addToWishlist({
          product: product._id,
          name: product.name,
          image: rawImage,
          price: product.salePrice || product.price || 0,
          salePrice: product.salePrice,
        })
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group product-card relative"
    >
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm">
          {rawImage ? (
            <img
              src={rawImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : gradientClass ? (
            <div className={`w-full h-full ${gradientClass} transition-transform duration-700 ease-out group-hover:scale-105`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold tracking-wider uppercase">
                Out of Stock
              </span>
            </div>
          )}

          {product.isNewArrival && (
            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              New
            </span>
          )}

          {product.isSale && discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
              -{discountPercent}%
            </span>
          )}

          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <motion.div
                key="filled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-red-500"
              >
                <HiHeart className="w-4 h-4" />
              </motion.div>
            ) : (
              <HiOutlineHeart className="w-4 h-4" />
            )}
          </button>

          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast.error('Please login to add items to cart');
                  router.push('/login');
                  return;
                }
                dispatch(addToCart({
                  product: product._id,
                  name: product.name,
                  image: rawImage,
                  price: product.salePrice || product.price || 0,
                  size: product.sizes?.[0] || 'M',
                  color: product.colors?.[0] || { name: 'Default', hex: '#000' },
                  quantity: 1,
                  stock: product.stock || 1,
                }));
                toast.success('Added to cart!');
              }}
              disabled={product.stock === 0}
              className="w-full py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className="mt-4 px-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            {stars.map((star, i) => (
              <span key={i} className="text-[10px] text-yellow-500">
                {star === 1 ? (
                  <FaStar />
                ) : star === 0.5 ? (
                  <FaStarHalfAlt />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
            <span className="text-[10px] text-gray-400 ml-1">
              ({product.numOfReviews || 0})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {product.isSale && (product.salePrice ?? 0) > 0 ? (
              <>
                <span className="text-sm font-semibold text-red-600">
                  {formatPrice(product.salePrice ?? 0)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price ?? 0)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(product.price ?? 0)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
