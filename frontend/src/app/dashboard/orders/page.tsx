'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { getMyOrders, cancelOrder } from '@/store/slices/orderSlice';
import { API_BASE_URL } from '@/lib/constants';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import CancelModal from '@/components/CancelModal';
import { formatPrice } from '@/lib/utils';
import { HiOutlineClipboardList, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-50 text-green-600',
  Shipped: 'bg-orange-50 text-orange-600',
  Confirmed: 'bg-purple-50 text-purple-600',
  Processing: 'bg-blue-50 text-blue-600',
  Cancelled: 'bg-red-50 text-red-500',
};

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  useEffect(() => {
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    es.addEventListener('order_updated', () => dispatch(getMyOrders()));
    es.addEventListener('order_created', () => dispatch(getMyOrders()));
    es.onerror = () => {};
    return () => es.close();
  }, [dispatch]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const orderId = cancelTarget;
    setCancellingId(orderId);
    const result = await dispatch(cancelOrder(orderId));
    setCancellingId(null);
    setCancelTarget(null);
    if (cancelOrder.fulfilled.match(result)) {
      dispatch(getMyOrders());
    } else {
      const msg = (result as any).payload || 'Failed to cancel order';
      alert(msg);
    }
  };

  const formatOrderDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-stone-900">My Orders</h2>
          <p className="text-sm text-stone-500 mt-0.5">View and track your orders</p>
        </motion.div>
        <div className="p-8 text-center text-sm text-stone-400">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="You haven't placed any orders yet. Start shopping!"
        actionLabel="Start Shopping"
        actionHref="/products"
        icon={<HiOutlineClipboardList size={24} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-stone-900">My Orders</h2>
        <p className="text-sm text-stone-500 mt-0.5">View and track your orders</p>
      </motion.div>

      <div className="space-y-2">
        {orders.map((order: any, idx: number) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-white border border-stone-100 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              className="w-full flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs font-medium text-stone-900">{order._id}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{formatOrderDate(order.createdAt)} • {order.orderItems?.length || 0} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[formatStatus(order.orderStatus)] || 'bg-stone-50 text-stone-500'}`}>
                  {formatStatus(order.orderStatus)}
                </span>
                <span className="text-xs font-semibold text-stone-900">{formatPrice(order.totalPrice)}</span>
                {expandedId === order._id ? <HiOutlineChevronUp size={14} className="text-stone-400" /> : <HiOutlineChevronDown size={14} className="text-stone-400" />}
              </div>
            </button>
            {expandedId === order._id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-stone-100 px-4 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-stone-400">Payment:</span> <span className="text-stone-700">{order.paymentMethod || 'N/A'}</span></div>
                  <div><span className="text-stone-400">Total:</span> <span className="text-stone-700">{formatPrice(order.totalPrice)}</span></div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/orders/${order._id}`}
                    className="px-4 py-2 bg-stone-900 text-white text-xs rounded-full hover:bg-stone-800 transition-colors"
                  >
                    View Details
                  </Link>
                  {order.orderStatus === 'Processing' && (
                    <button
                      onClick={() => setCancelTarget(order._id)}
                      disabled={cancellingId === order._id}
                      className="px-4 py-2 border border-red-200 text-red-500 text-xs rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <CancelModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={!!cancellingId}
      />

      <Pagination currentPage={1} totalPages={3} />
    </div>
  );
}
