'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FOOTER_QUICK_LINKS, FOOTER_CUSTOMER_SERVICE } from '@/lib/constants';
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaPinterestP,
} from 'react-icons/fa';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image src="/images/logo-white.png" alt="OUTFITY" width={420} height={126} className="h-10 sm:h-14 lg:h-28 w-auto" priority />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium fashion destination for the modern individual. Discover curated
              collections that define style and sophistication.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Pinterest"
              >
                <FaPinterestP className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-6">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {FOOTER_CUSTOMER_SERVICE.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-6">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to receive exclusive offers and early access to new arrivals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-l-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent text-black text-sm font-medium rounded-r-lg hover:bg-accent-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} OUTFITY. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 text-gray-500">
              <span className="text-xs">We accept</span>
              <div className="flex items-center gap-2">
                <span className="w-10 h-6 bg-white/10 rounded text-[8px] flex items-center justify-center font-bold">
                  VISA
                </span>
                <span className="w-10 h-6 bg-white/10 rounded text-[8px] flex items-center justify-center font-bold">
                  MC
                </span>
                <span className="w-10 h-6 bg-white/10 rounded text-[8px] flex items-center justify-center font-bold">
                  AMEX
                </span>
                <span className="w-10 h-6 bg-white/10 rounded text-[8px] flex items-center justify-center font-bold">
                  UPI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
