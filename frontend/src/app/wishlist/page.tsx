'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import EmptyState from '@/components/EmptyState';
import { RootState, AppDispatch } from '@/store/store';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineTrash, HiOutlineShare } from 'react-icons/hi';

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Wishlist' }]} />
        <EmptyState
          title="Your wishlist is empty"
          description="Save items you love to your wishlist and shop them later."
          actionLabel="Explore Products"
          actionHref="/products"
          icon={<HiOutlineHeart size={24} />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Wishlist' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-stone-500 mt-0.5">{wishlistItems.length} items saved</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-full text-xs text-stone-600 hover:bg-stone-50 transition-colors">
          <HiOutlineShare size={14} />
          Share Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {wishlistItems.map((item, idx) => {
          const discount = item.salePrice ? getDiscountPercent(item.price, item.salePrice) : 0;
          const displayPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;

          return (
            <motion.div
              key={item.product}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className="relative overflow-hidden bg-stone-100 rounded-2xl mb-3 aspect-[3/4]">
                <Link href={`/products/${item.product}`}>
                  {item.image ? (
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${item.image})` }} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-500" />
                  )}
                </Link>
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">-{discount}%</span>
                )}
                <button
                  onClick={() => dispatch(removeFromWishlist(item.product))}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <HiOutlineTrash size={14} />
                </button>
              </div>
              <Link href={`/products/${item.product}`} className="block">
                <h3 className="text-sm font-medium text-stone-900 truncate">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-stone-900">{formatPrice(displayPrice)}</span>
                  {item.salePrice && item.salePrice > 0 && <span className="text-xs text-stone-400 line-through">{formatPrice(item.price)}</span>}
                </div>
              </Link>
              <button className="w-full mt-2 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-full hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5">
                <HiOutlineShoppingBag size={14} />
                Move to Cart
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
