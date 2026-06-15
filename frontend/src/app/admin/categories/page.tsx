'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCollection,
} from 'react-icons/hi';

const bgColors = [
  'bg-gradient-to-br from-stone-500 to-stone-800',
  'bg-gradient-to-br from-rose-400 to-rose-700',
  'bg-gradient-to-br from-yellow-400 to-orange-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-800',
  'bg-gradient-to-br from-amber-600 to-amber-900',
  'bg-gradient-to-br from-violet-500 to-violet-800',
  'bg-gradient-to-br from-blue-400 to-blue-700',
  'bg-gradient-to-br from-cyan-400 to-cyan-700',
];

function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchCategories(); };
    es.addEventListener('category_created', refresh);
    es.addEventListener('category_updated', refresh);
    es.addEventListener('category_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setShowModal(true);
  };

  const handleSave = async (data: { name: string; description: string }) => {
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, data);
      } else {
        await api.post('/categories', data);
      }
      setShowModal(false);
      setEditing(null);
      await fetchCategories();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/categories/${deleteTarget._id}`);
        setDeleteTarget(null);
        await fetchCategories();
      } catch {
        // silently fail
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="p-8 text-center text-sm text-gray-400">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat: any, idx: number) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-sm transition-shadow"
          >
            <div className={`h-32 ${getColorForName(cat.name)} flex items-center justify-center`}>
              <HiOutlineCollection className="w-10 h-10 text-white/60" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={editing}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null); }}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
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

function CategoryModal({
  category,
  onSave,
  onClose,
}: {
  category: any | null;
  onSave: (data: { name: string; description: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, description });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 resize-none"
            />
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
              {saving ? 'Saving...' : category ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
