'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { HiOutlineShieldCheck, HiOutlineShieldExclamation, HiOutlineCreditCard, HiOutlineX } from 'react-icons/hi';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PAYMENT_LABELS: Record<string, { label: string; desc: string }> = {
  cod: { label: 'Cash on Delivery', desc: 'Pay when you receive' },
  razorpay: { label: 'Razorpay', desc: 'UPI, Cards, Net Banking' },
  stripe: { label: 'Stripe', desc: 'Credit / Debit Card' },
  upi: { label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  netbanking: { label: 'Net Banking', desc: 'All major banks' },
};

export default function Settings() {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [payments, setPayments] = useState<Record<string, boolean>>({});
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/site/status'),
      api.get('/site/payment'),
    ]).then(([statusRes, paymentRes]) => {
      setMaintenance(statusRes.data.maintenance);
      setPayments(paymentRes.data.payments || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await api.put('/site/maintenance');
      if (data.success) setMaintenance(data.maintenance);
    } catch (err: any) {
      console.error('Toggle failed:', err);
    }
    setToggling(false);
  };

  const handlePaymentToggle = async (key: string) => {
    const updated = { ...payments, [key]: !payments[key] };
    setPayments(updated);
    setPaymentLoading(true);
    try {
      await api.put('/site/payment', { payments: updated });
    } catch {
      setPayments(payments);
    }
    setPaymentLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">Manage your store configuration</p>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${maintenance ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {maintenance
                ? <HiOutlineShieldExclamation className="w-6 h-6 text-red-600" />
                : <HiOutlineShieldCheck className="w-6 h-6 text-emerald-600" />
              }
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Maintenance Mode</h2>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                When enabled, all non-admin users will see a &quot;Work in Progress&quot; page.
                You and other admins can still access the full site.
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${maintenance ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${maintenance ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  {maintenance ? 'Site is down for visitors' : 'Site is live'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${maintenance ? 'bg-red-500' : 'bg-stone-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-2">Payment Methods</h2>
        <p className="text-xs text-stone-500 mb-5 max-w-md">
          Toggle payment methods on/off worldwide. Disabled methods will be hidden on the checkout page in real time.
        </p>
        <div className="space-y-1">
          {Object.entries(PAYMENT_LABELS).map(([key, { label, desc }]) => {
            const enabled = payments[key] !== false;
            return (
              <div key={key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${enabled ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {enabled
                      ? <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                      : <HiOutlineX className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{label}</p>
                    <p className="text-[11px] text-stone-400">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePaymentToggle(key)}
                  disabled={paymentLoading}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-stone-900' : 'bg-stone-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
