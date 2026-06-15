'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function CancelModal({ open, onClose, onConfirm, loading }: CancelModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <HiOutlineExclamationCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-1">Cancel Order</h3>
              <p className="text-sm text-stone-500 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
