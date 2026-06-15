'use client';

import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EmptyState from '@/components/EmptyState';
import { RootState, AppDispatch } from '@/store/store';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineTrash, HiOutlineShare } from 'react-icons/hi';

export default function DashboardWishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save items you love to your wishlist and shop them later."
        actionLabel="Explore Products"
        actionHref="/products"
        icon={<HiOutlineHeart size={24} />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">My Wishlist</h2>
          <p className="text-sm text-stone-500 mt-0.5">{wishlistItems.length} items saved</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-50 transition-colors">
          <HiOutlineShare size={14} />
          Share
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wishlistItems.map((item, idx) => {
          const discount = item.salePrice ? getDiscountPercent(item.price, item.salePrice) : 0;
          const displayPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;

          return (
            <motion.div
              key={item.product}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-4 p-4 bg-white border border-stone-100 rounded-xl"
            >
              <Link href={`/products/${item.product}`} className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-stone-100">
                {item.image ? (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-500" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product}`} className="text-sm font-medium text-stone-900 hover:underline truncate block">
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-stone-900">{formatPrice(displayPrice)}</span>
                  {item.salePrice && item.salePrice > 0 && (
                    <span className="text-xs text-stone-400 line-through">{formatPrice(item.price)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">-{discount}%</span>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-stone-900 text-white text-xs rounded-full hover:bg-stone-800 transition-colors">
                    <HiOutlineShoppingBag size={12} />
                    Move to Cart
                  </button>
                  <button onClick={() => dispatch(removeFromWishlist(item.product))} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
