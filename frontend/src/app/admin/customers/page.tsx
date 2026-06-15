'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import {
  HiOutlineSearch,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShoppingBag,
} from 'react-icons/hi';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState<any | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/admin/all');
      setCustomers(data.users || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchCustomers(); };
    es.addEventListener('user_updated', refresh);
    es.addEventListener('user_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [search, customers]);

  const toggleStatus = async () => {
    if (confirmBlock) {
      try {
        await api.put(`/users/admin/${confirmBlock._id}/block`);
        setConfirmBlock(null);
        await fetchCustomers();
      } catch {
        // silently fail
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="p-8 text-center text-sm text-gray-400">Loading customers...</div>
      </div>
    );
  }

  const isBlocked = (user: any) => user.role === 'blocked' || user.isBlocked;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="relative max-w-xs">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Phone</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Orders</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Joined</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-400">No customers found.</td>
                </tr>
              ) : (
                filtered.map((customer: any, idx: number) => {
                  const blocked = isBlocked(customer);
                  return (
                    <motion.tr
                      key={customer._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                            {customer.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">{customer.email}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">{customer.phone || '—'}</td>
                      <td className="py-3 px-4 text-center text-gray-900 font-medium">{customer.orders || 0}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs hidden sm:table-cell">{formatDate(customer.createdAt)}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${
                            blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewCustomer(customer)}
                            className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmBlock(customer)}
                            className={`p-1.5 transition-colors rounded-lg ${
                              blocked
                                ? 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            {blocked ? (
                              <HiOutlineCheck className="w-4 h-4" />
                            ) : (
                              <HiOutlineBan className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {viewCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setViewCustomer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <button onClick={() => setViewCustomer(null)} className="p-1 text-gray-400 hover:text-black">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-lg font-medium">
                  {viewCustomer.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{viewCustomer.name}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
                      isBlocked(viewCustomer) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isBlocked(viewCustomer) ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{viewCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{viewCustomer.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineShoppingBag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{viewCustomer.orders || 0} orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(viewCustomer.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmBlock(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {isBlocked(confirmBlock) ? 'Unblock Customer' : 'Block Customer'}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {isBlocked(confirmBlock)
                  ? `Are you sure you want to unblock ${confirmBlock.name}? They will be able to place orders again.`
                  : `Are you sure you want to block ${confirmBlock.name}? They will not be able to place orders.`}
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfirmBlock(null)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={toggleStatus}
                  className={`flex-1 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                    isBlocked(confirmBlock)
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isBlocked(confirmBlock) ? 'Unblock' : 'Block'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
