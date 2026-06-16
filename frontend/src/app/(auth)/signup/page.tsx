'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { register, googleLogin, clearErrors } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearErrors()); }
  }, [error, dispatch]);

  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: '', color: '', width: '0%' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const result = await dispatch(register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Account created successfully!');
        router.push('/');
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
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
          <h1 className="text-2xl font-bold text-stone-900">Create Account</h1>
          <p className="text-sm text-stone-500 mt-1">Join the OUTFITY family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Full Name</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.name ? 'border-red-300' : 'border-stone-200'}`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Email Address</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.email ? 'border-red-300' : 'border-stone-200'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 99999 99999"
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.phone ? 'border-red-300' : 'border-stone-200'}`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'} value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.password ? 'border-red-300' : 'border-stone-200'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  <div className={`h-1 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="password" value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.confirmPassword ? 'border-red-300' : 'border-stone-200'}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); setErrors((prev) => ({ ...prev, terms: '' })); }} className="mt-0.5" />
            <label htmlFor="terms" className="text-xs text-stone-500">
              I agree to the{' '}
              <Link href="/terms" className="text-stone-900 font-medium hover:underline">Terms & Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-stone-900 font-medium hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-[11px] -mt-2">{errors.terms}</p>}

          <button type="submit" className="w-full py-3 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors">
            Create Account
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
                  toast.success('Account created with Google!');
                  router.push('/');
                }
              }
            }}
            onError={() => toast.error('Google sign-up failed')}
            size="large"
            shape="pill"
            theme="outline"
            text="signup_with"
          />
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </motion.div>
  );
}
