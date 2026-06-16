'use client';

import { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import SectionTitle from '@/components/SectionTitle';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import Newsletter from '@/components/Newsletter';
import InstagramGallery from '@/components/InstagramGallery';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineTag, HiOutlineSparkles } from 'react-icons/hi';
import api from '@/lib/api';
import { Coupon } from '@/types';
import { API_BASE_URL } from '@/lib/constants';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, bannerRes, couponRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/banners').catch(() => ({ data: { banners: [] } })),
          api.get('/coupons/active').catch(() => ({ data: { coupons: [] } })),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
        setBanners(bannerRes.data.banners || []);
        setCoupons(couponRes.data.coupons || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchData(); };
    es.addEventListener('product_created', refresh);
    es.addEventListener('product_updated', refresh);
    es.addEventListener('product_deleted', refresh);
    es.addEventListener('category_created', refresh);
    es.addEventListener('category_updated', refresh);
    es.addEventListener('category_deleted', refresh);
    es.addEventListener('banner_created', refresh);
    es.addEventListener('banner_updated', refresh);
    es.addEventListener('banner_deleted', refresh);
    es.addEventListener('coupon_created', refresh);
    es.addEventListener('coupon_updated', refresh);
    es.addEventListener('coupon_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const trending = products.filter((p) => p.isTrending);
  const saleItems = products.filter((p) => p.isSale);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-stone-100 rounded-3xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-stone-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroBanner />

      {categories.length > 0 && (
        <section className="bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <SectionTitle title="Shop by Category" subtitle="Curated collections for every style" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((cat, idx) => (
                <CategoryCard key={cat._id} category={{ ...cat, slug: cat.name.toLowerCase(), image: cat.image?.url }} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {banners.filter(b => b.isActive !== false).slice(0, 4).map((banner, idx) => {
              const hasImage = banner.image?.url;
              const bgStyle = hasImage ? { backgroundImage: `url(${banner.image.url})` } : {};
              const isReversed = idx % 2 === 0;
              return (
                <motion.div
                  key={banner._id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Link href={banner.link || '/products'}>
                    <div
                      className={`relative h-48 lg:h-56 rounded-2xl overflow-hidden bg-cover bg-center group cursor-pointer ${!hasImage ? 'bg-gradient-to-br from-stone-800 to-stone-900' : ''}`}
                      style={hasImage ? bgStyle : {}}
                    >
                      <div className={`absolute inset-0 ${hasImage ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' : ''} group-hover:bg-black/10 transition-colors duration-500`} />
                      <div className="relative z-10 h-full flex flex-col justify-end p-6">
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          className="text-amber-400 text-[10px] font-semibold tracking-[0.25em] uppercase mb-1"
                        >
                          {banner.subtitle || 'Featured'}
                        </motion.span>
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 + 0.3 }}
                          className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg"
                        >
                          {banner.title}
                        </motion.h3>
                        {banner.description && (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 + 0.4 }}
                            className="text-sm text-gray-200 mt-1 line-clamp-1 drop-shadow-md"
                          >
                            {banner.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionTitle title="Exclusive Offers" subtitle="Coupons & discounts just for you" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((cp, idx) => (
              <motion.div
                key={cp._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-gradient-to-br from-amber-50 via-white to-stone-50 rounded-2xl p-6 border border-amber-200/50 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineSparkles className="text-amber-600" size={18} />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">Limited Offer</span>
                  </div>
                  <p className="text-2xl font-black text-stone-900 uppercase tracking-wider mb-1">{cp.code}</p>
                  <p className="text-sm font-semibold text-amber-700 mb-2">
                    {cp.type === 'percentage' ? `${cp.value}% OFF` : cp.type === 'fixed' ? `₹${cp.value} OFF` : 'FREE SHIPPING'}
                  </p>
                  {cp.minOrder > 0 && (
                    <p className="text-xs text-stone-400">Min. order: ₹{cp.minOrder}</p>
                  )}
                  {cp.expiresAt && (
                    <p className="text-[10px] text-stone-400 mt-1">Expires: {new Date(cp.expiresAt).toLocaleDateString()}</p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className="mt-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 origin-left"
                  />
                  <Link
                    href="/cart"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors group-hover:gap-2.5"
                  >
                    <HiOutlineTag size={14} /> Use Coupon →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionTitle title="Best Sellers" subtitle="Most loved products this season" />
          <ProductGrid>
            {featured.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </ProductGrid>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionTitle title="New Arrivals" subtitle="Fresh drops to elevate your style" />
          <ProductGrid>
            {newArrivals.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </ProductGrid>
        </section>
      )}

      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionTitle title="Trending Now" subtitle="What everyone is wearing" />
          <ProductGrid>
            {trending.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </ProductGrid>
        </section>
      )}

      {saleItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionTitle title="Sale" subtitle="Limited time offers" />
          <ProductGrid>
            {saleItems.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </ProductGrid>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 py-16 lg:py-24 px-4 sm:px-8 md:px-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
          <div className="relative max-w-lg mx-auto">
            <p className="text-amber-400 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase mb-3">Summer Collection 2026</p>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white tracking-tight">Sun-Kissed Style</h2>
            <p className="mt-4 text-stone-400 text-xs sm:text-sm">Discover light, breathable fabrics and vibrant hues for the season ahead.</p>
            <Link href="/products?category=women" className="inline-flex items-center gap-2 mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-stone-900 text-xs sm:text-sm font-medium rounded-full hover:bg-stone-100 transition-all">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstagramGallery />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </div>
    </div>
  );
}
