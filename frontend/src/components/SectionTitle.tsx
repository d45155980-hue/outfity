'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}

export default function SectionTitle({
  subtitle,
  title,
  description,
  align = 'center',
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`max-w-xl mb-12 ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
    >
      {subtitle && (
        <span className="inline-block text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-display leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-gray-500 text-base leading-relaxed">
          {description}
        </p>
      )}
      <div
        className={`mt-6 w-16 h-0.5 bg-accent ${align === 'center' ? 'mx-auto' : ''}`}
      />
    </motion.div>
  );
}
