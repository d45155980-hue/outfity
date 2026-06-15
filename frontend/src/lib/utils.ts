export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDiscountedPrice = (price: number, salePrice: number): number => {
  return salePrice > 0 ? salePrice : price;
};

export const getDiscountPercent = (price: number, salePrice: number): number => {
  if (price <= 0 || salePrice <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

export const generateStars = (rating: number): number[] => {
  const stars: number[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(1);
    else if (rating >= i - 0.5) stars.push(0.5);
    else stars.push(0);
  }
  return stars;
};

export const truncateText = (text: string, max: number): string => {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '...';
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
