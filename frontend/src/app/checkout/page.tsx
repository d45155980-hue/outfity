'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { HiOutlineTag, HiOutlineSparkles } from 'react-icons/hi';
import { COUNTRIES } from '@/lib/constants';
import { RootState, AppDispatch } from '@/store/store';
import { clearCart, saveShippingInfo, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { createOrder } from '@/store/slices/orderSlice';
import { Coupon } from '@/types';

const shippingMethods = [
  { id: 'standard', label: 'Standard Delivery', description: '5-7 business days', price: 0 },
  { id: 'express', label: 'Express Delivery', description: '2-3 business days', price: 99 },
];

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive' },
  { id: 'razorpay', label: 'Razorpay', description: 'Pay via UPI, Card, Net Banking' },
  { id: 'stripe', label: 'Credit / Debit Card', description: 'Secure payment via Stripe' },
  { id: 'upi', label: 'UPI', description: 'Google Pay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net Banking', description: 'All major banks' },
];

function CheckoutForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const loading = useSelector((state: RootState) => state.orders.loading);
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', country: 'India', zipCode: '',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<Record<string, boolean> | null>(null);

  const reduxCoupon = useSelector((state: RootState) => state.cart.coupon);

  useEffect(() => {
    api.get('/coupons/active')
      .then(({ data }) => setAvailableCoupons(data.coupons || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPaymentConfig = () =>
      api.get('/site/payment')
        .then(({ data }) => setPaymentConfig(data.payments))
        .catch(() => {});
    fetchPaymentConfig();
    const id = setInterval(fetchPaymentConfig, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (paymentConfig && paymentMethod && paymentConfig[paymentMethod] === false) {
      setPaymentMethod('');
    }
  }, [paymentConfig, paymentMethod]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/checkout';
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isInitialized, isAuthenticated, router, searchParams]);

  if (!isInitialized || !isAuthenticated) {
    if (!isInitialized) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return null;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingMethod === 'express' ? 99 : 0;
  let actualDiscount = 0;
  if (reduxCoupon && subtotal > 0) {
    if (reduxCoupon.type === 'percentage') {
      actualDiscount = Math.round(subtotal * (reduxCoupon.value / 100));
    } else if (reduxCoupon.type === 'fixed') {
      actualDiscount = reduxCoupon.value;
    }
  }
  const total = Math.max(0, subtotal + shipping - actualDiscount);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Required';
    if (!form.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.phone.trim()) newErrors.phone = 'Required';
    if (!form.address.trim()) newErrors.address = 'Required';
    if (!form.city.trim()) newErrors.city = 'Required';
    if (!form.state.trim()) newErrors.state = 'Required';
    if (!form.zipCode.trim()) newErrors.zipCode = 'Required';
    if (!paymentMethod) newErrors.payment = 'Select a payment method';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess('');
      return;
    }
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsApplying(false);
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: code.trim(), orderAmount: subtotal });
      if (data.success && data.coupon) {
        dispatch(applyCoupon(data.coupon as Coupon));
        setCouponSuccess(`Coupon applied! ${data.coupon.type === 'percentage' ? `${data.coupon.value}% off` : `₹${data.coupon.value} off`}`);
        setCouponError('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setCouponSuccess('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleApplyAvailableCoupon = (code: string) => {
    setCouponCode(code);
    handleApplyCoupon(code);
  };

  const loadRazorpayScript = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setOrderError('');

    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color.hex,
        quantity: item.quantity,
      })),
      shippingAddress: form,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      totalPrice: total,
      discount: actualDiscount,
    };

    if (paymentMethod === 'razorpay' || paymentMethod === 'upi' || paymentMethod === 'netbanking') {
      try {
        const { data: orderData } = await api.post('/payments/razorpay/order', {
          amount: Math.round(total * 100),
          currency: 'INR',
        });

        if (!orderData.success) {
          setOrderError('Failed to create payment. Please try again.');
          return;
        }

        await loadRazorpayScript();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'OUTFITY',
          description: `Order #${Date.now()}`,
          order_id: orderData.id,
          method: paymentMethod === 'upi' ? 'upi' : paymentMethod === 'netbanking' ? 'netbanking' : undefined,
          handler: async (response: any) => {
            try {
              const { data: verifyData } = await api.post('/payments/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyData.success) {
                dispatch(saveShippingInfo(form));
                const result = await dispatch(createOrder(orderPayload)).unwrap();
                dispatch(clearCart());
                router.push(`/order-success?id=${result._id}`);
              } else {
                setOrderError('Payment verification failed.');
              }
            } catch {
              setOrderError('Payment verification failed.');
            }
          },
          modal: {
            ondismiss: () => {
              setOrderError('Payment cancelled.');
            },
          },
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: '#1c1917' },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        setOrderError(err?.response?.data?.message || 'Payment failed. Please try again.');
      }
      return;
    }

    dispatch(saveShippingInfo(form));
    try {
      const result = await dispatch(createOrder(orderPayload)).unwrap();
      dispatch(clearCart());
      router.push(`/order-success?id=${result._id}`);
    } catch (err: any) {
      setOrderError(err || 'Something went wrong. Please try again.');
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-stone-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Billing Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', colSpan: true },
                  { field: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', colSpan: true },
                  { field: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 99999 99999', colSpan: true },
                  { field: 'address', label: 'Address', type: 'text', placeholder: '123 Main Street, Apt 4B', colSpan: true },
                  { field: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
                  { field: 'state', label: 'State', type: 'text', placeholder: 'Maharashtra' },
                ].map(({ field, label, type, placeholder, colSpan }) => (
                  <div key={field} className={colSpan ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">{label}</label>
                    <input
                      type={type} value={(form as any)[field]} onChange={(e) => updateField(field, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full px-3.5 py-3 sm:py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors[field] ? 'border-red-300' : 'border-stone-200'}`}
                    />
                    {errors[field] && <p className="text-red-500 text-[11px] mt-0.5">{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">Country</label>
                  <select value={form.country} onChange={(e) => updateField('country', e.target.value)} className="w-full px-3.5 py-3 sm:py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">ZIP / Postcode</label>
                  <input type="text" value={form.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} placeholder="400001" className={`w-full px-3.5 py-3 sm:py-2.5 bg-stone-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${errors.zipCode ? 'border-red-300' : 'border-stone-200'}`} />
                  {errors.zipCode && <p className="text-red-500 text-[11px] mt-0.5">{errors.zipCode}</p>}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-stone-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Shipping Method</h2>
              <div className="space-y-2">
                {shippingMethods.map((method) => (
                  <label key={method.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${shippingMethod === method.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={method.id} checked={shippingMethod === method.id} onChange={(e) => setShippingMethod(e.target.value)} className="accent-stone-900" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{method.label}</p>
                        <p className="text-[11px] text-stone-500">{method.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-stone-900">{method.price === 0 ? 'Free' : formatPrice(method.price)}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-stone-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.filter((m) => paymentConfig ? paymentConfig[m.id] !== false : true).map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => { setPaymentMethod(e.target.value); setErrors((prev) => ({ ...prev, payment: '' })); }} className="accent-stone-900" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">{method.label}</p>
                      <p className="text-[11px] text-stone-500">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.payment && <p className="text-red-500 text-[11px] mt-2">{errors.payment}</p>}

              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs text-stone-500 mb-2">Card Details</p>
                  <div className="space-y-3">
                    <input type="text" placeholder="Card number" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                      <input type="text" placeholder="CVC" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:w-96 shrink-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4 sticky top-28">
              <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Order Summary</h3>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => {
                    const showGradient = item.image && !item.image.startsWith('http') && !item.image.startsWith('/') && !item.image.startsWith('data:');
                    return (
                      <div key={item.product + item.size + item.color.hex} className="flex gap-3">
                        <div className={`w-14 h-16 rounded-lg shrink-0 ${showGradient ? item.image : 'bg-cover bg-center'}`} style={showGradient ? {} : { backgroundImage: `url(${item.image})` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                          <p className="text-xs font-medium text-stone-900 mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-stone-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-stone-500">Subtotal</span><span className="text-stone-900">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-stone-500">Shipping</span><span className={shipping === 0 ? 'text-green-600' : 'text-stone-900'}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                  {actualDiscount > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatPrice(actualDiscount)}</span></div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-stone-200 pt-2"><span className="text-stone-900">Total</span><span className="text-stone-900">{formatPrice(total)}</span></div>
                </div>

                {orderError && (
                  <p className="text-red-500 text-xs text-center">{orderError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>

              <div className="bg-white border border-stone-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HiOutlineTag size={14} />
                  Coupon
                </h4>
                {reduxCoupon ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-green-800 uppercase">{reduxCoupon.code}</p>
                        <p className="text-[11px] text-green-600">
                          {reduxCoupon.type === 'percentage' ? `${reduxCoupon.value}% discount applied` : `₹${reduxCoupon.value} discount applied`}
                        </p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Remove</button>
                    </div>
                  </motion.div>
                ) : isApplying ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <div className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                      Applying coupon...
                    </div>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'easeInOut' }}
                      className="h-1 bg-stone-900 rounded-full"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponCode)}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-[11px] mt-1">{couponError}</p>}
                    {couponSuccess && <p className="text-green-600 text-[11px] mt-1">{couponSuccess}</p>}
                  </div>
                )}

                {availableCoupons.length > 0 && !reduxCoupon && !isApplying && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <HiOutlineSparkles className="text-amber-600" size={13} />
                      <span className="text-[11px] font-medium text-amber-800">Available offers</span>
                    </div>
                    <div className="space-y-1.5">
                      {availableCoupons.slice(0, 3).map((cp) => (
                        <button
                          key={cp._id}
                          onClick={() => handleApplyAvailableCoupon(cp.code)}
                          className="w-full flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-400 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <HiOutlineTag className="text-amber-700" size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-900 uppercase">{cp.code}</p>
                            <p className="text-[10px] text-stone-500">
                              {cp.type === 'percentage' ? `${cp.value}% OFF` : `₹${cp.value} OFF`}
                              {cp.minOrder > 0 && ` • Min. ₹${cp.minOrder}`}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
