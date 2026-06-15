'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import api from '@/lib/api';
import { loadUser } from '@/store/slices/authSlice';
import { formatPrice } from '@/lib/utils';
import { HiOutlineClipboardList, HiOutlineHeart, HiOutlineLocationMarker, HiOutlineShoppingBag, HiOutlineArrowRight } from 'react-icons/hi';

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-50 text-green-600',
  Shipped: 'bg-orange-50 text-orange-600',
  Confirmed: 'bg-purple-50 text-purple-600',
  Processing: 'bg-blue-50 text-blue-600',
};

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(loadUser());
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/me');
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [dispatch]);

  const totalOrders = orders.length;
  const wishlistCount = wishlistItems?.length || 0;
  const reviewsCount = orders.reduce((sum: number, o: any) => sum + (o.orderItems?.length || 0), 0);

  const quickStats = [
    { label: 'Total Orders', value: String(totalOrders), icon: HiOutlineShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Wishlist Items', value: String(wishlistCount), icon: HiOutlineHeart, color: 'bg-red-50 text-red-500' },
    { label: 'Saved Addresses', value: '—', icon: HiOutlineLocationMarker, color: 'bg-green-50 text-green-600' },
    { label: 'Reviews', value: String(reviewsCount), icon: HiOutlineClipboardList, color: 'bg-purple-50 text-purple-600' },
  ];

  const recentOrders = [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const formatOrderDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-stone-900">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-sm text-stone-500 mt-0.5">Manage your account, orders, and preferences.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-stone-100 rounded-xl p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-stone-900">{loading ? '...' : stat.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-900">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-xs text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1">
            View All <HiOutlineArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-stone-400">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-400">No orders yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="text-left font-medium text-stone-400 text-xs uppercase tracking-wider px-5 py-3">Order ID</th>
                  <th className="text-left font-medium text-stone-400 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left font-medium text-stone-400 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right font-medium text-stone-400 text-xs uppercase tracking-wider px-5 py-3">Total</th>
                  <th className="text-right font-medium text-stone-400 text-xs uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-medium text-stone-900">{order._id}</td>
                    <td className="px-5 py-3.5 text-xs text-stone-500">{formatOrderDate(order.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[formatStatus(order.orderStatus)] || 'bg-stone-50 text-stone-500'}`}>
                        {formatStatus(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-900 text-right font-medium">{formatPrice(order.totalPrice)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/dashboard/orders/${order._id}`} className="text-xs text-stone-500 hover:text-stone-900 transition-colors">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/orders" className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
          <div className="flex items-center gap-3">
            <HiOutlineClipboardList size={24} className="text-stone-600" />
            <div>
              <p className="text-sm font-medium text-stone-900">My Orders</p>
              <p className="text-xs text-stone-500">Track, return, or cancel</p>
            </div>
          </div>
          <HiOutlineArrowRight size={16} className="text-stone-400" />
        </Link>
        <Link href="/dashboard/wishlist" className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
          <div className="flex items-center gap-3">
            <HiOutlineHeart size={24} className="text-stone-600" />
            <div>
              <p className="text-sm font-medium text-stone-900">Wishlist</p>
              <p className="text-xs text-stone-500">View saved items</p>
            </div>
          </div>
          <HiOutlineArrowRight size={16} className="text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
