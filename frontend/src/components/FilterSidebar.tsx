'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineX } from 'react-icons/hi';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorsList = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Navy', hex: '#000080' },
];
const brandList = ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', "Levi's"];
const ratingsList = [5, 4, 3, 2, 1];

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-5 mb-5">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left mb-3">
        <span className="text-sm font-semibold uppercase tracking-wider text-gray-900">{title}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterSidebar({ isOpen, onClose, isMobile = false }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category') || '';
  const selectedSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const selectedColor = searchParams.get('color') || '';
  const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const selectedRating = searchParams.get('rating') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
    if (isMobile) onClose();
  }, [searchParams, router, isMobile, onClose]);

  const toggleArrayParam = useCallback((key: string, value: string) => {
    const current = searchParams.get(key)?.split(',').filter(Boolean) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateParam(key, next.join(','));
  }, [searchParams, updateParam]);

  const clearAll = () => {
    router.push('/products');
    if (isMobile) onClose();
  };

  const content = (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-black uppercase tracking-wider transition-colors">Clear All</button>
      </div>

      <CollapsibleSection title="Category">
        <div className="space-y-2">
          {['Men', 'Women', 'Kids', 'Accessories', 'Footwear'].map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="category" checked={category === cat.toLowerCase()} onChange={() => updateParam('category', cat.toLowerCase())} className="accent-black" />
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input type="number" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} placeholder="Min" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black" />
            <span className="text-gray-400">-</span>
            <input type="number" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} placeholder="Max" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Size">
        <div className="flex flex-wrap gap-2">
          {sizesList.map((size) => (
            <button key={size} onClick={() => toggleArrayParam('sizes', size)} className={`w-10 h-10 text-xs font-medium rounded border transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{size}</button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {colorsList.map((color) => (
            <button key={color.hex} onClick={() => updateParam('color', selectedColor === color.hex ? '' : color.hex)} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === color.hex ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'}`} style={{ backgroundColor: color.hex }} title={color.name} aria-label={color.name} />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Brand">
        <div className="space-y-2">
          {brandList.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleArrayParam('brands', brand)} className="accent-black" />
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Rating" defaultOpen={false}>
        <div className="space-y-2">
          {ratingsList.map((rating) => (
            <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="rating" checked={selectedRating === String(rating)} onChange={() => updateParam('rating', String(rating))} className="accent-black" />
              <span className="flex items-center gap-1 text-sm text-gray-600">
                {Array.from({ length: 5 }, (_, i) => <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-200'}`}>★</span>)}
                <span className="ml-1">& up</span>
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={onClose} aria-label="Close filters" className="p-3 -mr-2"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return <div className="bg-white border border-gray-100 rounded-sm">{content}</div>;
}
