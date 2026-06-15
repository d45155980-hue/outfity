'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineMail,
  HiOutlineUsers,
  HiOutlineUser,
} from 'react-icons/hi';

export default function SendNotification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('admin_broadcast');
  const [sendMethod, setSendMethod] = useState<'website' | 'email' | 'both'>('website');
  const [sendTo, setSendTo] = useState<'all' | 'selected'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (sendTo !== 'selected') return;
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/users/admin/all');
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [sendTo]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(
    (u: any) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedUsers(filtered.map((u: any) => u._id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (sendTo === 'selected' && selectedUsers.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    setSending(true);
    try {
      await api.post('/notifications/admin/broadcast', {
        title: title.trim(),
        message: message.trim(),
        type,
        sendMethod,
        userList: sendTo === 'selected' ? selectedUsers : [],
      });
      const methodLabel = sendMethod === 'email' ? 'via Email' : sendMethod === 'both' ? 'via Website + Email' : 'via Website';
      toast.success(`Sent ${methodLabel} to ${sendTo === 'all' ? 'all users' : selectedUsers.length + ' users'}`);
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
        <p className="text-sm text-gray-400 mt-1">Broadcast messages to users about offers, coupons, and updates</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notification Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 bg-white"
            >
              <option value="admin_broadcast">General Announcement</option>
              <option value="coupon_created">Coupon / Offer</option>
              <option value="product_created">New Collection / Product</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Sale - 30% Off!"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your notification message..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3">Send To</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setSendTo('all'); setSelectedUsers([]); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  sendTo === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <HiOutlineUsers className="w-4 h-4" />
                All Users
              </button>
              <button
                type="button"
                onClick={() => setSendTo('selected')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  sendTo === 'selected'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <HiOutlineUser className="w-4 h-4" />
                Select Users
              </button>
            </div>
          </div>

          {sendTo === 'selected' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs font-medium text-gray-600 hover:text-black whitespace-nowrap"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs font-medium text-gray-600 hover:text-black whitespace-nowrap"
                  >
                    Clear
                  </button>
                </div>
                {selectedUsers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">{selectedUsers.length} user(s) selected</p>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {loadingUsers ? (
                  <div className="p-6 text-center text-sm text-gray-400">Loading users...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No users found</div>
                ) : (
                  filtered.map((user: any) => {
                    const isSelected = selectedUsers.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleUser(user._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100/50 ${
                          isSelected ? 'bg-gray-100' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-black border-black' : 'border-gray-300'
                        }`}>
                          {isSelected && <HiOutlineCheck className="w-3 h-3 text-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                          {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3">Send Method</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSendMethod('website')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  sendMethod === 'website'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <HiOutlineBell className="w-4 h-4" />
                Website
              </button>
              <button
                type="button"
                onClick={() => setSendMethod('email')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  sendMethod === 'email'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <HiOutlineMail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setSendMethod('both')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  sendMethod === 'both'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <HiOutlineBell className="w-4 h-4" />
                <HiOutlineMail className="w-4 h-4 -ml-1" />
                Both
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <HiOutlineBell className="w-4 h-4" />
              {sending ? 'Sending...' : `Send to ${sendTo === 'all' ? 'All Users' : selectedUsers.length + ' Users'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
