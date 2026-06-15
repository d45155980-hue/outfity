'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '@/store/store';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import {
  HiOutlineBell,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineTag,
  HiOutlinePhotograph,
  HiOutlineCollection,
  HiOutlineExclamation,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineGift,
} from 'react-icons/hi';

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; ring: string; label: string }> = {
  order_created: { icon: <HiOutlineShoppingBag className="w-5 h-5" />, bg: 'bg-emerald-50', ring: 'ring-emerald-200', label: 'Order' },
  order_cancelled: { icon: <HiOutlineShoppingBag className="w-5 h-5" />, bg: 'bg-rose-50', ring: 'ring-rose-200', label: 'Cancelled' },
  order_status: { icon: <HiOutlineShoppingBag className="w-5 h-5" />, bg: 'bg-blue-50', ring: 'ring-blue-200', label: 'Update' },
  review_submitted: { icon: <HiOutlineStar className="w-5 h-5" />, bg: 'bg-amber-50', ring: 'ring-amber-200', label: 'Review' },
  review_approved: { icon: <HiOutlineStar className="w-5 h-5" />, bg: 'bg-green-50', ring: 'ring-green-200', label: 'Approved' },
  product_created: { icon: <HiOutlineCube className="w-5 h-5" />, bg: 'bg-violet-50', ring: 'ring-violet-200', label: 'New' },
  product_updated: { icon: <HiOutlineCube className="w-5 h-5" />, bg: 'bg-sky-50', ring: 'ring-sky-200', label: 'Updated' },
  product_deleted: { icon: <HiOutlineCube className="w-5 h-5" />, bg: 'bg-stone-100', ring: 'ring-stone-200', label: 'Removed' },
  coupon_created: { icon: <HiOutlineTag className="w-5 h-5" />, bg: 'bg-pink-50', ring: 'ring-pink-200', label: 'Offer' },
  banner_created: { icon: <HiOutlinePhotograph className="w-5 h-5" />, bg: 'bg-indigo-50', ring: 'ring-indigo-200', label: 'Banner' },
  category_created: { icon: <HiOutlineCollection className="w-5 h-5" />, bg: 'bg-teal-50', ring: 'ring-teal-200', label: 'Category' },
  user_registered: { icon: <HiOutlineUserGroup className="w-5 h-5" />, bg: 'bg-lime-50', ring: 'ring-lime-200', label: 'User' },
  user_blocked: { icon: <HiOutlineExclamation className="w-5 h-5" />, bg: 'bg-red-50', ring: 'ring-red-200', label: 'Blocked' },
  user_unblocked: { icon: <HiOutlineCheck className="w-5 h-5" />, bg: 'bg-green-50', ring: 'ring-green-200', label: 'Unblocked' },
  site_maintenance: { icon: <HiOutlineSparkles className="w-5 h-5" />, bg: 'bg-amber-50', ring: 'ring-amber-200', label: 'Maintenance' },
  site_payments: { icon: <HiOutlineSparkles className="w-5 h-5" />, bg: 'bg-cyan-50', ring: 'ring-cyan-200', label: 'Payment' },
  admin_broadcast: { icon: <HiOutlineGift className="w-5 h-5" />, bg: 'bg-purple-50', ring: 'ring-purple-200', label: 'Announcement' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function DashboardNotifications() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllAsRead())}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <HiOutlineCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-stone-100 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-stone-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-1/3" />
                <div className="h-2.5 bg-stone-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
            <HiOutlineBell className="w-8 h-8 text-stone-300" />
          </div>
          <p className="text-sm font-medium text-stone-500">No notifications yet</p>
          <p className="text-xs text-stone-400 mt-1">We will notify you when something happens</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, idx) => {
            const cfg = typeConfig[n.type] || { icon: <HiOutlineBell className="w-5 h-5" />, bg: 'bg-stone-50', ring: 'ring-stone-200', label: '' };
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => { if (!n.isRead) dispatch(markAsRead(n._id)); }}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  !n.isRead ? 'bg-stone-50 border-stone-200 shadow-sm' : 'bg-white border-stone-100'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ring-1 ${cfg.ring} ${!n.isRead ? '' : 'opacity-60'}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                </div>
                {!n.isRead && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-stone-900 mt-2 shadow-sm" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
