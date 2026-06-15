'use client';

import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import QuantitySelector from './QuantitySelector';
import { formatPrice } from '@/lib/utils';
import { HiOutlineTrash } from 'react-icons/hi';

interface CartItemProps {
  item: {
    product: string;
    name: string;
    image: string;
    price: number;
    size: string;
    color: { name: string; hex: string };
    quantity: number;
    stock: number;
  };
  onUpdateQuantity?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const dispatch = useDispatch();

  const subtotal = item.price * item.quantity;

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.product);
    } else {
      dispatch(
        removeFromCart({
          product: item.product,
          size: item.size,
          color: item.color.hex,
        })
      );
    }
  };

  const handleQuantityChange = (quantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(item.product, quantity);
    } else {
      dispatch(
        updateQuantity({
          product: item.product,
          size: item.size,
          color: item.color.hex,
          quantity,
        })
      );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 py-5 border-b border-gray-100 last:border-b-0"
    >
      <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">Size: {item.size}</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            Color:
            <span
              className="w-3 h-3 rounded-full inline-block border border-gray-200"
              style={{ backgroundColor: item.color.hex }}
            />
            {item.color.name}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <QuantitySelector
            quantity={item.quantity}
            min={1}
            max={item.stock}
            onChange={handleQuantityChange}
            size="sm"
          />
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {formatPrice(subtotal)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatPrice(item.price)} each
        </p>
      </div>
    </motion.div>
  );
}
