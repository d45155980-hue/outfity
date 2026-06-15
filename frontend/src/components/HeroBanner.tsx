'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const defaultSlides = [
  {
    id: 1,
    title: "MEN'S COLLECTION",
    subtitle: 'New Arrivals',
    description: 'Elevate your style with our latest men\'s fashion. Premium quality, timeless designs.',
    primaryBtn: { text: 'Shop Now', href: '/products?category=men' },
    secondaryBtn: { text: 'Explore More', href: '/products?category=men&sort=newest' },
    gradient: 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700',
    imageUrl: undefined as string | undefined,
  },
  {
    id: 2,
    title: "WOMEN'S COLLECTION",
    subtitle: 'Spring/Summer 2026',
    description: 'Discover elegant pieces that redefine contemporary women\'s fashion.',
    primaryBtn: { text: 'Shop Now', href: '/products?category=women' },
    secondaryBtn: { text: 'Explore More', href: '/products?category=women&sort=newest' },
    gradient: 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700',
    imageUrl: undefined as string | undefined,
  },
  {
    id: 3,
    title: 'WINTER ESSENTIALS',
    subtitle: 'Stay Warm, Stay Stylish',
    description: 'Curated winter wear collection to keep you cozy without compromising on style.',
    primaryBtn: { text: 'Shop Now', href: '/products?category=men&isSale=true' },
    secondaryBtn: { text: 'Explore More', href: '/products?category=women' },
    gradient: 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700',
    imageUrl: undefined as string | undefined,
  },
  {
    id: 4,
    title: 'NEW ARRIVALS',
    subtitle: 'Fresh Looks',
    description: 'Be the first to wear the latest trends. New styles added weekly.',
    primaryBtn: { text: 'Shop Now', href: '/products?sort=newest' },
    secondaryBtn: { text: 'Explore More', href: '/products' },
    gradient: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700',
    imageUrl: undefined as string | undefined,
  },
];

function buildSlide(banner: any) {
  const rawUrl = banner.image?.url || '';
  const hasImage = rawUrl && (rawUrl.startsWith('http') || rawUrl.startsWith('/'));
  const bg = hasImage ? `url(${rawUrl})` : undefined;
  return {
    id: banner._id,
    title: (banner.title || 'COLLECTION').toUpperCase(),
    subtitle: banner.subtitle || 'Featured',
    description: banner.description || 'Discover our latest collection.',
    primaryBtn: { text: 'Shop Now', href: banner.link || '/products' },
    secondaryBtn: { text: 'Explore More', href: '/products' },
    gradient: 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700',
    imageUrl: bg,
  };
}

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    api.get('/banners')
      .then(({ data }) => {
        if (data.banners?.length > 0) {
          setSlides(data.banners.map(buildSlide));
        }
      })
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const s = slides[current];

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={s.id}
          custom={direction}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' as const }}
          className="absolute inset-0 bg-cover bg-center"
          style={s.imageUrl ? { backgroundImage: s.imageUrl } : {}}
        >
          {!s.imageUrl && <div className={`absolute inset-0 ${s.gradient}`} />}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              <motion.span
                key={`sub-${s.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="inline-block text-amber-400 text-sm sm:text-base font-medium tracking-[0.3em] uppercase mb-4 drop-shadow-lg"
              >
                {s.subtitle}
              </motion.span>

              <motion.h1
                key={`title-${s.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white font-display mb-6 leading-tight drop-shadow-xl"
              >
                {s.title}
              </motion.h1>

              <motion.p
                key={`desc-${s.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                className="text-gray-200 text-base sm:text-lg max-w-lg mb-8 leading-relaxed drop-shadow-md"
              >
                {s.description}
              </motion.p>

              <motion.div
                key={`btns-${s.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={s.primaryBtn.href}
                  className="inline-flex items-center px-8 py-3.5 bg-amber-500 text-black text-sm font-semibold tracking-wide uppercase hover:bg-amber-400 transition-all rounded hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {s.primaryBtn.text}
                </Link>
                <Link
                  href={s.secondaryBtn.href}
                  className="inline-flex items-center px-8 py-3.5 border-2 border-white/40 text-white text-sm font-semibold tracking-wide uppercase hover:border-white hover:bg-white/10 transition-all rounded hover:scale-105 active:scale-95"
                >
                  {s.secondaryBtn.text}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === current
                ? 'w-12 h-3 bg-amber-500 shadow-lg shadow-amber-500/50'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80 hover:scale-125'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 z-20">
        <span className="text-xs text-white/60 font-mono tracking-wider">
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}
