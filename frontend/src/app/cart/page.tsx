'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import EmptyState from '@/components/EmptyState';
import CartItemComponent from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import { RootState, AppDispatch } from '@/store/store';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import { Coupon } from '@/types';
import { HiOutlineShoppingBag, HiArrowLeft, HiOutlineTag, HiOutlineSparkles } from 'react-icons/hi';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const reduxCoupon = useSelector((state: RootState) => state.cart.coupon);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    api.get('/coupons/active')
      .then(({ data }) => setAvailableCoupons(data.coupons || []))
      .catch(() => {});
  }, []);

  const handleUpdateQuantity = (productId: string, qty: number) => {
    const item = cartItems.find((item) => item.product === productId);
    if (item) {
      dispatch(updateQuantity({ product: item.product, size: item.size, color: item.color.hex, quantity: qty }));
    }
  };

  const handleRemove = (productId: string) => {
    const item = cartItems.find((item) => item.product === productId);
    if (item) {
      dispatch(removeFromCart({ product: item.product, size: item.size, color: item.color.hex }));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 99;
  let actualDiscount = 0;
  if (reduxCoupon && subtotal > 0) {
    if (reduxCoupon.type === 'percentage') {
      actualDiscount = Math.round(subtotal * (reduxCoupon.value / 100));
    } else if (reduxCoupon.type === 'fixed') {
      actualDiscount = reduxCoupon.value;
    }
  }
  const total = subtotal + shipping - actualDiscount;

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess('');
      return;
    }
    try {
      const { data } = await api.post('/coupons/validate', { code: code.trim(), orderAmount: subtotal });
      if (data.success && data.coupon) {
        dispatch(applyCoupon(data.coupon as Coupon));
        setCouponSuccess(`Coupon applied! ${data.coupon.type === 'percentage' ? `${data.coupon.value}% off` : data.coupon.type === 'fixed' ? `₹${data.coupon.value} off` : 'Free shipping'}`);
        setCouponError('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setCouponSuccess('');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleApplyAvailableCoupon = (code: string) => {
    setCouponCode(code);
    handleApplyCoupon(code);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Cart' }]} />
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start shopping to fill it up!"
          actionLabel="Start Shopping"
          actionHref="/products"
          icon={<HiOutlineShoppingBag size={32} />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Cart' }]} />

      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-6">Shopping Cart ({cartItems.length} items)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-3">
          <AnimatePresence>
            {cartItems.map((item) => (
              <CartItemComponent
                key={item.product}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors mt-4">
            <HiArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        <div className="lg:w-80 shrink-0 space-y-4">
          {availableCoupons.length > 0 && !reduxCoupon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl p-5 border border-amber-200/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineSparkles className="text-amber-600" size={16} />
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Available Offers</h4>
              </div>
              <div className="space-y-2">
                {availableCoupons.map((cp, idx) => (
                  <motion.button
                    key={cp._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleApplyAvailableCoupon(cp.code)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <HiOutlineTag className="text-amber-700" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-900 uppercase tracking-wider">{cp.code}</p>
                      <p className="text-[11px] text-stone-500">
                        {cp.type === 'percentage' ? `${cp.value}% OFF` : cp.type === 'fixed' ? `₹${cp.value} OFF` : 'Free Shipping'}
                        {cp.minOrder > 0 && ` • Min. ₹${cp.minOrder}`}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {reduxCoupon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 rounded-2xl p-4 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineTag className="text-green-600" size={16} />
                  <div>
                    <p className="text-sm font-bold text-green-800 uppercase">{reduxCoupon.code}</p>
                    <p className="text-[11px] text-green-600">
                      {reduxCoupon.type === 'percentage' ? `${reduxCoupon.value}% discount applied` : reduxCoupon.type === 'fixed' ? `₹${reduxCoupon.value} discount applied` : 'Free shipping applied'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          )}

          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            discount={actualDiscount}
            total={total}
            couponCode={couponCode}
            onApplyCoupon={handleApplyCoupon}
            couponError={couponError}
            couponSuccess={couponSuccess}
          />
          <Link
            href={isAuthenticated ? '/checkout' : '/login?redirect=%2Fcheckout'}
            className="mt-4 block w-full py-3.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors text-center"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
