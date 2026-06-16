'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import FilterSidebar from '@/components/FilterSidebar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import api from '@/lib/api';
import { HiOutlineAdjustments, HiOutlineSearch } from 'react-icons/hi';

const sortOptions = [
  { label: 'Latest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Best Rated', value: 'rating' },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><LoadingSkeleton count={8} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { sort, page, limit: 12 };
      if (category) params.category = category;
      if (q) params.keyword = q;
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.count || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sort, category, q, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Products' }]} />

      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 flex-col sm:flex-row gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{loading ? 'Searching...' : `Showing ${products.length} of ${total} results`}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-4 py-3 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <HiOutlineAdjustments size={16} />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="text-xs border border-stone-200 rounded-lg px-3 py-3 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="hidden lg:block w-56 shrink-0">
          <FilterSidebar isOpen={true} onClose={() => {}} />
        </div>
        <FilterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />

        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search criteria."
              actionLabel="Clear Filters"
              icon={<HiOutlineSearch size={24} />}
            />
          ) : (
            <>
              <ProductGrid>
                {products.map((product, idx) => (
                  <ProductCard key={product._id} product={product} index={idx} />
                ))}
              </ProductGrid>
              <Pagination currentPage={page} totalPages={Math.ceil(total / 12)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
