'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiStar } from 'react-icons/hi';
import { formatDate } from '@/lib/utils';

interface Review {
  _id: string;
  user: { _id: string; name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 bg-stone-50 rounded-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600">
            {review.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{review.user.name}</p>
            <p className="text-[11px] text-stone-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            star <= review.rating ? (
              <HiStar key={star} size={14} className="text-amber-400" />
            ) : (
              <HiOutlineStar key={star} size={14} className="text-stone-300" />
            )
          ))}
        </div>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
    </motion.div>
  );
}
