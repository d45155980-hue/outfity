'use client';

import { motion } from 'framer-motion';
import { HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: { button: 'w-7 h-7', text: 'text-sm w-8', icon: 'w-3 h-3' },
  md: { button: 'w-9 h-9', text: 'text-base w-10', icon: 'w-4 h-4' },
};

export default function QuantitySelector({
  quantity,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
}: QuantitySelectorProps) {
  const s = sizeClasses[size];

  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={decrease}
        disabled={quantity <= min}
        className={`${s.button} flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <HiOutlineMinus className={s.icon} />
      </button>
      <motion.span
        key={quantity}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`${s.text} text-center font-medium select-none`}
      >
        {quantity}
      </motion.span>
      <button
        onClick={increase}
        disabled={quantity >= max}
        className={`${s.button} flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <HiOutlinePlus className={s.icon} />
      </button>
    </div>
  );
}
