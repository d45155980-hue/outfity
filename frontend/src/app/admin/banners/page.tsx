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
  HiOutlineCheck,
  HiOutlineXCircle,
  HiOutlinePhotograph,
} from 'react-icons/hi';

export default function Banners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/banners/admin/all');
      setBanners(data.banners || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchBanners(); };
    es.addEventListener('banner_created', refresh);
    es.addEventListener('banner_updated', refresh);
    es.addEventListener('banner_deleted', refresh);
    es.addEventListener('site_updated', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const sorted = [...banners].sort((a: any, b: any) => a.position - b.position);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (banner: any) => {
    setEditing(banner);
    setShowModal(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      if (editing) {
        await api.put(`/banners/admin/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/banners/admin/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      setEditing(null);
      await fetchBanners();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/banners/admin/${deleteTarget._id}`);
        setDeleteTarget(null);
        await fetchBanners();
      } catch {
        // silently fail
      }
    }
  };

  const toggleActive = async (banner: any) => {
    try {
      await api.put(`/banners/admin/${banner._id}`, { isActive: !banner.isActive });
      await fetchBanners();
    } catch {
      // silently fail
    }
  };

  const imageUrl = (banner: any) => {
    if (banner.image?.url) return banner.image.url;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <div className="p-8 text-center text-sm text-gray-400">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((banner: any, idx: number) => {
          const img = imageUrl(banner);
          return (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              layout
              className={`bg-white rounded-xl border overflow-hidden group transition-all hover:shadow-md ${
                banner.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
              }`}
            >
              <div
                className="h-40 flex flex-col items-center justify-center text-center p-6 relative bg-stone-700"
              >
                {img ? (
                  <img src={img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative">
                  <p className="text-xs text-white/60 uppercase tracking-[0.15em] font-medium mb-1">
                    {banner.subtitle}
                  </p>
                  <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                  <p className="text-xs text-white/50 mt-1 max-w-xs">{banner.description}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-white/70 text-[10px] rounded-full">
                    Position {banner.position}
                  </span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {banner.isActive ? <HiOutlineCheck className="w-3 h-3" /> : <HiOutlineXCircle className="w-3 h-3" />}
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] text-gray-400">{banner.link}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`p-1.5 rounded-lg transition-all ${
                      banner.isActive
                        ? 'text-emerald-500 hover:bg-emerald-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {banner.isActive ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <HiOutlineXCircle className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <HiOutlinePencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <BannerModal
            banner={editing}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Banner</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
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

function BannerModal({
  banner,
  onSave,
  onClose,
}: {
  banner: any | null;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [description, setDescription] = useState(banner?.description || '');
  const [link, setLink] = useState(banner?.link || '/');
  const [position, setPosition] = useState(banner?.position?.toString() || '1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('link', link);
      formData.append('position', position);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await onSave(formData);
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
        className="bg-white rounded-xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {banner ? 'Edit Banner' : 'Add Banner'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/products"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                min={1}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Banner Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <HiOutlinePhotograph className="w-4 h-4" />
                {imageFile ? imageFile.name : 'Choose Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {banner?.image?.url && !imageFile && (
                <span className="text-xs text-gray-400">Current image will be kept if not replaced</span>
              )}
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
              {saving ? 'Saving...' : banner ? 'Update' : 'Add Banner'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
