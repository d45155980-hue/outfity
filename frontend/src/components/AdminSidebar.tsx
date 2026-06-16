'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineGift,
  HiOutlineStar,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
} from 'react-icons/hi';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: HiOutlineViewGrid },
  { name: 'Products', href: '/admin/products', icon: HiOutlineCube },
  { name: 'Categories', href: '/admin/categories', icon: HiOutlineCollection },
  { name: 'Orders', href: '/admin/orders', icon: HiOutlineClipboardList },
  { name: 'Customers', href: '/admin/customers', icon: HiOutlineUsers },
  { name: 'Coupons', href: '/admin/coupons', icon: HiOutlineGift },
  { name: 'Reviews', href: '/admin/reviews', icon: HiOutlineStar },
  { name: 'Banners', href: '/admin/banners', icon: HiOutlinePhotograph },
  { name: 'Send Notification', href: '/admin/notifications/send', icon: HiOutlineBell },
  { name: 'Settings', href: '/admin/settings', icon: HiOutlineCog },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="py-6">
      <div className="px-6 mb-8">
        <Link href="/admin">
          <Image src="/images/logo-white.png" alt="OUTFITY" width={400} height={120} className="h-10 sm:h-14 lg:h-28 w-auto opacity-90" priority />
        </Link>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
        aria-label="Open sidebar"
      >
        <HiOutlineMenu className="w-6 h-6" />
      </button>

      <aside className="hidden lg:block w-64 min-h-screen bg-white border-r border-gray-100 flex-shrink-0">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1"
                aria-label="Close sidebar"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
