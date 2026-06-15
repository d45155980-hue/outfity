'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  couponError?: string;
  couponSuccess?: string;
}

export default function OrderSummary({
  subtotal, shipping, discount, total, couponCode, onApplyCoupon, couponError, couponSuccess,
}: OrderSummaryProps) {
  const [code, setCode] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-stone-50 rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Order Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Subtotal</span>
          <span className="text-stone-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Shipping</span>
          <span className={shipping === 0 ? 'text-green-600' : 'text-stone-900'}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="border-t border-stone-200 pt-2 flex justify-between">
          <span className="text-sm font-semibold text-stone-900">Total</span>
          <span className="text-sm font-bold text-stone-900">{formatPrice(total)}</span>
        </div>
      </div>

      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <button
            onClick={() => onApplyCoupon?.(code)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Apply
          </button>
        </div>
        {couponError && <p className="text-red-500 text-[11px] mt-1">{couponError}</p>}
        {couponSuccess && <p className="text-green-600 text-[11px] mt-1">{couponSuccess}</p>}
      </div>
    </motion.div>
  );
}
