'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { updateProfile } from '@/store/slices/authSlice';
import api from '@/lib/api';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      await dispatch(updateProfile(formData)).unwrap();
      setProfileMsg('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');
    if (password.newPass !== password.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: password.current,
        newPassword: password.newPass,
      });
      setPasswordMsg('Password changed successfully!');
      setPassword({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-stone-900">My Profile</h2>
        <p className="text-sm text-stone-500 mt-0.5">Manage your personal information</p>
      </motion.div>

      <form onSubmit={handleProfileSubmit} className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
        {[
          { label: 'Full Name', value: profile.name, field: 'name' },
          { label: 'Email Address', value: profile.email, field: 'email', type: 'email' },
          { label: 'Phone Number', value: profile.phone, field: 'phone', type: 'tel' },
        ].map(({ label, value, field, type }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">{label}</label>
            <input
              type={type || 'text'}
              value={value}
              onChange={(e) => setProfile((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
        ))}
        {profileError && <p className="text-xs text-red-500">{profileError}</p>}
        {profileMsg && <p className="text-xs text-green-600">{profileMsg}</p>}
        <button
          type="submit"
          disabled={profileLoading}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {profileLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-stone-900">Change Password</h3>
        {[
          { label: 'Current Password', field: 'current' },
          { label: 'New Password', field: 'newPass' },
          { label: 'Confirm New Password', field: 'confirm' },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">{label}</label>
            <input
              type="password"
              value={(password as any)[field]}
              onChange={(e) => setPassword((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
        ))}
        {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
        {passwordMsg && <p className="text-xs text-green-600">{passwordMsg}</p>}
        <button
          type="submit"
          disabled={passwordLoading}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
