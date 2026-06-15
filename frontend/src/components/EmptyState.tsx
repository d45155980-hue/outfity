'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, actionLabel, actionHref = '/products', icon }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-6">
        {icon || <HiOutlineShoppingBag size={32} className="text-stone-300" />}
      </div>
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm text-stone-500 max-w-sm">{description}</p>
      {actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
