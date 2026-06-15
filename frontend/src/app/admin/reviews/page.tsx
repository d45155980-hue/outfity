'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import {
  HiOutlineStar,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineXCircle,
} from 'react-icons/hi';

const tabs = ['All', 'Approved', 'Pending'];

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reviews/admin/all');
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    const _token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const es = new EventSource(_token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(_token)}` : `${API_BASE_URL}/sse/orders`);
    const refresh = () => { fetchReviews(); };
    es.addEventListener('review_submitted', refresh);
    es.addEventListener('review_approved', refresh);
    es.addEventListener('review_deleted', refresh);
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return reviews;
    if (activeTab === 'Approved') return reviews.filter((r: any) => r.isApproved);
    return reviews.filter((r: any) => !r.isApproved);
  }, [reviews, activeTab]);

  const approveReview = async (id: string) => {
    try {
      await api.put(`/reviews/admin/${id}/approve`);
      await fetchReviews();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/reviews/admin/${deleteTarget._id}`);
        setDeleteTarget(null);
        await fetchReviews();
      } catch {
        // silently fail
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HiOutlineStar
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
      />
    ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <div className="p-8 text-center text-sm text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No reviews found.</div>
        ) : (
          filtered.map((review: any, idx: number) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                    {review.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{review.product?.name || 'Product'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{review.comment}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400">{formatDate(review.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                      >
                        <HiOutlineEye className="w-3.5 h-3.5" />
                      </button>
                      {!review.isApproved && (
                        <button
                          onClick={() => approveReview(review._id)}
                          className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50"
                        >
                          <HiOutlineCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(review)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Full Review</h3>
                <button onClick={() => setSelectedReview(null)} className="p-1 text-gray-400 hover:text-black">
                  <HiOutlineXCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                  {selectedReview.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedReview.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{selectedReview.product?.name || 'Product'}</p>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedReview.comment}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400">{formatDate(selectedReview.createdAt)}</span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    selectedReview.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedReview.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </motion.div>
          </motion.div>
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this review? This action cannot be undone.
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
