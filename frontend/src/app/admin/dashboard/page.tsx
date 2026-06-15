'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-violet-100 text-violet-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const weeklyRevenue = [32000, 28000, 45000, 38000, 52000, 48000, 58000];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders/admin/all'),
          api.get('/products?limit=10000'),
          api.get('/users/admin/all'),
        ]);

        const orders = ordersRes.data.orders || [];
        const products = productsRes.data.products || [];
        const users = usersRes.data.users || [];

        const totalSales = orders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCustomers: users.length,
        });

        const sorted = [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        setRecentOrders(sorted);
      } catch {
        setStats({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatNumber = (n: number) => n.toLocaleString('en-IN');

  const statCards = [
    { label: 'Total Sales', value: `₹${formatNumber(stats.totalSales)}`, icon: HiOutlineCurrencyRupee, change: '+12.5%', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders', value: formatNumber(stats.totalOrders), icon: HiOutlineShoppingBag, change: '+8.2%', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Products', value: formatNumber(stats.totalProducts), icon: HiOutlineCube, change: '+3.1%', color: 'from-violet-500 to-violet-600' },
    { label: 'Total Customers', value: formatNumber(stats.totalCustomers), icon: HiOutlineUsers, change: '+15.3%', color: 'from-amber-500 to-amber-600' },
  ];

  const formatOrderDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1.5">{loading ? '...' : stat.value}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <HiOutlineTrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">No orders yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-400 uppercase">Order</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Date</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-gray-400 uppercase">Total</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any, idx: number) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium text-gray-900">{order._id}</td>
                      <td className="py-3 px-2 text-gray-600">{order.shippingAddress?.fullName || 'N/A'}</td>
                      <td className="py-3 px-2 text-gray-400 hidden sm:table-cell">{formatOrderDate(order.createdAt)}</td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">₹{formatNumber(order.totalPrice || 0)}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${statusColors[formatStatus(order.orderStatus)] || 'bg-gray-100 text-gray-700'}`}>
                          {formatStatus(order.orderStatus)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Weekly Revenue</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyRevenue.map((value, idx) => {
              const max = Math.max(...weeklyRevenue);
              const height = (value / max) * 100;
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.6 + idx * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-black to-gray-700 rounded-t-md"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-gray-400">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
