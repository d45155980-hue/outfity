'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { getOrderDetails, cancelOrder } from '@/store/slices/orderSlice';
import { API_BASE_URL } from '@/lib/constants';
import Breadcrumb from '@/components/Breadcrumb';
import OrderTracker from '@/components/OrderTracker';
import CancelModal from '@/components/CancelModal';
import { formatPrice } from '@/lib/utils';
import { HiOutlineLocationMarker, HiOutlineCreditCard, HiArrowLeft } from 'react-icons/hi';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { order, loading } = useSelector((state: RootState) => state.orders);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    dispatch(getOrderDetails(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    es.addEventListener('order_updated', () => dispatch(getOrderDetails(orderId)));
    es.onerror = () => {};
    return () => es.close();
  }, [dispatch, orderId]);

  const handleCancel = async () => {
    setCancelling(true);
    const result = await dispatch(cancelOrder(orderId));
    setCancelling(false);
    setShowCancelModal(false);
    if (!cancelOrder.fulfilled.match(result)) {
      const msg = (result as any).payload || 'Failed to cancel order';
      alert(msg);
    } else {
      dispatch(getOrderDetails(orderId));
    }
  };

  const formatOrderDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading || !order) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: orderId },
        ]} />
        <div className="p-8 text-center text-sm text-stone-400">Loading order details...</div>
      </div>
    );
  }

  const orderItems = order.orderItems || [];
  const subtotal = order.itemsPrice || 0;
  const shipping = order.shippingPrice || 0;
  const discount = order.discount || 0;
  const total = order.totalPrice || 0;
  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Orders', href: '/dashboard/orders' },
        { label: orderId },
      ]} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Order #{orderId}</h2>
            <p className="text-sm text-stone-500">Placed on {formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 w-fit">
              {formatStatus(order.orderStatus)}
            </span>
            {order.orderStatus === 'Processing' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
                className="px-4 py-1.5 border border-red-200 text-red-500 text-xs rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-stone-100 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">Order Progress</h3>
        <OrderTracker currentStatus={order.orderStatus} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-stone-100 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <HiOutlineLocationMarker size={14} /> Shipping Address
          </h3>
          {address ? (
            <div className="text-sm text-stone-600 space-y-0.5">
              <p className="font-medium text-stone-900">{address.fullName}</p>
              <p>{address.address}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
              <p className="mt-1">Phone: {address.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-stone-400">No address available</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white border border-stone-100 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <HiOutlineCreditCard size={14} /> Payment Method
          </h3>
          <p className="text-sm text-stone-900 font-medium">{order.paymentMethod || 'N/A'}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-stone-100 rounded-2xl">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Order Items</h3>
        </div>
        <div className="p-6 space-y-4">
          {orderItems.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4">
              <div className={`w-16 h-20 rounded-lg ${item.image ? '' : 'bg-gradient-to-br from-stone-300 to-stone-500'} shrink-0`}>
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.product?._id || item.product}`} className="text-sm font-medium text-stone-900 hover:underline">{item.name}</Link>
                <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold text-stone-900 mt-1">{formatPrice(item.price || 0)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 p-6 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-stone-500">Subtotal</span><span className="text-stone-900">{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500">Shipping</span><span className="text-green-600">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between text-sm font-bold border-t border-stone-200 pt-2"><span className="text-stone-900">Total</span><span className="text-stone-900">{formatPrice(total)}</span></div>
        </div>
      </motion.div>

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
      />

      <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors">
        <HiArrowLeft size={14} /> Back to Orders
      </Link>
    </div>
  );
}
