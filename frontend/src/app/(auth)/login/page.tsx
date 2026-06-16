'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { login, googleLogin, clearErrors } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) router.push(redirectTo);
  }, [isAuthenticated, router, redirectTo]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearErrors()); }
  }, [error, dispatch]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const result = await dispatch(login({ email, password }));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Welcome back!');
        router.push(redirectTo);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-stone-900 tracking-tight inline-block mb-4">
            <Image src="/images/logo.png" alt="OUTFITY" width={440} height={136} className="h-10 sm:h-16 lg:h-32 w-auto mx-auto" priority />
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Email Address</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.email ? 'border-red-300' : 'border-stone-200'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.password ? 'border-red-300' : 'border-stone-200'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">Forgot Password?</Link>
          </div>

          <button type="submit" className="w-full py-3 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors">
            Sign In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
          <div className="relative flex justify-center"><span className="px-4 bg-white text-xs text-stone-400">OR</span></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                const result = await dispatch(googleLogin(credentialResponse.credential));
                if (result.meta.requestStatus === 'fulfilled') {
                  toast.success('Signed in with Google!');
                  router.push(redirectTo);
                }
              }
            }}
            onError={() => toast.error('Google sign-in failed')}
            size="large"
            shape="pill"
            theme="outline"
            text="continue_with"
          />
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-stone-900 font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </motion.div>
  );
}
