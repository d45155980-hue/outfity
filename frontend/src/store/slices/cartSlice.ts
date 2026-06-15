import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Address, Coupon } from '@/types';

interface CartState {
  cartItems: CartItem[];
  shippingInfo: Address | null;
  coupon: Coupon | null;
  discount: number;
}

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadShippingFromStorage = (): Address | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('shippingInfo');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState: CartState = {
  cartItems: loadCartFromStorage(),
  shippingInfo: loadShippingFromStorage(),
  coupon: null,
  discount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.cartItems.findIndex(
        (item) =>
          item.product === action.payload.product &&
          item.size === action.payload.size &&
          item.color.hex === action.payload.color.hex
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity = Math.min(
          state.cartItems[existingIndex].quantity + action.payload.quantity,
          action.payload.stock
        );
      } else {
        state.cartItems.push(action.payload);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action: PayloadAction<{ product: string; size: string; color: string }>) => {
      state.cartItems = state.cartItems.filter(
        (item) =>
          !(item.product === action.payload.product &&
            item.size === action.payload.size &&
            item.color.hex === action.payload.color)
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ product: string; size: string; color: string; quantity: number }>
    ) => {
      const item = state.cartItems.find(
        (item) =>
          item.product === action.payload.product &&
          item.size === action.payload.size &&
          item.color.hex === action.payload.color
      );
      if (item) {
        item.quantity = Math.min(Math.max(action.payload.quantity, 1), item.stock);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem('cartItems');
    },

    saveShippingInfo: (state, action: PayloadAction<Address>) => {
      state.shippingInfo = action.payload;
      localStorage.setItem('shippingInfo', JSON.stringify(action.payload));
    },

    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
      if (action.payload.type === 'percentage') {
        state.discount = action.payload.value;
      } else if (action.payload.type === 'fixed') {
        state.discount = action.payload.value;
      }
    },

    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveShippingInfo,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
