'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { NAV_LINKS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import NotificationBell from './NotificationBell';
import {
  HiOutlineSearch,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineTrash,
} from 'react-icons/hi';

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        setIsSearchOpen(false);
      }, 400);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, router]);

  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-sm py-px sm:py-0' : 'py-px sm:py-0.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            className="lg:hidden p-3 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex-shrink-0">
            <Image src="/images/logo.png" alt="OUTFITY" width={440} height={136} className="h-8 sm:h-10 lg:h-28 w-auto" priority />
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium text-gray-700 hover:text-black transition-colors group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 lg:p-2 hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <HiOutlineSearch className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
            </button>

            <NotificationBell />

            <Link
              href="/wishlist"
              className="flex relative p-2 lg:p-2 hover:text-gray-600 transition-colors"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 lg:p-2 hover:text-gray-600 transition-colors"
                aria-label="Cart"
              >
                <HiOutlineShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold">
                        Shopping Bag ({cartCount})
                      </h3>
                    </div>
                    {cartItems.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        Your bag is empty
                      </div>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                          {cartItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.size} / {item.color.name} × {item.quantity}
                                </p>
                                <p className="text-sm font-semibold">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <div className="flex justify-between mb-3">
                            <span className="text-sm font-medium">Total</span>
                            <span className="text-sm font-bold">{formatPrice(cartTotal)}</span>
                          </div>
                          <Link
                            href="/cart"
                            onClick={() => setIsCartOpen(false)}
                            className="block w-full text-center bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            View Bag
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center relative group">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 lg:p-2 hover:text-gray-600 transition-colors"
                  aria-label="My Account"
                >
                  <HiOutlineUser className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white shadow-lg border border-gray-100 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/dashboard" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">My Profile</Link>
                  <Link href="/dashboard/orders" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">My Orders</Link>
                  <Link href="/dashboard/wishlist" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">Wishlist</Link>
                  {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">Admin Panel</Link>}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 p-2 lg:p-2 hover:text-gray-600 transition-colors"
              >
                <HiOutlineUser className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
              </Link>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-3 border-t border-gray-100 mt-3">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Image src="/images/logo.png" alt="OUTFITY" width={360} height={110} className="h-8 sm:h-10 w-auto" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3"
                  aria-label="Close menu"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-4 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="my-4 border-gray-100" />
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <HiOutlineHeart className="w-5 h-5" />
                  Wishlist
                  {wishlistItems.length > 0 && (
                    <span className="ml-auto bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  href={isAuthenticated ? '/dashboard' : '/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  {isAuthenticated ? 'My Account' : 'Sign In'}
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
