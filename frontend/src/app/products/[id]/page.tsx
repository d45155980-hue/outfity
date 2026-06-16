'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { RootState } from '@/store/store';
import { HiOutlineHeart, HiHeart, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingBag, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineRefresh, HiOutlineStar, HiStar } from 'react-icons/hi';
import Breadcrumb from '@/components/Breadcrumb';
import ImageGallery from '@/components/ImageGallery';
import ReviewCard from '@/components/ReviewCard';
import ProductCard from '@/components/ProductCard';
import api from '@/lib/api';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);
  const { wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  const fetchReviews = useCallback(async () => {
    const res = await api.get(`/products/${id}/reviews`).catch(() => ({ data: { reviews: [] } }));
    const allReviews = res.data.reviews || [];
    setReviews(allReviews.filter((r: any) => r.isApproved));
    const myReview = allReviews.find((r: any) => r.user?._id === currentUser?._id);
    if (myReview) {
      setUserReview(myReview);
      setReviewRating(myReview.rating);
      setReviewComment(myReview.comment);
    }
  }, [id, currentUser?._id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data.product;
        setProduct(p);
        setSelectedSize(p.sizes?.[0] || '');
        setSelectedColor(p.colors?.[0] || { name: 'Default', hex: '#000' });
        setQuantity(1);

        const relRes = await api.get('/products', { params: { category: p.category?.name || p.category, limit: 5 } }).catch(() => ({ data: { products: [] } }));
        setRelated((relRes.data.products || []).filter((r: any) => r._id !== id));
        await fetchReviews();
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, fetchReviews]);

  useEffect(() => {
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    const token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : '';
    const evtSource = new EventSource(`${baseUrl}/sse/orders?token=${token || ''}`);
    evtSource.addEventListener('review_approved', () => { fetchReviews(); });
    evtSource.addEventListener('review_submitted', () => { fetchReviews(); });
    evtSource.addEventListener('review_deleted', () => { fetchReviews(); });
    return () => evtSource.close();
  }, [fetchReviews]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-stone-100 rounded" />
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-3/5 h-96 bg-stone-100 rounded-2xl" />
            <div className="lg:w-2/5 space-y-4">
              <div className="h-4 w-24 bg-stone-100 rounded" />
              <div className="h-8 w-64 bg-stone-100 rounded" />
              <div className="h-6 w-32 bg-stone-100 rounded" />
              <div className="h-4 w-full bg-stone-100 rounded" />
              <div className="h-4 w-3/4 bg-stone-100 rounded" />
              <div className="h-12 w-full bg-stone-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = getDiscountPercent(product.price, product.salePrice);
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;
  const isWishlisted = wishlistItems.some((item) => item.product === product._id);
  const categoryName = product.category?.name || product.category || '';

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }
    const imgUrl = product.images?.[0]?.url || '';
    const cartImage = imgUrl.startsWith('http') || imgUrl.startsWith('/') || imgUrl.startsWith('data:') ? imgUrl : '';
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: cartImage,
      price: product.salePrice > 0 ? product.salePrice : product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: product.stock,
    }));
    setAddedToCart(true);
    toast.success('Added to cart!');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist');
      router.push('/login');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      const wishImgUrl = product.images?.[0]?.url || '';
      const wishImage = wishImgUrl.startsWith('http') || wishImgUrl.startsWith('/') || wishImgUrl.startsWith('data:') ? wishImgUrl : '';
      dispatch(addToWishlist({
        product: product._id,
        name: product.name,
        image: wishImage,
        price: product.salePrice > 0 ? product.salePrice : product.price,
      }));
      toast.success('Added to wishlist!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      router.push('/login');
      return;
    }
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.put(`/products/${id}/review`, { rating: reviewRating, comment: reviewComment.trim() });
      toast.success('Review submitted! Awaiting approval.');
      await fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'Products', href: categoryName ? `/products?category=${categoryName.toLowerCase()}` : '/products' },
          { label: product.name },
        ]} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-3/5">
            <ImageGallery images={product.images?.filter((i: any) => i?.url)?.length > 0 ? product.images.filter((i: any) => i?.url) : [{ public_id: '0', url: 'bg-gradient-to-br from-stone-300 to-stone-500', alt: product.name }]} />
          </div>

          <div className="lg:w-2/5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-[11px] text-stone-400 uppercase tracking-[0.2em] font-medium">{product.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 mt-1 tracking-tight">{product.name}</h1>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(product.ratings) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-stone-500">{product.ratings}</span>
                <span className="text-sm text-stone-300">|</span>
                <button onClick={() => setActiveTab('reviews')} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">{product.numOfReviews} Reviews</button>
              </div>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-stone-900">{formatPrice(displayPrice)}</span>
                {product.salePrice > 0 && (
                  <>
                    <span className="text-sm text-stone-400 line-through">{formatPrice(product.price)}</span>
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}% OFF</span>
                  </>
                )}
              </div>

              {product.colors?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">Color: <span className="text-stone-900 normal-case">{selectedColor?.name}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: any) => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor?.hex === color.hex ? 'border-stone-900 scale-110' : 'border-stone-200 hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">Size: <span className="text-stone-900 normal-case">{selectedSize}</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedSize === size ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.stock > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">Quantity</p>
                  <div className="flex items-center border border-stone-200 rounded-lg w-fit overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                      <HiOutlineMinus size={14} />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-stone-900 border-x border-stone-200">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                      <HiOutlinePlus size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    addedToCart ? 'bg-green-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  <HiOutlineShoppingBag size={18} />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button onClick={handleBuyNow} className="w-full py-3.5 border border-stone-300 text-stone-700 text-sm font-medium rounded-full hover:bg-stone-50 transition-all">
                  Buy Now
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`w-full py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
                    isWishlisted ? 'border-red-200 text-red-500 bg-red-50' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {isWishlisted ? <HiHeart size={18} /> : <HiOutlineHeart size={18} />}
                  {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-stone-50 rounded-xl">
                  <HiOutlineTruck size={18} className="mx-auto text-stone-600" />
                  <p className="text-[10px] text-stone-500 mt-1">Free Shipping</p>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-xl">
                  <HiOutlineShieldCheck size={18} className="mx-auto text-stone-600" />
                  <p className="text-[10px] text-stone-500 mt-1">Secure Payment</p>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-xl">
                  <HiOutlineRefresh size={18} className="mx-auto text-stone-600" />
                  <p className="text-[10px] text-stone-500 mt-1">Easy Returns</p>
                </div>
              </div>

              {product.sku && <p className="mt-4 text-xs text-stone-400">SKU: <span className="text-stone-600">{product.sku}</span></p>}
            </motion.div>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <div className="border-b border-stone-200 flex gap-6">
            {['description', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'description' | 'reviews')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab === 'description' ? 'Description' : `Reviews (${reviews.length || product.numOfReviews})`}
                {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Category', value: categoryName },
                    { label: 'Brand', value: product.brand },
                    { label: 'Material', value: 'Premium Quality' },
                    { label: 'Fit', value: 'Regular Fit' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm border-b border-stone-100 pb-2">
                      <span className="text-stone-400">{item.label}</span>
                      <span className="text-stone-900 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
                {isAuthenticated && (
                  <form onSubmit={handleSubmitReview} className="bg-white border border-stone-100 rounded-2xl p-5 sm:p-6 mb-6 space-y-4">
                    <h3 className="text-sm font-semibold text-stone-900">{userReview ? 'Edit Your Review' : 'Write a Review'}</h3>
                    <div>
                      <p className="text-xs font-medium text-stone-700 mb-2">Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 -m-1 transition-transform hover:scale-110"
                          >
                            {star <= (hoverRating || reviewRating) ? (
                              <HiStar size={22} className="text-amber-400" />
                            ) : (
                              <HiOutlineStar size={22} className="text-stone-300 hover:text-amber-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">Your Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                      />
                      <p className="text-[11px] text-stone-400 mt-1 text-right">{reviewComment.length}/500</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </form>
                )}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-stone-400">No reviews yet.{isAuthenticated ? '' : ' Sign in to leave a review.'}</p>
                  ) : (
                    reviews.map((review: any) => (
                      <ReviewCard key={review._id} review={review} />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight mb-6">You May Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {related.map((p: any, idx: number) => (
                <div key={p._id} className="min-w-[200px] sm:min-w-[240px]">
                  <ProductCard product={p} index={idx} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 lg:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-stone-900">{formatPrice(displayPrice)}</p>
            {product.salePrice > 0 && <p className="text-[11px] text-stone-400 line-through">{formatPrice(product.price)}</p>}
          </div>
          <button onClick={handleAddToCart} className="flex-1 py-3 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors">
            {addedToCart ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
