'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { HiOutlineSelector, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusFlow = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered'];

const statusColors: Record<string, string> = {
  Processing: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-cyan-100 text-cyan-700',
  Packed: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-violet-100 text-violet-700',
  OutForDelivery: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/admin/all');
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const pollOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin/all');
      setOrders(data.orders || []);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    es.addEventListener('order_created', () => pollOrders());
    es.addEventListener('order_updated', () => pollOrders());
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const filtered = activeTab === 'All' ? orders : orders.filter((o: any) => {
    const s = o.orderStatus?.toLowerCase();
    return s === activeTab.toLowerCase();
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch {
      // silently fail
    }
  };

  const nextStatuses = (current: string) => {
    if (current === 'Cancelled' || current === 'Delivered') return [];
    const idx = statusFlow.indexOf(current);
    if (idx === -1) return ['Processing'];
    return statusFlow.slice(idx + 1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No {activeTab === 'All' ? '' : activeTab} orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Items</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Payment</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any, idx: number) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{order._id}</td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400">{order.shippingAddress?.email || ''}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{order.orderItems?.length || 0}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${statusColors[formatStatus(order.orderStatus)] || 'bg-gray-100 text-gray-700'}`}>
                        {formatStatus(order.orderStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-500 hidden sm:table-cell">{order.paymentMethod || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                        {order.orderStatus === 'Processing' && (
                          <button
                            onClick={() => updateStatus(order._id, 'Confirmed')}
                            className="px-2.5 py-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                          <button
                            onClick={() => updateStatus(order._id, 'Cancelled')}
                            className="px-2.5 py-1 text-[10px] font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <div className="group relative">
                          <button className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                            <HiOutlineSelector className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10">
                            {nextStatuses(order.orderStatus).length === 0 ? (
                              <p className="px-3 py-1.5 text-xs text-gray-400">No further actions</p>
                            ) : (
                              nextStatuses(order.orderStatus).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order._id, s)}
                                  className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-black transition-all"
                                >
                                  Mark as {s}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expandedId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {(() => {
              const order = orders.find((o: any) => o._id === expandedId);
              if (!order) return null;
              return (
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Order Details — {order._id}</h3>
                    <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-black">
                      <HiOutlineChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Customer</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress?.email || ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Order Date</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Payment</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{order.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Items</p>
                    {(order.orderItems || []).map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-900">{p.name} × {p.quantity}</span>
                        <span className="text-gray-600">₹{(p.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-semibold text-gray-900">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
