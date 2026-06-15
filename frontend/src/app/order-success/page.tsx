'use client';

import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RootState } from '@/store/store';
import { HiOutlineCheckCircle, HiOutlineShoppingBag, HiOutlineCalendar } from 'react-icons/hi';

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const order = useSelector((state: RootState) => state.orders.order);

  const orderId = searchParams.get('id');
  const orderNumber = order && 'orderNumber' in order ? (order as any).orderNumber : ('OFT-' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const estimatedDate = order?.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <HiOutlineCheckCircle size={40} className="text-green-500" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm text-stone-500 mt-2">Thank you for your purchase. Your order has been confirmed.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 bg-stone-50 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Order Number</span>
          <span className="font-medium text-stone-900 tracking-mono">{orderNumber}</span>
        </div>
        <div className="flex items-center justify-between text-sm border-t border-stone-200 pt-3">
          <span className="text-stone-500 flex items-center gap-1.5">
            <HiOutlineCalendar size={16} className="text-stone-400" />
            Estimated Delivery
          </span>
          <span className="font-medium text-stone-900">{estimatedDate}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors"
        >
          <HiOutlineShoppingBag size={18} />
          Continue Shopping
        </Link>
        <Link
          href={`/dashboard/orders/${orderId || ''}`}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-stone-300 text-stone-700 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors"
        >
          View Order
        </Link>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessInner />
    </Suspense>
  );
}
