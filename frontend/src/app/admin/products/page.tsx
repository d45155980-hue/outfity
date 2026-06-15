'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineStar,
  HiOutlineFire,
  HiOutlineSparkles,
  HiOutlineTag,
} from 'react-icons/hi';

interface Product {
  _id: string;
  name: string;
  sku: string;
  brand: string;
  category: { _id: string; name: string };
  price: number;
  salePrice: number;
  stock: number;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: { public_id: string; url: string }[];
  featured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  isSale: boolean;
  ratings: number;
}

interface Category {
  _id: string;
  name: string;
}

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7', '8', '9', '10', '11', '12', '30', '32', '34', '36', 'One Size'];

const ITEMS_PER_PAGE = 5;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchProducts(); };
    es.addEventListener('product_created', refresh);
    es.addEventListener('product_updated', refresh);
    es.addEventListener('product_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const filtered = search.trim()
    ? products.filter((p) =>
        [p.name, p.sku, p.category?.name || ''].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      )
    : products;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSave = async (formData: FormData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData);
        toast.success('Product created');
      }
      setShowModal(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const stockColor = (stock: number) => {
    if (stock > 30) return 'bg-emerald-100 text-emerald-700';
    if (stock > 10) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="relative max-w-xs">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">SKU</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Category</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">No products found</td></tr>
              ) : (
                paginated.map((product, idx) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">{product.sku}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-900">₹{product.salePrice || product.price}</span>
                      {product.salePrice > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${stockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">{product.category?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingProduct(product); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(product)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    p === page ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingProduct(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || 'OUTFITY',
    category: (product?.category as any)?._id || (product?.category as any) || '',
    price: product?.price?.toString() || '',
    salePrice: product?.salePrice?.toString() || '',
    stock: product?.stock?.toString() || '',
    sizes: product?.sizes || [] as string[],
    colors: product?.colors || [] as { name: string; hex: string }[],
    featured: product?.featured || false,
    isNewArrival: product?.isNewArrival || false,
    isTrending: product?.isTrending || false,
    isSale: product?.isSale || false,
  });

  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    product?.images?.map((img) => img.url) || []
  );
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const addColor = () => {
    if (colorName && colorHex) {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, { name: colorName, hex: colorHex }] }));
      setColorName('');
      setColorHex('#000000');
    }
  };

  const removeColor = (idx: number) => {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    for (const file of files) {
      setImagePreviewUrls((prev) => [...prev, URL.createObjectURL(file)]);
    }
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('brand', form.brand);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('salePrice', form.salePrice || '0');
      fd.append('stock', form.stock);
      fd.append('sizes', JSON.stringify(form.sizes));
      fd.append('colors', JSON.stringify(form.colors));
      fd.append('featured', String(form.featured));
      fd.append('isNewArrival', String(form.isNewArrival));
      fd.append('isTrending', String(form.isTrending));
      fd.append('isSale', String(form.isSale));
      imageFiles.forEach((file) => fd.append('images', file));

      await onSave(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-2xl w-full my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              {categories.length > 0 ? (
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Enter category name (will be created)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price (₹)</label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    form.sizes.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.colors.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs"
                >
                  <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                  {c.name}
                  <button type="button" onClick={() => removeColor(idx)} className="text-gray-400 hover:text-red-500 ml-0.5">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Color name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Images</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            {imagePreviewUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {imagePreviewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 w-full text-center hover:border-gray-400 transition-all cursor-pointer"
            >
              <HiOutlinePhotograph className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">Click to upload images (max 10)</p>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Tags</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'featured', label: 'Featured', icon: HiOutlineStar },
                { key: 'isNewArrival', label: 'New', icon: HiOutlineSparkles },
                { key: 'isTrending', label: 'Trending', icon: HiOutlineFire },
                { key: 'isSale', label: 'Sale', icon: HiOutlineTag },
              ].map((tag) => {
                const Icon = tag.icon;
                const isActive = form[tag.key as keyof typeof form] as boolean;
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => setForm({ ...form, [tag.key]: !isActive })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isActive
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
