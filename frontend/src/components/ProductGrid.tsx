'use client';

import { motion } from 'framer-motion';

interface ProductGridProps {
  children: React.ReactNode;
}

export default function ProductGrid({ children }: ProductGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
    >
      {children}
    </motion.div>
  );
}
