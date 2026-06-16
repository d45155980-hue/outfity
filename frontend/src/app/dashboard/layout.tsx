'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineClipboardList, HiOutlineHeart, HiOutlineLocationMarker, HiOutlineLogout, HiOutlineMenu, HiX, HiOutlineBell } from 'react-icons/hi';

const sidebarLinks = [
  { name: 'My Profile', href: '/dashboard/profile', icon: HiOutlineUser },
  { name: 'My Orders', href: '/dashboard/orders', icon: HiOutlineClipboardList },
  { name: 'Wishlist', href: '/dashboard/wishlist', icon: HiOutlineHeart },
  { name: 'Saved Addresses', href: '/dashboard/addresses', icon: HiOutlineLocationMarker },
  { name: 'Notifications', href: '/dashboard/notifications', icon: HiOutlineBell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">My Account</h1>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-3 text-stone-600 border border-stone-200 rounded-lg"
        >
          <HiOutlineMenu size={22} />
        </button>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="space-y-1 sticky top-28">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-all">
              <HiOutlineLogout size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden p-6"
            >
              <div className="flex justify-end mb-6">
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-600"><HiX size={20} /></button>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                        isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon size={18} />
                      {link.name}
                    </Link>
                  );
                })}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-all">
                  <HiOutlineLogout size={18} />
                  Logout
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
