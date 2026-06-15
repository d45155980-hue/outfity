'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import AdminSidebar from '@/components/AdminSidebar';
import { motion } from 'framer-motion';
import {
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import type { AppDispatch } from '@/store/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
    if (isAuthenticated && user && user.role !== 'admin' && !isLoginPage) {
      router.push('/');
    }
  }, [isAuthenticated, isLoginPage, router, user]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="lg:hidden" />
          <div className="hidden lg:block" />
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <HiOutlineUser className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name || 'Admin'}
              </span>
              <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20"
                >
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'admin@outfity.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-all"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
