'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '@/store/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '@/store/slices/notificationSlice';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineTag,
  HiOutlinePhotograph,
  HiOutlineCollection,
  HiOutlineExclamation,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineGift,
} from 'react-icons/hi';

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; ring: string }> = {
  order_created: { icon: <HiOutlineShoppingBag className="w-4 h-4" />, bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  order_cancelled: { icon: <HiOutlineShoppingBag className="w-4 h-4" />, bg: 'bg-rose-50', ring: 'ring-rose-200' },
  order_status: { icon: <HiOutlineShoppingBag className="w-4 h-4" />, bg: 'bg-blue-50', ring: 'ring-blue-200' },
  review_submitted: { icon: <HiOutlineStar className="w-4 h-4" />, bg: 'bg-amber-50', ring: 'ring-amber-200' },
  review_approved: { icon: <HiOutlineStar className="w-4 h-4" />, bg: 'bg-green-50', ring: 'ring-green-200' },
  product_created: { icon: <HiOutlineCube className="w-4 h-4" />, bg: 'bg-violet-50', ring: 'ring-violet-200' },
  product_updated: { icon: <HiOutlineCube className="w-4 h-4" />, bg: 'bg-sky-50', ring: 'ring-sky-200' },
  product_deleted: { icon: <HiOutlineCube className="w-4 h-4" />, bg: 'bg-stone-100', ring: 'ring-stone-200' },
  coupon_created: { icon: <HiOutlineTag className="w-4 h-4" />, bg: 'bg-pink-50', ring: 'ring-pink-200' },
  banner_created: { icon: <HiOutlinePhotograph className="w-4 h-4" />, bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
  category_created: { icon: <HiOutlineCollection className="w-4 h-4" />, bg: 'bg-teal-50', ring: 'ring-teal-200' },
  user_registered: { icon: <HiOutlineUserGroup className="w-4 h-4" />, bg: 'bg-lime-50', ring: 'ring-lime-200' },
  user_blocked: { icon: <HiOutlineExclamation className="w-4 h-4" />, bg: 'bg-red-50', ring: 'ring-red-200' },
  user_unblocked: { icon: <HiOutlineCheck className="w-4 h-4" />, bg: 'bg-green-50', ring: 'ring-green-200' },
  site_maintenance: { icon: <HiOutlineSparkles className="w-4 h-4" />, bg: 'bg-amber-50', ring: 'ring-amber-200' },
  site_payments: { icon: <HiOutlineSparkles className="w-4 h-4" />, bg: 'bg-cyan-50', ring: 'ring-cyan-200' },
  admin_broadcast: { icon: <HiOutlineGift className="w-4 h-4" />, bg: 'bg-purple-50', ring: 'ring-purple-200' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function NotificationBell() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && isAuthenticated) dispatch(fetchNotifications());
  }, [dispatch, isAuthenticated, open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-stone-600 hover:text-black transition-colors rounded-lg hover:bg-stone-100"
      >
        <HiOutlineBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <HiOutlineBell className="w-4 h-4 text-stone-500" />
                <h3 className="text-sm font-semibold text-stone-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium bg-stone-900 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-[11px] font-medium text-stone-500 hover:text-black transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <HiOutlineBell className="w-10 h-10 mx-auto text-stone-200 mb-3" />
                  <p className="text-xs text-stone-400">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const cfg = typeConfig[n.type] || { icon: <HiOutlineBell className="w-4 h-4" />, bg: 'bg-stone-50', ring: 'ring-stone-200' };
                  return (
                    <button
                      key={n._id}
                      onClick={() => { if (!n.isRead) dispatch(markAsRead(n._id)); }}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 ${!n.isRead ? 'bg-stone-50/70' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} ring-1 ${cfg.ring} ${!n.isRead ? '' : 'opacity-60'}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.isRead ? 'font-semibold text-stone-900' : 'font-medium text-stone-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-stone-400 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
