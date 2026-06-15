'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'product' | 'cart' | 'text';
}

export default function LoadingSkeleton({ count = 8, type = 'product' }: LoadingSkeletonProps) {
  if (type === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-stone-100 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    );
  }

  if (type === 'cart') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-stone-50 rounded-xl animate-pulse">
            <div className="w-20 h-24 bg-stone-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
              <div className="h-3 bg-stone-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-stone-100 rounded-2xl" />
          <div className="mt-3 space-y-2">
            <div className="h-3 bg-stone-100 rounded w-1/3" />
            <div className="h-4 bg-stone-100 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
