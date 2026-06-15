'use client';

import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';
import { ORDER_STATUS } from '@/lib/constants';

interface OrderTrackerProps {
  currentStatus: string;
}

const getStatusIndex = (status: string): number => {
  const index = ORDER_STATUS.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );
  return index >= 0 ? index : 0;
};

export default function OrderTracker({ currentStatus }: OrderTrackerProps) {
  const activeIndex = getStatusIndex(currentStatus);

  return (
    <div className="w-full py-8">
      <div className="relative flex items-center justify-between">
        {ORDER_STATUS.map((status, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={
                  isCurrent
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {isCompleted ? (
                  <HiCheck className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium text-center whitespace-nowrap transition-colors duration-300 ${
                  isCompleted ? 'text-black' : 'text-gray-400'
                }`}
              >
                {status}
              </span>
            </div>
          );
        })}

        <div className="absolute top-5 left-0 right-0 h-0.5 -translate-y-1/2 bg-gray-200 z-0">
          <motion.div
            initial={{ width: '0%' }}
            animate={{
              width: `${(activeIndex / (ORDER_STATUS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-full bg-black"
          />
        </div>
      </div>
    </div>
  );
}
