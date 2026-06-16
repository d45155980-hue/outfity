'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import FilterSidebar from '@/components/FilterSidebar';
import EmptyState from '@/components/EmptyState';
import Breadcrumb from '@/components/Breadcrumb';
import api from '@/lib/api';
import { HiOutlineSearch, HiOutlineClock, HiOutlineTrendingUp, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const trimmed = searchInput.trim();
    if (trimmed && trimmed !== query) {
      searchTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        params.set('q', trimmed);
        if (categoryFilter) params.set('category', categoryFilter);
        router.push(`/search?${params.toString()}`, { scroll: false });
      }, 400);
    }
    if (!trimmed && query) {
      router.push('/search', { scroll: false });
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const params: Record<string, any> = { keyword: query, limit: 50 };
    if (categoryFilter) params.category = categoryFilter;
    api.get('/products', { params })
      .then(({ data }) => setResults(data.products || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, categoryFilter]);

  const categories = [...new Set(results.map((p: any) => p.category?.name || p.category || '').filter(Boolean))];

  const recentSearches = ['cotton t-shirt', 'denim jacket', 'formal shoes', 'summer dress'];

  const handleSearchImmediate = (q: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const params = new URLSearchParams();
    params.set('q', q);
    if (categoryFilter) params.set('category', categoryFilter);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleCategoryClick = (cat: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('category', cat);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const clearCategory = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const params = new URLSearchParams();
    params.set('q', query);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Search' }]} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative max-w-2xl mx-auto mb-8">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for products, brands, categories..."
            className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </motion.div>

      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <HiOutlineClock size={14} /> Recent Searches
            </h3>
            <div className="space-y-1">
              {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchInput(s); handleSearchImmediate(s); }}
                    className="block w-full text-left py-3 px-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <HiOutlineTrendingUp size={14} /> Trending Searches
            </h3>
            <div className="space-y-1">
              {['premium cotton', 'evening wear', 'running shoes', 'leather bags'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchInput(s); handleSearchImmediate(s); }}
                    className="block w-full text-left py-3 px-3 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {query && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <p className="text-sm text-stone-500">
              {loading ? 'Searching...' : (
                <>Showing <span className="font-medium text-stone-900">{results.length}</span> result{results.length !== 1 ? 's' : ''} for &quot;<span className="font-medium text-stone-900">{query}</span>&quot;</>
              )}
            </p>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-3 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <HiOutlineAdjustments size={14} /> Filters
            </button>
          </div>

          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider mr-1">Categories:</span>
              {categories.map((cat) => {
                const isActive = categoryFilter.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => isActive ? clearCategory() : handleCategoryClick(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {categoryFilter && (
                <button
                  onClick={clearCategory}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                >
                  <HiOutlineX size={12} /> Clear
                </button>
              )}
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="hidden lg:block w-56 shrink-0">
              <FilterSidebar isOpen={true} onClose={() => {}} />
            </div>
            <FilterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-64 bg-stone-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </motion.div>
                ) : results.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <EmptyState
                      title="No results found"
                      description={`We couldn't find any results for "${query}". Try adjusting your search terms or browse our categories.`}
                      actionLabel="Browse All Products"
                      actionHref="/products"
                      icon={<HiOutlineSearch size={24} />}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProductGrid>
                      {results.map((product, idx) => (
                        <ProductCard key={product._id} product={product} index={idx} />
                      ))}
                    </ProductGrid>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
