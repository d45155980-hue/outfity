'use client';

import Link from 'next/link';
import { HiOutlineChevronRight, HiOutlineHome } from 'react-icons/hi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link href="/" className="hover:text-stone-900 transition-colors flex items-center gap-1">
        <HiOutlineHome size={14} />
        Home
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <HiOutlineChevronRight size={12} className="text-stone-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-stone-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
