'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const categoryIcons: Record<string, string> = {
  men: 'M',
  women: 'W',
  kids: 'K',
  accessories: 'A',
  footwear: 'F',
  'ethnic wear': 'E',
  sportswear: 'S',
  'winter wear': 'W',
};

const categoryGradients: Record<string, string> = {
  men: 'from-stone-900 to-stone-700',
  women: 'from-amber-900 to-amber-700',
  kids: 'from-sky-600 to-sky-400',
  accessories: 'from-stone-800 to-stone-600',
  footwear: 'from-zinc-900 to-zinc-700',
  'ethnic wear': 'from-rose-800 to-rose-600',
  sportswear: 'from-emerald-800 to-emerald-600',
  'winter wear': 'from-indigo-900 to-indigo-700',
};

const defaultGradient = 'from-stone-900 to-stone-700';

interface CategoryCardProps {
  category: {
    _id?: string;
    name: string;
    slug?: string;
    image?: { public_id?: string; url?: string } | string;
    description?: string;
  };
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const key = category.name.toLowerCase();
  const icon = Object.entries(categoryIcons).find(([k]) => key.includes(k))?.[1] || category.name.charAt(0);
  const gradient = Object.entries(categoryGradients).find(([k]) => key.includes(k))?.[1] || defaultGradient;

  const hasImage = typeof category.image === 'string' ? !!category.image : !!category.image?.url;
  const imageUrl = typeof category.image === 'string' ? '' : category.image?.url || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link
        href={`/products?category=${category.name.toLowerCase()}`}
        className="relative block overflow-hidden rounded-2xl bg-stone-900 shadow-lg shadow-stone-900/10 transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-stone-900/20"
      >
        <div className="aspect-[3/4] relative">
          {hasImage ? (
            <>
              <img
                src={imageUrl}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_50%)]" />
            </div>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 ring-1 ring-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
              <span className="text-white text-xl font-bold tracking-tight">{icon}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white text-center leading-tight">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/60 text-xs mt-1.5 text-center line-clamp-1">{category.description}</p>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-center gap-2 text-white/90 text-xs font-medium uppercase tracking-widest">
              Explore
              <span className="w-6 h-px bg-white/60" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
