'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineXCircle,
  HiOutlineTag,
} from 'react-icons/hi';

const typeColors: Record<string, string> = {
  percentage: 'bg-blue-100 text-blue-700',
  fixed: 'bg-amber-100 text-amber-700',
  free_shipping: 'bg-emerald-100 text-emerald-700',
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons/admin/all');
      setCoupons(data.coupons || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchCoupons(); };
    es.addEventListener('coupon_created', refresh);
    es.addEventListener('coupon_updated', refresh);
    es.addEventListener('coupon_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (coupon: any) => {
    setEditing(coupon);
    setShowModal(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editing) {
        await api.put(`/coupons/admin/${editing._id}`, data);
      } else {
        await api.post('/coupons/admin/create', data);
      }
      setShowModal(false);
      setEditing(null);
      await fetchCoupons();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/coupons/admin/${deleteTarget._id}`);
        setDeleteTarget(null);
        await fetchCoupons();
      } catch {
        // silently fail
      }
    }
  };

  const toggleActive = async (coupon: any) => {
    try {
      await api.put(`/coupons/admin/${coupon._id}`, { isActive: !coupon.isActive });
      await fetchCoupons();
    } catch {
      // silently fail
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return '%';
      case 'fixed': return '₹';
      case 'free_shipping': return '—';
      default: return '';
    }
  };

  const typeName = (type: string) => {
    switch (type) {
      case 'percentage': return 'Percentage';
      case 'fixed': return 'Fixed';
      case 'free_shipping': return 'Free Shipping';
      default: return type;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <div className="p-8 text-center text-sm text-gray-400">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon: any, idx: number) => (
          <motion.div
            key={coupon._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${
              coupon.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <HiOutlineTag className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-wider text-gray-900">{coupon.code}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${typeColors[coupon.type] || 'bg-gray-100 text-gray-700'}`}>
                      {typeName(coupon.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(coupon)}
                  className={`p-1.5 rounded-lg transition-all ${
                    coupon.isActive
                      ? 'text-emerald-500 hover:bg-emerald-50'
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {coupon.isActive ? <HiOutlineCheck className="w-4 h-4" /> : <HiOutlineXCircle className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Value</span>
                  <span className="font-medium text-gray-900">{typeLabel(coupon.type)}{coupon.type === 'free_shipping' ? 'Free Shipping' : coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Order</span>
                  <span className="text-gray-600">₹{coupon.minOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uses</span>
                  <span className="text-gray-600">{coupon.used || 0}/{coupon.maxUses || '∞'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires</span>
                  <span className="text-gray-600">{formatDate(coupon.expiresAt)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50 px-4 py-2 flex justify-end gap-1">
              <button
                onClick={() => openEdit(coupon)}
                className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <HiOutlinePencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteTarget(coupon)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <CouponModal
            coupon={editing}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900">Delete Coupon</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <strong>{deleteTarget.code}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CouponModal({
  coupon,
  onSave,
  onClose,
}: {
  coupon: any | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState(coupon?.code || '');
  const [type, setType] = useState(coupon?.type || 'percentage');
  const [value, setValue] = useState(coupon?.value?.toString() || '');
  const [minOrder, setMinOrder] = useState(coupon?.minOrder?.toString() || '');
  const [maxUses, setMaxUses] = useState(coupon?.maxUses?.toString() || '100');
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        code: code.toUpperCase(),
        type,
        value: type === 'free_shipping' ? 0 : Number(value),
        minOrder: Number(minOrder),
        maxUses: Number(maxUses),
        expiresAt: new Date(expiresAt).toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Add Coupon'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 uppercase tracking-wider font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>

          {type !== 'free_shipping' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Discount Value {type === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Order (₹)</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Maximum Uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : coupon ? 'Update' : 'Add Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
